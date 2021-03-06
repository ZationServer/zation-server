/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import 'source-map-support/register'

import ScServer               from "../main/sc/scServer";
import {
    WorkerChMapTaskAction,
    WorkerChSpecialTaskAction,
    WorkerChMapTarget,
    WorkerChTaskType,
    WorkerChSpecialTask, WorkerTaskPackage, WorkerChMapTask
} from "../main/definitions/workerChTaskDefinitions";
// noinspection ES6PreferShortImport
import {RawSocket}            from '../main/sc/socket';
import {RawZationToken}       from "../main/definitions/internal";
import {WorkerMessageAction}  from "../main/definitions/workerMessageAction";
import {ChannelPrepare}       from "../main/channel/channelPrepare";
import NodeInfo               from "../main/utils/nodeInfo";
import SocketSet              from "../main/utils/socketSet";
import {ObjectEditAction}     from "../main/definitions/objectEditAction";
import OriginsUtils, {OriginChecker} from "../main/origins/originsUtils";

import express      = require('express');
import {Request , Response} from "express";
import * as path            from 'path';
import bodyParser   = require('body-parser');
import url          = require('url');

import treeify          = require('treeify');
import ControllerReqHandler from "../main/controller/handle/controllerReqHandler";
import AuthConfig           from "../main/auth/authConfig";
import ZationToken          from "../main/internalApi/zationToken";
import ControllerPrepare    from "../main/controller/controllerPrepare";
import ServiceEngine        from "../main/services/serviceEngine";
import Bag                  from "../api/Bag";
import SocketMapper         from "../main/utils/socketMapper";
import ViewEngine           from "../main/views/viewEngine";
import Logger               from "../main/log/logger";
import PanelEngine          from "../main/panel/panelEngine";
import SidBuilder           from "../main/utils/sidBuilder";
import TokenUtils, {TokenClusterKeyCheckFunction} from "../main/token/tokenUtils";
import PanelOsInfo          from "../main/utils/panelOsInfo";
import BackgroundTasksWorkerSaver from "../main/background/backgroundTasksWorkerSaver";
import ZationConfigFull     from "../main/config/manager/zationConfigFull";
import ConfigLoader         from "../main/config/manager/configLoader";
import RawSocketUpgradeFactory  from "../main/socket/rawSocketUpgradeFactory";
import InternalChannelEngine, {INTERNAL_WORKER_CH} from '../main/internalChannels/internalChannelEngine';
import {MasterMessageAction, MasterMessagePackage} from '../main/definitions/masterMessage';
import AllowedSystemsChecker, {AllowedSystemsCheckFunction} from '../main/allowedSystems/allowedSystemsChecker';
import {
    AuthMiddlewareReq,
    HandshakeScMiddlewareReq,
    HandshakeWsMiddlewareReq,
    PubInMiddlewareReq,
    SubMiddlewareReq
} from "../main/sc/scMiddlewareReq";
import {SocketAction}             from "../main/definitions/socketAction";
import {TaskFunction}             from "../main/config/definitions/parts/backgroundTask";
import {ClientErrorName}          from "../main/definitions/clientErrorName";
import {DATABOX_START_INDICATOR}  from "../main/databox/dbDefinitions";
import {CHANNEL_START_INDICATOR}  from '../main/channel/channelDefinitions';
import DataboxHandler             from "../main/databox/handle/databoxHandler";
import DataboxPrepare             from "../main/databox/databoxPrepare";
import LicenseManager, {License}  from "../main/utils/licenseManager";
import BagExtensionProcessor      from '../main/bagExtension/bagExtensionProcessor';
import FunctionInitEngine         from '../main/functionInit/functionInitEngine';
import InjectionsManager                from '../main/injections/injectionsManager';
import InitializerManager               from '../main/initializer/initializerManager';
import {startModeSymbol}                from './startMode';
import createLogFileDownloader          from '../main/log/logFileHttpEndpoint';
import StartDebugStopwatch              from '../main/utils/startDebugStopwatch';
import {ErrorEventHolder}               from '../main/error/errorEventHolder';
import ChannelHandler                   from '../main/channel/handle/channelHandler';
import DynamicSingleton                 from '../main/utils/dynamicSingleton';
import PanelChannel                     from '../main/channel/systemChannels/channels/PanelChannel';
import ReceiverPrepare                  from '../main/receiver/receiverPrepare';
import ReceiverHandler                  from '../main/receiver/handle/receiverHandler';
import {RECEIVER_EVENT}                 from '../main/receiver/receiverDefinitions';
import {CONTROLLER_EVENT}               from '../main/controller/controllerDefinitions';
import ComponentUtils                   from '../main/component/componentUtils';
import Socket                           from '../api/Socket';
import {Writable}                       from '../main/utils/typeUtils';
import Process, {ProcessType}           from '../api/Process';
import CodeError                        from '../main/error/codeError';

const  SCWorker: any        = require('socketcluster/scworker');

(Process as Writable<typeof Process>).type = ProcessType.Worker;

class ZationWorker extends SCWorker
{
    private userBackgroundTasks: Record<string,TaskFunction> = {};

    private workerFullId: string;
    private readonly _isRespawn: boolean;
    private preparedAllComponents: boolean = false;

    private workerStartedTimeStamp: number;
    private serverStartedTimeStamp: number;
    private serverVersion: string;
    private zc: ZationConfigFull;

    public readonly scServer: ScServer;
    private serviceEngine: ServiceEngine;
    private preparedBag: Bag;
    private controllerPrepare: ControllerPrepare;
    private receiverPrepare: ReceiverPrepare;
    private databoxPrepare: DataboxPrepare;
    private authConfig: AuthConfig;
    private panelEngine: PanelEngine;
    private internalChannelEngine: InternalChannelEngine;
    private checkOrigin: OriginChecker;
    private channelPrepare: ChannelPrepare;
    private controllerReqHandler: ControllerReqHandler;
    private receiverHandler: ReceiverHandler;
    private databoxHandler: DataboxHandler;
    private channelHandler: ChannelHandler;
    private rawSocketUpdateEngine: RawSocketUpgradeFactory;
    private checkTokenClusterKey: TokenClusterKeyCheckFunction;
    private checkAllowedSystems: AllowedSystemsCheckFunction;

    private app: any;

    private readonly mapUserIdToSc: SocketMapper<Socket> = new SocketMapper<Socket>();
    private readonly mapTokenIdToSc: SocketMapper<Socket> = new SocketMapper<Socket>();
    private readonly mapAuthUserGroupToSc: SocketMapper<Socket> = new SocketMapper<Socket>();
    private readonly defaultUserGroupSet  = new SocketSet();
    private readonly panelUserSet = new SocketSet();

    private attachment: object = {};

    private httpRequestCount = 0;
    private wsRequestCount = 0;

    private license: License;

    //prepareClient
    private fullClientJs: string;
    private serverSettingsJs: string;

    //prepareView
    private viewEngine: ViewEngine;

    constructor() {
        super();
        this._isRespawn = (process.env.respawn == 'true');
    }

    // noinspection JSUnusedGlobalSymbols
    async run()
    {
        this.workerStartedTimeStamp = Date.now();
        this.serverStartedTimeStamp = this.options.zationServerStartedTimeStamp;
        this.serverVersion = this.options.zationServerVersion;

        this.workerFullId = this.id + '.' + process.pid;

        this.zc = new ZationConfigFull(this.options.zationConfigWorkerTransport);
        global[startModeSymbol] = this.zc.getStartMode();

        this.license = this.options.license;

        this.viewEngine = new ViewEngine(this.license,this.zc.mainConfig.instanceId,this.id.toString());

        //setLogger
        Logger.init(this.zc);

        await this.setUpLogInfo();

        process.title = `Zation Server: ${this.zc.mainConfig.instanceId} -> Worker - ${this.id}`;

        await this.startZWorker();
    }

    private async startZWorker()
    {
        Logger.log.startDebug(`The Worker with id ${this.id} begins the start process.`);

        const debugStopwatch = new StartDebugStopwatch(this.zc.isStartDebug());
        const startPromises: Promise<void>[] = [];

        //load html views
        startPromises.push(this.viewEngine.loadViews());

        debugStopwatch.start();
        this.zc.setOtherConfigs(ConfigLoader.loadOtherConfigsSafe(this.zc.configLocations));
        debugStopwatch.stop(`The Worker with id ${this.id} has loaded other zation configuration files.`);

        //start loading client js
        startPromises.push(this.loadClientJsData());

        //Set error event
        ErrorEventHolder.set(this.zc.event.error);

        //Set code error event
        CodeError.setCodeErrorEvent(this.zc.event.codeError);

        //Origins checker
        debugStopwatch.start();
        this.checkOrigin = OriginsUtils.createOriginChecker(this.zc.mainConfig.origins);
        debugStopwatch.stop(`The Worker with id ${this.id} has created the origin checker.`);

        //Token cluster key checker
        debugStopwatch.start();
        this.checkTokenClusterKey = TokenUtils.createTokenClusterKeyChecker(this.zc);
        debugStopwatch.stop(`The Worker with id ${this.id} has created the token cluster key checker.`);

        //Allowed systems checker
        debugStopwatch.start();
        this.checkAllowedSystems = AllowedSystemsChecker.createAllowedSystemsChecker(this.zc.appConfig.allowedSystems);
        debugStopwatch.stop(`The Worker with id ${this.id} has created the allowed systems checker.`);

        //Services (!Before Bag)
        debugStopwatch.start();
        this.serviceEngine = new ServiceEngine(this.zc,this);
        await this.serviceEngine.init();
        debugStopwatch.stop(`The Worker with id ${this.id} has created service engine.`);

        //BagExtensions (!Before Bag)
        debugStopwatch.start();
        const bagExtensionProcessor = new BagExtensionProcessor();
        await bagExtensionProcessor.process();
        debugStopwatch.stop(`The Worker with id ${this.id} has processed the bag extensions.`);

        debugStopwatch.start();
        this.authConfig = new AuthConfig(this.zc);
        debugStopwatch.stop(`The Worker with id ${this.id} has prepared the auth config part.`);

        //(!Before Bag)
        debugStopwatch.start();
        this.internalChannelEngine = new InternalChannelEngine(this.scServer);
        debugStopwatch.stop(`The Worker with id ${this.id} has initialized the channel publish helper.`);

        debugStopwatch.start();
        this.preparedBag = Bag._create(this,this.internalChannelEngine);
        debugStopwatch.stop(`The Worker with id ${this.id} has created the bag instance.`);

        //Socket update engine
        debugStopwatch.start();
        this.rawSocketUpdateEngine = new RawSocketUpgradeFactory(this,this.authConfig);
        debugStopwatch.stop(`The Worker with id ${this.id} has created the socket update engine.`);

        debugStopwatch.start();
        this.databoxPrepare = new DataboxPrepare(this.zc,this,this.preparedBag);
        this.databoxPrepare.prepare();
        debugStopwatch.stop(`The Worker with id ${this.id} has prepared the Databoxes.`);

        debugStopwatch.start();
        this.channelPrepare = new ChannelPrepare(this.zc,this,this.preparedBag);
        this.channelPrepare.prepare();
        debugStopwatch.stop(`The Worker with id ${this.id} has prepared the Channels.`);

        Bag._isReady();

        debugStopwatch.start();
        await InjectionsManager.get().processInjections();
        debugStopwatch.stop(`The Worker with id ${this.id} processed the injections.`);

        debugStopwatch.start();
        await InitializerManager.get().processInitializers();
        debugStopwatch.stop(`The Worker with id ${this.id} processed the initializers.`);

        debugStopwatch.start();
        await this.zc.event.beforeComponentsInit(this.isLeader);
        debugStopwatch.stop(`The Worker with id ${this.id} invoked beforeComponentsInit event.`);

        debugStopwatch.start();
        await this.channelPrepare.init();
        debugStopwatch.stop(`The Worker with id ${this.id} has initialized the Channels.`);

        debugStopwatch.start();
        await this.databoxPrepare.init();
        debugStopwatch.stop(`The Worker with id ${this.id} has initialized the Databoxes.`);

        //After databoxes, channel prepare (To access databoxes and channels using the bag).
        debugStopwatch.start();
        this.receiverPrepare = new ReceiverPrepare(this.zc,this,this.preparedBag);
        this.receiverPrepare.prepare();
        await this.receiverPrepare.init();
        debugStopwatch.stop(`The Worker with id ${this.id} has prepared and initialized the Receivers.`);

        //After databoxes, channel prepare (To access databoxes and channels using the bag).
        debugStopwatch.start();
        this.controllerPrepare = new ControllerPrepare(this.zc,this,this.preparedBag);
        this.controllerPrepare.prepare();
        await this.controllerPrepare.init();
        debugStopwatch.stop(`The Worker with id ${this.id} has prepared and initialized the Controllers.`);

        this.preparedAllComponents = true;

        debugStopwatch.start();
        await this.zc.event.afterComponentsInit(this.isLeader);
        debugStopwatch.stop(`The Worker with id ${this.id} invoked afterComponentsInit event.`);

        debugStopwatch.start();
        const panelChannel = DynamicSingleton.getInstance<typeof PanelChannel,PanelChannel>(PanelChannel);
        if(!panelChannel) throw new Error('Can not find the instance of system panel channel.');
        this.panelEngine = new PanelEngine(this,panelChannel,this.authConfig.getAuthUserGroups());
        if(this.zc.mainConfig.panel.active) {
            await this.initPanelUpdates();
            debugStopwatch.stop(`The Worker with id ${this.id} has created the panel engine.`);
        }
        else {
            debugStopwatch.stop(`The Worker with id ${this.id} has checked for the panel engine.`);
        }

        debugStopwatch.start();
        this.loadUserBackgroundTasks();
        debugStopwatch.stop(`The Worker with id ${this.id} has loaded the user background tasks.`);

        debugStopwatch.start();
        this.registerMasterEvent();
        debugStopwatch.stop(`The Worker with id ${this.id} has registered by the master event.`);

        debugStopwatch.start();
        await this.registerWorkerChannel();
        debugStopwatch.stop(`The Worker with id ${this.id} has registered to the worker channel.`);

        debugStopwatch.start();
        this.controllerReqHandler = new ControllerReqHandler(this.controllerPrepare,this.zc);
        debugStopwatch.stop(`The Worker with id ${this.id} has created the Controller handler.`);

        debugStopwatch.start();
        this.receiverHandler = new ReceiverHandler(this.receiverPrepare,this.zc);
        debugStopwatch.stop(`The Worker with id ${this.id} has created the Receiver handler.`);

        debugStopwatch.start();
        this.databoxHandler = new DataboxHandler(this.databoxPrepare,this.zc);
        debugStopwatch.stop(`The Worker with id ${this.id} has created the Databox handler.`);

        debugStopwatch.start();
        this.channelHandler = new ChannelHandler(this.channelPrepare,this.zc);
        debugStopwatch.stop(`The Worker with id ${this.id} has created the Channel handler.`);

        //After databoxes prepare (To access databoxes using the bag) and after bag ready.
        debugStopwatch.start();
        await FunctionInitEngine.initFunctions(this.preparedBag);
        debugStopwatch.stop(`The Worker with id ${this.id} has initialized the init functions.`);

        //wait for start process promises
        await Promise.all(startPromises);

        //Server
        debugStopwatch.start();
        await this.startHttpServer();
        debugStopwatch.stop(`The Worker with id ${this.id} has started the http server.`);

        //After events preprocessed
        debugStopwatch.start();
        await this.startWebSocketServer();
        debugStopwatch.stop(`The Worker with id ${this.id} has started the web socket server.`);

        //Fire ExpressEvent
        debugStopwatch.start();
        await this.zc.event.express(this.app,express);
        debugStopwatch.stop(`The Worker with id ${this.id} has processed the express event.`);

        //Fire ScServerEvent
        debugStopwatch.start();
        await this.zc.event.socketServer(this.scServer);
        debugStopwatch.stop(`The Worker with id ${this.id} has processed the scServer event.`);

        Logger.log.startDebug(`The Worker with id ${this.id} is started.`);

        debugStopwatch.start();
        await this.zc.event.workerInit(this.isLeader,this._isRespawn);
        debugStopwatch.stop(`The Worker with id ${this.id} invoked init event.`);

        this.zc.event.workerStarted(this.zc.getServerInfo(),this.isLeader,this._isRespawn,this);
    }

    private async setUpLogInfo()
    {
        this.on('error',(err) => {
           Logger.log.error
           (`Worker: '${this.getFullWorkerId()}' error thrown.`, err, `Worker will be restarted!`);
        });
    }

    private async startWebSocketServer()
    {
        this.initSocketMiddleware();
        this.initScServerEvents();

        if(this.zc.mainConfig.panel.active) {
            this.scServer.on('_connection', (socket) => {
                // The connection event counts as a WS request
                this.wsRequestCount++;
                socket.on('message', () => this.wsRequestCount++);
            });
        }

        //START SOCKET SERVER
        this.scServer.on('connection', async (rawSocket: RawSocket) => {

            const socket = rawSocket._socket;

            Logger.log.debug(`Socket with id: ${socket.id} is connected!`);

            rawSocket.on(CONTROLLER_EVENT,(data, respond) => {
                this.controllerReqHandler.processRequest(data,socket,respond);
            });

            rawSocket.on(RECEIVER_EVENT,(data) => {
                this.receiverHandler.processPackage(data,socket);
            });

            rawSocket.on(DATABOX_START_INDICATOR,(data, respond) => {
                this.databoxHandler.processConnectReq(data,socket,respond);
            });

            rawSocket.on(CHANNEL_START_INDICATOR,(data, respond) => {
                this.channelHandler.processSubRequest(data,socket,respond);
            });

            await this.zc.event.socketConnection(socket);
        });
        await this.zc.event.wsServerStarted(this.zc.getServerInfo());
    }

    private async startHttpServer()
    {
        if(this.zc.mainConfig.panel.active) {
            this.httpServer.on('request', () => {
                this.httpRequestCount++;
            });
        }

        this.app = express();

        const serverPath = this.zc.mainConfig.path;
        const serverPort = this.zc.mainConfig.port.toString();

        //Middleware check origin.
        this.app.use((req, res, next) => {
            if(this.checkOrigin(req.hostname,req.protocol,serverPort)){
                res.setHeader('Access-Control-Allow-Origin', `${req.protocol}://${req.hostname}`);
                res.header('Access-Control-Allow-Methods', '*');
                res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,contenttype');
                res.header('Access-Control-Allow-Credentials', true);
                return next();
            }
            else{
                res.status(401);
                res.write('Failed - Invalid origin: ' +
                    `${req.protocol}://${req.hostname}:${serverPort}`);
                res.end();
            }
        });

        //BodyParser
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({extended: true}));

        //Set Server
        this.httpServer.on('request', this.app);

        //Public folder
        this.app.use(`/zation/assets`, express.static(__dirname + '/../public/assets'));

        if(this.zc.mainConfig.panel.active) {
            this.app.use([`${serverPath}/panel/*`,`${serverPath}/panel`],
                express.static(require.resolve('zation-panel')));
            this.app.use(`/zation/assets/panel`, express.static(path.dirname(require.resolve('zation-panel'))));
        }

        this.app.get(`/zation/serverSettings.js`,(req,res) => {
            res.type('.js');
            res.send(this.serverSettingsJs);
        });

        //Log file download
        this.app.get([`${serverPath}/log/:key`,`${serverPath}/log`],createLogFileDownloader(this.zc.mainConfig.log.file,this.zc.rootPath));

        if(this.zc.mainConfig.provideClientJs) {
            this.app.get(`${serverPath}/client.js`,(req,res) => {
                res.type('.js');
                res.send(this.fullClientJs);
            });
        }

        //Http request on server path.
        this.app.all(`${serverPath}`, async (req: Request, res: Response) => {
            res.setHeader('content-type', 'text/html');
            res.write(this.getViewEngine().getZationDefaultView());
            res.end();
        });

        await this.zc.event.httpServerStarted(this.zc.getServerInfo());
    }

    getFullWorkerId() {
        return this.workerFullId;
    }

    /**
     * Create the zation middleware.
     */
    private initSocketMiddleware()
    {
        const middleware = this.zc.middleware;

        this.scServer.addMiddleware(this.scServer.MIDDLEWARE_SUBSCRIBE,(req: SubMiddlewareReq, next) => {
            const err: any = new Error(`A client can not subscribe to an internal channel.`);
            err.name = ClientErrorName.AccessDenied;
            next(err); //Block!
        });

        /**
         * Middleware for client publish.
         */
        this.scServer.addMiddleware(this.scServer.MIDDLEWARE_PUBLISH_IN,(req: PubInMiddlewareReq, next) => {
            const err: any = new Error(`A client can not publish to an internal channel.`);
            err.name = ClientErrorName.AccessDenied;
            next(err); //Block!
        });

        /**
         * Middleware when the socket is created.
         * Zation will add the client version, system and handshake attachment.
         */
        this.scServer.addMiddleware(this.scServer.MIDDLEWARE_HANDSHAKE_SC, async (req: HandshakeScMiddlewareReq, next) =>
        {
            //check for version and system info
            const urlParts = url.parse(req.socket.request.url || '', true);
            const query = urlParts.query;
            let version;
            if (
                typeof query === 'object' && typeof query.version === 'string' &&
                !isNaN(version = parseFloat(query.version)) &&
                typeof query.system === 'string')
            {
                const rawSocket = req.socket;

                //parse attachment
                let attachment = {};
                if(typeof query.attachment === 'string') {
                    try {
                        attachment = JSON.parse(query.attachment);
                    }
                    catch (e) {}
                }
                (rawSocket as any)[nameof<RawSocket>(s => s.handshakeAttachment)] = attachment;
                (rawSocket as any)[nameof<RawSocket>(s => s.clientVersion)] = version;
                (rawSocket as any)[nameof<RawSocket>(s => s.clientSystem)] = query.system;

                let apiLevel;
                if(typeof query.apiLevel === 'string' &&
                    !isNaN(apiLevel = parseInt(query.apiLevel))) {
                    (rawSocket as any)[nameof<RawSocket>(s => s.apiLevel)] = apiLevel;
                }

                if(!this.checkAllowedSystems(query.system, version)) {
                    const err = new Error('The client system is not allowed to connect.');
                    err.name = 'BadSystem';
                    return next(err);
                }

                this.rawSocketUpdateEngine.upgrade(rawSocket);
                const socket = rawSocket._socket;

                this.initSocketEvents(socket);
                await this.zc.event.socketInit(socket);

                next(await middleware.socket(socket));
            }
            else{
                const err = new Error('Cannot connect without providing a valid version and system key in URL query argument.');
                err.name = 'BadQueryUrlArguments';
                next(err)
            }
        });

        /**
         * Middleware before the socket is created.
         * Zation will check the origin.
         */
        this.scServer.addMiddleware(this.scServer.MIDDLEWARE_HANDSHAKE_WS, async (req: HandshakeWsMiddlewareReq, next) =>
        {
            let origin: any = req.headers.origin;
            if (origin === 'null' || origin == null) {
                origin = '*';
            }
            const parts = url.parse(origin);
            if(this.checkOrigin(parts.hostname,parts.protocol,parts.port)) {
                next();
            }
            else {
                //origin fail
                next(new Error('Failed to authorize socket handshake - Invalid origin: ' + req.origin));
            }
        });

        /**
         * Authentication middleware.
         * Zation will check the token.
         */
        this.scServer.addMiddleware(this.scServer.MIDDLEWARE_AUTHENTICATE, async (req: AuthMiddlewareReq, next) =>
        {
            const token = req.authToken;
            if(token == null || typeof token !== 'object') return next(true);

            //check if the token is valid
            try {
                TokenUtils.checkToken(token,this.authConfig);
                this.checkTokenClusterKey(token);
            }
            catch (e) {
                next(e,true);
            }

            if(token.onlyPanelToken) next();
            else next(await middleware.authenticate(new ZationToken(token)));
        });
    }

    /**
     * Register for sc server events.
     */
    private initScServerEvents() {
        const event = this.zc.event;

        this.scServer.on('connectionAbort', async (rawSocket: RawSocket, code, data) => {
            await event.socketConnectionAbort(rawSocket._socket,code,data);
        });

        this.scServer.on('disconnection', async (rawSocket: RawSocket, code, data) =>
        {
            const socket = rawSocket._socket;
            //Remove socket from all maps.
            const token = rawSocket.authToken;
            if(token !== null){
                this.unmapSocketToken(token,socket);
            }
            this.defaultUserGroupSet.remove(socket);

            await event.socketDisconnection(socket,code,data);
        });

        this.scServer.on('authentication', async (rawSocket: RawSocket) => {
           await event.socketAuthentication(rawSocket._socket);
        });

        this.scServer.on('deauthentication', async (rawSocket: RawSocket) => {
            await event.socketDeauthentication(rawSocket._socket);
        });

        this.scServer.on('authenticationStateChange', async (rawSocket: RawSocket, stateChangeData: any) => {
            await event.socketAuthStateChange(rawSocket._socket,stateChangeData);
        });

        this.scServer.on('badSocketAuthToken', async (rawSocket: RawSocket, badAuthStatus) => {
            await event.socketBadAuthToken(rawSocket._socket,badAuthStatus);
        });
    }

    /**
     * Register for socket events.
     * @param socket
     */
    private initSocketEvents(socket: Socket)
    {
        const event = this.zc.event;
        socket.rawSocket.on('error', async (err) => {
            await event.socketError(socket,err);
        });

        socket.rawSocket.on('raw', async (data) => {
            await event.socketRaw(socket,data);
        });
    }

    // noinspection JSUnusedGlobalSymbols
    createHTTPServer()
    {
        let httpServer;
        if (this.options.protocol === 'https') {
            httpServer = require('https').createServer(this.options.protocolOptions);
        }
        else {
            httpServer = require('http').createServer();
        }
        return httpServer;
    }

    //Part worker remote tasks

    /**
     * Register on worker channel for remote tasks.
     */
    private async registerWorkerChannel()
    {
        const channel = this.exchange.subscribe(INTERNAL_WORKER_CH);
        channel.watch(async (data: WorkerTaskPackage) =>
        {
            switch (data.taskType) {
                case WorkerChTaskType.MapTask:
                     await this.processMapTask(data);
                     break;
                case WorkerChTaskType.SpecialTask:
                    await this.processSpecialTask(data);
                    break;
            }
        });
    }

    /**
     * Process a special worker task.
     * @param task
     */
    async processSpecialTask(task: WorkerChSpecialTask)
    {
        const data = task.data;
        switch (task.action) {
            case WorkerChSpecialTaskAction.UpdateUserTokens:
                await this.updateTokens
                (this.mapUserIdToSc,data.operations,data.target.toString(),data.exceptSocketSids);
                break;
            case WorkerChSpecialTaskAction.UpdateGroupTokens:
                await this.updateTokens
                (this.mapAuthUserGroupToSc,data.operations,data.target,data.exceptSocketSids);
                break;
            case WorkerChSpecialTaskAction.Message:
                await this.zc.event.workerMessage(data);
                break;
        }
    }

    /**
     * Process a worker map task.
     * @param task
     */
    async processMapTask(task: WorkerChMapTask)
    {
        const ids: any[] = task.ids;
        const exceptSocketSids = task.exceptSocketSids;

        let socketAction: SocketAction | undefined = undefined;
        switch (task.action) {
            case WorkerChMapTaskAction.Emit:
                const data = task.data;
                socketAction = (s: Socket) => {
                    s._emit(data.event,data.data);
                };
                break;
            case WorkerChMapTaskAction.Disconnect:
                socketAction = (s: Socket) => {
                    s.disconnect();
                };
                break;
            case WorkerChMapTaskAction.Deauthenticate:
                socketAction = (s: Socket) => {
                    s.deauthenticate();
                };
                break;
        }

        if(socketAction !== undefined){
            switch (task.target) {
                case WorkerChMapTarget.UserIds:
                    this.forUserIds(ids,exceptSocketSids,socketAction);
                    break;
                case WorkerChMapTarget.TokenIds:
                    this.forTokenIds(ids,exceptSocketSids,socketAction);
                    break;
                case WorkerChMapTarget.AllSockets:
                    this.forAllSockets(exceptSocketSids,socketAction);
                    break;
                case WorkerChMapTarget.SocketSids:
                    this.forAllSocketSids(ids,socketAction);
                    break;
                case WorkerChMapTarget.AuthUserGroups:
                    this.forAuthUserGroups(ids,task.data.all || false,exceptSocketSids,socketAction);
                    break;
                case WorkerChMapTarget.DefaultUserGroup:
                    this.forDefaultUserGroup(exceptSocketSids,socketAction);
                    break;
            }
        }
    }

    /**
     * Update all tokens from sockets in the map.
     * @param map
     * @param operations
     * @param target
     * @param exceptSocketSids
     */
    private async updateTokens(map: SocketMapper<Socket>, operations: ObjectEditAction[], target, exceptSocketSids: string[]) {
        const filterExceptSocketIds: string[] = this.socketSidsFilter(exceptSocketSids);
        const promises: Promise<void>[] = [];
        map.forEach(target,(socket: Socket) => {
            if(!filterExceptSocketIds.includes(socket.id)) {
                promises.push(socket.applyEditActionsOnTokenPayload(operations));
            }
        });
        await Promise.all(promises);
    }

    /**
     * Do action for sockets with sid on the server.
     * @param ids
     * @param action
     */
    private forAllSocketSids(ids: string[],action: SocketAction) {
        const filterSocketIds: string[] = this.socketSidsFilter(ids);
        for(let i = 0; i < filterSocketIds.length; i++)
        {
            if(this.scServer.clients.hasOwnProperty(filterSocketIds[i])) {
                action(this.scServer.clients[filterSocketIds[i]]._socket);
            }
        }
    }

    /**
     * Do action for all sockets on the server.
     * @param exceptSocketSids
     * @param action
     */
    private forAllSockets(exceptSocketSids: string[],action: SocketAction)
    {
        const filterExceptSocketIds: string[] = this.socketSidsFilter(exceptSocketSids);
        for(const id in this.scServer.clients) {
            if(this.scServer.clients.hasOwnProperty(id)) {
                if(!filterExceptSocketIds.includes(this.scServer.clients[id].id)) {
                    action(this.scServer.clients[id]._socket);
                }
            }
        }
    }

    /**
     * Filter socket sids from a sid array.
     * @param socketSids
     */
    private socketSidsFilter(socketSids: string[]): string[]
    {
        const filteredIds: string[] = [];
        socketSids.forEach((sid) =>{
            const splitSid = SidBuilder.splitSid(sid);
            if (this.options.instanceId === splitSid[0] && this.id == splitSid[1]) {
                filteredIds.push(splitSid[2]);
            }
        });
        return filteredIds;
    }

    /**
     * Do action for all sockets with grouped id in a mapper.
     * @param mapper
     * @param ids
     * @param exceptSocketSids
     * @param action
     */
    private forMappingSCId(mapper: SocketMapper<Socket>, ids: (string | number)[], exceptSocketSids: string[], action: SocketAction): void
    {
        const filterExceptSocketIds: string[] = this.socketSidsFilter(exceptSocketSids);
        for(let i = 0; i < ids.length; i++) {
            mapper.forEach(ids[i].toString(),(socket: Socket) => {
                if(!filterExceptSocketIds.includes(socket.id)) {
                    action(socket);
                }
            });
        }
    }

    /**
     * Do a action for all sockets in a mapper.
     * @param mapper
     * @param exceptSocketSids
     * @param action
     */
    private forMappingSCAll(mapper: SocketMapper<Socket>, exceptSocketSids: string[], action: SocketAction): void
    {
        const filterExceptSocketIds: string[] = this.socketSidsFilter(exceptSocketSids);
        mapper.forAllEach((socket: Socket) => {
            if(!filterExceptSocketIds.includes(socket.id)) {
                action(socket);
            }
        });
    }

    /**
     * Do a action for all sockets with token id.
     * @param tokenIds
     * @param exceptSocketSids
     * @param action
     */
    private forTokenIds(tokenIds: (number | string)[],exceptSocketSids: string[],action: SocketAction): void {
        this.forMappingSCId(this.mapTokenIdToSc,tokenIds,exceptSocketSids,action);
    }

    /**
     * Do a action for all sockets with auth user groups.
     * @param groups
     * @param all
     * @param exceptSocketSids
     * @param action
     */
    private forAuthUserGroups(groups: string[],all: boolean,exceptSocketSids: string[],action: SocketAction): void {
        if(all){
            this.forMappingSCAll(this.mapAuthUserGroupToSc,exceptSocketSids,action);
        }
        else{
            this.forMappingSCId(this.mapAuthUserGroupToSc,groups,exceptSocketSids,action);
        }
    }

    /**
     * Do a action for all sockets with default user group.
     * @param exceptSocketSids
     * @param action
     */
    private forDefaultUserGroup(exceptSocketSids: string[],action: SocketAction): void {
        const filterExceptSocketIds: string[] = this.socketSidsFilter(exceptSocketSids);
        this.defaultUserGroupSet.forEach((socket: Socket) => {
            if(!filterExceptSocketIds.includes(socket.id)) {
                action(socket);
            }
        });
    }

    /**
     * Do a action for all sockets with user id.
     * @param userIds
     * @param exceptSocketSids
     * @param action
     */
    private forUserIds(userIds: (number | string)[],exceptSocketSids: string[],action: SocketAction): void {
        this.forMappingSCId(this.mapUserIdToSc,userIds,exceptSocketSids,action);
    }

    //Part background tasks

    /**
     * Register on master for user background tasks.
     */
    private registerMasterEvent()
    {
        this.on('masterMessage',async (message: MasterMessagePackage,respond) => {
            switch (message[0]) {
                case MasterMessageAction.backgroundTask:
                    await this.processBackgroundTask(message[1]);
                    respond(null);
                    break;
                case MasterMessageAction.componentStructure:
                    if(this.preparedAllComponents){
                        respond(null,treeify.asTree(ComponentUtils.buildTreeInfoStructure(false,
                            this.controllerPrepare,this.receiverPrepare,
                            this.databoxPrepare,this.channelPrepare),true));
                    }
                    else {
                        respond(new Error('Not ready'));
                    }
                    break;
            }
        });
    }

    /**
     * Process a background task.
     */
    private async processBackgroundTask(id) {
        if(this.userBackgroundTasks.hasOwnProperty(id)) {
            try {
                Logger.log.debug
                (`The Worker with id: ${this.id}, starts to invoke background task: '${id}'`);
                await this.userBackgroundTasks[id](this.preparedBag);
            }
            catch (e) {
                Logger.log.error(`The Worker with id: ${this.id}, error while invoking the background task: '${id}': ${e.stack}`);
                await this.zc.event.error(e);
            }
        }
    }

    /**
     * Load user background tasks.
     */
    private loadUserBackgroundTasks() {
        const bkTS = new BackgroundTasksWorkerSaver(
            (name,task) => {
                this.userBackgroundTasks[name] = task;
            });
        bkTS.saveUserBackgroundTasks(this.zc);
    }

    /**
     * Load client js data from master.
     */
    private async loadClientJsData(): Promise<void>
    {
        try {
            const promises: Promise<void>[] = [];
            promises.push(new Promise<void>(async (resolve) => {
                this.serverSettingsJs = await this.sendToZationMaster({action: WorkerMessageAction.ServerSettingsJs});
                resolve();
            }));
            promises.push(new Promise<void>(async (resolve) => {
                this.fullClientJs = await this.sendToZationMaster({action: WorkerMessageAction.FullClientJs});
                resolve();
            }));
            await Promise.all(promises);
        }
        catch (e) {
            throw new Error('Failed to load client js data from master!');
        }
    }

    /**
     * Send data to the master.
     * @param data
     */
    public sendToZationMaster(data: {action: WorkerMessageAction} | any): Promise<any> {
        return new Promise<boolean>((resolve,reject) => {
            this.sendToMaster(data,(err,data) => {
                err ? reject(err): resolve(data);
            });
        });
    }

    /**
     * Kill the full server for a reason.
     * @param error
     */
    public async killServer(error: Error | string): Promise<void> {
        await this.sendToZationMaster({action: WorkerMessageAction.KillServer, data: error});
    }

    //Part panel

    //Get the first panel information.
    public async getFirstPanelInfo(): Promise<object>
    {
        const infos =  {
            //static props
            brokerCount  : this.zc.mainConfig.brokers,
            hostname     : this.zc.mainConfig.hostname,
            port         : this.zc.mainConfig.port,
            path         : this.zc.mainConfig.path,
            secure       : this.zc.mainConfig.secure,
            appName      : this.zc.mainConfig.appName,
            debug        : this.zc.mainConfig.debug,
            wsEngine     : this.zc.mainConfig.wsEngine,
            nodeVersion  : process.version,
            license      : this.license ? LicenseManager.licenseToPanelLicense(this.license): undefined,
            ip           : this.getPreparedBag().getServerIpAddress(),
            zationServerVersion   : this.serverVersion,
            workerStartedTimestamp: this.workerStartedTimeStamp,
            serverStartedTimestamp: this.serverStartedTimeStamp,
            panelAuthUserMap: this.panelEngine.getPanelUserMap(),
            generalSystemInfo: (await PanelOsInfo.getGeneralInfo()),
            defaultUserName: this.authConfig.getDefaultUserGroup(),
            //dynamic properties
            clientCount: this.scServer.clientsCount,
            systemInfo : (await PanelOsInfo.getUpdatedInfo()),
            user: {
                panelUserCount: this.getPanelUserSet().getLength(),
                defaultUserGroupCount: this.getPreparedBag().getWorkerDefaultUserGroupCount(),
                authUserGroups: this.getPreparedBag().getWorkerAuthUserGroupsCount()
            },
            httpRequests: this.httpRequestCount,
            wsRequests: this.wsRequestCount
        };
        if(this.isLeader){
            //nodeInfo
            const brokerInfo = (await NodeInfo.getBrokerInfo(this));
            infos['brokers'] = brokerInfo.brokers;
            infos['cBrokers'] = brokerInfo.cBrokers;
            infos['master'] = await NodeInfo.getMasterInfo(this);
        }
        return infos;
    }

    //Update the panel engine with data.
    private async initPanelUpdates(): Promise<void>
    {
        const bag = this.preparedBag;
        setInterval(async () => {
            if(this.panelEngine.isPanelInUse()) {
                this.panelEngine.update({
                    systemInfo  : (await PanelOsInfo.getUpdatedInfo()),
                    clientCount : this.scServer.clientsCount,
                    user: {
                        panelUserCount: bag.getWorkerPanelClientsCount(),
                        defaultUserGroupCount: bag.getWorkerDefaultUserGroupCount(),
                        authUserGroups: bag.getWorkerAuthUserGroupsCount()
                    },
                    httpRequests: this.httpRequestCount,
                    wsRequests  : this.wsRequestCount
                });
            }
            this.httpRequestCount = 0;
            this.wsRequestCount = 0;
        },1000);

        if(this.isLeader){
            //brokerInfo
            setInterval(async () => {
                if(this.panelEngine.isPanelInUse()){
                    const brokerInfo = (await NodeInfo.getBrokerInfo(this));
                    this.panelEngine.updateLeaderInfo({
                        brokers: brokerInfo.brokers,
                        cBrokers: brokerInfo.cBrokers,
                        master: (await NodeInfo.getMasterInfo(this))
                    });
                }
            },4000);
        }

    }

    /**
     * Unmap the socket from every mapper with the token information.
     * @param token
     * @param socket
     */
    unmapSocketToken(token: RawZationToken, socket: Socket) {
        this.mapAuthUserGroupToSc.unMap(token.authUserGroup,socket);
        this.mapTokenIdToSc.unMap(token.tid,socket);
        if(token.userId !== undefined){
            this.mapUserIdToSc.unMap(token.userId.toString(),socket);
        }
        this.panelUserSet.remove(socket);
    }

    /**
     * Update the socket token maps.
     * @param oldToken
     * @param newToken
     * @param socket
     */
    updateSocketTokenMaps(oldToken: RawZationToken | null, newToken: RawZationToken | null, socket: Socket) {
        if(newToken != null) {
            if(oldToken == null) {
                //new authenticated remove from default and map to the other maps
                //that requires a token.
                this.defaultUserGroupSet.remove(socket);

                if(newToken.authUserGroup !== undefined){
                    this.mapAuthUserGroupToSc.map(newToken.authUserGroup,socket);
                }

                this.mapTokenIdToSc.map(newToken.tid,socket);

                if(newToken.userId !== undefined){
                    this.mapUserIdToSc.map(newToken.userId.toString(),socket);
                }

                if(typeof newToken.onlyPanelToken === 'boolean' && newToken.onlyPanelToken){
                    this.panelUserSet.add(socket);
                }
            }
            else {
                //updated authentication
                //check for changes and update map
                if(newToken.authUserGroup !== oldToken.authUserGroup) {
                    this.mapAuthUserGroupToSc.unMap(oldToken.authUserGroup,socket);
                    if(newToken.authUserGroup !== undefined){
                        this.mapAuthUserGroupToSc.map(newToken.authUserGroup,socket);
                    }
                }
                //token id can not be changed.

                //Only one '=' (userId can be a number or string)
                if(newToken.userId != oldToken.userId){
                    if(oldToken.userId !== undefined){
                        this.mapUserIdToSc.unMap(oldToken.userId.toString(),socket);
                    }
                    if(newToken.userId !== undefined){
                        this.mapUserIdToSc.map(newToken.userId.toString(),socket);
                    }
                }
                if(newToken.onlyPanelToken !== oldToken.onlyPanelToken) {
                    if(typeof newToken.onlyPanelToken === 'boolean' && newToken.onlyPanelToken){
                        this.panelUserSet.add(socket);
                    }
                    else {
                        this.panelUserSet.remove(socket);
                    }
                }
            }
        }
        else {
            //add to default group
            this.defaultUserGroupSet.add(socket);
            if(oldToken != null) {
                //Deauthenticated remove from other mappings that requires a token
                //if the old token was a token.
                this.worker.unmapSocketToken(oldToken,socket);
            }
        }
    }

    getServerVersion(): string {
        return this.serverVersion;
    }

    getServerStartedTime(): number {
        return this.serverStartedTimeStamp;
    }

    getWorkerId(): number {
        return this.id;
    }

    getWorkerStartedTime(): number {
        return this.workerStartedTimeStamp;
    }

    getZationConfig(): ZationConfigFull {
        return this.zc;
    }

    getPreparedBag(): Bag {
        return this.preparedBag;
    }

    getAuthConfig(): AuthConfig {
        return this.authConfig;
    }

    getServiceEngine(): ServiceEngine {
        return this.serviceEngine;
    }

    getUserIdToScMapper(): SocketMapper<Socket> {
        return this.mapUserIdToSc;
    }

    getTokenIdToScMapper(): SocketMapper<Socket> {
        return this.mapTokenIdToSc;
    }

    getAuthUserGroupToScMapper(): SocketMapper<Socket> {
        return this.mapAuthUserGroupToSc;
    }

    getDefaultUserGroupSet(): SocketSet {
        return this.defaultUserGroupSet;
    }

    getPanelUserSet(): SocketSet {
        return this.panelUserSet;
    }

    setAttachment(obj: object): void {
        this.attachment = obj;
    }

    getAttachment(): object {
        return this.attachment;
    }

    getPanelEngine(): PanelEngine {
        return this.panelEngine;
    }

    getViewEngine(): ViewEngine {
        return this.viewEngine;
    }

    isRespawn(): boolean {
        return this._isRespawn;
    }
}

new ZationWorker();

export = ZationWorker;