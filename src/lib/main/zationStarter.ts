/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */
                               require('cache-require-paths');
import BackgroundTaskSender  = require("../helper/background/backgroundTasksSender");
const  SocketCluster : any   = require('socketcluster');
import Const                 = require('../helper/constants/constWrapper');
import Logger                = require('../helper/logger/logger');
import ZationConfig          = require('./zationConfig');
import ConfigChecker         = require('../helper/config/configChecker');
import ConfigErrorBag        = require('../helper/config/configErrorBag');
import HashSet               = require('hashset');
import TimeTools             = require('../helper/tools/timeTools');
import PrepareClientJs       = require('../helper/client/prepareClientJs');
import MasterTempDbEngine    = require('../helper/tempDb/masterTempDbEngine');
import BackgroundTasksSetter = require("../helper/background/backgroundTasksSetter");
const  isWindows             = require('is-windows');
const  ScClient : any        = require('socketcluster-client');


class ZationStarter
{
    private static instance : ZationStarter | null = null;
    private static readonly version : string = '0.2.9';

    private readonly serverStartedTimeStamp : number;
    private readonly zc : ZationConfig;
    private workerIds : any;
    private brokerIds : any;
    private tempDbEngine : MasterTempDbEngine;
    private master : any;

    private stateServerActive : boolean;

    constructor(options)
    {
        if(ZationStarter.instance === null)
        {
            ZationStarter.instance = this;

            this.serverStartedTimeStamp = Date.now();
            this.zc = new ZationConfig(options);

            //setLogger
            Logger.setZationConfig(this.zc);
            this.workerIds = new HashSet();
            this.brokerIds = new HashSet();

            (async () =>
            {
                try
                {
                    await this.start();
                }
                catch (e)
                {
                    Logger.printStartFail(`Exception when trying to start server -> ${e.toString()}`);
                    console.log(e);
                }
            })();
        }
        else
        {
            Logger.printWarning('You can only start zation once.');
        }
    }

    private async start()
    {
        Logger.printBusy('Launching Zation');
        Logger.printDebugInfo('Zation is launching in debug Mode.');

        Logger.startStopWatch();
        let configErrorBag = new ConfigErrorBag();
        const configChecker = new ConfigChecker(this.zc,configErrorBag);

        configChecker.checkStarterConfig();
        if(configErrorBag.hasConfigError()) {
            Logger.printConfigErrorBag(configErrorBag);
            process.exit();
        }
        Logger.printStartDebugInfo(`Master has checked the start config.`,true);

        Logger.startStopWatch();
        this.zc.loadOtherConfigs();
        Logger.printStartDebugInfo(`Master has loaded the other config files.`,true);

        Logger.startStopWatch();
        configChecker.checkAllConfigs();
        if(configErrorBag.hasConfigError()) {
            Logger.printConfigErrorBag(configErrorBag);
            process.exit();
        }
        Logger.printStartDebugInfo(`Master has checked the config files.`,true);

        Logger.startStopWatch();
        PrepareClientJs.createServerSettingsFile(this.zc);
        Logger.printStartDebugInfo('Master builds the server settings file.',true);

        if(this.zc.isUseErrorInfoTempDb() || this.zc.isUseTokenInfoTempDb())
        {
            Logger.startStopWatch();
            this.tempDbEngine = new MasterTempDbEngine(this.zc);
            await this.tempDbEngine.init();
            Logger.printStartDebugInfo('Master init the master temp db engine.',true);
        }

        Logger.startStopWatch();
        this.startSocketCluster();
        Logger.printStartDebugInfo('Master starts socket cluster.',true);
    }

    private startSocketCluster()
    {
        try {
            require("sc-uws");
        }
        catch (e) {
            if(this.zc.getMain(Const.Main.KEYS.USE_SC_UWS)) {
                Logger.printStartFail
                (`Failed to load sc-uws! Error -> ${e.toString()}.`);

                if(isWindows()) {
                    Logger.printStartFail(`Try to install c++ compiler with command 'npm install --global --production windows-build-tools'`);
                }

                Logger.printStartFail
                (`${isWindows() ? 'Also you' : 'You'} can try to set the property 'useScUws' in Main or Start config to false. But you will lose performance!`);
                process.exit();
            }
        }

        let scOptions = {
            workers : this.zc.getMain(Const.Main.KEYS.WORKERS),
            brokers : this.zc.getMain(Const.Main.KEYS.BROKERS),
            rebootWorkerOnCrash: true,
            appName: this.zc.getMain(Const.Main.KEYS.APP_NAME),
            workerController:__dirname + '/zationWorker.js',
            brokerController:__dirname  + '/zationBroker.js',
            workerClusterController: null,
            environment : this.zc.getMain(Const.Main.KEYS.ENVIRONMENT),
            port   : this.zc.getMain(Const.Main.KEYS.PORT),
            path   : this.zc.getMain(Const.Main.KEYS.PATH),
            protocol : this.zc.getMain(Const.Main.KEYS.SECURE) ? 'https' : 'http',
            protocolOptions: this.zc.getMain(Const.Main.KEYS.HTTPS_CONFIG),
            authKey: this.zc.getMain(Const.Main.KEYS.AUTH_KEY),
            authAlgorithm: this.zc.getMain(Const.Main.KEYS.AUTH_ALGORITHM),
            authPublicKey: this.zc.getMain(Const.Main.KEYS.AUTH_PUBLIC_KEY),
            authPrivateKey: this.zc.getMain(Const.Main.KEYS.AUTH_PRIVATE_KEY),
            authDefaultExpiry: this.zc.getMain(Const.Main.KEYS.AUTH_DEFAULT_EXPIRY),
            zationConfigWorkerTransport : this.zc.getWorkerTransport(),
            zationServerVersion : ZationStarter.version,
            zationServerStartedTimeStamp : this.serverStartedTimeStamp,
            ipcAckTimeout: 3000,
            logLevel : this.zc.getMain(Const.Main.KEYS.SC_CONSOLE_LOG) ? 100 : 0,

        };

        if(this.zc.getMain(Const.Main.KEYS.USE_SC_UWS)) {
            scOptions['wsEngine'] = 'sc-uws';
        }
        else {
            scOptions['wsEngine'] = 'ws';
        }

        this.master = new SocketCluster(scOptions);

        // noinspection JSUnresolvedFunction
        this.master.on('ready',async () =>
        {
           this.stateServerActive =  !!this.master.options.clusterStateServerHost;

           if(!this.stateServerActive) {
               Logger.startStopWatch();
               this.startBackgroundTasks();
               Logger.printStartDebugInfo('Master init the background tasks.',true);
           }
           else
           {
               try {
                   await this.connectToStateServer();
               }
               catch (e) {
                   this.crashServer(e);
               }
           }

           this.printStartedInformation();
           await this.zc.emitEvent(Const.Event.ZATION_IS_STARTED, this.zc.getSomeInformation());
        });


        // noinspection JSUnresolvedFunction
        this.master.on('workerMessage', async (wId,data,resp) =>
        {
            if(data['memoryDbRequest'])
            {
                await this.tempDbEngine.processMemoryDbReq(data['memoryDbRequestData'],resp);
            }
            else
            {
                resp(new Error('Unknown command!'));
            }
        });

        // noinspection JSUnresolvedFunction
        this.master.on('workerStart', (info) =>
        {
            let id = info.id;
            // noinspection JSUnresolvedFunction
            if(id  !== undefined && !this.workerIds.contains(id)) {
                // noinspection JSUnresolvedFunction
                this.workerIds.add(id);
            }
        });

        // noinspection JSUnresolvedFunction
        this.master.on('brokerStart', (info) =>
        {
            let id = info.id;
            // noinspection JSUnresolvedFunction
            if(id  !== undefined && !this.brokerIds.contains(id)) {
                // noinspection JSUnresolvedFunction
                this.brokerIds.add(id);
            }
        });

        // noinspection JSUnresolvedFunction
        this.master.on('workerExit', (info) =>
        {
            let id = info.id;
            if(id  !== undefined) {
                // noinspection JSUnresolvedFunction
                this.workerIds.remove(id);
            }
        });

        // noinspection JSUnresolvedFunction
        this.master.on('brokerExit', (info) =>
        {
            let id = info.id;
            if(id  !== undefined) {
                // noinspection JSUnresolvedFunction
                this.brokerIds.remove(id);
            }
        });
    }

    private printStartedInformation()
    {
        const hostName = this.zc.getMain(Const.Main.KEYS.HOSTNAME);
        const port     = this.zc.getMain(Const.Main.KEYS.PORT);
        const path     = this.zc.getMain(Const.Main.KEYS.PATH);
        const protocol = this.zc.getMain(Const.Main.KEYS.SECURE) ? 'https' : 'http';
        const server   = `${protocol}://${hostName}:${port}${path}`;

        Logger.log('\x1b[32m%s\x1b[0m', '   [ACTIVE]','Zation started');
        Logger.log(`            Version: ${ZationStarter.version}`);
        Logger.log(`            Your app: ${this.zc.getMain(Const.Main.KEYS.APP_NAME)}`);
        Logger.log(`            Hostname: ${hostName}`);
        Logger.log(`            Port: ${port}`);
        Logger.log(`            Time: ${TimeTools.getMoment(this.zc)}`);
        Logger.log(`            Time zone: ${this.zc.getMain(Const.Main.KEYS.TIME_ZONE)}`);
        Logger.log(`            Instance id: ${this.master.options.instanceId}`);
        Logger.log(`            WebSocket engine: ${this.master.options.wsEngine}`);
        Logger.log(`            Machine scaling active: ${this.stateServerActive}`);
        Logger.log(`            Worker count: ${this.master.options.workers}`);
        Logger.log(`            Broker count: ${this.master.options.brokers}`);
        Logger.log(`            Server: ${server}`);
        Logger.log('            GitHub: https://github.com/ZationServer');
        Logger.log(`            StartTime: ${Date.now()-this.serverStartedTimeStamp} ms`);
    }

    private getRandomWorkerId()
    {
        // noinspection JSUnresolvedFunction
        let array = this.workerIds.toArray();
        return array[Math.floor(Math.random()*array.length)];
    }

    //PART Scaling

    private async connectToStateServer()
    {
        //connect to state server
        const DEFAULT_PORT = 7777;
        const DEFAULT_RETRY_DELAY = 2000;
        const DEFAULT_STATE_SERVER_CONNECT_TIMEOUT = 3000;
        const DEFAULT_STATE_SERVER_ACK_TIMEOUT = 2000;
        const DEFAULT_RECONNECT_RANDOMNESS = 1000;
        const retryDelay = this.master.options.brokerRetryDelay || DEFAULT_RETRY_DELAY;
        const reconnectRandomness = this.master.stateServerReconnectRandomness || DEFAULT_RECONNECT_RANDOMNESS;
        const authKey = this.master.options.clusterAuthKey || null;

        const zcStateSocketOptions = {
            hostname: this.master.options.stateServerHost, // Required option
            port: this.master.options.stateServerPort || DEFAULT_PORT,
            connectTimeout: this.master.options.stateServerConnectTimeout || DEFAULT_STATE_SERVER_CONNECT_TIMEOUT,
            ackTimeout: this.master.options.stateServerAckTimeout || DEFAULT_STATE_SERVER_ACK_TIMEOUT,
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
        const stateSocket = ScClient.connect(zcStateSocketOptions);

        return new Promise((resolve, reject) =>
        {
            let connected : boolean = false;

            stateSocket.on('newLeader',(data,respond) => {
                this.activateLeader(stateSocket);
                respond(null);
            });

            stateSocket.on('connect', async () =>
            {
                connected = true;
                try {
                    await this.syncData(stateSocket);
                }
                catch (e) {
                    reject(e);
                }
                stateSocket.emit('zMasterJoin', {instanceId : this.master.options.instanceId},
                    (err) =>
                {
                    if(!err) {
                        reject(err);
                    }
                });
            });

            setTimeout(() =>
            {
                if(!connected) {
                    reject(new Error('Timeout to connect to zation-cluster-state server.'));
                }
            },5000);
        });
    }

    private async syncData(stateSocket : any)
    {
        Logger.printStartDebugInfo('Master is try to synchronize data from leader.');
        await new Promise((resolve, reject) =>
        {
            stateSocket.emit('getSyncData',{},async (err,data) => {
                if(err) {
                    reject(new Error(`Failed to get synchronize data error -> ${err.toString()}`));
                }

                if(data.haveLeader) {
                    Logger.startStopWatch();
                    await this.setSyncData(data);
                    Logger.printStartDebugInfo('Master synchronize data from leader.',true);
                    resolve();
                }
                else {
                    Logger.printStartDebugInfo(`Master does not need to synchronize data from a leader.`);
                }
            });
        });
    }

    private activateLeader(stateSocket : any)
    {
        Logger.printDebugInfo(`This Instance '${this.master.options.instanceId}' becomes the leader.`);

        Logger.startStopWatch();
        this.startBackgroundTasks();
        Logger.printStartDebugInfo('Master init the background tasks.',true);

        Logger.printStartDebugInfo('Master register on leader events.');
        stateSocket.on('getSyncData',async (data,respond) => {
            respond(null,await this.getSyncData());
        });
    }

    private async setSyncData(data : any)
    {
        //set data to broker


    }

    private async getSyncData()
    {
        //get data from broker
        this.brokerIds.toArray().forEach( (id) =>
        {

        });
    }

    // noinspection JSMethodCanBeStatic
    private crashServer(error : any)
    {
        Logger.printStartFail(error.message);
        process.exit();
    }

    //PART BackgroundTasks

    private startBackgroundTasks()
    {
        //userBackgroundTasks
        const bkTsSender = new BackgroundTaskSender(this,this.zc);

        const bkTS = new BackgroundTasksSetter(
            (name,time) => {

            bkTsSender.setEveryBackgroundTask(name,time);
        },
            (name,time) => {
            bkTsSender.setAtBackgroundTask(name,time);
        });

        bkTS.setUserBackgroundTasks(this.zc);

        //systemBackgroundTask
        setInterval(() =>
        {
            this.sendToRandomWorker({systemBackgroundTasks : true});
        }
        ,this.zc.getMain(Const.Main.KEYS.SYSTEM_BACKGROUND_TASK_REFRESH_RATE));
    }

    public sendToRandomWorker(obj)
    {
        let workerId = this.getRandomWorkerId();

        if(workerId !== undefined)
        {
            if(obj.userBackgroundTask !== undefined)
            {
                Logger.printDebugInfo
                (`Worker with id: ${workerId}, start to invoke background task : '${obj.userBackgroundTask}'`);
            }
            else if(obj.systemBackgroundTasks !== undefined && obj.systemBackgroundTasks)
            {
                Logger.printDebugInfo
                (`Worker with id: ${workerId}, start to invoke system background tasks`);
            }

            this.master.sendToWorker(workerId,obj)
        }
    }
}

export = ZationStarter;