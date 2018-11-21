/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import PortChecker = require("../helper/tools/portChecker");

require('cache-require-paths');
import BackgroundTaskSender  = require("../helper/background/backgroundTasksSender");
const  SocketCluster : any   = require('socketcluster');
import Logger                = require('../helper/logger/logger');
import ZationConfig          = require('./zationConfig');
import ConfigChecker         = require('../helper/config/configChecker');
import ConfigErrorBag        = require('../helper/config/configErrorBag');
import HashSet               = require('hashset');
import TimeTools             = require('../helper/tools/timeTools');
import ClientPrepare         = require('../helper/client/clientPrepare');
import BackgroundTasksSetter = require("../helper/background/backgroundTasksLoader");
const  isWindows             = require('is-windows');
import StateServerEngine     = require("../helper/cluster/stateServerEngine");
import {WorkerMessageActions} from "../helper/constants/workerMessageActions";

class ZationMaster {
    private static instance: ZationMaster | null = null;
    private static readonly version: string = '0.4.8';

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

    //prepareClient
    private fullClientJs : string;
    private serverSettingsJs : string;

    constructor(options) {
        if (ZationMaster.instance === null) {
            ZationMaster.instance = this;

            this.serverStartedTimeStamp = Date.now();
            this.workerIds = new HashSet();
            this.brokerIds = new HashSet();
            this.zc = new ZationConfig(options);

            (async () => {

                //loads main config and defaults
                await this.zc.masterInit();

                //setLogger
                Logger.setZationConfig(this.zc);

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
        await this.zc.loadOtherConfigs();
        Logger.printStartDebugInfo(`Master has loaded the other config files.`, true);

        Logger.startStopWatch();
        configChecker.checkAllConfigs();
        if (configErrorBag.hasConfigError()) {
            Logger.printConfigErrorBag(configErrorBag);
            process.exit();
        }
        Logger.printStartDebugInfo(`Master has checked the config files.`, true);

        await this.checkPort();

        Logger.startStopWatch();
        this.serverSettingsJs = ClientPrepare.createServerSettingsFile(this.zc);
        Logger.printStartDebugInfo(`Master has prepared the server settings js file.`, true);

        if(this.zc.mainConfig.clientJsPrepare) {
            Logger.startStopWatch();
            this.fullClientJs = ClientPrepare.buildClientJs(this.serverSettingsJs);
            Logger.printStartDebugInfo(`Master has prepared the client js file.`, true);
        }

        this.checkClusterMode();
        if (this.stateServerActive) {
            //cluster active
            this.stateServerEngine = new StateServerEngine(this.zc, this);
            try {
                await this.stateServerEngine.registerStateServer();
            }
            catch (e) {
                this.killServer(e);
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
        const port = this.zc.mainConfig.port;
        const portIsAvailable = await PortChecker.isPortAvailable(port);
        if(!portIsAvailable) {
            this.killServer(`The port ${port} is not available! try with a different port!`);
        }
        Logger.printStartDebugInfo('Master checked port is available.', true);
    }

    private startSocketCluster()
    {
        try {
            require("sc-uws");
        }
        catch (e) {
            if(this.zc.mainConfig.useScUws) {
                Logger.printStartFail
                (`Failed to load sc-uws! Error -> ${e.toString()}.`);
                if(isWindows()) {
                    Logger.printStartFail(`Try to install c++ compiler with command 'npm install --global --production windows-build-tools' and 'npm install -g node-gyp'`);
                }
                Logger.printStartFail
                (`${isWindows() ? 'Also you' : 'You'} can try to set the property 'useScUws' in Main or Start config to false. But you will lose performance!`);
                process.exit();
            }
        }

        const scLogLevel = this.zc.mainConfig.scConsoleLog ?
            this.zc.mainConfig.scLogLevel || null : 0;

        let scOptions = {
            workers : this.zc.mainConfig.workers,
            brokers : this.zc.mainConfig.brokers,
            appName: this.zc.mainConfig.appName,
            workerController:__dirname + '/zationWorker.js',
            brokerController:__dirname  + '/zationBroker.js',
            workerClusterController: null,
            environment : this.zc.mainConfig.environment,
            port   : this.zc.mainConfig.port,
            path   : this.zc.mainConfig.path,
            protocol : this.zc.mainConfig.secure ? 'https' : 'http',
            protocolOptions: this.zc.mainConfig.httpsConfig,
            authKey: this.zc.mainConfig.authKey,
            authAlgorithm: this.zc.mainConfig.authAlgorithm,
            authPublicKey: this.zc.mainConfig.authPublicKey,
            authPrivateKey: this.zc.mainConfig.authPrivateKey,
            authDefaultExpiry: this.zc.mainConfig.authDefaultExpiry,
            zationConfigWorkerTransport : this.zc.getWorkerTransport(),
            zationServerVersion : ZationMaster.version,
            zationServerStartedTimeStamp : this.serverStartedTimeStamp,
            logLevel : scLogLevel,
            clusterAuthKey : this.zc.mainConfig.clusterAuthKey || null,
            clusterStateServerHost : this.clusterStateServerHost,
            clusterStateServerPort : this.zc.mainConfig.stateServerPort || null,
            clusterMappingEngine : this.zc.mainConfig.clusterMappingEngine || null,
            clusterClientPoolSize : this.zc.mainConfig.clusterClientPoolSize || null,
            clusterInstanceIp : this.zc.mainConfig.clusterInstanceIp || null,
            clusterInstanceIpFamily : this.zc.mainConfig.clusterInstanceIpFamily || null,
            clusterStateServerConnectTimeout : this.zc.mainConfig.clusterStateServerConnectTimeout || null,
            clusterStateServerAckTimeout : this.zc.mainConfig.clusterStateServerAckTimeout || null,
            clusterStateServerReconnectRandomness : this.zc.mainConfig.clusterStateServerReconnectRandomness || null,
            socketChannelLimit : this.zc.mainConfig.socketChannelLimit || null,
            crashWorkerOnError : this.zc.mainConfig.crashWorkerOnError || null,
            rebootWorkerOnCrash: this.zc.mainConfig.rebootWorkerOnCrash || null,
            killMasterOnSignal : this.zc.mainConfig.killMasterOnSignal || null,
            instanceId : this.zc.mainConfig.instanceId || null,
            killWorkerMemoryThreshold : this.zc.mainConfig.killWorkerMemoryThreshold || null,
            connectTimeout : this.zc.mainConfig.connectTimeout || null,
            handshakeTimeout : this.zc.mainConfig.handshakeTimeout || null,
            ackTimeout : this.zc.mainConfig.ackTimeout || null,
            ipcAckTimeout : this.zc.mainConfig.ipcAckTimeout || null,
            socketUpgradeTimeout : this.zc.mainConfig.socketUpgradeTimeout || null,
            origins : this.zc.mainConfig.origins || null,
            pingInterval : this.zc.mainConfig.pingInterval || null,
            pingTimeout : this.zc.mainConfig.pingTimeout || null,
            processTermTimeout : this.zc.mainConfig.processTermTimeout || null,
            propagateErrors : this.zc.mainConfig.propagateErrors || null,
            propagateWarnings : this.zc.mainConfig.propagateWarnings || null,
            middlewareEmitWarnings : this.zc.mainConfig.middlewareEmitWarnings || null,
            rebootOnSignal : this.zc.mainConfig.rebootOnSignal || null,
            downgradeToUser : this.zc.mainConfig.downgradeToUser || null,
            socketRoot : this.zc.mainConfig.socketRoot || null,
            schedulingPolicy : this.zc.mainConfig.schedulingPolicy || null,
            allowClientPublish : this.zc.mainConfig.allowClientPublish || null,
            tcpSynBacklog : this.zc.mainConfig.tcpSynBacklog || null,
            workerStatusInterval : this.zc.mainConfig.workerStatusInterval || null,
            pubSubBatchDuration : this.zc.mainConfig.pubSubBatchDuration || null,
        };

        if(this.zc.mainConfig.useScUws) {
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
           await this.zc.emitEvent(this.zc.eventConfig.isStarted, this.zc.getZationInfo());
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
            switch (action) {
                case WorkerMessageActions.IS_LEADER:
                    respond(null,{isLeader : this.clusterLeader});
                    break;
                case WorkerMessageActions.FULL_CLIENT_JS:
                    respond(null,this.fullClientJs);
                    break;
                case WorkerMessageActions.SERVER_SETTINGS_JS:
                    respond(null,this.serverSettingsJs);
                    break;
                case WorkerMessageActions.KILL_SERVER:
                    this.killServer(data.data);
                    respond(null);
                    break;
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
        const hostName = this.zc.mainConfig.hostname;
        const port     = this.zc.mainConfig.port;
        const path     = this.zc.mainConfig.path;
        const protocol = this.zc.mainConfig.secure ? 'https' : 'http';
        const server   = `${protocol}://${hostName}:${port}${path}`;

        Logger.log('\x1b[32m%s\x1b[0m', '   [ACTIVE]','Zation started');
        Logger.log(`            Version: ${ZationMaster.version}`);
        Logger.log(`            Your app: ${this.zc.mainConfig.appName}`);
        Logger.log(`            Hostname: ${hostName}`);
        Logger.log(`            Port: ${port}`);
        Logger.log(`            Time: ${TimeTools.getMoment(this.zc)}`);
        Logger.log(`            Time zone: ${this.zc.mainConfig.timeZone}`);
        Logger.log(`            Instance id: ${this.master.options.instanceId}`);
        Logger.log(`            WebSocket engine: ${this.master.options.wsEngine}`);
        Logger.log(`            Machine scaling active: ${this.stateServerActive}`);
        Logger.log(`            Worker count: ${this.master.options.workers}`);
        Logger.log(`            Broker count: ${this.master.options.brokers}`);
        Logger.log(`            Server: ${server}`);
        if(this.zc.mainConfig.usePanel) {
            Logger.log(`            Panel: ${server}/panel`);
        }
        if(this.zc.mainConfig.clientJsPrepare) {
            Logger.log(`            ClientJs: ${server}/client.js`);
        }
        Logger.log('            GitHub: https://github.com/ZationServer');
        Logger.log(`            StartTime: ${Date.now()-this.serverStartedTimeStamp} ms`);
        Logger.log('            Copyright by Luca Scaringella');
    }

    private getRandomWorkerId()
    {
        // noinspection JSUnresolvedFunction
        let array = this.workerIds.toArray();
        return array[Math.floor(Math.random()*array.length)];
    }

    //PART Scaling
    private checkClusterMode() {
        this.clusterStateServerHost = this.zc.mainConfig.stateServerHost || null;
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
    public killServer(error : Error | string)
    {
        if(this.master) {
            this.master.killWorkers();
            this.master.killBrokers();
        }
        const txt = typeof error === 'object' ?
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