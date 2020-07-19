/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import 'source-map-support/register';
import {WorkerMessageAction}    from '../main/definitions/workerMessageAction';
import {StarterConfig}          from '../main/config/definitions/main/starterConfig';
import StringSet                from '../main/utils/stringSet';
import StateServerEngine        from '../main/cluster/stateServerEngine';
import Logger                   from '../main/log/logger';
import ConfigChecker            from '../main/config/utils/configChecker';
import ClientPrepare            from '../main/client/clientPrepare';
import PortChecker              from '../main/utils/portChecker';
import BackgroundTasksSender    from '../main/background/backgroundTasksSender';
import BackgroundTasksLoader    from '../main/background/backgroundTasksLoader';
import ZationConfigMaster       from '../main/config/manager/zationConfigMaster';
import ConfigPrecompiler                       from '../main/config/utils/configPrecompiler';
import LicenseManager, {License, LicenseLevel} from '../main/utils/licenseManager';
// noinspection ES6PreferShortImport
import {StartErrorName}                        from '../main/definitions/startErrorName';
// noinspection TypeScriptPreferShortImport
import {processRawStartMode, StartMode, startModeSymbol} from './startMode';
import ConfigBuildError                 from '../main/config/manager/configBuildError';
import ConfigLoader                     from '../main/config/manager/configLoader';
import BagExtensionConflictChecker      from '../main/bagExtension/bagExtensionConflictChecker';
import {ProcessType, processTypeSymbol} from '../main/definitions/processType';
// noinspection ES6PreferShortImport
import {Events}                                    from '../main/config/definitions/parts/events';
import StartDebugStopwatch                         from '../main/utils/startDebugStopwatch';
import {getMoment}                                 from '../main/utils/timeUtils';
import {MasterMessageAction, MasterMessagePackage} from '../main/definitions/masterMessage';
// noinspection ES6PreferShortImport
import {ConsoleColor}                              from '../main/log/logCategories';
const IP: any                                      = require('ip');

const  SocketCluster: any = require('socketcluster');

global[processTypeSymbol] = ProcessType.Master;

export default class ZationMaster {
    private static instance: ZationMaster | null = null;
    private static readonly version: string = '1.7.2';
    static readonly minLicenseVersionRequired: number = 1;

    private readonly serverStartedTimeStamp: number;
    private zc: ZationConfigMaster;
    private readonly zcLoader: ConfigLoader;
    private license: License | undefined = undefined;

    private workerIds: StringSet;
    private brokerIds: StringSet;
    private master: any;

    private readonly startResolve: () => void;
    private readonly startReject: (err: any) => void;
    private readonly startMode: number;

    private debugStopwatch: StartDebugStopwatch;

    //cluster
    private clusterStateServerHost: any;
    private stateServerActive: boolean;
    private stateServerEngine: StateServerEngine;

    private clusterLeader: boolean = false;

    //prepareClient
    private fullClientJs: string;
    private serverSettingsJs: string;


    constructor(options: StarterConfig,startResolve: () => void,startReject: (err: any) => void,startMode: number | string = 0) {

        startMode = processRawStartMode(startMode);
        global[startModeSymbol] = startMode;

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

                    //init logger
                    Logger.init(this.zc);
                    this.debugStopwatch = new StartDebugStopwatch(this.zc.isStartDebug());

                    if(startMode !== StartMode.Check) {
                        await this.start();
                    }
                    else {
                        await this.check();
                    }
                }
                catch (e) {
                    if(e instanceof ConfigBuildError){
                        Logger.logStartFail(`An error was thrown by try to build a configuration -> ${e.stack}`);
                    }
                    else {
                        Logger.logStartFail(` An error was thrown by starting the server -> ${e.stack}`);
                    }
                }
            })();
        }
        else {
            console.log('\x1b[31m%s\x1b[0m\',\'   [WARNING]','You can only start zation once.');
        }
    }

    private async start() {
        Logger.log.busy('Launching Zation');

        if(this.zc.isDebug()){
            Logger.log.info('Zation is launching with debug mode on.');
        }

        let errorBag;
        const configChecker = new ConfigChecker(this.zcLoader);

        this.debugStopwatch.start();
        await this.configFileLoad();
        this.debugStopwatch.stop(`The Master has loaded the other config files.`);

        if(this.zc.starterConfig.checkConfigs) {
            this.debugStopwatch.start();
            errorBag = configChecker.checkAllConfigs();
            if (errorBag.hasError()) {
                Logger.consoleLogErrorBag(errorBag);
                return this.rejectStart(StartErrorName.ConfigErrors,'The configs have errors.');
            }
            this.debugStopwatch.stop(`The Master has checked the config files.`);
        }

        this.debugStopwatch.start();
        const bagExtensionChecker = new BagExtensionConflictChecker();
        errorBag = bagExtensionChecker.checkBagExtensionsConflicts();
        if (errorBag.hasError()) {
            Logger.consoleLogErrorBag(errorBag,'BagExtension conflict');
            return this.rejectStart(StartErrorName.BagExtensionsConflicts,'The BagExtensions have conflicts.');
        }
        this.debugStopwatch.stop(`The Master has checked the bag extensions.`);

        if(this.zc.mainConfig.license !== undefined){
            this.debugStopwatch.start();
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
            this.debugStopwatch.stop(`The Master has checked the license.`);
        }

        this.debugStopwatch.start();
        const portIsAvailable = await PortChecker.isPortAvailable(this.zc.mainConfig.port);
        if(!portIsAvailable) {
            const msg = `The port: ${this.zc.mainConfig.port} is in use. Try with a different port.`;
            this.printStartFail(msg);
            return this.rejectStart(StartErrorName.PortInUse,msg);
        }
        this.debugStopwatch.stop(`The Master has checked that the port is available.`);

        this.debugStopwatch.start();
        this.serverSettingsJs = ClientPrepare.createServerSettingsFile(this.zc);
        this.debugStopwatch.stop(`The Master has prepared the server settings js file.`);

        if(this.zc.mainConfig.provideClientJs) {
            this.debugStopwatch.start();
            this.fullClientJs = ClientPrepare.buildClientJs(this.serverSettingsJs);
            this.debugStopwatch.stop(`The Master has prepared the client js file.`);
        }

        this.debugStopwatch.start();
        this.startBackgroundTasks();
        this.debugStopwatch.stop(`The Master init the background tasks.`);

        this.checkClusterMode();
        if (this.stateServerActive) {
            //cluster active
            this.stateServerEngine = new StateServerEngine(this.zc, this, this.license);
            try {
                Logger.log.startDebug('Master wait for connection to zation-cluster-state server...');
                await this.stateServerEngine.registerStateServer();
            }
            catch (e) {
                this.printStartFail(e.message);
                return this.rejectStart(StartErrorName.RegisterToStateServerFailed,e.message,e.code);
            }
        }

        //init event
        this.debugStopwatch.start();
        const masterInitEvent = (this.zcLoader.appConfig.events || {}).masterInit;
        if(masterInitEvent){
            await ConfigPrecompiler.precompileEvent(nameof<Events>(s => s.masterInit),
                masterInitEvent || (() => {}))(this.zc.getServerInfo());
        }
        this.debugStopwatch.stop(`The Master invoked init event.`);

        this.startSocketClusterWithLog();
    }

    private async check() {
        let configErrorBag;
        const configChecker = new ConfigChecker(this.zcLoader);

        this.debugStopwatch.start();
        await this.configFileLoad();
        this.debugStopwatch.stop(`Loaded the other config files.`);

        configErrorBag = configChecker.checkAllConfigs();
        if (configErrorBag.hasError()) {
            Logger.consoleLogErrorBag(configErrorBag);
            return this.rejectStart(StartErrorName.ConfigErrors,'The configs have errors.');
        }
        console.log('\x1b[32m%s\x1b[0m', '   [CHECKED]','✅ No configuration errors found.');
    }

    public async configFileLoad() {
        await this.zcLoader.loadOtherConfigs();

        if(this.zcLoader.loadedConfigs.length > 0) {
            const moreConfigs = this.zcLoader.loadedConfigs.length>1;
            Logger.log.debug
            (`The configuration${moreConfigs ? 's': ''}: ${this.zcLoader.loadedConfigs.join(', ')} ${moreConfigs ? 'are': 'is'} loaded.`);
        }
        else {
            Logger.log.debug(`No config file with root path: '${this.zc.rootPath}' was found.`)
        }
    }

    public startSocketClusterWithLog() {
        this.debugStopwatch.start();
        this.startSocketCluster();
        if(this.zc.isStartDebug())
            this.debugStopwatch.stop(`The Master has started sc-cluster.`);
    }

    private startSocketCluster()
    {
        try {
            require(this.zc.mainConfig.wsEngine);
        }
        catch (e) {
            Logger.logStartFail
            (`Failed to load the wsEngine: ${this.zc.mainConfig.wsEngine}. Error -> ${e.toString()}.`);
            return this.rejectStart(StartErrorName.LoadWsEngineFailed,'Failed to load wsEngine.');
        }

        const scOptions = {
            workers: this.zc.mainConfig.workers,
            brokers: this.zc.mainConfig.brokers,
            appName: this.zc.mainConfig.appName,
            workerController :__dirname + '/zationWorker.js',
            brokerController :__dirname  + '/zationBroker.js',
            workerClusterController: __dirname + '/workerClusterController.js',
            wsEngine: this.zc.mainConfig.wsEngine,
            environment: this.zc.mainConfig.environment,
            port: this.zc.mainConfig.port,
            path: this.zc.mainConfig.path,
            host: this.zc.mainConfig.hostname,
            protocol: this.zc.mainConfig.secure ? 'https': 'http',
            protocolOptions: this.zc.mainConfig.httpsConfig,
            authKey: this.zc.mainConfig.authSecretKey,
            authAlgorithm: this.zc.mainConfig.authAlgorithm,
            authPublicKey: this.zc.mainConfig.authPublicKey,
            authPrivateKey: this.zc.mainConfig.authPrivateKey,
            authDefaultExpiry: this.zc.mainConfig.authDefaultExpiry,
            zationConfigWorkerTransport: this.zc.getZcTransport(),
            zationServerVersion: ZationMaster.version,
            zationServerStartedTimeStamp: this.serverStartedTimeStamp,
            logLevel: this.zc.mainConfig.log.core.active ? this.zc.mainConfig.log.core.logLevel: 0,
            license: this.license,
            clusterAuthKey: this.zc.mainConfig.clusterAuthKey || null,
            clusterStateServerHost: this.clusterStateServerHost,
            clusterStateServerPort: this.zc.mainConfig.stateServerPort || null,
            clusterMappingEngine: this.zc.mainConfig.clusterMappingEngine || null,
            clusterClientPoolSize: this.zc.mainConfig.clusterClientPoolSize || null,
            clusterInstanceIp: this.zc.mainConfig.clusterInstanceIp || null,
            clusterInstanceIpFamily: this.zc.mainConfig.clusterInstanceIpFamily || null,
            clusterStateServerConnectTimeout: this.zc.mainConfig.clusterStateServerConnectTimeout || null,
            clusterStateServerAckTimeout: this.zc.mainConfig.clusterStateServerAckTimeout || null,
            clusterStateServerReconnectRandomness: this.zc.mainConfig.clusterStateServerReconnectRandomness || null,
            socketChannelLimit: this.zc.mainConfig.socketChannelLimit || null,
            crashWorkerOnError: this.zc.mainConfig.crashWorkerOnError || null,
            rebootWorkerOnCrash: this.zc.mainConfig.rebootWorkerOnCrash || null,
            killMasterOnSignal: this.zc.mainConfig.killMasterOnSignal || null,
            instanceId: this.zc.mainConfig.instanceId || null,
            killWorkerMemoryThreshold: this.zc.mainConfig.killWorkerMemoryThreshold || null,
            connectTimeout: this.zc.mainConfig.connectTimeout || null,
            handshakeTimeout: this.zc.mainConfig.handshakeTimeout || null,
            ackTimeout: this.zc.mainConfig.ackTimeout || null,
            ipcAckTimeout: this.zc.mainConfig.ipcAckTimeout || null,
            socketUpgradeTimeout: this.zc.mainConfig.socketUpgradeTimeout || null,
            origins: this.zc.mainConfig.scOrigins ? this.zc.mainConfig.scOrigins: '*:*',
            pingInterval: this.zc.mainConfig.pingInterval || null,
            pingTimeout: this.zc.mainConfig.pingTimeout || null,
            processTermTimeout: this.zc.mainConfig.processTermTimeout || null,
            propagateErrors: this.zc.mainConfig.propagateErrors || null,
            propagateWarnings: this.zc.mainConfig.propagateWarnings || null,
            middlewareEmitWarnings: this.zc.mainConfig.middlewareEmitWarnings || null,
            rebootOnSignal: this.zc.mainConfig.rebootOnSignal || null,
            downgradeToUser: this.zc.mainConfig.downgradeToUser || null,
            socketRoot: this.zc.mainConfig.socketRoot || null,
            schedulingPolicy: this.zc.mainConfig.schedulingPolicy || null,
            allowClientPublish: this.zc.mainConfig.allowClientPublish || null,
            tcpSynBacklog: this.zc.mainConfig.tcpSynBacklog || null,
            workerStatusInterval: this.zc.mainConfig.workerStatusInterval || null,
            pubSubBatchDuration: this.zc.mainConfig.pubSubBatchDuration || null,
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

            if(this.zc.mainConfig.logComponentApi || this.zc.isDebug()){
                await this.logComponentApiTree();
            }

            if(this.startResolve){this.startResolve();}

            const startedEvent = (this.zcLoader.appConfig.events || {}).started;
            if(startedEvent){
                await ConfigPrecompiler.precompileEvent(nameof<Events>(s => s.started),
                    startedEvent || (() => {}))(this.zc.getServerInfo());
            }
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
                case WorkerMessageAction.Info:
                    respond(null,{
                        isLeader: this.clusterLeader,
                        pid: process.pid,
                        clusterMode: this.stateServerActive,
                        stateServerConnected: this.stateServerActive ? this.stateServerEngine.isConnected(): false
                    });
                    break;
                case WorkerMessageAction.IsLeader:
                    respond(null,{isLeader: this.clusterLeader});
                    break;
                case WorkerMessageAction.FullClientJs:
                    respond(null,this.fullClientJs);
                    break;
                case WorkerMessageAction.ServerSettingsJs:
                    respond(null,this.serverSettingsJs);
                    break;
                case WorkerMessageAction.KillServer:
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
        const protocol = this.zc.mainConfig.secure ? 'https': 'http';

        const urlHostname = (hostName === 'localhost' || hostName === '0.0.0.0') ? IP.address() : hostName;
        const server   = `${protocol}://${urlHostname}:${port}${path}`;
        const license = this.license ?
            `Licensed to ${this.license.h} (${LicenseLevel[this.license.l]})` :
            'No license (only for testing)';

        const msg: string[] = [];
        msg.push(`Zation${this.license ? '': ' (Unlicensed)'} started 🚀`
            + (this.zc.inTestMode() ? ' in TestMode 🛠': ''));
        msg.push(`            Version: ${ZationMaster.version}`);
        msg.push(`            Your app: ${this.zc.mainConfig.appName}`);
        msg.push(`            Hostname: ${hostName}`);
        msg.push(`            Port: ${port}`);
        msg.push(` ️          Time️: ${getMoment(this.zc.mainConfig.timeZone)}`);
        msg.push(`            Time zone: ${this.zc.mainConfig.timeZone}`);
        msg.push(`            Instance id: ${this.master.options.instanceId}`);
        msg.push(`            Node.js version: ${process.version}`);
        msg.push(`            WsEngine: ${this.master.options.wsEngine}`);
        msg.push(`            Machine scaling active: ${this.stateServerActive}`);
        msg.push(`            Worker count: ${this.master.options.workers}`);
        msg.push(`            Broker count: ${this.master.options.brokers}`);
        msg.push(`            License: ${license}`);
        if(this.license){
            msg.push(`            LicenseType: ${LicenseManager.licenseTypeToString(this.license)}`);
            msg.push(`            LicenseId: ${this.license.i}`);
        }
        msg.push(`            Server: ${server}`);
        if(this.zc.mainConfig.panel.active) {
            msg.push(`            Panel: ${server}/panel`);
        }
        const logFileOptions = this.zc.mainConfig.log.file;
        if(logFileOptions.active && logFileOptions.download.active) {
            msg.push(`            Log: ${server}/log/${logFileOptions.download.accessKey}`);
        }
        if(this.zc.mainConfig.provideClientJs) {
            msg.push(`            ClientJs: ${server}/client.js`);
        }
        msg.push('            GitHub: https://github.com/ZationServer');
        msg.push(`            StartTime: ${Date.now()-this.serverStartedTimeStamp} ms`);
        msg.push('            Copyright(c) Luca Scaringella');

        Logger.log.active(msg.join('\n'));
    }

    private logComponentApiTree(): Promise<void> {
        return new Promise<void>((resolve => {
            this.sendToRandomWorker([MasterMessageAction.componentStructure],(err,structure) => {
                if(err) {
                    //try again later
                    setTimeout(() => this.logComponentApiTree().then(() => resolve()),300);
                }
                else {
                    Logger.log.custom({
                        color: ConsoleColor.Green,
                        name:'Component API',
                        level: 1
                    },'\n' + structure.split('\n').map((s) => '            ' + s).join('\n'));
                    resolve();
                }
            })
        }));
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
    public changeInstanceId(instanceId: string) {
        Logger.log.info(`The master changes the instance id: '${this.zc.mainConfig.instanceId}' to '${instanceId}'.`);
        this.zc.mainConfig.instanceId = instanceId;
    }

    /**
     * Activate this master to the cluster leader.
     */
    public activateClusterLeader(): void {
        Logger.log.info(`This Instance '${this.master.options.instanceId}' becomes the cluster leader.`);
        this.clusterLeader = true;
    }

    /**
     * Deactivate this master cluster leadership.
     */
    public deactivateClusterLeader(): void {
        Logger.log.info(`This Instance '${this.master.options.instanceId}' gets leadership taken off.`);
        this.clusterLeader = false;
    }

    //PART Crash
    // noinspection JSMethodCanBeStatic
    /**
     * Kill the complete server for a specific reason.
     * @param error
     */
    public killServer(error?: Error | string)
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
    private printStartFail(error: Error | string) {
        const txt = typeof error === 'object' ?
            error.message: error;
        Logger.logStartFail(txt);
    }

    /**
     * Reject the start promise.
     * @param name
     * @param errMsg
     * @param errCode
     */
    public rejectStart(name: StartErrorName,errMsg: string,errCode?: string): void {
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
     * @param message
     * @param callback
     */
    public sendToRandomWorker(message: MasterMessagePackage,callback?: (err: any,result?: any) => any)
    {
        const workerId = this.getRandomWorkerId();
        if(workerId !== undefined) {
            this.master.sendToWorker(workerId,message,callback);
        }
        else if(callback){callback(new Error('No worker available.'))}
    }

    /**
     * Returns if this master is the cluster leader.
     */
    public isClusterLeader(): boolean {
        return this.clusterLeader;
    }
}