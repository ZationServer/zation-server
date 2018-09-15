/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import ZationConfig          = require("../../main/zationConfig");
const  ScClient : any        = require('socketcluster-client');
import Const                 = require('../constants/constWrapper');
import ZationMaster          = require("../../main/zationMaster");
import Encoder               = require("../tools/encoder");
import Logger                = require("../logger/logger");
const  uuidV4                = require('uuid/v4');

class StateServerEngine
{
    private zc : ZationConfig;
    private zm : ZationMaster;
    private stateSocket : any;
    private readonly useClusterEncode : boolean;
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

        this.buildConnectSettings();
        this.buildServerSettings();

        this.useSharedTokenAuth = !!this.zc.getMain(Const.Main.KEYS.CLUSTER_SHARE_TOKEN_AUTH);
        this.useClusterEncode = !!this.zc.getMain(Const.Main.KEYS.CLUSTER_SECRET_KEY);

        if(this.useClusterEncode) {
            this.encoder = new Encoder(this.zc.getMain(Const.Main.KEYS.CLUSTER_SECRET_KEY));
        }

        this.buildServerSharedData();
    }

    private buildServerSettings()
    {
        this.serverSettings = {
            useShareTokenAuth : this.zc.getMain(Const.Main.KEYS.CLUSTER_SHARE_TOKEN_AUTH),
            useSecretKey : this.zc.isMain(Const.Main.KEYS.CLUSTER_SECRET_KEY)
        };
    }

    private buildServerSharedData()
    {
        const sharedVar = {
                tokenCheckKey : this.zc.getInternal(Const.Settings.INTERNAL_DATA.TOKEN_CHECK_KEY)
            };

        if(this.useSharedTokenAuth) {
            sharedVar['authPubKey'] = this.zc.getMain(Const.Main.KEYS.AUTH_PUBLIC_KEY);
            sharedVar['authPriKey'] = this.zc.getMain(Const.Main.KEYS.AUTH_PRIVATE_KEY);
            sharedVar['authKey'] = this.zc.getMain(Const.Main.KEYS.AUTH_KEY);
            sharedVar['authAlgorithm'] = this.zc.getMain(Const.Main.KEYS.AUTH_ALGORITHM);
        }

        if(this.useClusterEncode) {
            this.serverSharedData = this.encoder.encrypt(sharedVar);
        }
        else {
            this.serverSharedData = sharedVar;
        }
    }

    private loadSharedVar(sharedVar : string | object)
    {
        let sharedVarDec;

        if(this.useClusterEncode && typeof sharedVar === 'string') {
            try {
                sharedVarDec = this.encoder.decrypt(sharedVar);
            }
            catch (e) {
                this.zm.crashServer(`Decrypting the shared variables failed.` +
                    `Check if every zation server has the same cluster secret key`)
            }
        }
        else {
            sharedVarDec = sharedVar;
        }

        if(typeof sharedVarDec !== 'object')
        {
            this.zc.setInternal(Const.Settings.INTERNAL_DATA.TOKEN_CHECK_KEY,sharedVarDec.tokenCheckKey);

            if(this.useSharedTokenAuth)
            {
                this.zc.setMain(Const.Main.KEYS.AUTH_PUBLIC_KEY,sharedVarDec['authPubKey']);
                this.zc.setMain(Const.Main.KEYS.AUTH_PRIVATE_KEY,sharedVarDec['authPriKey']);
                this.zc.setMain(Const.Main.KEYS.AUTH_KEY,sharedVarDec['authKey']);
                this.zc.setMain(Const.Main.KEYS.AUTH_ALGORITHM,sharedVarDec['authAlgorithm']);
            }
        }
        else {
            this.zm.crashServer(`Load the shared variables failed.` +
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
        const reconnectRandomness = this.zc.getMainOrNull(Const.Main.KEYS.CLUSTER_STATE_SERVER_RECONNECT_RANDOMNESS)
            || DEFAULT_RECONNECT_RANDOMNESS;

        const authKey = this.zc.getMainOrNull(Const.Main.KEYS.CLUSTER_AUTH_KEY) || null;

        this.connectSettings = {

            hostname: this.zc.getMainOrNull(Const.Main.KEYS.STATE_SERVER_HOST), // Required option

            port: this.zc.getMainOrNull(Const.Main.KEYS.STATE_SERVER_PORT) || DEFAULT_PORT,

            connectTimeout: this.zc.getMainOrNull(Const.Main.KEYS.CLUSTER_STATE_SERVER_CONNECT_TIMEOUT)
                || DEFAULT_STATE_SERVER_CONNECT_TIMEOUT,

            ackTimeout: this.zc.getMainOrNull(Const.Main.KEYS.CLUSTER_STATE_SERVER_ACK_TIMEOUT)
                || DEFAULT_STATE_SERVER_ACK_TIMEOUT,

            autoReconnectOptions: {
                initialDelay: retryDelay,
                randomness: reconnectRandomness,
                multiplier: 1,
                maxDelay: retryDelay + reconnectRandomness
            },
            query: {
                authKey,
                instancePort: this.zc.getMain(Const.Main.KEYS.PORT),
                instanceType: 'zation-master',
            }
        };
    }

    public async registerStateServer()
    {
        this.stateSocket = ScClient.connect(this.connectSettings);

        return new Promise((resolve) =>
        {
            this.stateSocket.on('error',async (e) =>
            {
                if(e.name === 'BadClusterAuthError') {
                    this.zm.crashServer(`The provided 'clusterAuthKey' is wrong. Can't connect to zation-cluster-state server.`);
                }
                else {
                    Logger.printStartDebugInfo
                    (`Error by trying to connect to zation-cluster-state server -> ${e.toString()}. Connection is tried again.`);
                }
            });

            this.stateSocket.on('close',async ()=>
            {
                if(this.inBootProcess) {
                    this.zm.crashServer(`Connection to state server is lost in boot process!`);
                }
                else {
                    //lost connection by running server
                    Logger.printDebugWarning
                    (`Connection to zation-cluster-state server is closed. To scale up or down, the state server must be reachable!`);
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
                            const res = await this.reconnectStateServer();
                            if(!res) {
                                await tryFunc();
                            }
                        }
                        else {
                            Logger.printDebugWarning(`Reconnection to state server failed ${tryCount} times!`);
                        }
                    }
                }
            });
        });
    }

    private async registerMaster()
    {
        this.stateSocket.emit
        ('zMasterRegister',
            {
                settings : this.serverSettings,
                sharedData : this.serverSharedData,
                instanceId : this.zc.getMain(Const.Main.KEYS.INSTANCE_ID)
            },
            async (err,data) =>
            {
                if(!err) {
                    await this.reactOnRegisterRespond(data);
                }
                else {
                    throw err;
                }
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
            this.zm.crashServer(`Other connected servers with the zation-cluster-state server have different settings.`+
            `Try to shut down all servers and start the server with the new settings to accept the other settings.`);
        }
        else if(info === 'instanceIdAlreadyReg') {
            const oldInstanceId = this.zc.getMain(Const.Main.KEYS.INSTANCE_ID);

            Logger.printStartDebugInfo
            (`InstanceId: ${oldInstanceId} is already registered.` +
             `Master tries to generate a new instanceID and to register to the state server again.`);

            this.zc.setMain(Const.Main.KEYS.INSTANCE_ID,uuidV4());
            await this.registerMaster();
        }
        else {
            this.zm.crashServer(`The respond info from the zation-cluster-state server could not be found`);
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
                    this.zm.crashServer(`Error by trying to join the cluster. Error -> ${err.toString()}`);
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
                    instanceId : this.zc.getMain(Const.Main.KEYS.INSTANCE_ID),
                    wasLeader : this.isClusterLeader
                }
                ,
                (err,data) =>
                {
                    if(!err)
                    {
                        const info = data.info;
                        if(info === 'wrongReconnectUUID') {
                            this.zm.crashServer(`Failed to reconnect to state server -> wrong reconnect uuid!`);
                        }
                        else if(info === 'failedToRemoveLeader') {
                            this.zm.crashServer(`Failed to remove leadership!`);
                        }
                        else {
                            if(info === 'ok') {
                                Logger.printDebugInfo('Reconnected to state server!');
                            }
                            resolve(true);
                        }
                    }
                    else {
                        Logger.printDebugInfo(`Reconnection to state server failed. Error -> ${err.toString()}`)
                        resolve(false);
                    }
                });
        }));
    }
}

export = StateServerEngine;