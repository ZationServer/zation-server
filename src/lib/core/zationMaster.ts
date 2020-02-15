/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

const  SocketCluster : any   = require('socketcluster');
import {WorkerMessageAction}   from "../main/constants/workerMessageAction";
import {StarterConfig}         from "../main/config/definitions/starterConfig";
import StringSet               from "../main/utils/stringSet";
import StateServerEngine       from "../main/cluster/stateServerEngine";
import Logger                  from "../main/logger/logger";
import ConfigChecker           from "../main/config/utils/configChecker";
import ClientPrepare           from "../main/client/clientPrepare";
import PortChecker             from "../main/utils/portChecker";
import TimeUtils               from "../main/utils/timeUtils";
import BackgroundTasksSender   from "../main/background/backgroundTasksSender";
import BackgroundTasksLoader   from "../main/background/backgroundTasksLoader";
import ZationConfigMaster      from "../main/config/manager/zationConfigMaster";
import LicenseManager, {License, LicenseLevel} from "../main/utils/licenseManager";
// noinspection TypeScriptPreferShortImport
import {StartErrorName}        from "../main/constants/startErrorName";
// noinspection TypeScriptPreferShortImport
import {StartMode}             from "../main/constants/startMode";
import FuncUtils               from "../main/utils/funcUtils";
import ConfigBuildError        from "../main/config/manager/configBuildError";
import ConfigLoader            from "../main/config/manager/configLoader";
import BagExtensionConflictChecker from '../main/bagExtension/bagExtensionConflictChecker';

export default class ZationMaster {
    private static instance: ZationMaster | null = null;
    private static readonly version: string = '1.4.71';
    static readonly minLicenseVersionRequired: number = 1;

    private readonly serverStartedTimeStamp: number;
    private zc: ZationConfigMaster;
    private readonly zcLoader : ConfigLoader;
    private license : License | undefined = undefined;

    private workerIds: StringSet;
    private brokerIds: StringSet;
    private master: any;

    private readonly startResolve : () => void;
    private readonly startReject : (err : any) => void;
    private readonly startMode : number;

    //cluster
    private clusterStateServerHost: any;
    private stateServerActive: boolean;
    private stateServerEngine: StateServerEngine;

    private clusterLeader: boolean = false;

    //prepareClient
    private fullClientJs : string;
    private serverSettingsJs : string;


    constructor(options : StarterConfig,startResolve : () => void,startReject : (err : any) => void,startMode : number | string = 0) {

        if(typeof startMode === 'string'){startMode = parseInt(startMode);}
        startMode = startMode !== 0 && startMode !== 1 && startMode !== 2 ? 0 : startMode;
        global['_ZATION_START_MODE'] = startMode;

        this.startResolve = startResolve;
        this.startReject = startReject;
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
                        Logger.initLogFile();

                        await this.start();
                    }
                    else {
                        await this.check();
                    }
                }
                catch (e) {
                    if(e instanceof ConfigBuildError){
                        Logger.printStartFail(`An error was thrown by try to build a configuration -> ${e.stack}`);
                    }
                    else {
                        Logger.printStartFail(`An error was thrown on server start -> ${e.stack}`);
                    }

                }
            })();
        }
        else {
            Logger.printWarning('You can only start zation once.');
        }
    }

    private async start() {
        Logger.printBusy('Launching Zation');
        Logger.printDebugInfo('Zation is launching with debug mode on.');

        Logger.startStopWatch();

        let errorBag;

        const configChecker = new ConfigChecker(this.zcLoader);
        if(this.zc.starterConfig.checkConfigs) {
            errorBag = configChecker.checkStarterConfig();
            if (errorBag.hasError()) {
                Logger.printErrorBag(errorBag);
                return this.rejectStart(StartErrorName.ConfigErrors,'The starter config has errors.');
            }
            Logger.printStartDebugInfo(`The Master has checked the starter config.`, true);
        }

        Logger.startStopWatch();
        await this.configFileLoad();
        Logger.printStartDebugInfo(`The Master has loaded the other config files.`, true);

        if(this.zc.starterConfig.checkConfigs) {
            Logger.startStopWatch();
            errorBag = configChecker.checkAllConfigs();
            if (errorBag.hasError()) {
                Logger.printErrorBag(errorBag);
                return this.rejectStart(StartErrorName.ConfigErrors,'The configs have errors.');
            }
            Logger.printStartDebugInfo(`The Master has checked the config files.`, true);
        }

        Logger.startStopWatch();
        const bagExtensionChecker = new BagExtensionConflictChecker();
        errorBag = bagExtensionChecker.checkBagExtensionsConflicts();
        if (errorBag.hasError()) {
            Logger.printErrorBag(errorBag,'BagExtension conflict');
            return this.rejectStart(StartErrorName.BagExtensionsConflicts,'The BagExtensions have conflicts.');
        }
        Logger.printStartDebugInfo(`The Master has checked the bag extensions.`, true);


        if(this.zc.mainConfig.license !== undefined){
            Logger.startStopWatch();
            try {
                this.license = LicenseManager.processLicense(this.zc.mainConfig.license);
            }
            catch (e) {
                const msg = 'The provided license is invalid.';
                this.printStartFail(msg);
                return this.rejectStart(StartErrorName.InvalidLicense,msg);
            }
            if(!LicenseManager.licenseVersionValid(this.license)){
                const msg = 'The version of the provided license is incompatible.';
                this.printStartFail(msg);
                return this.rejectStart(StartErrorName.LicenseVersionIncompatible,msg);
            }
            Logger.printStartDebugInfo('The Master has checked the license.', true);
        }

        Logger.startStopWatch();
        const portIsAvailable = await PortChecker.isPortAvailable(this.zc.mainConfig.port);
        if(!portIsAvailable) {
            const msg = `The port: ${this.zc.mainConfig.port} is in use. Try with a different port.`;
            this.printStartFail(msg);
            return this.rejectStart(StartErrorName.PortInUse,msg);
        }
        Logger.printStartDebugInfo('The Master has checked that the port is available.', true);

        Logger.startStopWatch();
        this.serverSettingsJs = ClientPrepare.createServerSettingsFile(this.zc);
        Logger.printStartDebugInfo(`The Master has prepared the server settings js file.`, true);

        if(this.zc.mainConfig.provideClientJs) {
            Logger.startStopWatch();
            this.fullClientJs = ClientPrepare.buildClientJs(this.serverSettingsJs);
            Logger.printStartDebugInfo(`The Master has prepared the client js file.`, true);
        }

        Logger.startStopWatch();
        this.startBackgroundTasks();
        Logger.printStartDebugInfo('Master init the background tasks.',true);

        this.checkClusterMode();
        if (this.stateServerActive) {
            //cluster active
            this.stateServerEngine = new StateServerEngine(this.zc, this, this.license);
            try {
                Logger.printStartDebugInfo('Master wait for connection to zation-cluster-state server...');
                await this.stateServerEngine.registerStateServer();
            }
            catch (e) {
                this.printStartFail(e.message);
                return this.rejectStart(StartErrorName.RegisterToStateServerFailed,e.message,e.code);
            }
        }

        //init event
        Logger.startStopWatch();
        await FuncUtils.createFuncAsyncInvokeSafe(this.zcLoader.eventConfig.masterInit)
        (this.zc.getZationInfo());
        Logger.printStartDebugInfo('Master invoked init event.',true);

        this.startSocketClusterWithLog();
    }

    private async check() {
        Logger.startStopWatch();

        let configErrorBag;

        const configChecker = new ConfigChecker(this.zcLoader);
        configErrorBag = configChecker.checkStarterConfig();
        if (configErrorBag.hasError()) {
            Logger.printErrorBag(configErrorBag);
            return this.rejectStart(StartErrorName.ConfigErrors,'The starter config has errors.');
        }
        Logger.printStartDebugInfo(`Checked starter config.`, true);

        Logger.startStopWatch();
        await this.configFileLoad();
        Logger.printStartDebugInfo(`Loaded the other config files.`, true);

        Logger.startStopWatch();
        configErrorBag = configChecker.checkAllConfigs();
        if (configErrorBag.hasError()) {
            Logger.printErrorBag(configErrorBag);
            return this.rejectStart(StartErrorName.ConfigErrors,'The configs have errors.');
        }
        Logger.log('\x1b[32m%s\x1b[0m', '   [CHECKED]','✅ No configuration errors found.');
    }

    public async configFileLoad() {
        await this.zcLoader.loadOtherConfigs();

        if(this.zcLoader.loadedConfigs.length > 0) {
            const moreConfigs = this.zcLoader.loadedConfigs.length>1;
            Logger.printDebugInfo
            (`The configuration${moreConfigs ? 's' : ''}: ${this.zcLoader.loadedConfigs.join(', ')} ${moreConfigs ? 'are' : 'is'} loaded.`);
        }
        else {
            Logger.printDebugInfo(`No config file with root path: '${this.zc.rootPath}' was found.`)
        }
    }

    public startSocketClusterWithLog() {
        Logger.startStopWatch();
        this.startSocketCluster();
        Logger.printStartDebugInfo('The Master has started sc-cluster.', true);
    }

    private startSocketCluster()
    {
        try {
            require(this.zc.mainConfig.wsEngine);
        }
        catch (e) {
            Logger.printStartFail
            (`Failed to load the wsEngine: ${this.zc.mainConfig.wsEngine}. Error -> ${e.toString()}.`);
            return this.rejectStart(StartErrorName.LoadWsEngineFailed,'Failed to load wsEngine.');
        }

        const scLogLevel = this.zc.mainConfig.scConsoleLog ?
            this.zc.mainConfig.scLogLevel || null : 0;

        const scOptions = {
            workers : this.zc.mainConfig.workers,
            brokers : this.zc.mainConfig.brokers,
            appName : this.zc.mainConfig.appName,
            workerController :__dirname + '/zationWorker.js',
            brokerController :__dirname  + '/zationBroker.js',
            workerClusterController: __dirname + '/workerClusterController.js',
            wsEngine : this.zc.mainConfig.wsEngine,
            environment : this.zc.mainConfig.environment,
            port : this.zc.mainConfig.port,
            path : this.zc.mainConfig.path,
            host : this.zc.mainConfig.hostname,
            protocol : this.zc.mainConfig.secure ? 'https' : 'http',
            protocolOptions: this.zc.mainConfig.httpsConfig,
            authKey : this.zc.mainConfig.authSecretKey,
            authAlgorithm: this.zc.mainConfig.authAlgorithm,
            authPublicKey: this.zc.mainConfig.authPublicKey,
            authPrivateKey: this.zc.mainConfig.authPrivateKey,
            authDefaultExpiry: this.zc.mainConfig.authDefaultExpiry,
            zationConfigWorkerTransport : this.zc.getZcTransport(),
            zationServerVersion : ZationMaster.version,
            zationServerStartedTimeStamp : this.serverStartedTimeStamp,
            logLevel : scLogLevel,
            license : this.license,
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

        this.master = new SocketCluster(scOptions);

        // noinspection JSUnresolvedFunction
        this.master.on('ready',async () =>
        {
           if(!this.stateServerActive) {
               //not in cluster mode
               this.clusterLeader = true;
           }
           else {
               await this.stateServerEngine.start();
           }

           this.logStartedInformation();

           if(this.startResolve){this.startResolve();}

            await FuncUtils.createFuncAsyncInvokeSafe(this.zcLoader.eventConfig.started)
            (this.zc.getZationInfo());
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
                case WorkerMessageAction.INFO:
                    respond(null,{
                        isLeader : this.clusterLeader,
                        pid : process.pid,
                        clusterMode : this.stateServerActive,
                        stateServerConnected : this.stateServerActive ? this.stateServerEngine.isConnected() : false
                    });
                    break;
                case WorkerMessageAction.IS_LEADER:
                    respond(null,{isLeader : this.clusterLeader});
                    break;
                case WorkerMessageAction.FULL_CLIENT_JS:
                    respond(null,this.fullClientJs);
                    break;
                case WorkerMessageAction.SERVER_SETTINGS_JS:
                    respond(null,this.serverSettingsJs);
                    break;
                case WorkerMessageAction.KILL_SERVER:
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

    private logStartedInformation()
    {
        const hostName = this.zc.mainConfig.hostname;
        const port     = this.zc.mainConfig.port;
        const path     = this.zc.mainConfig.path;
        const protocol = this.zc.mainConfig.secure ? 'https' : 'http';
        const server   = `${protocol}://${hostName}:${port}${path}`;
        const license = this.license ?
            `Licensed to ${this.license.h} (${LicenseLevel[this.license.l]})` :
            'No license (only for testing)';

        Logger.log('\x1b[32m%s\x1b[0m','   [ACTIVE]',`Zation${this.license ? '' : ' (Unlicensed)'} started 🚀`
            + (this.zc.inTestMode() ? ' in TestMode 🛠' : ''));
        Logger.log(`            Version: ${ZationMaster.version}`);
        Logger.log(`            Your app: ${this.zc.mainConfig.appName}`);
        Logger.log(`            Hostname: ${hostName}`);
        Logger.log(`            Port: ${port}`);
        Logger.log(` ️          Time️: ${TimeUtils.getMoment(this.zc.mainConfig.timeZone)}`);
        Logger.log(`            Time zone: ${this.zc.mainConfig.timeZone}`);
        Logger.log(`            Instance id: ${this.master.options.instanceId}`);
        Logger.log(`            Node.js version: ${process.version}`);
        Logger.log(`            WsEngine: ${this.master.options.wsEngine}`);
        Logger.log(`            Machine scaling active: ${this.stateServerActive}`);
        Logger.log(`            Worker count: ${this.master.options.workers}`);
        Logger.log(`            Broker count: ${this.master.options.brokers}`);
        Logger.log(`            License: ${license}`);
        if(this.license){
            Logger.log(`            LicenseType: ${LicenseManager.licenseTypeToString(this.license)}`);
            Logger.log(`            LicenseId: ${this.license.i}`);
        }
        Logger.log(`            Server: ${server}`);
        if(this.zc.mainConfig.usePanel) {
            Logger.log(`            Panel: ${server}/panel`);
        }
        if(this.zc.mainConfig.logFileDownloadable && this.zc.mainConfig.logFile) {
            Logger.log(`            Log: ${server}/log/${this.zc.mainConfig.logFileAccessKey}`);
        }
        if(this.zc.mainConfig.provideClientJs) {
            Logger.log(`            ClientJs: ${server}/client.js`);
        }
        Logger.log('            GitHub: https://github.com/ZationServer');
        Logger.log(`            StartTime: ${Date.now()-this.serverStartedTimeStamp} ms`);
        Logger.log('            Copyright(c) Luca Scaringella');

        if(this.zc.mainConfig.logFileStarted){
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
        this.stateServerActive = typeof this.clusterStateServerHost === 'string';
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
    public activateClusterLeader() : void {
        Logger.printDebugInfo(`This Instance '${this.master.options.instanceId}' becomes the cluster leader.`);
        this.clusterLeader = true;
    }

    /**
     * Deactivate this master cluster leadership.
     */
    public deactivateClusterLeader() : void {
        Logger.printDebugInfo(`This Instance '${this.master.options.instanceId}' gets leadership taken off.`);
        this.clusterLeader = false;
    }

    //PART Crash
    // noinspection JSMethodCanBeStatic
    /**
     * Kill the complete server for a specific reason.
     * @param error
     */
    public killServer(error ?: Error | string)
    {
        if(this.master) {
            this.master.killWorkers();
            this.master.killBrokers();
        }
        if(error !== undefined){this.printStartFail(error);}
        process.exit();
    }

    // noinspection JSMethodCanBeStatic
    /**
     * Print a start fail.
     * @param error
     */
    private printStartFail(error : Error | string) {
        const txt = typeof error === 'object' ?
            error.message : error;
        Logger.printStartFail(txt);
    }

    /**
     * Reject the start promise.
     * @param name
     * @param errMsg
     * @param errCode
     */
    public rejectStart(name : StartErrorName,errMsg : string,errCode ?: string) : void {
        if(!this.zc.mainConfig.killOnStartFailure && this.startReject){
            ZationMaster.instance = null;
            const err = new Error(errMsg);
            err.name = name;
            if(errCode !== undefined){err['code'] = errCode;}
            if(this.stateServerEngine){this.stateServerEngine.destroy();}
            this.startReject(err);
        }
        else {
            this.killServer();
        }
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
            (name,time,clusterSafe) => {
            bkTsSender.setEveryBackgroundTask(name,time,clusterSafe);
        },
            (name,time,clusterSafe) => {
            bkTsSender.setAtBackgroundTask(name,time,clusterSafe);
        });

        bkTS.setUserBackgroundTasks(this.zcLoader.appConfig.backgroundTasks);
    }

    /**
     * Send something to a random worker.
     * @param obj
     */
    public sendToRandomWorker(obj)
    {
        const workerId = this.getRandomWorkerId();
        if(workerId !== undefined) {
            this.master.sendToWorker(workerId,obj)
        }
    }

    /**
     * Returns if this master is the cluster leader.
     */
    public isClusterLeader() : boolean {
        return this.clusterLeader;
    }
}