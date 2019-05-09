/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import ConfigLoader from "../helper/configManager/configLoader";

require('cache-require-paths');
const  SocketCluster : any   = require('socketcluster');
const  isWindows             = require('is-windows');
import {WorkerMessageActions}  from "../helper/constants/workerMessageActions";
import {StarterConfig}         from "../helper/configDefinitions/starterConfig";
import StringSet               from "../helper/utils/simpleSet";
import StateServerEngine       from "../helper/cluster/stateServerEngine";
import Logger                  from "../helper/logger/logger";
import ConfigErrorBag          from "../helper/configUtils/configErrorBag";
import ConfigChecker           from "../helper/configUtils/configChecker";
import ClientPrepare           from "../helper/client/clientPrepare";
import PortChecker             from "../helper/utils/portChecker";
import TimeUtils               from "../helper/utils/timeUtils";
import BackgroundTasksSender   from "../helper/background/backgroundTasksSender";
import BackgroundTasksLoader   from "../helper/background/backgroundTasksLoader";
import ZationConfigMaster      from "../helper/configManager/zationConfigMaster";
// noinspection TypeScriptPreferShortImport
import {StartMode}             from "./../helper/constants/startMode";
import FuncUtils from "../helper/utils/funcUtils";

export default class ZationMaster {
    private static instance: ZationMaster | null = null;
    private static readonly version: string = '0.9.7';

    private readonly serverStartedTimeStamp: number;
    private zc: ZationConfigMaster;
    private readonly zcLoader : ConfigLoader;

    private workerIds: StringSet;
    private brokerIds: StringSet;
    private master: any;

    private readonly startUpCB : () => void;
    private readonly startMode : number;

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


    constructor(options : StarterConfig,startUpCB : () => void,startMode : number | string = 0) {

        if(typeof startMode === 'string'){startMode = parseInt(startMode);}
        startMode = startMode !== 0 && startMode !== 1 && startMode !== 2 ? 0 : startMode;

        this.startUpCB = startUpCB;
        this.startMode = startMode;

        if (ZationMaster.instance === null) {
            ZationMaster.instance = this;

            this.serverStartedTimeStamp = Date.now();
            this.workerIds = new StringSet();
            this.brokerIds = new StringSet();

            this.zcLoader = new ConfigLoader(options);

            (async () => {
                try {
                    await this.zcLoader.loadMainConfig();

                    this.zc = new ZationConfigMaster(
                        this.zcLoader.starterConfig,
                        this.zcLoader.mainConfig,
                        this.zcLoader.configLocations,
                        this.zcLoader.getRootPath(),
                        this.startMode
                    );

                    process.title = `Zation Server: ${this.zc.mainConfig.instanceId} -> Master`;

                    //setLogger
                    Logger.setZationConfig(this.zc);


                    if(startMode !== StartMode.ONLY_CHECK) {
                        //Check LogToFile
                        Logger.initFileLog();

                        await this.start();
                    }
                    else {
                        await this.check();
                    }
                }
                catch (e) {
                    Logger.printStartFail(`Exception when trying to start server -> ${e.stack}`);
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

        const configErrorBag = new ConfigErrorBag();
        const configChecker = new ConfigChecker(this.zcLoader, configErrorBag);

        if(this.zc.starterConfig.checkConfigs) {
            configChecker.checkStarterConfig();
            if (configErrorBag.hasConfigError()) {
                Logger.printConfigErrorBag(configErrorBag);
                process.exit();
            }
            Logger.printStartDebugInfo(`The Master has checked the starter config.`, true);
        }

        Logger.startStopWatch();
        await this.zcLoader.loadOtherConfigs();

        if(this.zcLoader.loadedConfigs.length > 0) {
            const moreConfigs = this.zcLoader.loadedConfigs.length>1;
            Logger.printDebugInfo
            (`The configuration${moreConfigs ? 's' : ''}: ${this.zcLoader.loadedConfigs.toString()} ${moreConfigs ? 'are' : 'is'} loaded.`);
        }
        else {
            Logger.printDebugInfo(`No config file with root path: '${this.zc.rootPath}' was found.`)
        }
        Logger.printStartDebugInfo(`The Master has loaded the other config files.`, true);

        if(this.zc.starterConfig.checkConfigs) {
            Logger.startStopWatch();
            configChecker.checkAllConfigs();
            if (configErrorBag.hasConfigError()) {
                Logger.printConfigErrorBag(configErrorBag);
                process.exit();
            }
            Logger.printStartDebugInfo(`The Master has checked the config files.`, true);
        }

        await this.checkPort();

        Logger.startStopWatch();
        this.serverSettingsJs = ClientPrepare.createServerSettingsFile(this.zc);
        Logger.printStartDebugInfo(`The Master has prepared the server settings js file.`, true);

        if(this.zc.mainConfig.provideClientJs) {
            Logger.startStopWatch();
            this.fullClientJs = ClientPrepare.buildClientJs(this.serverSettingsJs);
            Logger.printStartDebugInfo(`The Master has prepared the client js file.`, true);
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

    private async check() {
        Logger.startStopWatch();
        const configErrorBag = new ConfigErrorBag();
        const configChecker = new ConfigChecker(this.zcLoader, configErrorBag);

        configChecker.checkStarterConfig();
        if (configErrorBag.hasConfigError()) {
            Logger.printConfigErrorBag(configErrorBag);
            process.exit();
        }
        Logger.printStartDebugInfo(`Checked starter config.`, true);

        Logger.startStopWatch();
        await this.zcLoader.loadOtherConfigs();

        if(this.zcLoader.loadedConfigs.length > 0) {
            const moreConfigs = this.zcLoader.loadedConfigs.length>1;
            Logger.printDebugInfo
            (`The configuration${moreConfigs ? 's' : ''}: ${this.zcLoader.loadedConfigs.toString()} ${moreConfigs ? 'are' : 'is'} loaded.`);
        }
        else {
            Logger.printDebugInfo(`No config file with root path: '${this.zc.rootPath}' was found.`)
        }
        Logger.printStartDebugInfo(`Loaded the other config files.`, true);

        Logger.startStopWatch();
        configChecker.checkAllConfigs();
        if (configErrorBag.hasConfigError()) {
            Logger.printConfigErrorBag(configErrorBag);
            process.exit();
        }
        Logger.log('\x1b[32m%s\x1b[0m', '   [CHECKED]','✅ No configuration errors found.');
    }

    public startSocketClusterWithLog() {
        Logger.startStopWatch();
        this.startSocketCluster();
        Logger.printStartDebugInfo('The Master has started sc-cluster.', true);
    }

    private async checkPort()
    {
        Logger.startStopWatch();
        const port = this.zc.mainConfig.port;
        const portIsAvailable = await PortChecker.isPortAvailable(port);
        if(!portIsAvailable) {
            this.killServer(`The port ${port} is not available! try with a different port!`);
        }
        Logger.printStartDebugInfo('The Master has checked that the port is available.', true);
    }

    private startSocketCluster()
    {
        if(this.zc.mainConfig.useScUws) {
            try {
                require("sc-uws");
            }
            catch (e) {
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
            port  : this.zc.mainConfig.port,
            path  : this.zc.mainConfig.path,
            host : this.zc.mainConfig.hostname,
            protocol : this.zc.mainConfig.secure ? 'https' : 'http',
            protocolOptions: this.zc.mainConfig.httpsConfig,
            authKey: this.zc.mainConfig.authSecretKey,
            authAlgorithm: this.zc.mainConfig.authAlgorithm,
            authPublicKey: this.zc.mainConfig.authPublicKey,
            authPrivateKey: this.zc.mainConfig.authPrivateKey,
            authDefaultExpiry: this.zc.mainConfig.authDefaultExpiry,
            zationConfigWorkerTransport : this.zc.getZcTransport(),
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
            origins : this.zc.mainConfig.scOrigins ? this.zc.mainConfig.scOrigins : '*:*',
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
               this.initBackgroundTasks();
               this.backgroundTaskActive = true;
               this.clusterLeader = true;
           }
           else {
               await this.stateServerEngine.start();
           }

           this.printStartedInformation();

           if(this.startUpCB){this.startUpCB();}

           await this.emitStartedEvent();
        });

        // noinspection JSUnresolvedFunction
        this.master.on('workerStart', (info) =>
        {
            let id = info.id;
            if(id  !== undefined) {
                this.workerIds.add(id);
            }
        });

        // noinspection JSUnresolvedFunction
        this.master.on('brokerStart', (info) =>
        {
            let id = info.id;
            if(id  !== undefined) {
                this.brokerIds.add(id);
            }
        });

        // noinspection JSUnresolvedFunction
        this.master.on('workerMessage', (workerId,data,respond) =>
        {
            const action = data.action;
            switch (action) {
                case WorkerMessageActions.INFO:
                    respond(null,{isLeader : this.clusterLeader, pid : process.pid, clusterMode : this.stateServerActive});
                    break;
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
                this.workerIds.remove(id);
            }
        });

        // noinspection JSUnresolvedFunction
        this.master.on('brokerExit', (info) =>
        {
            let id = info.id;
            if(id  !== undefined) {
                this.brokerIds.remove(id);
            }
        });
    }

    private initBackgroundTasks() {
        Logger.startStopWatch();
        this.startBackgroundTasks();
        this.backgroundTaskInit = true;
        Logger.printStartDebugInfo('Master init the background tasks.',true);
    }

    private async emitStartedEvent() {
        if(this.zcLoader.eventConfig.started) {
            let started = this.zcLoader.eventConfig.started;
            if(Array.isArray(started)) {
                started = FuncUtils.createFuncArrayAsyncInvoker(started);
            }
            await started(this.zc.getZationInfo());
        }
    }

    private printStartedInformation()
    {
        const hostName = this.zc.mainConfig.hostname;
        const port     = this.zc.mainConfig.port;
        const path     = this.zc.mainConfig.path;
        const protocol = this.zc.mainConfig.secure ? 'https' : 'http';
        const server   = `${protocol}://${hostName}:${port}${path}`;

        Logger.log('\x1b[32m%s\x1b[0m','   [ACTIVE]','Zation started 🚀' + (this.zc.inTestMode() ? ' in TestMode 🛠' : ''));
        Logger.log(`            Version: ${ZationMaster.version}`);
        Logger.log(`            Your app: ${this.zc.mainConfig.appName}`);
        Logger.log(`            Hostname: ${hostName}`);
        Logger.log(`            Port: ${port}`);
        Logger.log(` ️          Time️: ${TimeUtils.getMoment(this.zc.mainConfig.timeZone)}`);
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
        if(this.zc.mainConfig.logDownloadable && this.zc.mainConfig.logToFile) {
            Logger.log(`            Log: ${server}/log/${this.zc.mainConfig.logAccessKey}`);
        }
        if(this.zc.mainConfig.provideClientJs) {
            Logger.log(`            ClientJs: ${server}/client.js`);
        }
        Logger.log('            GitHub: https://github.com/ZationServer');
        Logger.log(`            StartTime: ${Date.now()-this.serverStartedTimeStamp} ms`);
        Logger.log('            Copyright by Luca Scaringella');

        if(this.zc.mainConfig.logStarted){
            Logger.logFileInfo
            (`Zation started 🚀 with Version ${ZationMaster.version} on Server Url ${server}`+
                ` with options -> Machine scaling: ${this.stateServerActive}, WebSocket Engine: ${this.master.options.wsEngine}.`);
        }
    }

    private getRandomWorkerId() {
        // noinspection JSUnresolvedFunction
        const array = this.workerIds.toArray();
        return array[Math.floor(Math.random()*array.length)];
    }

    //PART Scaling
    private checkClusterMode() {
        this.clusterStateServerHost = this.zc.mainConfig.stateServerHost || null;
        this.stateServerActive =  !!this.clusterStateServerHost;
    }

    /**
     * This method will change the current instance id.
     * Notice that it only works in boot mode (Worker/Broker are not started).
     * @param instanceId
     */
    public changeInstanceId(instanceId : string) {
        Logger.printInfo(`The master changes the instance id: '${this.zc.mainConfig.instanceId}' to '${instanceId}'.`);
        this.zc.mainConfig.instanceId = instanceId;
    }

    /**
     * Activate this master to the cluster leader.
     */
    public activateClusterLeader() : void
    {
        Logger.printDebugInfo(`This Instance '${this.master.options.instanceId}' becomes the cluster leader.`);
        if(!this.backgroundTaskInit) {
            this.initBackgroundTasks();
        }
        this.backgroundTaskActive = true;
        this.clusterLeader = true;
    }

    /**
     * Deactivate this master cluster leadership.
     */
    public deactivateClusterLeader() : void
    {
        Logger.printDebugInfo(`This Instance '${this.master.options.instanceId}' gets leadership taken off.`);
        this.backgroundTaskActive = false;
        this.clusterLeader = false;
    }

    //PART Crash
    // noinspection JSMethodCanBeStatic
    /**
     * Kill the complete server for a specific reason.
     * @param error
     */
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
    /**
     * Start the background task planning.
     */
    private startBackgroundTasks()
    {
        //userBackgroundTasks
        const bkTsSender = new BackgroundTasksSender(this,this.zc);

        const bkTS = new BackgroundTasksLoader(
            (name,time) => {
            bkTsSender.setEveryBackgroundTask(name,time);
        },
            (name,time) => {
            bkTsSender.setAtBackgroundTask(name,time);
        });

        bkTS.setUserBackgroundTasks(this.zcLoader.appConfig.backgroundTasks);
    }

    /**
     * Send a background task to a random worker.
     * @param obj
     */
    public sendBackgroundTask(obj) {
        if(this.backgroundTaskActive) {
            this.sendToRandomWorker(obj);
        }
    }

    /**
     * Send something to a random worker.
     * @param obj
     */
    public sendToRandomWorker(obj)
    {
        let workerId = this.getRandomWorkerId();

        if(workerId !== undefined)
        {
            if(obj.userBackgroundTask !== undefined)
            {
                Logger.printDebugInfo
                (`The Worker with id: ${workerId}, starts to invoke background task : '${obj.userBackgroundTask}'`);
            }
            else if(obj.systemBackgroundTasks !== undefined && obj.systemBackgroundTasks)
            {
                Logger.printDebugInfo
                (`The Worker with id: ${workerId}, starts to invoke system background tasks`);
            }

            this.master.sendToWorker(workerId,obj)
        }
    }
}