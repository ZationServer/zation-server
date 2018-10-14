/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import PortChecker = require("../helper/tools/portChecker");

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
import BackgroundTasksSetter = require("../helper/background/backgroundTasksSetter");
const  isWindows             = require('is-windows');
import StateServerEngine     = require("../helper/cluster/stateServerEngine");
import {WorkerMessageActions} from "../helper/constants/workerMessageActions";

class ZationMaster {
    private static instance: ZationMaster | null = null;
    private static readonly version: string = '0.3.7';

    private readonly serverStartedTimeStamp: number;
    private readonly zc: ZationConfig;
    private workerIds: any;
    private brokerIds: any;
    private master: any;

    //cluster
    private clusterStateServerHost: any;
    private stateServerActive: boolean;
    private stateServerEngine: StateServerEngine;

    private clusterLeader: boolean = false;

    //backgroundTasks
    private backgroundTaskActive: boolean = true;
    private backgroundTaskInit: boolean = false;

    constructor(options) {
        if (ZationMaster.instance === null) {
            ZationMaster.instance = this;

            this.serverStartedTimeStamp = Date.now();
            this.zc = new ZationConfig(options);

            //setLogger
            Logger.setZationConfig(this.zc);
            this.workerIds = new HashSet();
            this.brokerIds = new HashSet();

            (async () => {
                try {
                    await this.start();
                }
                catch (e) {
                    Logger.printStartFail(`Exception when trying to start server -> ${e.toString()}`);
                }
            })();
        }
        else {
            Logger.printWarning('You can only start zation once.');
        }
    }

    private async start() {
        Logger.printBusy('Launching Zation');
        Logger.printDebugInfo('Zation is launching in debug Mode.');

        Logger.startStopWatch();
        let configErrorBag = new ConfigErrorBag();
        const configChecker = new ConfigChecker(this.zc, configErrorBag);

        configChecker.checkStarterConfig();
        if (configErrorBag.hasConfigError()) {
            Logger.printConfigErrorBag(configErrorBag);
            process.exit();
        }
        Logger.printStartDebugInfo(`Master has checked the start config.`, true);

        Logger.startStopWatch();
        this.zc.loadOtherConfigs();
        Logger.printStartDebugInfo(`Master has loaded the other config files.`, true);

        Logger.startStopWatch();
        configChecker.checkAllConfigs();
        if (configErrorBag.hasConfigError()) {
            Logger.printConfigErrorBag(configErrorBag);
            process.exit();
        }
        Logger.printStartDebugInfo(`Master has checked the config files.`, true);

        Logger.startStopWatch();
        PrepareClientJs.createServerSettingsFile(this.zc);
        Logger.printStartDebugInfo('Master builds the server settings file.', true);

        await this.checkPort();

        this.checkClusterMode();
        if (this.stateServerActive) {
            //cluster active
            this.stateServerEngine = new StateServerEngine(this.zc, this);
            try {
                await this.stateServerEngine.registerStateServer();
            }
            catch (e) {
                this.crashServer(e);
            }
        }
        this.startSocketClusterWithLog();
    }

    public startSocketClusterWithLog() {
        Logger.startStopWatch();
        this.startSocketCluster();
        Logger.printStartDebugInfo('Master starts sc cluster.', true);
    }

    private async checkPort()
    {
        Logger.startStopWatch();
        const port = this.zc.getMain(Const.Main.KEYS.PORT);
        const portIsAvailable = await PortChecker.isPortAvailable(port);
        if(!portIsAvailable) {
            this.crashServer(`The port ${port} is not available! try with a different port!`);
        }
        Logger.printStartDebugInfo('Master checked port is available.', true);
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

        const scLogLevel = this.zc.getMain(Const.Main.KEYS.SC_CONSOLE_LOG) ?
            this.zc.getMainOrNull(Const.Main.KEYS.SC_LOG_LEVEL) : 0;

        let scOptions = {
            workers : this.zc.getMain(Const.Main.KEYS.WORKERS),
            brokers : this.zc.getMain(Const.Main.KEYS.BROKERS),
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
            zationServerVersion : ZationMaster.version,
            zationServerStartedTimeStamp : this.serverStartedTimeStamp,
            logLevel : scLogLevel,
            clusterAuthKey : this.zc.getMainOrNull(Const.Main.KEYS.CLUSTER_AUTH_KEY),
            clusterStateServerHost : this.clusterStateServerHost,
            clusterStateServerPort : this.zc.getMainOrNull(Const.Main.KEYS.STATE_SERVER_PORT),
            clusterMappingEngine : this.zc.getMainOrNull(Const.Main.KEYS.CLUSTER_MAPPING_ENGINE),
            clusterClientPoolSize : this.zc.getMainOrNull(Const.Main.KEYS.CLUSTER_CLIENT_POOL_SIZE),
            clusterInstanceIp : this.zc.getMainOrNull(Const.Main.KEYS.CLUSTER_INSTANCE_IP),
            clusterInstanceIpFamily : this.zc.getMainOrNull(Const.Main.KEYS.CLUSTER_INSTANCE_IP_FAMILY),
            clusterStateServerConnectTimeout : this.zc.getMainOrNull(Const.Main.KEYS.CLUSTER_STATE_SERVER_CONNECT_TIMEOUT),
            clusterStateServerAckTimeout : this.zc.getMainOrNull(Const.Main.KEYS.CLUSTER_STATE_SERVER_ACK_TIMEOUT),
            clusterStateServerReconnectRandomness : this.zc.getMainOrNull(Const.Main.KEYS.CLUSTER_STATE_SERVER_RECONNECT_RANDOMNESS),
            socketChannelLimit : this.zc.getMainOrNull(Const.Main.KEYS.SOCKET_CHANNEL_LIMIT),
            crashWorkerOnError : this.zc.getMainOrNull(Const.Main.KEYS.CRASH_WORKER_ON_ERROR),
            rebootWorkerOnCrash: this.zc.getMainOrNull(Const.Main.KEYS.REBOOT_WORKER_ON_CRASH),
            killMasterOnSignal : this.zc.getMainOrNull(Const.Main.KEYS.KILL_MASTER_ON_SIGNAL),
            instanceId : this.zc.getMainOrNull(Const.Main.KEYS.INSTANCE_ID),
            killWorkerMemoryThreshold : this.zc.getMainOrNull(Const.Main.KEYS.KILL_WORKER_MEMORY_THRESHOLD),
            connectTimeout : this.zc.getMainOrNull(Const.Main.KEYS.CONNECT_TIMEOUT),
            handshakeTimeout : this.zc.getMainOrNull(Const.Main.KEYS.HANDSHAKE_TIMEOUT),
            ackTimeout : this.zc.getMainOrNull(Const.Main.KEYS.ACK_TIMEOUT),
            ipcAckTimeout : this.zc.getMainOrNull(Const.Main.KEYS.IPC_ACK_TIMEOUT),
            socketUpgradeTimeout : this.zc.getMainOrNull(Const.Main.KEYS.SOCKET_UPGRADE_TIMEOUT),
            origins : this.zc.getMainOrNull(Const.Main.KEYS.ORIGINS),
            pingInterval : this.zc.getMainOrNull(Const.Main.KEYS.PING_INTERVAL),
            pingTimeout : this.zc.getMainOrNull(Const.Main.KEYS.PING_TIMEOUT),
            processTermTimeout : this.zc.getMainOrNull(Const.Main.KEYS.PROCESS_TERM_TIME_OUT),
            propagateErrors : this.zc.getMainOrNull(Const.Main.KEYS.PROPAGATE_ERRORS),
            propagateWarnings : this.zc.getMainOrNull(Const.Main.KEYS.PROPAGATE_WARNINGS),
            middlewareEmitWarnings : this.zc.getMainOrNull(Const.Main.KEYS.MIDDLEWARE_EMIT_WARNINGS),
            rebootOnSignal : this.zc.getMainOrNull(Const.Main.KEYS.REBOOT_ON_SIGNAL),
            downgradeToUser : this.zc.getMainOrNull(Const.Main.KEYS.DOWNGRADE_TO_USER),
            socketRoot : this.zc.getMainOrNull(Const.Main.KEYS.SOCKET_ROOT),
            schedulingPolicy : this.zc.getMainOrNull(Const.Main.KEYS.SCHEDULING_POLICY),
            allowClientPublish : this.zc.getMainOrNull(Const.Main.KEYS.ALLOW_CLIENT_PUBLISH),
            tcpSynBacklog : this.zc.getMainOrNull(Const.Main.KEYS.TCP_SYN_BACKLOG),
            workerStatusInterval : this.zc.getMainOrNull(Const.Main.KEYS.WORKER_STATUS_INTERVAL),
            pubSubBatchDuration : this.zc.getMainOrNull(Const.Main.KEYS.PUB_SUB_BATCH_DURATION),
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
           if(!this.stateServerActive) {
               //not in cluster mode
               Logger.startStopWatch();
               this.startBackgroundTasks();
               Logger.printStartDebugInfo('Master init the background tasks.',true);
               this.backgroundTaskInit = true;
               this.backgroundTaskActive = true;
               this.clusterLeader = true;
           }
           else {
               await this.stateServerEngine.scStarted();
           }

           this.printStartedInformation();
           await this.zc.emitEvent(Const.Event.ZATION_IS_STARTED, this.zc.getSomeInformation());
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
        this.master.on('workerMessage', (workerId,data,respond) =>
        {
            const action = data.action;
            if(action === WorkerMessageActions.IS_LEADER) {
                respond(null,{isLeader : this.clusterLeader});
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
        Logger.log(`            Version: ${ZationMaster.version}`);
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
        if(this.zc.getMain(Const.Main.KEYS.USE_PANEL)) {
            Logger.log(`            Panel: ${server}/panel`);
        }
        if(this.zc.getMain(Const.Main.KEYS.CLIENT_JS_PREPARE)) {
            Logger.log(`            ClientJs: ${server}/client`);
        }
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
    private checkClusterMode() {
        this.clusterStateServerHost = this.zc.getMainOrNull(Const.Main.KEYS.STATE_SERVER_HOST);
        this.stateServerActive =  !!this.clusterStateServerHost;
    }

    public activateClusterLeader() : void
    {
        Logger.printDebugInfo(`This Instance '${this.master.options.instanceId}' becomes the cluster leader.`);

        if(!this.backgroundTaskInit) {
            Logger.startStopWatch();
            this.startBackgroundTasks();
            Logger.printStartDebugInfo('Master init the background tasks.',true);
            this.backgroundTaskInit = true;
        }
        this.backgroundTaskActive = true;
        this.clusterLeader = true;
    }

    public deactivateClusterLeader() : void
    {
        Logger.printDebugInfo(`This Instance '${this.master.options.instanceId}' gets the lead taken off!`);
        this.backgroundTaskActive = false;
        this.clusterLeader = false;
    }

    //PART Crash
    // noinspection JSMethodCanBeStatic
    public crashServer(error : Error | string)
    {
        if(this.master) {
            this.master.killWorkers();
            this.master.killBrokers();
        }
        let txt = typeof error === 'object' ?
            error.message : error;
        Logger.printStartFail(txt);
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
    }

    public sendBackgroundTask(obj)
    {
        if(this.backgroundTaskActive) {
            this.sendToRandomWorker(obj);
        }
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

export = ZationMaster;