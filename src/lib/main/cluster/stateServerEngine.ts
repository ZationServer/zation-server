/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import ZationConfig from "../config/manager/zationConfig";
import ZationMaster from "../../core/zationMaster";
import Encoder      from "../utils/encoder";
import Logger       from "../logger/logger";
import {License}    from "../utils/licenseManager";

const  ScClient : any        = require('socketcluster-client');
const  uuidV4                = require('uuid/v4');

export const ZATION_CLUSTER_VERSION = 1;

export default class StateServerEngine
{
    private zc : ZationConfig;
    private zm : ZationMaster;
    private stateSocket : any;
    private readonly useClusterSecretKey : boolean;
    private encoder : Encoder;

    private inRegisterProcess : boolean = true;
    private firstConnection : boolean = true;
    private isClusterLeader : boolean = false;

    private reconnectUUID : string;

    private connectSettings : object;
    private serverSettings : object;
    private licenseData : {id : string,m : [number,number]} | undefined = undefined;
    private serverSharedData : SharedData | string;

    private readonly useSharedTokenAuth : boolean;

    constructor(zc : ZationConfig,zm : ZationMaster,license ?: License)
    {
        this.zc = zc;
        this.zm = zm;
        if(license){
            this.licenseData = {
                id : license.i,
                m : license.m
            };
        }

        this.useSharedTokenAuth = this.zc.mainConfig.clusterShareTokenAuth;
        this.useClusterSecretKey = typeof this.zc.mainConfig.clusterSecretKey === 'string';

        this.buildConnectSettings();
        this.buildServerSettings();

        if(this.useClusterSecretKey) {
            // @ts-ignore
            this.encoder = new Encoder(this.zc.mainConfig.clusterSecretKey);
        }

        this.buildServerSharedData();
    }

    /**
     * Build the server settings.
     */
    private buildServerSettings()
    {
        this.serverSettings = {
            useShareTokenAuth : this.useSharedTokenAuth,
            useClusterSecretKey : this.useClusterSecretKey
        };
    }

    /**
     * Build the server shared data between masters.
     */
    private buildServerSharedData()
    {
        const sharedData : SharedData = {
                tokenClusterKey : this.zc.internalData.tokenClusterKey,
                databoxKey : this.zc.internalData.databoxKey
            };

        if(this.useSharedTokenAuth) {
            sharedData.verifyKey = this.zc.getVerifyKey();
            sharedData.signKey = this.zc.getSignKey();
            sharedData.authAlgorithm = this.zc.mainConfig.authAlgorithm;
        }

        if(this.useClusterSecretKey) {
            this.serverSharedData = this.encoder.encrypt(sharedData);
        }
        else {
            this.serverSharedData = sharedData;
        }
    }

    /**
     * Load the shared data from another master.
     * This method will also try to decrypt them by using a cluster key.
     * @param sharedData
     */
    private loadSharedData(sharedData : string | SharedData)
    {
        if(this.useClusterSecretKey && typeof sharedData === 'string') {
            try {
                // @ts-ignore
                sharedData = this.encoder.decrypt(sharedData);
            }
            catch (e) {
                const error = new Error(`Decrypt the shared variables failed.` +
                    `Check if every zation server has the same cluster secret key`);
                (error as any).code = 'DECRYPT_SHARED_VARIABLES_FAILED';
                throw error;
            }
        }

        if(typeof sharedData === 'object') {
            this.zc.internalData.tokenClusterKey = sharedData.tokenClusterKey;
            this.zc.internalData.databoxKey = sharedData.databoxKey;

            if(this.useSharedTokenAuth) {
                this.zc.internalData.verifyKey = sharedData.verifyKey;
                this.zc.internalData.signKey = sharedData.signKey;
                this.zc.mainConfig.authAlgorithm = sharedData.authAlgorithm;
            }
        }
        else {
            const error = new Error(`Load the shared variables failed.` +
                `Check if every zation server has the same cluster secret key setting`);
            (error as any).code = 'LOAD_SHARED_VARIABLES_FAILED';
            throw error;
        }
    }

    /**
     * Build the connection settings for the state server connection.
     */
    private buildConnectSettings() {
        //connect to state server
        const DEFAULT_PORT = 7777;
        const DEFAULT_RETRY_DELAY = 800;
        const DEFAULT_STATE_SERVER_CONNECT_TIMEOUT = 3000;
        const DEFAULT_STATE_SERVER_ACK_TIMEOUT = 10000;
        const DEFAULT_RECONNECT_RANDOMNESS = 1000;
        const retryDelay = DEFAULT_RETRY_DELAY;
        const reconnectRandomness = this.zc.mainConfig.clusterStateServerReconnectRandomness
            || DEFAULT_RECONNECT_RANDOMNESS;

        const authKey = this.zc.mainConfig.clusterAuthKey || null;

        this.connectSettings = {

            hostname: this.zc.mainConfig.stateServerHost, // Required option

            port: this.zc.mainConfig.stateServerPort || DEFAULT_PORT,

            connectTimeout: this.zc.mainConfig.clusterStateServerConnectTimeout
                || DEFAULT_STATE_SERVER_CONNECT_TIMEOUT,

            ackTimeout: this.zc.mainConfig.clusterStateServerAckTimeout
                || DEFAULT_STATE_SERVER_ACK_TIMEOUT,

            autoReconnectOptions: {
                initialDelay: retryDelay,
                randomness: reconnectRandomness,
                multiplier: 1,
                maxDelay: retryDelay + reconnectRandomness
            },
            query: {
                authKey,
                instancePort: this.zc.mainConfig.port,
                instanceType: 'zation-master',
                zationClusterVersion : ZATION_CLUSTER_VERSION
            },

            autoConnect : false
        };
    }

    /**
     * Deactivate the leadership from this master.
     */
    private deactivateLeadership() {
        this.zm.deactivateClusterLeader();
        this.isClusterLeader = false;
    }

    /**
     * Activate the leadership from this master.
     */
    private activateLeadership() {
        this.zm.activateClusterLeader();
        this.isClusterLeader = true;
    }

    /**
     * Destroy the state server socket.
     */
    destroy() : void {
        if(this.stateSocket){
            this.stateSocket.destroy();
        }
    }

    /**
     * Start to connect and register to the state server.
     * Promise will be resolved after the connection is established, and the master has registered at the state server.
     */
    public registerStateServer() : Promise<void>
    {
        this.stateSocket = ScClient.connect(this.connectSettings);
        const promise = new Promise<void>((resolve,reject) =>
        {
            this.stateSocket.on('error',async (e) => {
                if(!this.inRegisterProcess){
                    Logger.printDebugWarning(`Error on state server connection socket: ${e}`);
                }
            });

            this.stateSocket.on('disconnect',async ()=>
            {
                if(this.inRegisterProcess) {
                    const error = new Error(`Connection to state server is lost in register process!`);
                    (error as any).code = 'CONNECTION_LOST';
                    reject(error);
                }
                else {
                    //lost connection by running server
                    Logger.printDebugWarning
                    (`Connection to zation-cluster-state server is lost. To scale up or down, the state server must be reachable!`);
                }
            });

            this.stateSocket.on('connectAbort',async (code,data)=>
            {
                if(this.inRegisterProcess) {
                    let error;
                    switch (code) {
                        case 4010:
                            //BadZationClusterVersion
                            error = new Error(`This zation cluster version of this zation server version is not compatible with the state server version.`);
                            (error as any).code = 'VERSION_NOT_COMPATIBLE';
                            reject(error);
                            break;
                        case 4011:
                            //BadClusterAuthError
                            error = new Error(`The provided 'clusterAuthKey' is wrong. Can't connect to zation-cluster-state server.`);
                            (error as any).code = 'WRONG_CLUSTER_AUTH_KEY';
                            reject(error);
                            break;
                        default :
                            error = new Error(`Connection to the state server is failed in the register process.`);
                            (error as any).code = 'CONNECTION_FAILED';
                            reject(error);
                            break;
                    }
                }
                else {
                    Logger.printDebugWarning
                    (`Reconnection to the zation-cluster-state server is failed. Reason: ${data}. The master will try again to reconnect.`);
                }
            });

            this.stateSocket.on('removeLeader',async (data,respond)=> {
                this.deactivateLeadership();
                respond(null);
            });

            this.stateSocket.on('connect', async () =>
            {
                if(this.firstConnection) {
                    this.firstConnection = false;
                    Logger.printStartDebugInfo('Master is connected to zation-cluster-state server');
                    try {
                        await this.registerMaster();
                        resolve();
                    }
                    catch (e) {
                        const err = new Error(`Register by state server is failed. Err: ${e.toString()}.`);
                        (err as any).code = (e as any).code;
                        reject(err);
                    }
                }
                else {
                    await this.tryReconnect();
                }
            });
        });
        this.stateSocket.connect();
        return promise;
    }

    /**
     * Register this master at the state server.
     */
    private registerMaster()
    {
        return new Promise((resolve,reject) =>
        {
            this.stateSocket.emit
            ('zMasterRegister', {
                    settings : this.serverSettings,
                    sharedData : this.serverSharedData,
                    instanceId : this.zc.mainConfig.instanceId,
                    license : this.licenseData
                },
                async (err,data) => {
                    if(!err) {
                        try {
                            await this.reactOnRegisterRespond(data);
                            this.inRegisterProcess = false;
                            resolve();
                        }
                        catch (e) {
                         reject(e);
                        }
                    }
                    else {reject(err);}
                });
        });
    }

    /**
     * Reaction on the register responds from the state server.
     * @param data
     */
    private async reactOnRegisterRespond(data : any)
    {
        const info = data.info;
        const reconnectUUID = data.reconnectUUID;

        switch (info) {
            case 'first':
                this.reconnectUUID = reconnectUUID;
                break;
            case 'ok' :
                this.reconnectUUID = reconnectUUID;
                this.loadSharedData(data.sharedData);
                break;
            case 'reconnectMode' :
                const ms = data['tryIn'];
                Logger.printStartDebugInfo
                (`Zation-cluster-state server is in ${data['mode']} reconnectMode! Master is try again to connect in ${ms} ms.`);

                await new Promise((resolve,reject) => {
                    setTimeout(async () => {
                        try {
                            await this.registerMaster();
                            resolve();
                        }
                        catch (e) {reject(e);}
                    },Number(ms));
                });
                break;
            case 'notSameSettings' :
                const error = new Error(`Other connected servers with the zation-cluster-state server have different settings.`+
                    `Try to shut down all servers and start the server with the new settings to accept the other settings.`);
                (error as any).code = 'DIFFERENT_SETTINGS';
                throw error;
            case 'instanceIdAlreadyReg':
                Logger.printStartDebugInfo
                (`InstanceId: ${this.zc.mainConfig.instanceId} is already registered.` +
                    `Master tries to generate a new instanceID and to register to the state server again.`);
                this.zm.changeInstanceId(uuidV4());
                await this.registerMaster();
                break;
            default :
                const unknownError = new Error(`The respond info from the zation-cluster-state server could not be found.`);
                (unknownError as any).code = 'UNKNOWN_RESPOND_INFO';
                throw unknownError;
        }
    }

    /**
     * Method for joining the cluster.
     */
    private async joinCluster()
    {
        await new Promise((resolve)=> {
            this.stateSocket.emit('zMasterJoin',{},(err) => {
                err ?
                    this.zm.killServer(`Error by trying to join the cluster. Error -> ${err.toString()}`) :
                    resolve();
            });
        });
    }

    /**
     * A method that registers the listener for the leadership event.
     */
    private registerNewLeaderEvent() {
        this.stateSocket.on('newLeader',async (data,respond) => {
            this.activateLeadership();
            respond(null);
        });
    }

    /**
     * Will join the cluster, register for the new leader event.
     */
    public async start() {
        this.registerNewLeaderEvent();
        await this.joinCluster();
    }

    /**
     * Will tries more times to reconnect.
     */
    private async tryReconnect()
    {
        const tryRec = async () =>
        {
            await new Promise(async (resolve) => {
                if(this.stateSocket.getState() === this.stateSocket.OPEN) {
                    Logger.printDebugInfo('Try to reconnect to the state server.');

                    if(!(await this.reconnect())) {
                        Logger.printDebugWarning(`Reconnection to state server failed.`);
                        setTimeout(async () => {
                            await tryRec();
                            resolve();
                        },350);
                    }
                    else {
                        resolve();
                    }
                }
            })
        };
        await tryRec();
    }

    /**
     * Returns if the engine is connected to the state server.
     */
    public isConnected() : boolean {
        return this.stateSocket ? this.stateSocket.state === this.stateSocket.OPEN : false;
    }

    /**
     * Reconnect to the state server.
     */
    private reconnect() : Promise<boolean>
    {
        return new Promise(((resolve) =>
        {
            this.stateSocket.emit('zMasterReconnect',
                {
                    reconnectUUID : this.reconnectUUID,
                    settings : this.serverSettings,
                    sharedData : this.serverSharedData,
                    instanceId : this.zc.mainConfig.instanceId,
                    license : this.licenseData,
                    wasLeader : this.isClusterLeader
                }
                ,
                async (err,data) =>
                {
                    if(!err)
                    {
                        const info = data.info;
                        switch (info) {
                            case 'wrongReconnectUUID':
                                this.zm.killServer(`Failed to reconnect to state server -> wrong reconnect uuid!`);
                                break;
                            case 'removeLeadership':
                                this.deactivateLeadership();
                                resolve((await this.reconnect()));
                                break;
                            case 'ok':
                                Logger.printDebugInfo('Reconnected to state server!');
                                resolve(true);
                                break;
                            case 'alreadyJoined':
                                resolve(true);
                                break;
                            default:
                                resolve(false);
                                break;
                        }
                    }
                    else {
                        Logger.printDebugInfo(`Reconnection to state server failed. Error -> ${err.toString()}`);
                        resolve(false);
                    }
                });
        }));
    }
}

interface SharedData {
    tokenClusterKey : string,
    databoxKey : string,
    verifyKey ?: any,
    signKey ?: any,
    authAlgorithm ?: string
}