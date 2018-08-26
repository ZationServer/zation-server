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

class StateServerEngine
{
    private zc : ZationConfig;
    private zm : ZationMaster;
    private stateSocket : any;
    private readonly useClusterEncode : boolean;
    private encoder : Encoder;

    private inBootProcess : boolean = true;

    constructor(zc : ZationConfig,zm : ZationMaster)
    {
        this.zc = zc;
        this.zm = zm;

        this.useClusterEncode =  !!this.zc.getMain(Const.Main.KEYS.CLUSTER_SECRET_KEY);
        if(this.useClusterEncode) {
            this.encoder = new Encoder(this.zc.getMain(Const.Main.KEYS.CLUSTER_SECRET_KEY));
        }
    }

    public async connectToStateServer()
    {
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

        const zcStateSocketOptions = {

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

        this.stateSocket = ScClient.connect(zcStateSocketOptions);

        return new Promise((resolve, reject) =>
        {
            let firstCon = true;

            this.stateSocket.on('error',async (e) =>
            {
                if(e.name === 'BadClusterAuthError') {
                    this.crashServer(`The provided 'clusterAuthKey' is wrong. Can't connect to zation-cluster-state server.`);
                }
                else {
                    Logger.printStartDebugInfo
                    (`Error by trying to connect to zation-cluster-state server -> ${e.toString()}. Connection is tried again.`);
                }
            });

            this.stateSocket.on('close',async ()=>
            {



            });

            this.stateSocket.on('connect', async () =>
            {
                if(firstCon)
                {
                    this.stateSocket.emit
                    ('zMasterRegister',
                        {
                            instanceId : this.master.options.instanceId,
                            tempStorageEngine : this.zc.getMain(Const.Main.KEYS.TEMP_STORAGE_ENGINE),
                            shareTokenAuth : this.zc.getMain(Const.Main.KEYS.CLUSTER_SHARE_TOKEN_AUTH)
                        },
                        (err) =>
                        {
                            if(!err) {
                                reject(err);
                            }
                        });
                }
            });
        });
    }
}

export = StateServerEngine;