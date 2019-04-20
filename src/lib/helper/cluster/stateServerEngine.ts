/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import ZationConfig from "../../main/zationConfig";
import ZationMaster from "../../main/zationMaster";
import Encoder      from "../tools/encoder";
import Logger       from "../logger/logger";

const  ScClient : any        = require('socketcluster-client');
const  uuidV4                = require('uuid/v4');

export default class StateServerEngine
{
    private zc : ZationConfig;
    private zm : ZationMaster;
    private stateSocket : any;
    private readonly useSecretKey : boolean;
    private encoder : Encoder;

    private inBootProcess : boolean = true;
    private firstConnection : boolean = true;
    private isClusterLeader : boolean = false;

    private reconnectUUID : string;

    private connectSettings : object;
    private serverSettings : object;
    private serverSharedData : object | string;

    private readonly useSharedTokenAuth : boolean;

    constructor(zc : ZationConfig,zm : ZationMaster)
    {
        this.zc = zc;
        this.zm = zm;

        this.useSharedTokenAuth = this.zc.mainConfig.clusterShareTokenAuth;
        this.useSecretKey = !!this.zc.mainConfig.clusterSecretKey;

        this.buildConnectSettings();
        this.buildServerSettings();

        if(this.useSecretKey) {
            // @ts-ignore
            this.encoder = new Encoder(this.zc.mainConfig.clusterSecretKey);
        }

        this.buildServerSharedData();
    }

    private buildServerSettings()
    {
        this.serverSettings = {
            useShareTokenAuth : this.useSharedTokenAuth,
            useSecretKey : this.useSecretKey
        };
    }

    private buildServerSharedData()
    {
        const sharedVar = {
                tokenCheckKey : this.zc.internalData.tokenCheckKey
            };

        if(this.useSharedTokenAuth) {
            sharedVar['authPubKey'] = this.zc.mainConfig.authPublicKey;
            sharedVar['authPriKey'] = this.zc.mainConfig.authPrivateKey;
            sharedVar['authKey'] = this.zc.mainConfig.authKey;
            sharedVar['authAlgorithm'] = this.zc.mainConfig.authAlgorithm;
        }

        if(this.useSecretKey) {
            this.serverSharedData = this.encoder.encrypt(sharedVar);
        }
        else {
            this.serverSharedData = sharedVar;
        }
    }

    private loadSharedVar(sharedVar : string | object)
    {
        let sharedVarDec;

        if(this.useSecretKey && typeof sharedVar === 'string') {
            try {
                sharedVarDec = this.encoder.decrypt(sharedVar);
            }
            catch (e) {
                this.zm.killServer(`Decrypting the shared variables failed.` +
                    `Check if every zation server has the same cluster secret key`)
            }
        }
        else {
            sharedVarDec = sharedVar;
        }

        if(typeof sharedVarDec === 'object')
        {
            this.zc.internalData.tokenCheckKey = sharedVarDec.tokenCheckKey;

            if(this.useSharedTokenAuth)
            {
                this.zc.mainConfig.authPublicKey = sharedVarDec['authPubKey'];
                this.zc.mainConfig.authPrivateKey = sharedVarDec['authPriKey'];
                this.zc.mainConfig.authKey = sharedVarDec['authKey'];
                this.zc.mainConfig.authAlgorithm = sharedVarDec['authAlgorithm'];
            }
        }
        else {
            this.zm.killServer(`Load the shared variables failed.` +
                `Check if every zation server has the same cluster secret key setting`)
        }
    }

    private buildConnectSettings() {
        //connect to state server
        const DEFAULT_PORT = 7777;
        const DEFAULT_RETRY_DELAY = 2000;
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
            }
        };
    }

    public registerStateServer()
    {
        this.stateSocket = ScClient.connect(this.connectSettings);
        Logger.printStartDebugInfo('Master wait for connection to zation-cluster-state server...');
        return new Promise((resolve) =>
        {
            this.stateSocket.on('error',async (e) =>
            {
                if(e.name === 'BadClusterAuthError') {
                    this.zm.killServer(`The provided 'clusterAuthKey' is wrong. Can't connect to zation-cluster-state server.`);
                }
            });

            this.stateSocket.on('disconnect',async ()=>
            {
                if(this.inBootProcess) {
                    this.zm.killServer(`Connection to state server is lost in boot process!`);
                }
                else {
                    //lost connection by running server
                    Logger.printDebugWarning
                    (`Connection to zation-cluster-state server is lost. To scale up or down, the state server must be reachable!`);
                }
            });

            this.stateSocket.on('connectAbort',async ()=>
            {
                if(this.inBootProcess) {
                    this.zm.killServer(`Connection to state server is failed in start process!`);
                }
                else {
                    Logger.printDebugWarning
                    (`Reconnection to zation-cluster-state server is failed. Connection is tried again.`);
                }
            });

            this.stateSocket.on('removeLeader',async (data,respond)=> {
                this.zm.deactivateClusterLeader();
                this.isClusterLeader = false;
                respond(null);
            });

            this.stateSocket.on('connect', async () =>
            {
                if(this.firstConnection) {
                    this.firstConnection = false;
                    Logger.printStartDebugInfo('Master is connected to zation-cluster-state server');
                    await this.registerMaster();
                    resolve();
                }
                else {
                    //reconnection to state server
                    let tryCount = 0;
                    const tryFunc = async () =>
                    {
                        if(tryCount < 4) {
                            tryCount++;
                            Logger.printDebugInfo('Try to reconnect to state server!');
                            const res = await this.reconnectStateServer();
                            if(!res) {
                                await tryFunc();
                            }
                        }
                        else {
                            Logger.printDebugWarning(`Reconnection to state server failed ${tryCount} times!`);
                        }
                    };
                    await tryFunc();
                }
            });
        });
    }

    private registerMaster()
    {
        return new Promise((resolve) =>
        {
            this.stateSocket.emit
            ('zMasterRegister',
                {
                    settings : this.serverSettings,
                    sharedData : this.serverSharedData,
                    instanceId : this.zc.mainConfig.instanceId
                },
                async (err,data) =>
                {
                    if(!err) {
                        await this.reactOnRegisterRespond(data);
                        resolve();
                    }
                    else {
                        throw err;
                    }
                });
        });
    }

    private async reactOnRegisterRespond(data : any)
    {
        const info = data.info;
        const reconnectUUID = data.reconnectUUID;

        if(info === 'first') {
            this.reconnectUUID = reconnectUUID;
        }
        else if(info === 'ok') {
            this.reconnectUUID = reconnectUUID;
            this.loadSharedVar(data.sharedVar);
        }
        else if(info === 'reconnectMode') {
            const ms = data['tryIn'];
            Logger.printStartDebugInfo
            (`Zation-cluster-state server is in ${data['mode']} reconnectMode! Master is try again to connect in ${ms} ms`);

            await new Promise((resolve) => {
                setTimeout(async () => {
                    await this.registerMaster();
                    resolve();
                },Number(ms));
            });
        }
        else if(info === 'notSameSettings') {
            this.zm.killServer(`Other connected servers with the zation-cluster-state server have different settings.`+
            `Try to shut down all servers and start the server with the new settings to accept the other settings.`);
        }
        else if(info === 'instanceIdAlreadyReg') {
            const oldInstanceId = this.zc.mainConfig.instanceId;

            Logger.printStartDebugInfo
            (`InstanceId: ${oldInstanceId} is already registered.` +
             `Master tries to generate a new instanceID and to register to the state server again.`);

            this.zc.mainConfig.instanceId = uuidV4();
            await this.registerMaster();
        }
        else {
            this.zm.killServer(`The respond info from the zation-cluster-state server could not be found`);
        }
    }

    public async scStarted()
    {
        //register on newLeader event
        this.stateSocket.on('newLeader',async (data,respond) => {
            this.zm.activateClusterLeader();
            this.isClusterLeader = true;
            respond(null);
        });

        //join cluster
        await new Promise((resolve)=>
        {
            this.stateSocket.emit('zMasterJoin',{},(err) => {
                if(err) {
                    this.zm.killServer(`Error by trying to join the cluster. Error -> ${err.toString()}`);
                }
                else {
                    resolve();
                }
            });
        });

        this.inBootProcess = false;
    }

    private reconnectStateServer() : Promise<boolean>
    {
        return new Promise(((resolve) =>
        {
            this.stateSocket.emit('zMasterReconnect',
                {
                    reconnectUUID : this.reconnectUUID,
                    settings : this.serverSettings,
                    sharedData : this.serverSharedData,
                    instanceId : this.zc.mainConfig.instanceId,
                    wasLeader : this.isClusterLeader
                }
                ,
                (err,data) =>
                {
                    if(!err)
                    {
                        const info = data.info;
                        if(info === 'wrongReconnectUUID') {
                            this.zm.killServer(`Failed to reconnect to state server -> wrong reconnect uuid!`);
                        }
                        else if(info === 'failedToRemoveLeader') {
                            this.zm.killServer(`Failed to remove leadership!`);
                        }
                        else {
                            if(info === 'ok') {
                                Logger.printDebugInfo('Reconnected to state server!');
                            }
                            resolve(true);
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