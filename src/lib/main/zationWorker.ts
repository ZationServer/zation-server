/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import ScServer             from "../helper/sc/scServer";
import ChMiddlewareHelper   from '../helper/channel/chMiddlewareHelper';
import {WorkerChMapTaskActions, WorkerChSpecialTaskActions} from "../helper/constants/workerChTaskActions";
import UpSocket               from "../helper/sc/socket";
import {WorkerChTargets}      from "../helper/constants/workerChTargets";
import {ZationChannel, ZationToken} from "../helper/constants/internal";
import {WorkerMessageActions} from "../helper/constants/workerMessageActions";
import {ChannelPrepare}       from "../helper/channel/channelPrepare";
import BagExtensionEngine     from "../helper/bagExtension/bagExtensionEngine";
import NodeInfo               from "../helper/utils/nodeInfo";
import SocketSet              from "../helper/utils/socketSet";
import OriginsUtils, {OriginChecker} from "../helper/origins/originsUtils";
import {SyncTokenActions}     from "../helper/constants/syncTokenActions";

import express      = require('express');
import cookieParser = require('cookie-parser');
import bodyParser   = require('body-parser');
import fileUpload   = require('express-fileupload');
import url          = require('url');

import process          = require("process");
import {WorkerChTaskType} from "../helper/constants/workerChTaskType";
import InputProcessor from "../helper/input/inputProcessor";
import ZationReqHandler   from "./zationReqHandler";
import AEPreparedPart     from "../helper/auth/aePreparedPart";
import ZationTokenInfo    from "../helper/infoObjects/zationTokenInfo";
import ControllerPrepare  from "../helper/controller/controllerPrepare";
import ServiceEngine      from "../helper/services/serviceEngine";
import SmallBag           from "../api/SmallBag";
import Mapper             from "../helper/utils/mapper";
import ViewEngine         from "../helper/views/viewEngine";
import Logger             from "../helper/logger/logger";
import ConfigPreCompiler  from "../helper/configUtils/configPreCompiler";
import PanelEngine        from "../helper/panel/panelEngine";
import SidBuilder         from "../helper/utils/sidBuilder";
import ChUtils            from "../helper/channel/chUtils";
import TokenUtils, {TokenClusterKeyCheckFunction} from "../helper/token/tokenUtils";
import SystemInfo         from "../helper/utils/systemInfo";
import BackgroundTasksWorkerSaver from "../helper/background/backgroundTasksWorkerSaver";
import MiddlewareUtils    from "../helper/utils/middlewareUtils";
import ZationConfigFull   from "../helper/configManager/zationConfigFull";
import ConfigLoader       from "../helper/configManager/configLoader";
import SocketUpgradeEngine from "../helper/socket/socketUpgradeEngine";
import ChannelBagEngine    from "../helper/channel/channelBagEngine";
import {
    AuthMiddlewareReq,
    HandshakeScMiddlewareReq,
    HandshakeWsMiddlewareReq,
    PubInMiddlewareReq,
    PubOutMiddlewareReq,
    SubMiddlewareReq
} from "../helper/sc/scMiddlewareReq";
import ExpressUtils from "../helper/utils/expressUtils";
import {SocketAction} from "../helper/constants/socketAction";
import {TaskFunction} from "../helper/configDefinitions/appConfig";

const  SCWorker : any        = require('socketcluster/scworker');

class ZationWorker extends SCWorker
{
    private userBackgroundTasks : Record<string,TaskFunction> = {};

    private workerFullId : string;

    private workerStartedTimeStamp : number;
    private serverStartedTimeStamp : number;
    private serverVersion : string;
    private zc : ZationConfigFull;

    public scServer : ScServer;
    private serviceEngine : ServiceEngine;
    private bagExtensionEngine : BagExtensionEngine;
    private preparedSmallBag : SmallBag;
    private controllerPrepare : ControllerPrepare;
    private aePreparedPart : AEPreparedPart;
    private panelEngine : PanelEngine;
    private chMiddlewareHelper : ChMiddlewareHelper;
    private channelBagEngine : ChannelBagEngine;
    private originCheck : OriginChecker;
    private channelPrepare : ChannelPrepare;
    private inputDataProcessor : InputProcessor;
    private zationReqHandler : ZationReqHandler;
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
    }

    // noinspection JSUnusedGlobalSymbols
    async run()
    {
        this.workerStartedTimeStamp = Date.now();
        this.serverStartedTimeStamp = this.options.zationServerStartedTimeStamp;
        this.serverVersion = this.options.zationServerVersion;

        this.workerFullId = this.id + '.' + process.pid;

        this.zc = new ZationConfigFull(this.options.zationConfigWorkerTransport);

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
        const otherConfigsLoadedSet = await ConfigLoader.loadOtherConfigs(this.zc.configLocations);
        Logger.printStartDebugInfo(`The Worker with id ${this.id} has loaded other zation configuration files.`,true);

        //start loading client js
        startPromises.push(this.loadClientJsData());

        Logger.startStopWatch();
        let preCompiler = new ConfigPreCompiler(otherConfigsLoadedSet);
        this.zc.setOtherConfigs(preCompiler.preCompile());
        Logger.printStartDebugInfo(`The Worker with id ${this.id} has pre compiled configurations.`, true);

        //Origins checker
        Logger.startStopWatch();
        this.originCheck = OriginsUtils.createOriginChecker(this.zc.mainConfig.origins);
        Logger.printStartDebugInfo(`The Worker with id ${this.id} has created the origin checker.`,true);

        //Token cluster key checker
        Logger.startStopWatch();
        this.tokenClusterKeyCheck = TokenUtils.createTokenClusterKeyChecker(this.zc);
        Logger.printStartDebugInfo(`The Worker with id ${this.id} has created the token cluster key checker.`,true);

        //Services (!Before SmallBag)
        Logger.startStopWatch();
        this.serviceEngine = new ServiceEngine(this.zc,this);
        await this.serviceEngine.init();
        Logger.printStartDebugInfo(`The Worker with id ${this.id} has created service engine.`,true);

        //BagExtensions (!Before SmallBag)
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
        this.preparedSmallBag = new SmallBag(this,this.channelBagEngine);
        //set smallBag for events on channels or access check
        this.channelBagEngine.smallBag = this.preparedSmallBag;
        Logger.printStartDebugInfo(`The Worker with id ${this.id} has prepared an small bag.`,true);

        //InputDataProcessor after smallBag!
        Logger.startStopWatch();
        this.inputDataProcessor= new InputProcessor(this);
        Logger.printStartDebugInfo(`The Worker with id ${this.id} has prepared the input request data processor.`,true);

        //Socket update engine
        Logger.startStopWatch();
        this.socketUpdateEngine = new SocketUpgradeEngine(this,this.channelPrepare);
        Logger.printStartDebugInfo(`The Worker with id ${this.id} has created the socket update engine.`,true);

        //PrepareChannels after smallBag!
        Logger.startStopWatch();
        this.channelPrepare.prepare(this.preparedSmallBag);
        Logger.printStartDebugInfo(`The Worker with id ${this.id} has prepared the channels.`,true);

        //PrepareController after smallBag!
        Logger.startStopWatch();
        this.controllerPrepare = new ControllerPrepare(this.zc,this,this.preparedSmallBag,this.inputDataProcessor);
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
        this.chMiddlewareHelper = new ChMiddlewareHelper(this.channelPrepare,this.preparedSmallBag);
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
        this.zationReqHandler = new ZationReqHandler(this);
        Logger.printStartDebugInfo(`The Worker with id ${this.id} has created the zation request handler.`,true);

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
        await this.zc.eventConfig.express(this.preparedSmallBag,this.app);
        Logger.printStartDebugInfo(`The Worker with id ${this.id} has processed the express event.`,true);

        //Fire ScServerEvent
        Logger.startStopWatch();
        await this.zc.eventConfig.scServer(this.preparedSmallBag,this.scServer);
        Logger.printStartDebugInfo(`The Worker with id ${this.id} has processed the scServer event.`,true);

        Logger.printStartDebugInfo(`The Worker with id ${this.id} is started.`,false);

        //Fire event is started
        await this.zc.eventConfig.workerStarted(this.preparedSmallBag,this.zc.getZationInfo(),this);

        if(this.isLeader){
            this.zc.eventConfig.workerLeaderStarted(this.preparedSmallBag,this.zc.getZationInfo(),this);
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
        this.scServer.on('connection', async (socket : UpSocket, conState) => {

            this.socketUpdateEngine.upgradeSocket(socket);
            this.initSocketEvents(socket);

            Logger.printDebugInfo(`Socket with id: ${socket.id} is connected!`);

            socket.on('>', async (data, respond) => {
                await this.zationReqHandler.processSocketReq(data,socket,respond);
            });

            await Promise.all([
                this.zc.eventConfig.sc_serverConnection(this.getPreparedSmallBag(),socket,conState),
                this.zc.eventConfig.socketConnection(this.getPreparedSmallBag(),socket.socketInfo)
            ]);
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
        this.app.all(`${serverPath}`, async (req, res) => {
            //Run Zation
            await this.zationReqHandler.processHttpReq(res,req);
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

            if (channel.indexOf(ZationChannel.CUSTOM_ID_CHANNEL_PREFIX) !== -1) {
                next(await this.chMiddlewareHelper.checkAccessSubCustomIdCh(req.socket,channel));
            }
            else if (channel.indexOf(ZationChannel.CUSTOM_CHANNEL_PREFIX) !== -1) {
                next(await this.chMiddlewareHelper.middlewareSubCustomCh(req.socket,channel));
            }
            else {
                if (authToken !== null) {
                    const id = authToken[nameof<ZationToken>(s => s.zationUserId)];
                    const authUserGroup = authToken[nameof<ZationToken>(s => s.zationAuthUserGroup)];

                    if (channel.indexOf(ZationChannel.USER_CHANNEL_PREFIX) !== -1) {
                        if(id !== undefined) {
                            if (ZationChannel.USER_CHANNEL_PREFIX + id === channel) {
                                Logger.printDebugInfo(`Socket with id: ${req.socket.id} subscribes user channel '${id}'`);
                                next();
                            }
                            else {
                                const err : any = new Error(`User: ${id} can\'t subscribe an other user Channel: '${channel}'!`);
                                err.code = 4543;
                                next(err); //Block!
                            }
                        }
                        else {
                            const err : any = new Error(`User: with undefined id can\'t subscribe user Channel: '${channel}'!`);
                            err.code = 4542;
                            next(err); //Block!
                        }
                    }
                    else if (channel.indexOf(ZationChannel.AUTH_USER_GROUP_PREFIX) !== -1) {
                        if(authUserGroup !== undefined) {
                            if (ZationChannel.AUTH_USER_GROUP_PREFIX + authUserGroup === channel) {
                                Logger.printDebugInfo
                                (`Socket with id: ${req.socket.id} subscribes auth user group channel '${authUserGroup}'`);
                                next();
                            }
                            else {
                                const err : any = new Error('User can\'t subscribe an other auth user group channel.');
                                err.code = 4533;
                                next(err); //Block!
                            }
                        }
                        else {
                            const err : any = new Error(`User: with undefined auth user group can\'t subscribe auth user group channel!`);
                            err.code = 4532;
                            next(err); //Block!
                        }
                    }
                    else if (channel === ZationChannel.DEFAULT_USER_GROUP) {
                        const err : any = new Error('Authenticated user can\' subscribe default user group channel!');
                        err.code = 4521;
                        next(err); //Block!
                    }
                    else if (channel === ZationChannel.PANEL_OUT) {
                        if (typeof authToken[nameof<ZationToken>(s => s.zationPanelAccess)] === 'boolean' &&
                            authToken[nameof<ZationToken>(s => s.zationPanelAccess)]) {
                            Logger.printDebugInfo
                            (`Socket with id: ${req.socket.id} subscribes panel out channel`);
                            next();
                        }
                        else {
                            const err : any = new Error('User with no panel access can\'t subscribe panel out channel!');
                            err.code = 4502;
                            next(err); //Block!
                        }
                    }
                    else if(channel === ZationChannel.PANEL_IN) {
                        const err : any = new Error('User can\'t subscribe panel in channel!');
                        err.code = 4901;
                        next(err); //Block!
                    }
                    else if(channel === ZationChannel.ALL_WORKER) {
                        const err : any = new Error('User can\'t subscribe all worker channel!');
                        err.code = 4503;
                        next(err); //Block!
                    }
                    else {
                        Logger.printDebugInfo(`Socket with id: ${req.socket.id} subscribes '${channel}'`);
                        next();
                    }
                }
                else {
                    if (channel.indexOf(ZationChannel.USER_CHANNEL_PREFIX) !== -1) {
                        const err : any = new Error('Anonymous user can\'t subscribe a user Channel!');
                        err.code = 4541;
                        next(err); //Block!
                    }
                    else if (channel.indexOf(ZationChannel.AUTH_USER_GROUP_PREFIX) !== -1) {
                        const err : any = new Error('Anonymous user can\'t subscribe a auth user group channel!');
                        err.code = 4531;
                        next(err); //Block!
                    }
                    else if (channel === ZationChannel.DEFAULT_USER_GROUP) {
                        Logger.printDebugInfo(`Socket with id: ${req.socket.id} subscribes default user group channel`);
                        next();
                    }
                    else if(channel === ZationChannel.PANEL_IN || channel  === ZationChannel.PANEL_OUT) {
                        const err : any = new Error('Anonymous user can\'t subscribe panel in or out channel!');
                        err.code = 4501;
                        next(err); //Block!
                    }
                    else if(channel === ZationChannel.ALL_WORKER) {
                        const err : any = new Error('User can\'t subscribe all worker Channel!');
                        err.code = 4504;
                        next(err); //Block!
                    }
                    else {
                        Logger.printDebugInfo(`Socket with id: ${req.socket.id} subscribes '${channel}'`);
                        next();
                    }
                }
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

            if (channel.indexOf(ZationChannel.USER_CHANNEL_PREFIX) !== -1) {
                const userId = ChUtils.getUserIdFromCh(channel);
                if(await (userChInfo.clientPublishAccessChecker(socket.authEngine,req.data,socket.socketInfo,userId))) {
                    userChInfo.onClientPub(
                        this.preparedSmallBag,
                        req.data,
                        socket.socketInfo,
                        userId
                    );
                    next();
                }
                else{
                    const err : any = new Error('Client publication not allowed in this user channel!');
                    err.code = 4546;
                    next(err); //Block!
                }
            }
            else if (channel.indexOf(ZationChannel.CUSTOM_ID_CHANNEL_PREFIX) !== -1) {
                next(await this.chMiddlewareHelper.checkAccessClientPubCustomIdCh(req.socket,channel,req.data));
            }
            else if (channel.indexOf(ZationChannel.CUSTOM_CHANNEL_PREFIX) !== -1) {
                next(await this.chMiddlewareHelper.middlewareClientPubCustomCh(req.socket,channel,req.data));
            }
            else if (channel.indexOf(ZationChannel.AUTH_USER_GROUP_PREFIX) !== -1) {
                const authUserGroup = ChUtils.getUserAuthGroupFromCh(channel);
                if(authUserGroupChInfo.clientPublishAccessChecker(socket.authEngine,req.data,socket.socketInfo,authUserGroup)) {
                    authUserGroupChInfo.onClientPub(
                        this.preparedSmallBag,
                        req.data,
                        socket.socketInfo,
                        authUserGroup
                    );
                    next();
                }
                else{
                    const err : any = new Error('Client publication not allowed in this auth user group channel!');
                    err.code = 4536;
                    next(err); //Block!
                }
            }
            else if (channel === ZationChannel.ALL) {
                if(allChInfo.clientPublishAccessChecker(socket.authEngine,req.data,socket.socketInfo,undefined)) {
                    allChInfo.onClientPub(
                        this.preparedSmallBag,
                        req.data,
                        req.socket.socketInfo
                    );
                    next();
                }
                else {
                    const err : any = new Error('Client publication not allowed in all channel!');
                    err.code = 4556;
                    next(err); //Block!
                }
            }
            else if (channel === ZationChannel.DEFAULT_USER_GROUP) {
                if(defaultUserGroupChInfo.clientPublishAccessChecker(socket.authEngine,req.data,socket.socketInfo,undefined)) {
                    defaultUserGroupChInfo.onClientPub(
                        this.preparedSmallBag,
                        req.data,
                        req.socket.socketInfo
                    );
                    next();
                }
                else{
                    const err : any = new Error('Client publication not allowed in default user group channel!');
                    err.code = 4526;
                    next(err); //Block!
                }
            }
            else if(channel === ZationChannel.PANEL_OUT) {
                const err : any = new Error('Client publication not allowed in panel out channel!');
                err.code = 4506;
                next(err); //Block!
            }
            else if(channel === ZationChannel.PANEL_IN) {
                const authToken = req.socket.getAuthToken();
                if(authToken !== null && typeof authToken[nameof<ZationToken>(s => s.zationPanelAccess)] === 'boolean' &&
                    authToken[nameof<ZationToken>(s => s.zationPanelAccess)])
                {
                    next();
                }
                else {
                    const err : any = new Error('User with no panel access can\'t publish in panel in channel!');
                    err.code = 4902;
                    next(err); //Block!
                }
            }
            //Important! (Otherwise every socket can publish in worker channel and can modify the whole network.)
            else if(req.channel === ZationChannel.ALL_WORKER) {
                const err : any = new Error('User can\'t publish in all worker channel!');
                err.code = 4507;
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
                        req.channel.indexOf(ZationChannel.USER_CHANNEL_PREFIX) !== -1 &&
                        !userChInfo.socketGetOwnPub
                    )
                    ||
                    (
                        req.channel.indexOf(ZationChannel.CUSTOM_ID_CHANNEL_PREFIX) !== -1 &&
                        !this.channelPrepare.getSafeCustomIdChInfo(ChUtils.getCustomIdChannelName(req.channel))
                            .socketGetOwnPub
                    )
                    ||
                    (
                        req.channel.indexOf(ZationChannel.CUSTOM_CHANNEL_PREFIX) !== -1 &&
                        !this.channelPrepare.getSafeCustomChInfo(ChUtils.getCustomChannelName(req.channel))
                            .socketGetOwnPub
                    )
                    ||
                    (
                        req.channel.indexOf(ZationChannel.AUTH_USER_GROUP_PREFIX) !== -1 &&
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
                    (eventConfig.middlewareSocket,next,this.getPreparedSmallBag(),socket);

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
            (eventConfig.middlewareAuthenticate,next,this.getPreparedSmallBag(),new ZationTokenInfo(token));

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

        this.scServer.on('error', async (err) => {
            await this.zc.eventConfig.sc_serverError(this.getPreparedSmallBag(),err);
        });

        this.scServer.on('notice', async (note) => {
            await this.zc.eventConfig.sc_serverNotice(this.getPreparedSmallBag(),note);
        });

        this.scServer.on('handshake', async (socket) => {
            //register before
            socket.on('connect', async (scConState) => {
                await this.zc.eventConfig.sc_socketConnect(this.getPreparedSmallBag(),socket,scConState);
            });
            await this.zc.eventConfig.sc_serverHandshake(this.getPreparedSmallBag(),socket);
        });

        this.scServer.on('connectionAbort', async (socket,code,data) => {
            await this.zc.eventConfig.sc_serverConnectionAbort(this.getPreparedSmallBag(),socket,code,data);
        });

        this.scServer.on('disconnection', async (socket : UpSocket, code, data) =>
        {
            /**
             * Remove socket from all maps.
             */
            const token = socket.authToken;
            if(token !== null){
                this.mapAuthUserGroupToSc.unMap(token.zationAuthUserGroup,socket);
                this.mapTokenIdToSc.unMap(token.zationTokenId,socket);
                if(token.zationUserId !== undefined){
                    this.mapUserIdToSc.unMap(token.zationUserId.toString(),socket);
                }
                this.panelUserSet.remove(socket);
            }
            this.defaultUserGroupSet.remove(socket);

            await Promise.all([
                this.zc.eventConfig.socketDisconnection(this.getPreparedSmallBag(),socket.socketInfo,code,data),
                this.zc.eventConfig.sc_serverDisconnection(this.getPreparedSmallBag(),socket,code,data)]
            );
        });

        this.scServer.on('closure', async (socket,code,data) => {
            await this.zc.eventConfig.sc_serverClosure(this.getPreparedSmallBag(),socket,code,data);
        });

        /**
         * Emit subscribe event.
         */
        this.scServer.on('subscription', async (socket : UpSocket, chName, chOptions) =>
        {
            if(chName.indexOf(ZationChannel.CUSTOM_ID_CHANNEL_PREFIX) !== -1) {
                const {name,id} = ChUtils.getCustomIdChannelInfo(chName);

                this.channelPrepare.getSafeCustomIdChInfo(name)
                .onSub(
                    this.preparedSmallBag,
                    socket.socketInfo,
                    {id,name}
                );
            }
            else if(chName.indexOf(ZationChannel.CUSTOM_CHANNEL_PREFIX) !== -1) {
                const name = ChUtils.getCustomChannelName(chName);

                this.channelPrepare.getSafeCustomChInfo(name)
                .onSub(
                    this.preparedSmallBag,
                    socket.socketInfo,
                    {name}
                );
            }
            else if(chName.indexOf(ZationChannel.USER_CHANNEL_PREFIX) !== -1) {
                userChInfo.onSub(
                    this.preparedSmallBag,
                    socket.socketInfo,
                    ChUtils.getUserIdFromCh(chName)
                );
            }
            else if(chName.indexOf(ZationChannel.AUTH_USER_GROUP_PREFIX) !== -1) {
                authUserGroupChInfo.onSub(
                    this.preparedSmallBag,
                    socket.socketInfo,
                    ChUtils.getUserAuthGroupFromCh(chName)
                );
            }
            else if(chName === ZationChannel.DEFAULT_USER_GROUP) {
                defaultUserGroupChInfo.onSub(
                    this.preparedSmallBag,
                    socket.socketInfo
                )
            }
            else if(chName === ZationChannel.ALL) {
                allChInfo.onSub(
                    this.preparedSmallBag,
                    socket.socketInfo
                );
            }
            await this.zc.eventConfig.sc_serverSubscription(this.getPreparedSmallBag(),socket,chName,chOptions);
        });

        /**
         * Emit unsubscribe event
         */
        this.scServer.on('unsubscription', async (socket,chName) =>
        {
            //trigger sub customCh event and update mapper
            if(chName.indexOf(ZationChannel.CUSTOM_ID_CHANNEL_PREFIX) !== -1) {
                const {name,id} = ChUtils.getCustomIdChannelInfo(chName);

                this.channelPrepare.getSafeCustomIdChInfo(name)
                .onUnsub(
                    this.preparedSmallBag,
                    socket.socketInfo,
                    {name,id}
                );
            }
            else if(chName.indexOf(ZationChannel.CUSTOM_CHANNEL_PREFIX) !== -1) {
                const name = ChUtils.getCustomChannelName(chName);

                this.channelPrepare.getSafeCustomChInfo(name)
                .onUnsub(
                    this.preparedSmallBag,
                    socket.socketInfo,
                    {name}
                );
            }
            else if(chName.indexOf(ZationChannel.USER_CHANNEL_PREFIX) !== -1) {
                userChInfo.onUnsub(
                    this.preparedSmallBag,
                    socket.socketInfo,
                    ChUtils.getUserIdFromCh(chName)
                );
            }
            else if(chName.indexOf(ZationChannel.AUTH_USER_GROUP_PREFIX) !== -1) {
                authUserGroupChInfo.onUnsub(
                    this.preparedSmallBag,
                    socket.socketInfo,
                    ChUtils.getUserAuthGroupFromCh(chName)
                );
            }
            else if(chName === ZationChannel.DEFAULT_USER_GROUP) {
                defaultUserGroupChInfo.onUnsub(
                    this.preparedSmallBag,
                    socket.socketInfo
                );
            }
            else if(chName === ZationChannel.ALL) {
                allChInfo.onUnsub(
                    this.preparedSmallBag,
                    socket.socketInfo
                );
            }
            await this.zc.eventConfig.sc_serverUnsubscription(this.getPreparedSmallBag(),socket,chName);
        });

        this.scServer.on('authentication', async (socket,authToken) => {
            await Promise.all([
                this.zc.eventConfig.socketAuthenticated(this.getPreparedSmallBag(),socket.socketInfo),
                this.zc.eventConfig.sc_serverAuthentication(this.getPreparedSmallBag(),socket,authToken)
            ]);
        });

        this.scServer.on('deauthentication', async (socket,oldAuthToken) => {
            await Promise.all([
                this.zc.eventConfig.socketDeauthenticated(this.getPreparedSmallBag(),socket.socketInfo),
                this.zc.eventConfig.sc_serverDeauthentication(this.getPreparedSmallBag(),socket,oldAuthToken)
            ]);
        });

        this.scServer.on('authenticationStateChange', async (socket,stateChangeData : any) => {
            await this.zc.eventConfig.sc_serverAuthenticationStateChange(this.getPreparedSmallBag(),socket,stateChangeData);
        });

        this.scServer.on('badSocketAuthToken', async (socket,badAuthStatus) => {
            socket.emit('zationBadAuthToken',{});
            await this.zc.eventConfig.sc_serverBadSocketAuthToken(this.getPreparedSmallBag(),socket,badAuthStatus);
        });

        this.scServer.on('ready', async () => {
            await this.zc.eventConfig.sc_serverReady(this.getPreparedSmallBag());
        });

    }

    /**
     * Register for socket events.
     * @param socket
     */
    private initSocketEvents(socket : UpSocket)
    {
        socket.on('error', async (err) => {
            await this.zc.eventConfig.sc_socketError(this.getPreparedSmallBag(),socket,err);
        });

        socket.on('raw', async (data) => {
            await this.zc.eventConfig.sc_socketRaw(this.getPreparedSmallBag(),socket,data);
        });

        socket.on('disconnect', async (code,data) => {
            await this.zc.eventConfig.sc_socketDisconnect(this.getPreparedSmallBag(),socket,code,data);
        });

        socket.on('connectAbort', async (code,data) => {
            await this.zc.eventConfig.sc_socketConnectAbort(this.getPreparedSmallBag(),socket,code,data);
        });

        socket.on('close', async (code,data) =>
        {
            await this.zc.eventConfig.sc_socketClose(this.getPreparedSmallBag(),socket,code,data);
        });

        socket.on('subscribe', async (channel,channelOptions) => {
            await this.zc.eventConfig.sc_socketSubscribe(this.getPreparedSmallBag(),socket,channel,channelOptions);
        });

        socket.on('unsubscribe', async (channel) => {
            await this.zc.eventConfig.sc_socketUnsubscribe(this.getPreparedSmallBag(),socket,channel);
        });

        socket.on('badAuthToken', async (badAuthStatus) => {
            await this.zc.eventConfig.sc_socketBadAuthToken(this.getPreparedSmallBag(),socket,badAuthStatus);
        });

        socket.on('authenticate', async (token : ZationToken) => {
            await this.zc.eventConfig.sc_socketAuthenticate(this.getPreparedSmallBag(),socket,token);
        });

        socket.on('deauthenticate', async (token : ZationToken) => {
            await this.zc.eventConfig.sc_socketDeauthenticate(this.getPreparedSmallBag(),socket,token);
        });

        socket.on('authStateChange', async (stateChangeData : any) => {
            await this.zc.eventConfig.sc_socketAuthStateChange(this.getPreparedSmallBag(),socket,stateChangeData);
        });

        socket.on('message', async (msg) => {
            await this.zc.eventConfig.sc_socketMessage(this.getPreparedSmallBag(),socket,msg);
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
        const channel = this.exchange.subscribe(ZationChannel.ALL_WORKER);
        channel.watch(async (data) =>
        {
            switch (data.actionType) {
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
     * @param data
     */
    async processSpecialTask(data : any)
    {
        const mainData = data.mainData;
        switch (data.action) {
            case WorkerChSpecialTaskActions.UPDATE_USER_TOKENS:
                await this.updateTokens
                (this.mapUserIdToSc,mainData.actions,mainData.target.toString(),mainData.exceptSocketSids);
                break;
            case WorkerChSpecialTaskActions.UPDATE_GROUP_TOKENS:
                await this.updateTokens
                (this.mapAuthUserGroupToSc,mainData.actions,mainData.target,mainData.exceptSocketSids);
                break;
            case WorkerChSpecialTaskActions.MESSAGE:
                await this.zc.eventConfig.workerMessage(this.preparedSmallBag,mainData.data);
                break;
        }
    }

    /**
     * Process a worker map task.
     * @param data
     */
    async processMapTask(data : any)
    {
        if(!Array.isArray(data.ids)) {
            return;
        }

        const ids : any[] = data.ids;
        const exceptSocketSids = data.exceptSocketSids;
        const mainData = data.mainData;
        const emitData = mainData.data;

        switch (data.action) {
            case WorkerChMapTaskActions.KICK_OUT:
                const ch = mainData.ch;
                if(ch)
                {
                    const kickOutAction = (s : UpSocket) => {
                        ChUtils.kickOutSearch(s,ch);
                    };
                    switch (data.target) {
                        case WorkerChTargets.USER_IDS:
                            this.forUserIds(ids,exceptSocketSids,kickOutAction);
                            break;
                        case WorkerChTargets.TOKEN_IDS:
                            this.forTokenIds(ids,exceptSocketSids,kickOutAction);
                            break;
                        case WorkerChTargets.ALL_SOCKETS:
                            this.forAllSockets(exceptSocketSids,kickOutAction);
                            break;
                        case WorkerChTargets.SOCKETS_SIDS:
                            this.forAllSocketSids(ids,kickOutAction);
                            break;
                        case WorkerChTargets.AUTH_USER_GROUPS:
                            this.forAuthUserGroups(ids,mainData.all,exceptSocketSids,kickOutAction);
                            break;
                        case WorkerChTargets.DEFAULT_USER_GROUP:
                            this.forDefaultUserGroup(exceptSocketSids,kickOutAction);
                            break;
                    }
                }
                break;
            case WorkerChMapTaskActions.EMIT:
                const emitAction = (s : UpSocket) => {
                    s.emit(mainData.event,emitData);
                };
                switch (data.target) {
                    case WorkerChTargets.USER_IDS:
                        this.forUserIds(ids,exceptSocketSids,emitAction);
                        break;
                    case WorkerChTargets.TOKEN_IDS:
                        this.forTokenIds(ids,exceptSocketSids,emitAction);
                        break;
                    case WorkerChTargets.ALL_SOCKETS:
                        this.forAllSockets(exceptSocketSids,emitAction);
                        break;
                    case WorkerChTargets.SOCKETS_SIDS:
                        this.forAllSocketSids(ids,emitAction);
                        break;
                    case WorkerChTargets.AUTH_USER_GROUPS:
                        this.forAuthUserGroups(ids,mainData.all,exceptSocketSids,emitAction);
                        break;
                    case WorkerChTargets.DEFAULT_USER_GROUP:
                        this.forDefaultUserGroup(exceptSocketSids,emitAction);
                        break;
                }
                break;
            case WorkerChMapTaskActions.DISCONNECT:
                const disconnectAction = (s : UpSocket) => {
                    s.disconnect();
                };
                switch (data.target) {
                    case WorkerChTargets.USER_IDS:
                        this.forUserIds(ids,exceptSocketSids,disconnectAction);
                        break;
                    case WorkerChTargets.TOKEN_IDS:
                        this.forTokenIds(ids,exceptSocketSids,disconnectAction);
                        break;
                    case WorkerChTargets.ALL_SOCKETS:
                        this.forAllSockets(exceptSocketSids,disconnectAction);
                        break;
                    case WorkerChTargets.SOCKETS_SIDS:
                        this.forAllSocketSids(ids,disconnectAction);
                        break;
                    case WorkerChTargets.AUTH_USER_GROUPS:
                        this.forAuthUserGroups(ids,mainData.all,exceptSocketSids,disconnectAction);
                        break;
                    case WorkerChTargets.DEFAULT_USER_GROUP:
                        this.forDefaultUserGroup(exceptSocketSids,disconnectAction);
                        break;
                }
                break;
            case WorkerChMapTaskActions.DEAUTHENTICATE:
                const deauthenticateAction = (s : UpSocket) => {
                    s.deauthenticate();
                };
                switch (data.target) {
                    case WorkerChTargets.USER_IDS:
                        this.forUserIds(ids,exceptSocketSids,deauthenticateAction);
                        break;
                    case WorkerChTargets.TOKEN_IDS:
                        this.forTokenIds(ids,exceptSocketSids,deauthenticateAction);
                        break;
                    case WorkerChTargets.ALL_SOCKETS:
                        this.forAllSockets(exceptSocketSids,deauthenticateAction);
                        break;
                    case WorkerChTargets.SOCKETS_SIDS:
                        this.forAllSocketSids(ids,deauthenticateAction);
                        break;
                    case WorkerChTargets.AUTH_USER_GROUPS:
                        this.forAuthUserGroups(ids,mainData.all,exceptSocketSids,deauthenticateAction);
                        break;
                    case WorkerChTargets.DEFAULT_USER_GROUP:
                        this.forDefaultUserGroup(exceptSocketSids,deauthenticateAction);
                        break;
                }
                break;
        }
    }

    /**
     * Update all tokens from sockets in the map.
     * @param map
     * @param actions
     * @param target
     * @param exceptSocketSids
     */
    private async updateTokens(map : Mapper<UpSocket>, actions : {action : SyncTokenActions,params : any[]}[], target, exceptSocketSids : string[]) {
        const filterExceptSocketIds : string[] = this.socketSidsFilter(exceptSocketSids);
        const promises : Promise<void>[] = [];
        map.forEach(target,(socket : UpSocket) => {
            if(!filterExceptSocketIds.includes(socket.id)) {
                const edit = this.preparedSmallBag.seqEditTokenVariablesWithSocket(socket);
                for(let i = 0; i < actions.length; i++) {
                    switch (actions[i].action) {
                        case SyncTokenActions.SET :
                            edit.set(actions[i].params[0],actions[i].params[1]);
                            break;
                        case SyncTokenActions.DELETE :
                            edit.delete(actions[i].params[0]);
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
                await this.userBackgroundTasks[id](this.preparedSmallBag);
            }
            catch (e) {
                Logger.printDebugInfo
                (`The Worker with id: ${this.id}, error while invoking the background task : '${id}'`);
                await this.zc.eventConfig.beforeError(this.preparedSmallBag,e);
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
                this.serverSettingsJs = await this.sendToZationMaster({action : WorkerMessageActions.SERVER_SETTINGS_JS});
                resolve();
            }));
            promises.push(new Promise<void>(async (resolve) => {
                this.fullClientJs = await this.sendToZationMaster({action : WorkerMessageActions.FULL_CLIENT_JS});
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
    public sendToZationMaster(data : {action : WorkerMessageActions} | any) : Promise<any> {
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
        await this.sendToZationMaster({action : WorkerMessageActions.KILL_SERVER, data : error});
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
            ip          : this.getPreparedSmallBag().getServerIpAddress(),
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
                defaultUserGroupCount : this.getPreparedSmallBag().getWorkerDefaultUserGroupCount(),
                authUserGroups : this.getPreparedSmallBag().getWorkerAuthUserGroupsCount()
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
                        defaultUserGroupCount : this.getPreparedSmallBag().getWorkerDefaultUserGroupCount(),
                        authUserGroups : this.getPreparedSmallBag().getWorkerAuthUserGroupsCount()
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

    getPreparedSmallBag() : SmallBag {
        return this.preparedSmallBag;
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
}

new ZationWorker();

export = ZationWorker;