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

    private reconnectUUID : string;

    private connectSettings : object;
    private serverSettings : object;
    private serverSharedVar : object | string;

    private useSharedTokenAuth : boolean;

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

        this.buildServerSharedVar();
    }

    private buildServerSettings()
    {
        this.serverSettings = {
            tsEngine : this.zc.getMain(Const.Main.KEYS.TEMP_STORAGE_ENGINE),
            useShareTokenAuth : this.zc.getMain(Const.Main.KEYS.CLUSTER_SHARE_TOKEN_AUTH),
            useSecretKey : this.zc.isMain(Const.Main.KEYS.CLUSTER_SECRET_KEY)
        };
    }

    private buildServerSharedVar()
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
            this.serverSharedVar = this.encoder.encrypt(sharedVar);
        }
        else {
            this.serverSharedVar = sharedVar;
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
        c = ScClient.connect(this.connectSettings);

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

            this.stateSocket.on('connect', async () =>
            {
                if(this.firstConnection) {
                    this.firstConnection = false;
                    await this.registerMaster();
                    resolve();
                }
                else {
                    //reconnection to state server
                    this.reconnectStateServer();
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
                sharedVar : this.serverSharedVar,
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
            (`Zation-cluster-state server is in reconnectMode! Master is try again to connect in ${ms} ms`);

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




    }

    public activateLeader()
    {
        this.stateSocket('getSyncData',async (data,respond) => {
            respond(null,await this.zm.getSyncData());
        });

    }

    private reconnectStateServer()
    {
        this.stateSocket.emit('zMasterReconnect',
            {
                reconnectUUID : this.reconnectUUID,
                settings : this.serverSettings,
                sharedVar : this.serverSharedVar,
                instanceId : this.zc.getMain(Const.Main.KEYS.INSTANCE_ID),
                was
            }
            ,
        (err) =>
        {





        });



    }
}

export = StateServerEngine;