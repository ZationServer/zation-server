/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import ScServer               from "../main/sc/scServer";
import ChMiddlewareHelper     from '../main/channel/chMiddlewareHelper';
import {
    WorkerChMapTaskAction,
    WorkerChSpecialTaskAction,
    WorkerChMapTarget,
    WorkerChTaskType,
    WorkerChSpecialTask, WorkerTaskPackage, WorkerChMapTask
} from "../main/constants/workerChTaskDefinitions";
import UpSocket               from "../main/sc/socket";
import {ZationToken}          from "../main/constants/internal";
import {WorkerMessageAction}  from "../main/constants/workerMessageAction";
import {ChannelPrepare}       from "../main/channel/channelPrepare";
import BagExtensionEngine     from "../main/bagExtension/bagExtensionEngine";
import NodeInfo               from "../main/utils/nodeInfo";
import SocketSet              from "../main/utils/socketSet";
import OriginsUtils, {OriginChecker} from "../main/origins/originsUtils";
import {
    SyncTokenDefinitions,
    SyncTokenOperationType,
} from "../main/constants/syncTokenDefinitions";

import express      = require('express');
import {Request , Response} from "express";
import cookieParser = require('cookie-parser');
import bodyParser   = require('body-parser');
import fileUpload   = require('express-fileupload');
import url          = require('url');

import process          = require("process");
import ControllerReqHandler from "../main/controller/request/controllerReqHandler";
import AEPreparedPart       from "../main/auth/aePreparedPart";
import ZationTokenWrapper   from "../main/internalApi/zationTokenWrapper";
import ControllerPrepare    from "../main/controller/controllerPrepare";
import ServiceEngine        from "../main/services/serviceEngine";
import Bag                  from "../api/Bag";
import Mapper               from "../main/utils/mapper";
import ViewEngine           from "../main/views/viewEngine";
import Logger               from "../main/logger/logger";
import ConfigPreCompiler    from "../main/config/utils/configPreCompiler";
import PanelEngine          from "../main/panel/panelEngine";
import SidBuilder           from "../main/utils/sidBuilder";
import ChUtils              from "../main/channel/chUtils";
import TokenUtils, {TokenClusterKeyCheckFunction} from "../main/token/tokenUtils";
import SystemInfo           from "../main/utils/systemInfo";
import BackgroundTasksWorkerSaver from "../main/background/backgroundTasksWorkerSaver";
import MiddlewareUtils      from "../main/utils/middlewareUtils";
import ZationConfigFull     from "../main/config/manager/zationConfigFull";
import ConfigLoader         from "../main/config/manager/configLoader";
import SocketUpgradeEngine  from "../main/socket/socketUpgradeEngine";
import ChannelBagEngine     from "../main/channel/channelBagEngine";
import {
    AuthMiddlewareReq,
    HandshakeScMiddlewareReq,
    HandshakeWsMiddlewareReq,
    PubInMiddlewareReq,
    PubOutMiddlewareReq,
    SubMiddlewareReq
} from "../main/sc/scMiddlewareReq";
import ExpressUtils   from "../main/utils/expressUtils";
import {SocketAction} from "../main/constants/socketAction";
import {TaskFunction} from "../main/config/definitions/backgroundTaskConfig";
import {ClientErrorName}          from "../main/constants/clientErrorName";
import {DATABOX_START_INDICATOR}  from "../main/databox/dbDefinitions";
import {ZationChannel}            from "../main/channel/channelDefinitions";
import DataboxHandler             from "../main/databox/handle/databoxHandler";
import DataboxPrepare             from "../main/databox/databoxPrepare";

const  SCWorker : any        = require('socketcluster/scworker');

class ZationWorker extends SCWorker
{
    private userBackgroundTasks : Record<string,TaskFunction> = {};

    private workerFullId : string;
    private readonly _isRespawn : boolean;

    private workerStartedTimeStamp : number;
    private serverStartedTimeStamp : number;
    private serverVersion : string;
    private zc : ZationConfigFull;

    public readonly scServer : ScServer;
    private serviceEngine : ServiceEngine;
    private bagExtensionEngine : BagExtensionEngine;
    private preparedBag : Bag;
    private controllerPrepare : ControllerPrepare;
    private databoxPrepare : DataboxPrepare;
    private aePreparedPart : AEPreparedPart;
    private panelEngine : PanelEngine;
    private chMiddlewareHelper : ChMiddlewareHelper;
    private channelBagEngine : ChannelBagEngine;
    private originCheck : OriginChecker;
    private channelPrepare : ChannelPrepare;
    private zationCReqHandler : ControllerReqHandler;
    private zationDbHandler : DataboxHandler;
    private socketUpdateEngine : SocketUpgradeEngine;
    private tokenClusterKeyCheck : TokenClusterKeyCheckFunction;

    private authStartActive : boolean;

    private app : any;

    private readonly mapUserIdToSc : Mapper<UpSocket> = new Mapper<UpSocket>();
    private readonly mapTokenIdToSc : Mapper<UpSocket> = new Mapper<UpSocket>();
    private readonly mapAuthUserGroupToSc : Mapper<UpSocket> = new Mapper<UpSocket>();
    private readonly defaultUserGroupSet  = new SocketSet();
    private readonly panelUserSet = new SocketSet();

    private variableStorage : object = {};

    private httpRequestCount = 0;
    private wsRequestCount = 0;

    //prepareClient
    private fullClientJs : string;
    private serverSettingsJs : string;

    //prepareView
    private viewEngine : ViewEngine = new ViewEngine();

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
        global['_ZATION_START_MODE'] = this.zc.getStartMode();

        //setLogger
        Logger.setZationConfig(this.zc);

        await this.setUpLogInfo();

        process.title = `Zation Server: ${this.zc.mainConfig.instanceId} -> Worker - ${this.id}`;

        //Check LogToFile
        Logger.initFileLog();

        await this.startZWorker();
    }

    private async startZWorker()
    {
        Logger.printStartDebugInfo(`The Worker with id ${this.id} begins the start process.`,false,true);

        const startPromises : Promise<void>[] = [];

        //load html views
        startPromises.push(this.viewEngine.loadViews());

        Logger.startStopWatch();
        const otherConfigsLoadedSet = ConfigLoader.loadOtherConfigs(this.zc.configLocations);
        Logger.printStartDebugInfo(`The Worker with id ${this.id} has loaded other zation configuration files.`,true);

        //start loading client js
        startPromises.push(this.loadClientJsData());

        Logger.startStopWatch();
        let preCompiler = new ConfigPreCompiler(otherConfigsLoadedSet);
        this.zc.setOtherConfigs(preCompiler.preCompile(this.zc,this.zc.mainConfig.showPrecompiledConfigs && this.isLeader));
        Logger.printStartDebugInfo(`The Worker with id ${this.id} has pre compiled configurations.`, true);

        //Origins checker
        Logger.startStopWatch();
        this.originCheck = OriginsUtils.createOriginChecker(this.zc.mainConfig.origins);
        Logger.printStartDebugInfo(`The Worker with id ${this.id} has created the origin checker.`,true);

        //Token cluster key checker
        Logger.startStopWatch();
        this.tokenClusterKeyCheck = TokenUtils.createTokenClusterKeyChecker(this.zc);
        Logger.printStartDebugInfo(`The Worker with id ${this.id} has created the token cluster key checker.`,true);

        //Services (!Before Bag)
        Logger.startStopWatch();
        this.serviceEngine = new ServiceEngine(this.zc,this);
        await this.serviceEngine.init();
        Logger.printStartDebugInfo(`The Worker with id ${this.id} has created service engine.`,true);

        //BagExtensions (!Before Bag)
        Logger.startStopWatch();
        this.bagExtensionEngine = new BagExtensionEngine(this.zc);
        this.bagExtensionEngine.extendBag();
        Logger.printStartDebugInfo(`The Worker with id ${this.id} has processed the bag extensions.`,true);

        Logger.startStopWatch();
        this.aePreparedPart = new AEPreparedPart(this.zc);
        Logger.printStartDebugInfo(`The Worker with id ${this.id} has prepared an auth engine part.`,true);

        //ChannelPrepare (!Before ChannelBagEngine)
        Logger.startStopWatch();
        this.channelPrepare = new ChannelPrepare(this.zc);
        Logger.printStartDebugInfo(`The Worker with id ${this.id} has created the channel prepare engine.`,true);

        Logger.startStopWatch();
        this.channelBagEngine = new ChannelBagEngine(this,this.aePreparedPart,this.channelPrepare);
        Logger.printStartDebugInfo(`The Worker with id ${this.id} has initialized the channel bag engine.`,true);

        Logger.startStopWatch();
        this.preparedBag = new Bag(this,this.channelBagEngine);
        //set Bag for events on channels or access check
        this.channelBagEngine.bag = this.preparedBag;
        Logger.printStartDebugInfo(`The Worker with id ${this.id} has prepared an bag.`,true);

        //Socket update engine
        Logger.startStopWatch();
        this.socketUpdateEngine = new SocketUpgradeEngine(this,this.channelPrepare);
        Logger.printStartDebugInfo(`The Worker with id ${this.id} has created the socket update engine.`,true);

        Logger.startStopWatch();
        this.databoxPrepare = new DataboxPrepare(this.zc,this,this.preparedBag);
        await this.databoxPrepare.prepare();
        Logger.printStartDebugInfo(`The Worker with id ${this.id} has prepared the Databoxes.`,true);

        //PrepareChannels after Bag!
        Logger.startStopWatch();
        this.channelPrepare.prepare(this.preparedBag);
        Logger.printStartDebugInfo(`The Worker with id ${this.id} has prepared the channels.`,true);

        //PrepareController after Bag!
        Logger.startStopWatch();
        this.controllerPrepare = new ControllerPrepare(this.zc,this,this.preparedBag);
        await this.controllerPrepare.prepare();
        Logger.printStartDebugInfo(`The Worker with id ${this.id} has prepared the controllers.`,true);

        Logger.startStopWatch();
        this.panelEngine = new PanelEngine(this,this.aePreparedPart.getAuthGroups());
        if(this.zc.mainConfig.usePanel) {
            await this.initPanelUpdates();
            Logger.printStartDebugInfo(`The Worker with id ${this.id} has created the panel engine.`,true);
        }
        else {
            Logger.printStartDebugInfo(`The Worker with id ${this.id} has checked for the panel engine.`,true);
        }

        Logger.startStopWatch();
        this.chMiddlewareHelper = new ChMiddlewareHelper(this.channelPrepare,this.preparedBag);
        Logger.printStartDebugInfo(`The Worker with id ${this.id} has initialized the channel middleware helper.`,true);

        Logger.startStopWatch();
        this.loadUserBackgroundTasks();
        Logger.printStartDebugInfo(`The Worker with id ${this.id} has loaded the user background tasks.`,true);

        Logger.startStopWatch();
        this.registerMasterEvent();
        Logger.printStartDebugInfo(`The Worker with id ${this.id} has registered by the master event.`,true);

        Logger.startStopWatch();
        await this.registerWorkerChannel();
        Logger.printStartDebugInfo(`The Worker with id ${this.id} has registered to the worker channel.`,true);

        Logger.startStopWatch();
        this.zationCReqHandler = new ControllerReqHandler(this);
        Logger.printStartDebugInfo(`The Worker with id ${this.id} has created the zation request handler.`,true);

        Logger.startStopWatch();
        this.zationDbHandler = new DataboxHandler(this.databoxPrepare,this.zc);
        Logger.printStartDebugInfo(`The Worker with id ${this.id} has created the zation Databox handler.`,true);

        Logger.startStopWatch();
        this.checkAuthStart();
        Logger.printStartDebugInfo(`The Worker with id ${this.id} has checked for authStart.`,true);

        //wait for start process promises
        await Promise.all(startPromises);

        //Server
        Logger.startStopWatch();
        await this.startHttpServer();
        Logger.printStartDebugInfo(`The Worker with id ${this.id} has started the http server.`,true);

        Logger.startStopWatch();
        await this.startWebSocketServer();
        Logger.printStartDebugInfo(`The Worker with id ${this.id} has started the web socket server.`,true);

        //Fire ExpressEvent
        Logger.startStopWatch();
        await this.zc.eventConfig.express(this.preparedBag,this.app);
        Logger.printStartDebugInfo(`The Worker with id ${this.id} has processed the express event.`,true);

        //Fire ScServerEvent
        Logger.startStopWatch();
        await this.zc.eventConfig.socketServer(this.preparedBag,this.scServer);
        Logger.printStartDebugInfo(`The Worker with id ${this.id} has processed the scServer event.`,true);

        Logger.printStartDebugInfo(`The Worker with id ${this.id} is started.`,false);

        //init event
        Logger.startStopWatch();
        await this.zc.eventConfig.workerInit(this.preparedBag,this.isLeader,this._isRespawn);
        Logger.printStartDebugInfo(`The Worker with id ${this.id} invoked init event.`,true);

        //Fire event is started
        this.zc.eventConfig.workerStarted(this.preparedBag,this.zc.getZationInfo(),this._isRespawn,this);

        if(this.isLeader){
            this.zc.eventConfig.workerLeaderStarted(this.preparedBag,this.zc.getZationInfo(),this._isRespawn,this);
        }
    }

    private async setUpLogInfo()
    {
        this.on('error',(e) => {
           Logger.printError(
               e,
               `Worker: '${this.getFullWorkerId()}' has an error!`,
               `Worker will be restarted!`
           );
        });
    }

    private async startWebSocketServer()
    {
        this.initSocketMiddleware();
        this.initScServerEvents();

        if(this.zc.mainConfig.usePanel) {
            this.scServer.on('_connection', (socket) => {
                // The connection event counts as a WS request
                this.wsRequestCount++;
                socket.on('message', () => {
                    this.wsRequestCount++;
                });
            });
        }

        //START SOCKET SERVER
        this.scServer.on('connection', async (socket : UpSocket) => {

            this.socketUpdateEngine.upgradeSocket(socket);
            this.initSocketEvents(socket);

            const initPromise = this.zc.eventConfig.socketInit(this.getPreparedBag(),socket.zSocket);

            Logger.printDebugInfo(`Socket with id: ${socket.id} is connected!`);

            socket.on('>', async (data, respond) => {
                await this.zationCReqHandler.processSocketReq(data,socket,respond);
            });

            socket.on(DATABOX_START_INDICATOR, async (data, respond) => {
                await this.zationDbHandler.processConnectReq(data,socket,respond);
            });

            await initPromise;
            await this.zc.eventConfig.socketConnection(this.getPreparedBag(),socket.zSocket);
        });
        await this.zc.eventConfig.wsServerStarted(this.zc.getZationInfo());
    }

    private async startHttpServer()
    {
        if(this.zc.mainConfig.usePanel) {
            this.httpServer.on('request', () => {
                this.httpRequestCount++;
            });
        }

        this.app = express();

        const serverPath = this.zc.mainConfig.path;
        const serverPort = this.zc.mainConfig.port.toString();

        //Middleware check origin.
        this.app.use((req, res, next) => {
            if(this.originCheck(req.hostname,req.protocol,serverPort)){
                res.setHeader('Access-Control-Allow-Origin', `${req.protocol}://${req.hostname}`);
                res.header('Access-Control-Allow-Methods', 'GET, POST');
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

        //StartCookieParser
        this.app.use(cookieParser());
        //FileParser
        this.app.use(fileUpload());
        //BodyParser
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({extended: true}));

        //Set Server
        this.httpServer.on('request', this.app);

        //Public folder
        this.app.use(`/zation/assets`, express.static(__dirname + '/../public/assets'));

        if(this.zc.mainConfig.usePanel) {
            this.app.use([`${serverPath}/panel/*`,`${serverPath}/panel`],
                express.static(__dirname + '/../public/panel'));
        }

        this.app.get(`/zation/serverSettings.js`,(req,res) => {
            res.type('.js');
            res.send(this.serverSettingsJs);
        });

        //Log file download
        this.app.get([`${serverPath}/log/:key`,`${serverPath}/log`],ExpressUtils.createLogFileDownloader(this.zc));

        if(this.zc.mainConfig.provideClientJs) {
            this.app.get(`${serverPath}/client.js`,(req,res) => {
                res.type('.js');
                res.send(this.fullClientJs);
            });
        }

        //Request
        this.app.all(`${serverPath}`, async (req : Request, res : Response) => {
            //Run Zation
            await this.zationCReqHandler.processHttpReq(req,res);
        });

        await this.zc.eventConfig.httpServerStarted(this.zc.getZationInfo());
    }

    getFullWorkerId() {
        return this.workerFullId;
    }

    /**
     * Create the zation middleware.
     */
    private initSocketMiddleware()
    {
        const eventConfig = this.zc.eventConfig;

        const userChInfo = this.channelPrepare.getUserChInfo();
        const authUserGroupChInfo = this.channelPrepare.getAuthUserGroupChInfo();
        const defaultUserGroupChInfo = this.channelPrepare.getDefaultUserGroupChInfo();
        const allChInfo = this.channelPrepare.getAllChInfo();

        this.scServer.addMiddleware(this.scServer.MIDDLEWARE_SUBSCRIBE, async (req : SubMiddlewareReq, next) => {
            const authToken = req.socket.getAuthToken();
            const channel = req.channel;

            if (channel.indexOf(ZationChannel.CUSTOM_CHANNEL_PREFIX) === 0) {
                next(await this.chMiddlewareHelper.checkAccessSubCustomCh(req.socket,channel));
            }
            else if (channel.indexOf(ZationChannel.USER_CHANNEL_PREFIX) === 0) {
                if(authToken !== null){
                    const id = authToken.userId;
                    if(id !== undefined) {
                        if (ZationChannel.USER_CHANNEL_PREFIX + id === channel) {
                            Logger.printDebugInfo(`Socket with id: ${req.socket.id} subscribes to the user channel: '${id}'.`);
                            next();
                        }
                        else {
                            const err : any = new Error(`A client can only subscribe to the user channel where his user id belongs to.`);
                            err.name = ClientErrorName.ACCESS_DENIED;
                            next(err); //Block!
                        }
                    }
                    else {
                        const err : any = new Error(`A client with undefined user id cannot subscribe to this user channel.`);
                        err.name = ClientErrorName.ACCESS_DENIED;
                        next(err); //Block!
                    }
                }
                else {
                    const err : any = new Error('An anonymous client cannot subscribe to this user channel.');
                    err.name = ClientErrorName.ACCESS_DENIED;
                    next(err); //Block!
                }
            }
            else if (channel.indexOf(ZationChannel.AUTH_USER_GROUP_PREFIX) === 0) {
                if(authToken !== null){
                    const authUserGroup = authToken.authUserGroup;
                    if(authUserGroup !== undefined) {
                        if (ZationChannel.AUTH_USER_GROUP_PREFIX + authUserGroup === channel) {
                            Logger.printDebugInfo
                            (`Socket with id: ${req.socket.id} subscribes to the auth user group channel: '${authUserGroup}'.`);
                            next();
                        }
                        else {
                            const err : any = new Error('A client can only subscribe to the auth user group channel where his auth user group belongs to.');
                            err.name = ClientErrorName.ACCESS_DENIED;
                            next(err); //Block!
                        }
                    }
                    else {
                        const err : any = new Error(`A client with undefined auth user group cannot subscribe to this auth user group channel.`);
                        err.name = ClientErrorName.ACCESS_DENIED;
                        next(err); //Block!
                    }
                }
                else {
                    const err : any = new Error('An anonymous client cannot subscribe to this auth user group channel.');
                    err.name = ClientErrorName.ACCESS_DENIED;
                    next(err); //Block!
                }
            }
            else if (channel === ZationChannel.DEFAULT_USER_GROUP) {
                if(authToken !== null){
                    const err : any = new Error('An authenticated client cannot subscribe to the default user group channel.');
                    err.name = ClientErrorName.ACCESS_DENIED;
                    next(err); //Block!
                }
                else {
                    Logger.printDebugInfo(`Socket with id: ${req.socket.id} subscribes to the default user group channel.`);
                    next();
                }
            }
            else if (channel === ZationChannel.PANEL_OUT) {
                if(authToken !== null){
                    if (typeof authToken.panelAccess === 'boolean' && authToken.panelAccess) {
                        Logger.printDebugInfo
                        (`Socket with id: ${req.socket.id} subscribes to the panel out channel.`);
                        next();
                    }
                    else {
                        const err : any = new Error('A client without panel access cannot subscribe to the panel out channel!');
                        err.name = ClientErrorName.ACCESS_DENIED;
                        next(err); //Block!
                    }
                }
                else {
                    const err : any = new Error('An anonymous client cannot subscribe to the panel out channel.');
                    err.name = ClientErrorName.ACCESS_DENIED;
                    next(err); //Block!
                }
            }
            else if(channel === ZationChannel.PANEL_IN) {
                const err : any = new Error('A client cannot subscribe to the panel in channel.');
                err.name = ClientErrorName.ACCESS_DENIED;
                next(err); //Block!
            }
            else if(channel.indexOf(DATABOX_START_INDICATOR) === 0) {
                const err : any = new Error('A client cannot subscribe to an internally Databox channel.');
                err.name = ClientErrorName.ACCESS_DENIED;
                next(err); //Block!
            }
            else if(channel === ZationChannel.ALL_WORKER) {
                const err : any = new Error('A client cannot subscribe to the all worker channel.');
                err.name = ClientErrorName.ACCESS_DENIED;
                next(err); //Block!
            }
            else {
                Logger.printDebugInfo(`Socket with id: ${req.socket.id} subscribes the '${channel}' channel.`);
                next();
            }
        });

        /**
         * Middleware for client publish.
         */
        this.scServer.addMiddleware(this.scServer.MIDDLEWARE_PUBLISH_IN, async (req : PubInMiddlewareReq, next) =>
        {
            const channel = req.channel;
            const socket = req.socket;

            ChUtils.pubDataAddSocketSrcSid(req,socket);

            if (channel.indexOf(ZationChannel.USER_CHANNEL_PREFIX) === 0) {
                const userId = ChUtils.getUserIdFromCh(channel);
                if(await (userChInfo.clientPublishAccessChecker(socket.authEngine,req.data,socket.zSocket,userId))) {
                    userChInfo.onClientPub(
                        this.preparedBag,
                        req.data,
                        socket.zSocket,
                        userId
                    );
                    next();
                }
                else{
                    const err : any = new Error('Publish in this user group channel denied.');
                    err.name = ClientErrorName.ACCESS_DENIED;
                    next(err); //Block!
                }
            }
            else if (channel.indexOf(ZationChannel.CUSTOM_CHANNEL_PREFIX) === 0) {
                next(await this.chMiddlewareHelper.checkAccessClientPubCustomCh(req.socket,channel,req.data));
            }
            else if (channel.indexOf(ZationChannel.AUTH_USER_GROUP_PREFIX) === 0) {
                const authUserGroup = ChUtils.getUserAuthGroupFromCh(channel);
                if(await authUserGroupChInfo.clientPublishAccessChecker(socket.authEngine,req.data,socket.zSocket,authUserGroup)) {
                    authUserGroupChInfo.onClientPub(
                        this.preparedBag,
                        req.data,
                        socket.zSocket,
                        authUserGroup
                    );
                    next();
                }
                else{
                    const err : any = new Error('Publish in this auth user group channel denied.');
                    err.name = ClientErrorName.ACCESS_DENIED;
                    next(err); //Block!
                }
            }
            else if (channel === ZationChannel.ALL) {
                if(await allChInfo.clientPublishAccessChecker(socket.authEngine,req.data,socket.zSocket,undefined)) {
                    allChInfo.onClientPub(
                        this.preparedBag,
                        req.data,
                        req.socket.zSocket
                    );
                    next();
                }
                else {
                    const err : any = new Error('Publish in the all channel denied.');
                    err.name = ClientErrorName.ACCESS_DENIED;
                    next(err); //Block!
                }
            }
            else if (channel === ZationChannel.DEFAULT_USER_GROUP) {
                if(await defaultUserGroupChInfo.clientPublishAccessChecker(socket.authEngine,req.data,socket.zSocket,undefined)) {
                    defaultUserGroupChInfo.onClientPub(
                        this.preparedBag,
                        req.data,
                        req.socket.zSocket
                    );
                    next();
                }
                else{
                    const err : any = new Error('Publish in the default user group channel denied.');
                    err.name = ClientErrorName.ACCESS_DENIED;
                    next(err); //Block!
                }
            }
            else if(channel === ZationChannel.PANEL_OUT) {
                const err : any = new Error('A client cannot publish in the panel out channel.');
                err.name = ClientErrorName.ACCESS_DENIED;
                next(err); //Block!
            }
            else if(channel === ZationChannel.PANEL_IN) {
                const authToken = req.socket.getAuthToken();
                if(authToken !== null && typeof authToken[nameof<ZationToken>(s => s.panelAccess)] === 'boolean' &&
                    authToken[nameof<ZationToken>(s => s.panelAccess)])
                {
                    next();
                }
                else {
                    const err : any = new Error('A client without panel access cannot publish in the panel in channel.');
                    err.name = ClientErrorName.ACCESS_DENIED;
                    next(err); //Block!
                }
            }
            else if(req.channel.indexOf(DATABOX_START_INDICATOR) === 0) {
                const err : any = new Error('A client cannot publish in an internally Databox channel.');
                err.name = ClientErrorName.ACCESS_DENIED;
                next(err); //Block!
            }
            //Important! (Otherwise every socket can publish in worker channel and can modify the whole network.)
            else if(req.channel === ZationChannel.ALL_WORKER) {
                const err : any = new Error('A client cannot publish in the all worker channel.');
                err.name = ClientErrorName.ACCESS_DENIED;
                next(err); //Block!
            }
            else {
                next();
            }
        });

        /**
         * Middleware before each target socket gets publish.
         */
        this.scServer.addMiddleware(this.scServer.MIDDLEWARE_PUBLISH_OUT, async (req : PubOutMiddlewareReq, next) =>
        {
            if(req.data.sSid === req.socket.sid)
            {
                if
                (
                    (
                        req.channel.indexOf(ZationChannel.USER_CHANNEL_PREFIX) === 0 &&
                        !userChInfo.socketGetOwnPub
                    )
                    ||
                    (
                        req.channel.indexOf(ZationChannel.CUSTOM_CHANNEL_PREFIX) === 0 &&
                        !this.channelPrepare.getCustomChPreInfo(ChUtils.getCustomChannelName(req.channel))
                            .socketGetOwnPub
                    )
                    ||
                    (
                        req.channel.indexOf(ZationChannel.AUTH_USER_GROUP_PREFIX) === 0 &&
                        !authUserGroupChInfo.socketGetOwnPub
                    )
                    ||
                    (
                        req.channel === ZationChannel.ALL &&
                        !allChInfo.socketGetOwnPub
                    )
                    ||
                    (
                        req.channel === ZationChannel.DEFAULT_USER_GROUP &&
                        !defaultUserGroupChInfo.socketGetOwnPub
                    )
                ) {
                    //block for get own published message
                    next(true);
                }
                else {
                    // get own published message
                    next();
                }
            }
            else {
                //not same src or not src sid information
                next();
            }
        });

        /**
         * Middleware when the socket is created.
         * Zation will add the client version,system and handshake variables.
         */
        this.scServer.addMiddleware(this.scServer.MIDDLEWARE_HANDSHAKE_SC, async (req : HandshakeScMiddlewareReq, next) =>
        {
            //check for version and system info
            const urlParts = url.parse(req.socket.request.url || '', true);
            const query = urlParts.query;
            if (
                typeof query === 'object' &&
                (typeof query.version === 'string') && typeof query.system === 'string')
            {
                const socket = req.socket;

                //parse custom variables
                let variables = {};
                if(typeof query.variables === 'string') {
                    try {
                        variables = JSON.parse(query.variables);
                    }
                    catch (e) {}
                }
                // @ts-ignore
                socket.handshakeVariables = variables;

                // @ts-ignore
                socket.zationClient = {
                    version : parseFloat(query.version),
                    system : query.system,
                };

                if(typeof query.apiLevel === 'string') {
                    // @ts-ignore
                    socket.apiLevel = parseInt(query.apiLevel);
                }

                const zationMidRes = await
                    MiddlewareUtils.checkMiddleware
                    (eventConfig.middlewareSocket,next,this.getPreparedBag(),socket);

                if(zationMidRes) {next();}
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
        this.scServer.addMiddleware(this.scServer.MIDDLEWARE_HANDSHAKE_WS, async (req : HandshakeWsMiddlewareReq, next) =>
        {
            let origin : any = req.headers.origin;
            if (origin === 'null' || origin == null) {
                origin = '*';
            }
            const parts = url.parse(origin);
            if(this.originCheck(parts.hostname,parts.protocol,parts.port)) {
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
        this.scServer.addMiddleware(this.scServer.MIDDLEWARE_AUTHENTICATE, async (req : AuthMiddlewareReq, next) =>
        {
            const token = req.authToken;
            //check if the token is valid
            try {
                TokenUtils.checkToken(token,this.aePreparedPart);
                this.tokenClusterKeyCheck(token);
            }
            catch (e) {
                next(e);
            }

            const zationAuthMid = await MiddlewareUtils.checkMiddleware
            (eventConfig.middlewareAuthenticate,next,this.getPreparedBag(),new ZationTokenWrapper(token));

            if(zationAuthMid) {next();}
        });
    }

    /**
     * Register for sc server events.
     */
    private initScServerEvents()
    {
        const userChInfo = this.channelPrepare.getUserChInfo();
        const authUserGroupChInfo = this.channelPrepare.getAuthUserGroupChInfo();
        const defaultUserGroupChInfo = this.channelPrepare.getDefaultUserGroupChInfo();
        const allChInfo = this.channelPrepare.getAllChInfo();

        this.scServer.on('connectionAbort', async (socket : UpSocket,code,data) => {
            await this.zc.eventConfig.socketConnectionAbort(this.getPreparedBag(),socket,code,data);
        });

        this.scServer.on('disconnection', async (socket : UpSocket, code, data) =>
        {
            /**
             * Remove socket from all maps.
             */
            const token = socket.authToken;
            if(token !== null){
                this.unmapSocketToken(token,socket);
            }
            this.defaultUserGroupSet.remove(socket);

            await this.zc.eventConfig.socketDisconnection(this.getPreparedBag(),socket.zSocket,code,data);
        });

        /**
         * Emit subscribe event.
         */
        this.scServer.on('subscription', async (socket : UpSocket, chName, chOptions) =>
        {
            if(chName.indexOf(ZationChannel.CUSTOM_CHANNEL_PREFIX) === 0) {
                const {name,id} = ChUtils.getCustomChannelInfo(chName);

                this.channelPrepare.getCustomChPreInfo(name)
                .onSub(
                    this.preparedBag,
                    socket.zSocket,
                    {id,name}
                );
            }
            else if(chName.indexOf(ZationChannel.USER_CHANNEL_PREFIX) === 0) {
                userChInfo.onSub(
                    this.preparedBag,
                    socket.zSocket,
                    ChUtils.getUserIdFromCh(chName)
                );
            }
            else if(chName.indexOf(ZationChannel.AUTH_USER_GROUP_PREFIX) === 0) {
                authUserGroupChInfo.onSub(
                    this.preparedBag,
                    socket.zSocket,
                    ChUtils.getUserAuthGroupFromCh(chName)
                );
            }
            else if(chName === ZationChannel.DEFAULT_USER_GROUP) {
                defaultUserGroupChInfo.onSub(
                    this.preparedBag,
                    socket.zSocket
                )
            }
            else if(chName === ZationChannel.ALL) {
                allChInfo.onSub(
                    this.preparedBag,
                    socket.zSocket
                );
            }
            await this.zc.eventConfig.socketSubscription(this.getPreparedBag(),socket.zSocket,chName,chOptions);
        });

        /**
         * Emit unsubscribe event
         */
        this.scServer.on('unsubscription', async (socket : UpSocket,chName) =>
        {
            //trigger sub customCh event and update mapper
            if(chName.indexOf(ZationChannel.CUSTOM_CHANNEL_PREFIX) === 0) {
                const {name,id} = ChUtils.getCustomChannelInfo(chName);

                this.channelPrepare.getCustomChPreInfo(name)
                .onUnsub(
                    this.preparedBag,
                    socket.zSocket,
                    {name,id}
                );
            }
            else if(chName.indexOf(ZationChannel.USER_CHANNEL_PREFIX) === 0) {
                userChInfo.onUnsub(
                    this.preparedBag,
                    socket.zSocket,
                    ChUtils.getUserIdFromCh(chName)
                );
            }
            else if(chName.indexOf(ZationChannel.AUTH_USER_GROUP_PREFIX) === 0) {
                authUserGroupChInfo.onUnsub(
                    this.preparedBag,
                    socket.zSocket,
                    ChUtils.getUserAuthGroupFromCh(chName)
                );
            }
            else if(chName === ZationChannel.DEFAULT_USER_GROUP) {
                defaultUserGroupChInfo.onUnsub(
                    this.preparedBag,
                    socket.zSocket
                );
            }
            else if(chName === ZationChannel.ALL) {
                allChInfo.onUnsub(
                    this.preparedBag,
                    socket.zSocket
                );
            }
            await this.zc.eventConfig.socketUnsubscription(this.getPreparedBag(),socket.zSocket,chName);
        });

        this.scServer.on('authentication', async (socket : UpSocket) => {
           await this.zc.eventConfig.socketAuthentication(this.getPreparedBag(),socket.zSocket);
        });

        this.scServer.on('deauthentication', async (socket : UpSocket) => {
            this.zc.eventConfig.socketDeauthentication(this.getPreparedBag(),socket.zSocket);
        });

        this.scServer.on('authenticationStateChange', async (socket : UpSocket,stateChangeData : any) => {
            await this.zc.eventConfig.socketAuthStateChange(this.getPreparedBag(),socket.zSocket,stateChangeData);
        });

        this.scServer.on('badSocketAuthToken', async (socket : UpSocket,badAuthStatus) => {
            socket.emit('zationBadAuthToken',{});
            await this.zc.eventConfig.socketBadAuthToken(this.getPreparedBag(),socket,badAuthStatus);
        });
    }

    /**
     * Register for socket events.
     * @param socket
     */
    private initSocketEvents(socket : UpSocket)
    {
        socket.on('error', async (err) => {
            await this.zc.eventConfig.socketError(this.getPreparedBag(),socket,err);
        });

        socket.on('raw', async (data) => {
            await this.zc.eventConfig.socketRaw(this.getPreparedBag(),socket,data);
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
        const channel = (this.exchange.subscribe as any)(ZationChannel.ALL_WORKER);
        channel.watch(async (data : WorkerTaskPackage) =>
        {
            switch (data.taskType) {
                case WorkerChTaskType.MAP_TASK:
                     await this.processMapTask(data);
                     break;
                case WorkerChTaskType.SPECIAL_TASK:
                    await this.processSpecialTask(data);
                    break;
            }
        });
    }

    /**
     * Process a special worker task.
     * @param task
     */
    async processSpecialTask(task : WorkerChSpecialTask)
    {
        const data = task.data;
        switch (task.action) {
            case WorkerChSpecialTaskAction.UPDATE_USER_TOKENS:
                await this.updateTokens
                (this.mapUserIdToSc,data.operations,data.target.toString(),data.exceptSocketSids);
                break;
            case WorkerChSpecialTaskAction.UPDATE_GROUP_TOKENS:
                await this.updateTokens
                (this.mapAuthUserGroupToSc,data.operations,data.target,data.exceptSocketSids);
                break;
            case WorkerChSpecialTaskAction.MESSAGE:
                await this.zc.eventConfig.workerMessage(this.preparedBag,data);
                break;
        }
    }

    /**
     * Process a worker map task.
     * @param task
     */
    async processMapTask(task : WorkerChMapTask)
    {
        const ids : any[] = task.ids;
        const exceptSocketSids = task.exceptSocketSids;

        let socketAction : SocketAction | undefined = undefined;
        switch (task.action) {
            case WorkerChMapTaskAction.KICK_OUT:
                const ch = task.data.ch;
                if(ch !== undefined) {
                    socketAction = (s : UpSocket) => {
                        ChUtils.kickOutSearch(s,ch);
                    };
                }
                break;
            case WorkerChMapTaskAction.EMIT:
                const data = task.data;
                socketAction = (s : UpSocket) => {
                    s.emit(data.event,data.data);
                };
                break;
            case WorkerChMapTaskAction.DISCONNECT:
                socketAction = (s : UpSocket) => {
                    s.disconnect();
                };
                break;
            case WorkerChMapTaskAction.DEAUTHENTICATE:
                socketAction = (s : UpSocket) => {
                    s.deauthenticate();
                };
                break;
        }

        if(socketAction !== undefined){
            switch (task.target) {
                case WorkerChMapTarget.USER_IDS:
                    this.forUserIds(ids,exceptSocketSids,socketAction);
                    break;
                case WorkerChMapTarget.TOKEN_IDS:
                    this.forTokenIds(ids,exceptSocketSids,socketAction);
                    break;
                case WorkerChMapTarget.ALL_SOCKETS:
                    this.forAllSockets(exceptSocketSids,socketAction);
                    break;
                case WorkerChMapTarget.SOCKETS_SIDS:
                    this.forAllSocketSids(ids,socketAction);
                    break;
                case WorkerChMapTarget.AUTH_USER_GROUPS:
                    this.forAuthUserGroups(ids,task.data.all || false,exceptSocketSids,socketAction);
                    break;
                case WorkerChMapTarget.DEFAULT_USER_GROUP:
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
    private async updateTokens(map : Mapper<UpSocket>, operations : SyncTokenDefinitions[], target, exceptSocketSids : string[]) {
        const filterExceptSocketIds : string[] = this.socketSidsFilter(exceptSocketSids);
        const promises : Promise<void>[] = [];
        map.forEach(target,(socket : UpSocket) => {
            if(!filterExceptSocketIds.includes(socket.id)) {
                const edit = this.preparedBag.seqEditTokenVariablesWithSocket(socket);
                for(let i = 0; i < operations.length; i++) {
                    switch (operations[i].t) {
                        case SyncTokenOperationType.SET :
                            edit.set(operations[i].p as string | string[],operations[i].v);
                            break;
                        case SyncTokenOperationType.DELETE :
                            edit.delete(operations[i].p);
                            break;
                    }
                }
                promises.push(edit.commit());
            }
        });
        await Promise.all(promises);
    }

    /**
     * Do action for sockets with sid on the server.
     * @param ids
     * @param action
     */
    private forAllSocketSids(ids : string[],action : SocketAction) {
        const filterSocketIds : string[] = this.socketSidsFilter(ids);
        for(let i = 0; i < filterSocketIds.length; i++)
        {
            if(this.scServer.clients.hasOwnProperty(filterSocketIds[i])) {
                action(this.scServer.clients[filterSocketIds[i]]);
            }
        }
    }

    /**
     * Do action for all sockets on the server.
     * @param exceptSocketSids
     * @param action
     */
    private forAllSockets(exceptSocketSids : string[],action : SocketAction)
    {
        const filterExceptSocketIds : string[] = this.socketSidsFilter(exceptSocketSids);
        for(let id in this.scServer.clients) {
            if(this.scServer.clients.hasOwnProperty(id)) {
                if(!filterExceptSocketIds.includes(this.scServer.clients[id].id)) {
                    action(this.scServer.clients[id]);
                }
            }
        }
    }

    /**
     * Filter socket sids from a sid array.
     * @param socketSids
     */
    private socketSidsFilter(socketSids : string[]) : string[]
    {
        const filteredIds : string[] = [];
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
    private forMappingSCId(mapper : Mapper<UpSocket>, ids : (string | number)[], exceptSocketSids : string[], action : SocketAction) : void
    {
        const filterExceptSocketIds : string[] = this.socketSidsFilter(exceptSocketSids);
        for(let i = 0; i < ids.length; i++) {
            mapper.forEach(ids[i].toString(),(socket : UpSocket) => {
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
    private forMappingSCAll(mapper : Mapper<UpSocket>, exceptSocketSids : string[], action : SocketAction) : void
    {
        const filterExceptSocketIds : string[] = this.socketSidsFilter(exceptSocketSids);
        mapper.forAllEach((socket : UpSocket) => {
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
    private forTokenIds(tokenIds : (number | string)[],exceptSocketSids : string[],action : SocketAction) : void {
        this.forMappingSCId(this.mapTokenIdToSc,tokenIds,exceptSocketSids,action);
    }

    /**
     * Do a action for all sockets with auth user groups.
     * @param groups
     * @param all
     * @param exceptSocketSids
     * @param action
     */
    private forAuthUserGroups(groups : string[],all : boolean,exceptSocketSids : string[],action : SocketAction) : void {
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
    private forDefaultUserGroup(exceptSocketSids : string[],action : SocketAction) : void {
        const filterExceptSocketIds : string[] = this.socketSidsFilter(exceptSocketSids);
        this.defaultUserGroupSet.forEach((socket : UpSocket) => {
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
    private forUserIds(userIds : (number | string)[],exceptSocketSids : string[],action : SocketAction) : void {
        this.forMappingSCId(this.mapUserIdToSc,userIds,exceptSocketSids,action);
    }

    //Part background tasks

    /**
     * Register on master for user background tasks.
     */
    private registerMasterEvent()
    {
        this.on('masterMessage',async (data,respond) => {
            if(data['userBackgroundTask']) {
                await this.processBackgroundTask(data['userBackgroundTask']);
            }
            respond(null);
        });
    }

    /**
     * Process a background task.
     */
    private async processBackgroundTask(id) {
        if(this.userBackgroundTasks.hasOwnProperty(id)) {
            try {
                Logger.printDebugInfo
                (`The Worker with id: ${this.id}, starts to invoke background task : '${id}'`);
                await this.userBackgroundTasks[id](this.preparedBag);
            }
            catch (e) {
                Logger.printDebugInfo
                (`The Worker with id: ${this.id}, error while invoking the background task : '${id}'`);
                await this.zc.eventConfig.beforeError(this.preparedBag,e);
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
     * Check for active auth start.
     */
    private checkAuthStart() {
        if(this.zc.mainConfig.authStart)
        {
            this.authStartActive = true;
            setTimeout(() =>
            {
                this.authStartActive = false;
            },this.zc.mainConfig.authStartDuration);
        }
    }

    /**
     * Load client js data from master.
     */
    private async loadClientJsData() : Promise<void>
    {
        try {
            const promises : Promise<void>[] = [];
            promises.push(new Promise<void>(async (resolve) => {
                this.serverSettingsJs = await this.sendToZationMaster({action : WorkerMessageAction.SERVER_SETTINGS_JS});
                resolve();
            }));
            promises.push(new Promise<void>(async (resolve) => {
                this.fullClientJs = await this.sendToZationMaster({action : WorkerMessageAction.FULL_CLIENT_JS});
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
    public sendToZationMaster(data : {action : WorkerMessageAction} | any) : Promise<any> {
        return new Promise<boolean>((resolve,reject) => {
            this.sendToMaster(data,(err,data) => {
                err ? reject(err) : resolve(data);
            });
        });
    }

    /**
     * Kill the full server for a reason.
     * @param error
     */
    public async killServer(error : Error | string) : Promise<void> {
        await this.sendToZationMaster({action : WorkerMessageAction.KILL_SERVER, data : error});
    }

    //Part panel

    //Get the first panel information.
    public async getFirstPanelInfo() : Promise<object>
    {
        const infos =  {
            //static props
            brokerCount : this.zc.mainConfig.brokers,
            hostname    : this.zc.mainConfig.hostname,
            port        : this.zc.mainConfig.port,
            path        : this.zc.mainConfig.path,
            postKey     : this.zc.mainConfig.postKey,
            secure      : this.zc.mainConfig.secure,
            appName     : this.zc.mainConfig.appName,
            debug       : this.zc.mainConfig.debug,
            useScUws    : this.zc.mainConfig.useScUws,
            ip          : this.getPreparedBag().getServerIpAddress(),
            workerStartedTimestamp : this.workerStartedTimeStamp,
            serverStartedTimestamp : this.serverStartedTimeStamp,
            panelAuthUserMap : this.panelEngine.getPanelUserMap(),
            generalSystemInfo : (await SystemInfo.getGeneralInfo()),
            defaultUserName : this.aePreparedPart.getDefaultGroup(),
            //dynamic properties
            clientCount : this.scServer.clientsCount,
            systemInfo  : (await SystemInfo.getUpdatedInfo()),
            user: {
                panelUserCount : this.getPanelUserSet().getLength(),
                defaultUserGroupCount : this.getPreparedBag().getWorkerDefaultUserGroupCount(),
                authUserGroups : this.getPreparedBag().getWorkerAuthUserGroupsCount()
            },
            httpRequests : this.httpRequestCount,
            wsRequests : this.wsRequestCount
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
    private async initPanelUpdates() : Promise<void>
    {
        setInterval(async () => {
            if(this.panelEngine.isPanelInUse()) {
                this.panelEngine.update({
                    systemInfo   : (await SystemInfo.getUpdatedInfo()),
                    clientCount  : this.scServer.clientsCount,
                    user: {
                        panelUserCount : this.getPanelUserSet().getLength(),
                        defaultUserGroupCount : this.getPreparedBag().getWorkerDefaultUserGroupCount(),
                        authUserGroups : this.getPreparedBag().getWorkerAuthUserGroupsCount()
                    },
                    httpRequests : this.httpRequestCount,
                    wsRequests   : this.wsRequestCount
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
                        brokers : brokerInfo.brokers,
                        cBrokers : brokerInfo.cBrokers,
                        master : (await NodeInfo.getMasterInfo(this))
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
    unmapSocketToken(token : ZationToken, socket : UpSocket) {
        this.mapAuthUserGroupToSc.unMap(token.authUserGroup,socket);
        this.mapTokenIdToSc.unMap(token.tid,socket);
        if(token.userId !== undefined){
            this.mapUserIdToSc.unMap(token.userId.toString(),socket);
        }
        this.panelUserSet.remove(socket);
    }

    getServerVersion() : string {
        return this.serverVersion;
    }

    getServerStartedTime() : number {
        return this.serverStartedTimeStamp;
    }

    getWorkerId() : number {
        return this.id;
    }

    getIsAuthStartActive() : boolean {
        return this.authStartActive;
    }

    getWorkerStartedTime() : number {
        return this.workerStartedTimeStamp;
    }

    getZationConfig() : ZationConfigFull {
        return this.zc;
    }

    getPreparedBag() : Bag {
        return this.preparedBag;
    }

    getAEPreparedPart() : AEPreparedPart {
        return this.aePreparedPart;
    }

    getChannelBagEngine() : ChannelBagEngine {
        return this.channelBagEngine
    }

    getControllerPrepare() : ControllerPrepare
    {
        return this.controllerPrepare;
    }

    getServiceEngine() : ServiceEngine {
        return this.serviceEngine;
    }

    getUserIdToScMapper() : Mapper<UpSocket> {
        return this.mapUserIdToSc;
    }

    getTokenIdToScMapper() : Mapper<UpSocket> {
        return this.mapTokenIdToSc;
    }

    getAuthUserGroupToScMapper() : Mapper<UpSocket> {
        return this.mapAuthUserGroupToSc;
    }

    getDefaultUserGroupSet() : SocketSet {
        return this.defaultUserGroupSet;
    }

    getPanelUserSet() : SocketSet {
        return this.panelUserSet;
    }

    getWorkerVariableStorage() : object {
        return this.variableStorage;
    }

    getPanelEngine() : PanelEngine {
        return this.panelEngine;
    }

    getViewEngine() : ViewEngine {
        return this.viewEngine;
    }

    setWorkerVariableStorage(obj : object) : void {
        this.variableStorage = obj;
    }

    getTokenClusterKeyCheck() : TokenClusterKeyCheckFunction {
        return this.tokenClusterKeyCheck;
    }

    isRespawn() : boolean {
        return this._isRespawn;
    }
}

new ZationWorker();

export = ZationWorker;