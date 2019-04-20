/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import {ScServer} from "../helper/sc/scServer";
import {ChAccessEngine} from '../helper/channel/chAccessEngine';
import {WorkerChMapTaskActions, WorkerChSpecialTaskActions} from "../helper/constants/workerChTaskActions";
import {Socket} from "../helper/sc/socket";
import {WorkerChTargets} from "../helper/constants/workerChTargets";
import {ZationChannel, ZationToken} from "../helper/constants/internal";
import {WorkerMessageActions} from "../helper/constants/workerMessageActions";
import {ChConfigManager} from "../helper/channel/chConfigManager";
import BagExtensionEngine from "../helper/bagExtension/bagExtensionEngine";
import {NodeInfo} from "../helper/tools/nodeInfo";
import {SocketSet} from "../helper/tools/socketSet";
import OriginsEngine from "../helper/origins/originsEngine";
import {SyncTokenActions} from "../helper/constants/syncTokenActions";

require('cache-require-paths');
import ChTools = require("../helper/channel/chTools");
import FuncTools = require("../helper/tools/funcTools");
import express = require('express');
import cookieParser = require('cookie-parser');
import bodyParser = require('body-parser');
import fileUpload = require('express-fileupload');
import url = require('url');
import ZationConfig = require('./zationConfig');
import ConfigPreCompiler = require('../helper/config/configPreCompiler');
import Logger = require('../helper/logger/logger');
import ServiceEngine = require('../helper/services/serviceEngine');
import SmallBag = require('../api/SmallBag');

import BackgroundTasksSaver = require("../helper/background/backgroundTasksWorkerSaver");
import Mapper = require("../helper/tools/mapper");
import IdTools = require("../helper/tools/idTools");
import CIdChInfo = require("../helper/infoObjects/cIdChInfo");
import CChInfo = require("../helper/infoObjects/cChInfo");
import process = require("process");
import PanelEngine = require("../helper/panel/panelEngine");
import PubDataInfo = require("../helper/infoObjects/pubDataInfo");
import ViewEngine = require("../helper/views/viewEngine");
import SystemInfo = require("../helper/tools/systemInfo");
import {WorkerChTaskType} from "../helper/constants/workerChTaskType";
import {InputDataProcessor} from "../helper/input/inputDataProcessor";
import {ZationReqHandler} from "./zationReqHandler";
import AEPreparedPart from "../helper/auth/aePreparedPart";
import ZationTokenInfo from "../helper/infoObjects/zationTokenInfo";
import TokenTools = require("../helper/token/tokenTools");
import {BaseShBridgeSocket} from "../helper/bridges/baseShBridgeSocket";
import AuthEngine from "../helper/auth/authEngine";
import TokenEngine = require("../helper/token/tokenEngine");
import ChannelEngine = require("../helper/channel/channelEngine");
import SocketInfo from "../helper/infoObjects/socketInfo";
import ControllerPrepare from "../helper/controller/controllerPrepare";

const  SCWorker : any        = require('socketcluster/scworker');

class ZationWorker extends SCWorker
{
    private userBackgroundTasks : object;

    private workerFullId : string;

    private workerStartedTimeStamp : number;
    private serverStartedTimeStamp : number;
    private serverVersion : string;
    private zc : ZationConfig;

    public scServer : ScServer;
    private serviceEngine : ServiceEngine;
    private bagExtensionEngine : BagExtensionEngine;
    private preparedSmallBag : SmallBag;
    private controllerPrepare : ControllerPrepare;
    private aePreparedPart : AEPreparedPart;
    private panelEngine : PanelEngine;
    private chAccessEngine : ChAccessEngine;
    private originsEngine : OriginsEngine;
    private chConfigManager : ChConfigManager;
    private inputDataProcessor : InputDataProcessor;
    private zationReqHandler : ZationReqHandler;

    private authStartActive : boolean;

    private app : any;

    private mapUserIdToSc : Mapper<Socket> = new Mapper<Socket>();
    private mapTokenIdToSc : Mapper<Socket> = new Mapper<Socket>();

    private mapCustomChToSc : Mapper<Socket> = new Mapper<Socket>();
    private mapCustomIdChToSc : Mapper<Socket> = new Mapper<Socket>();

    private mapAuthUserGroupToSc : Mapper<Socket> = new Mapper<Socket>();
    private defaultUserGroupSet  = new SocketSet();
    private panelUserSet = new SocketSet();

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
        //BackgroundStuff
        this.userBackgroundTasks = {};

        this.workerStartedTimeStamp = Date.now();
        this.serverStartedTimeStamp = this.options.zationServerStartedTimeStamp;
        this.serverVersion = this.options.zationServerVersion;

        this.workerFullId = this.id + '.' + process.pid;

        this.zc = new ZationConfig(this.options.zationConfigWorkerTransport,true);

        //setLogger
        Logger.setZationConfig(this.zc);

        await this.setUpLogInfo();

        //Check LogToFile
        Logger.initFileLog();

        await this.startZWorker();
    }

    private async startZWorker()
    {
        Logger.printStartDebugInfo(`The Worker with id ${this.id} begins the start process.`,false,true);

        Logger.startStopWatch();
        this.viewEngine.loadViews();
        Logger.printStartDebugInfo(`The Worker with id ${this.id} has loaded the views.`, true);

        Logger.startStopWatch();
        await this.zc.loadOtherConfigs();
        Logger.printStartDebugInfo(`The Worker with id ${this.id} has loaded other zation configuration files.`,true);

        //start loading client js
        const clientJs = this.loadClientJsData();

        Logger.startStopWatch();
        let preCompiler = new ConfigPreCompiler(this.zc);
        preCompiler.preCompile();
        Logger.printStartDebugInfo(`The Worker with id ${this.id} has pre compiled configurations.`, true);

        //Origins engine
        Logger.startStopWatch();
        this.originsEngine = new OriginsEngine(this.zc.mainConfig.origins);
        Logger.printStartDebugInfo(`The Worker with id ${this.id} has created the origins engine.`,true);

        //Services
        Logger.startStopWatch();
        this.serviceEngine = new ServiceEngine(this.zc,this);
        await this.serviceEngine.init();
        Logger.printStartDebugInfo(`The Worker with id ${this.id} has created service engine.`,true);

        //BagExtensions
        Logger.startStopWatch();
        this.bagExtensionEngine = new BagExtensionEngine(this.zc);
        this.bagExtensionEngine.extendBag();
        Logger.printStartDebugInfo(`The Worker with id ${this.id} has processed the bag extensions.`,true);

        Logger.startStopWatch();
        this.preparedSmallBag = new SmallBag(this);
        Logger.printStartDebugInfo(`The Worker with id ${this.id} has prepared an small bag.`,true);

        Logger.startStopWatch();
        this.inputDataProcessor= new InputDataProcessor(this);
        Logger.printStartDebugInfo(`The Worker with id ${this.id} has prepared the input request data processor.`,true);

        //prepareController
        Logger.startStopWatch();
        this.controllerPrepare = new ControllerPrepare(this.zc,this);
        await this.controllerPrepare.prepare();
        Logger.printStartDebugInfo(`The Worker with id ${this.id} has prepared the controllers.`,true);

        Logger.startStopWatch();
        this.aePreparedPart = new AEPreparedPart(this.zc,this);
        Logger.printStartDebugInfo(`The Worker with id ${this.id} has prepared an auth engine part.`,true);

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
        this.chConfigManager = new ChConfigManager(this.zc);
        Logger.printStartDebugInfo(`The Worker with id ${this.id} has initialized the channel config manager.`,true);

        Logger.startStopWatch();
        this.chAccessEngine= new ChAccessEngine(this.chConfigManager,this.preparedSmallBag);
        Logger.printStartDebugInfo(`The Worker with id ${this.id} has initialized the channel access engine.`,true);

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

        //wait for client js before http server
        await clientJs;

        //Server
        Logger.startStopWatch();
        await this.startHttpServer();
        Logger.printStartDebugInfo(`The Worker with id ${this.id} has started the http server.`,true);

        Logger.startStopWatch();
        await this.startWebSocketServer();
        Logger.printStartDebugInfo(`The Worker with id ${this.id} has started the web socket server.`,true);

        //Fire ExpressEvent
        Logger.startStopWatch();
        await this.zc.emitEvent(this.zc.eventConfig.express,this.preparedSmallBag,this.app);
        Logger.printStartDebugInfo(`The Worker with id ${this.id} has processed the express event.`,true);

        //Fire ScServerEvent
        Logger.startStopWatch();
        await this.zc.emitEvent(this.zc.eventConfig.scServer,this.preparedSmallBag,this.scServer);
        Logger.printStartDebugInfo(`The Worker with id ${this.id} has processed the scServer event.`,true);

        Logger.printStartDebugInfo(`The Worker with id ${this.id} is started.`,false);

        //Fire event is started
        await this.zc.emitEvent
        (this.zc.eventConfig.workerStarted,this.preparedSmallBag,this.zc.getZationInfo(),this);

        if(this.isLeader){
            await this.zc.emitEvent
            (this.zc.eventConfig.workerLeaderStarted,this.preparedSmallBag,this.zc.getZationInfo(),this);
        }

    }

    private async setUpLogInfo()
    {
        this.on('error',(e) =>
        {
           Logger.printError
           (
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
        this.scServer.on('connection', async (socket : Socket,conState) => {
            this.upgradeSocket(socket);
            this.initSocketEvents(socket);
            this.defaultUserGroupSet.add(socket);

            Logger.printDebugInfo(`Socket with id: ${socket.id} is connected!`);

            socket.on('ZATION.SERVER.REQUEST', async (data, respond) => {
                await this.zationReqHandler.processSocketReq(data,socket,respond);
            });

            await this.zc.emitEvent(this.zc.eventConfig.sc_serverConnection,this.getPreparedSmallBag(),socket,conState);
            await this.zc.emitEvent(this.zc.eventConfig.socket,this.getPreparedSmallBag(),socket);

        });

        await this.zc.emitEvent(this.zc.eventConfig.wsServerStarted,this.zc.getZationInfo());
    }

    /**
     * Add new zation functionality to the socket.
     */
    private upgradeSocket(socket : Socket) {
        socket.sid = IdTools.buildSid(this.options.instanceId,this.id,socket.id);
        socket.tid = Date.now() + socket.id;

        /*
        Prepare engines
         */
        const baseSHBridge = new BaseShBridgeSocket(socket);
        socket.baseSHBridge = baseSHBridge;
        socket.tokenEngine = new TokenEngine(baseSHBridge,this,this.zc);
        socket.channelEngine = new ChannelEngine(this,baseSHBridge);
        socket.authEngine = new AuthEngine(baseSHBridge,socket.tokenEngine,this);
        socket.socketInfo = new SocketInfo(socket);

        socket.zationSocketVariables = {};
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

        this.app.use((req, res, next) => {
            if(this.originsEngine.check(req.hostname,req.protocol,serverPort)){
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

        //startCookieParser
        // noinspection JSUnresolvedFunction
        this.app.use(cookieParser());
        //FileParser
        // noinspection JSUnresolvedFunction
        this.app.use(fileUpload());
        //BodyParser
        // noinspection JSUnresolvedFunction
        this.app.use(bodyParser.json());
        // noinspection JSUnresolvedFunction
        this.app.use(bodyParser.urlencoded({extended: true}));

        //Set Server
        this.httpServer.on('request', this.app);

        //PUBLIC FOLDER

        // noinspection JSUnresolvedFunction,TypeScriptValidateJSTypes
        this.app.use(`/zation/assets`, express.static(__dirname + '/../public/assets'));

        if(this.zc.mainConfig.usePanel) {
            // noinspection JSUnresolvedFunction,TypeScriptValidateJSTypes
            this.app.use([`${serverPath}/panel/*`,`${serverPath}/panel`],
                express.static(__dirname + '/../public/panel'));
        }

        // noinspection JSUnresolvedFunction
        this.app.get(`/zation/serverSettings.js`,(req,res) =>
        {
            res.type('.js');
            res.send(this.serverSettingsJs);
        });

        // noinspection JSUnresolvedFunction
        this.app.get([`${serverPath}/log/:key`,`${serverPath}/log`],async (req,res) => {
            const key = req.params.key !== undefined ? req.params.key : '';
            if(this.zc.mainConfig.logToFile) {
                if(this.zc.mainConfig.logDownloadable)
                {
                    if(key === this.zc.mainConfig.logAccessKey) {
                        res.download(this.zc.mainConfig.logPath + 'ZATION_LOG_FILE.log');
                    }
                    else {
                        res.status(401).send('Wrong access key');
                    }
                }
                else {
                    res.status(404).send('LogFile download is disabled');
                }
            }
            else {
                res.status(404).send('Log to file is disabled');
            }
        });

        if(this.zc.mainConfig.clientJsPrepare) {
            // noinspection JSUnresolvedFunction
            this.app.get(`${serverPath}/client.js`,(req,res) =>
            {
                res.type('.js');
                res.send(this.fullClientJs);
            });
        }

        //REQUEST
        // noinspection JSUnresolvedFunction
        this.app.all(`${serverPath}`, async (req, res) => {
            //Run Zation
            // noinspection JSUnusedLocalSymbols
            await this.zationReqHandler.processHttpReq(res,req);
        });

        await this.zc.emitEvent(this.zc.eventConfig.httpServerStarted,this.zc.getZationInfo());
    }

    getFullWorkerId() {
        return this.workerFullId;
    }

    private initSocketMiddleware()
    {
        const eventConfig = this.zc.eventConfig;

        this.scServer.addMiddleware(this.scServer.MIDDLEWARE_SUBSCRIBE, async (req, next) => {

            let userMidRes = true;

            if(eventConfig.sc_middlewareSubscribe) {
                userMidRes = await
                    this.zc.checkScMiddlewareEvent
                    (eventConfig.sc_middlewareSubscribe,next,this.getPreparedSmallBag(),req);
            }

            if(userMidRes)
            {
                // noinspection JSUnresolvedFunction
                let authToken = req.socket.getAuthToken();
                let channel = req.channel;

                if (channel.indexOf(ZationChannel.CUSTOM_ID_CHANNEL_PREFIX) !== -1) {
                    next(await this.chAccessEngine.checkAccessSubCustomIdCh(req.socket,channel));
                }
                else if (channel.indexOf(ZationChannel.CUSTOM_CHANNEL_PREFIX) !== -1) {
                    next(await this.chAccessEngine.checkAccessSubCustomCh(req.socket,channel));
                }
                else {
                    if (authToken !== null) {
                        const id = authToken[nameof<ZationToken>(s => s.zationUserId)];
                        const group = authToken[nameof<ZationToken>(s => s.zationAuthUserGroup)];

                        if (channel.indexOf(ZationChannel.USER_CHANNEL_PREFIX) !== -1) {
                            if(id !== undefined) {
                                if (ZationChannel.USER_CHANNEL_PREFIX + id === channel) {
                                    Logger.printDebugInfo(`Socket with id: ${req.socket.id} subscribes user channel '${id}'`);
                                    next();
                                }
                                else {
                                    let err : any = new Error(`User: ${id} can\'t subscribe an other User Channel: '${channel}'!`);
                                    err.code = 4543;
                                    next(err); //Block!

                                }
                            }
                            else {
                                let err : any = new Error(`User: with undefined id can\'t subscribe User Channel: '${channel}'!`);
                                err.code = 4542;
                                next(err); //Block!
                            }
                        }
                        else if (channel.indexOf(ZationChannel.AUTH_USER_GROUP_PREFIX) !== -1) {
                            if(group !== undefined) {
                                if (ZationChannel.AUTH_USER_GROUP_PREFIX + group === channel) {

                                    Logger.printDebugInfo
                                    (`Socket with id: ${req.socket.id} subscribes auth group channel '${group}'`);
                                    next();
                                }
                                else {
                                    let err : any = new Error('User can\'t subscribe an other User GROUP Channel!');
                                    err.code = 4533;
                                    next(err); //Block!
                                }
                            }
                            else {
                                let err : any = new Error(`User: with undefined group can\'t subscribe Group Channel!`);
                                err.code = 4532;
                                next(err); //Block!
                            }
                        }
                        else if (channel === ZationChannel.DEFAULT_USER_GROUP) {
                            let err : any = new Error('Auth User can\' subscribe default User GROUP Channel!');
                            err.code = 4521;
                            next(err); //Block!
                        }
                        else if (channel === ZationChannel.PANEL_OUT)
                        {
                            if (authToken[nameof<ZationToken>(s => s.zationPanelAccess)] !== undefined &&
                                authToken[nameof<ZationToken>(s => s.zationPanelAccess)]) {

                                Logger.printDebugInfo
                                (`Socket with id: ${req.socket.id} subscribes panel out channel`);
                                next();
                            }
                            else {
                                let err : any = new Error('User can\'t subscribe panel out channel!');
                                err.code = 4502;
                                next(err); //Block!
                            }
                        }
                        else if(channel === ZationChannel.PANEL_IN) {
                            let err : any = new Error('User can\'t subscribe panel in channel!');
                            err.code = 4901;
                            next(err); //Block!
                        }
                        else if(channel === ZationChannel.ALL_WORKER) {
                            let err : any = new Error('User can\'t subscribe all worker channel!');
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
                            let err : any = new Error('Anonymous user can\'t subscribe a User Channel!');
                            err.code = 4541;
                            next(err); //Block!
                        }
                        else if (channel.indexOf(ZationChannel.AUTH_USER_GROUP_PREFIX) !== -1) {
                            let err : any = new Error('Anonymous user can\'t subscribe a User GROUP Channel!');
                            err.code = 4531;
                            next(err); //Block!
                        }
                        else if (channel === ZationChannel.DEFAULT_USER_GROUP) {
                            Logger.printDebugInfo(`Socket with id: ${req.socket.id} subscribes default group channel`);
                            next();
                        }
                        else if(channel === ZationChannel.PANEL_IN || channel  === ZationChannel.PANEL_OUT) {
                            let err : any = new Error('Anonymous user can\'t subscribe panel in or out Channel!');
                            err.code = 4501;
                            next(err); //Block!
                        }
                        else if(channel === ZationChannel.ALL_WORKER) {
                            let err : any = new Error('User can\'t subscribe all worker Channel!');
                            err.code = 4504;
                            next(err); //Block!
                        }
                        else {
                            Logger.printDebugInfo(`Socket with id: ${req.socket.id} subscribes '${channel}'`);
                            next();
                        }
                    }
                }
            }
        });

        this.scServer.addMiddleware(this.scServer.MIDDLEWARE_PUBLISH_IN, async (req, next) =>
        {
            const channel = req.channel;
            let userMidRes = true;

            if(eventConfig.sc_middlewarePublishIn) {
                userMidRes = await this.zc.checkScMiddlewareEvent
                    (eventConfig.sc_middlewarePublishIn,next,this.getPreparedSmallBag(),req);
            }

            if(userMidRes)
            {
                if (channel.indexOf(ZationChannel.USER_CHANNEL_PREFIX) !== -1) {
                    if(this.chConfigManager.getAllowClientPubUserCh()) {
                        const func = this.chConfigManager.getOnClientPubUserCh();
                        if(!!func) {
                            const id = ChTools.getUserIdFromCh(channel);
                            (async () => {
                                await FuncTools.emitEvent
                                (func,this.preparedSmallBag,id,new SocketInfo(req.socket),PubDataInfo.getFromBuild(req.data));
                            })();
                        }
                        next();
                    }
                    else{
                        const err : any = new Error('Client publication not allowed in a user channel!');
                        err.code = 4546;
                        next(err); //Block!
                    }
                }
                else if (channel.indexOf(ZationChannel.CUSTOM_ID_CHANNEL_PREFIX) !== -1) {
                    ChTools.pubDataAddSocketSrcSid(req,req.socket);
                    next(await this.chAccessEngine.checkAccessClientPubCustomIdCh(req.socket,channel,req.data));
                }
                else if (channel.indexOf(ZationChannel.CUSTOM_CHANNEL_PREFIX) !== -1) {
                    ChTools.pubDataAddSocketSrcSid(req,req.socket);
                    next(await this.chAccessEngine.checkAccessClientPubCustomCh(req.socket,channel,req.data));
                }
                else if (channel.indexOf(ZationChannel.AUTH_USER_GROUP_PREFIX) !== -1) {
                    if(this.chConfigManager.getAllowClientAuthUserGroupCh()) {
                        const func = this.chConfigManager.getOnClientPubAuthUserUserCh();
                        if(!!func) {
                            const group = ChTools.getUserAuthGroupFromCh(channel);
                            (async () => {
                                await FuncTools.emitEvent
                                (func,this.preparedSmallBag,group,new SocketInfo(req.socket),PubDataInfo.getFromBuild(req.data));
                            })();
                        }
                        next();
                    }
                    else{
                        const err : any = new Error('Client publication not allowed in a auth user group channel!');
                        err.code = 4536;
                        next(err); //Block!
                    }
                }
                else if (channel === ZationChannel.ALL) {
                    if(this.chConfigManager.getAllowClientAllCh()) {
                        const func = this.chConfigManager.getOnClientPubAllCh();
                        if(!!func) {
                            (async () => {
                                await FuncTools.emitEvent
                                (func,this.preparedSmallBag,new SocketInfo(req.socket),PubDataInfo.getFromBuild(req.data));
                            })();
                        }
                        next();
                    }
                    else{
                        const err : any = new Error('Client publication not allowed in all channel!');
                        err.code = 4556;
                        next(err); //Block!
                    }
                }
                else if (channel === ZationChannel.DEFAULT_USER_GROUP) {
                    if(this.chConfigManager.getAllowClientDefaultUserGroupCh()) {
                        const func = this.chConfigManager.getOnClientPubDefaultUserUserCh();
                        if(!!func) {
                            (async () => {
                                await FuncTools.emitEvent
                                (func,this.preparedSmallBag,new SocketInfo(req.socket),PubDataInfo.getFromBuild(req.data));
                            })();
                        }
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
                    if(authToken !== null &&
                        authToken[nameof<ZationToken>(s => s.zationPanelAccess)] !== undefined &&
                        authToken[nameof<ZationToken>(s => s.zationPanelAccess)])
                    {
                        ChTools.pubDataAddSocketSrcSid(req,req.socket);
                        next();
                    }
                    else
                    {
                        let err : any = new Error('User with no panel access can\'t publish in panel in channel!');
                        err.code = 4902;
                        next(err); //Block!
                    }
                }
                else if(req.channel === ZationChannel.ALL_WORKER) {
                    let err : any = new Error('User can\'t publish in all worker channel!');
                    err.code = 4507;
                    next(err); //Block!
                }
                else {
                    next();
                }
            }
        });

        //ZATION checks for sockets get own published data
        this.scServer.addMiddleware(this.scServer.MIDDLEWARE_PUBLISH_OUT, async (req, next) =>
        {
            let userMidRes = true;

            if(eventConfig.sc_middlewarePublishOut){
                userMidRes = await
                    this.zc.checkScMiddlewareEvent
                    (eventConfig.sc_middlewarePublishOut,next,this.getPreparedSmallBag(),req);
            }

            if(userMidRes)
            {
                if(req.data.hasOwnProperty('ssi')) {
                    if(req.data['ssi'] === req.socket.sid)
                    {
                        if
                        (
                            (
                                req.channel.indexOf(ZationChannel.USER_CHANNEL_PREFIX) !== -1 &&
                                !this.chConfigManager.getSocketGetOwnPubUserCh()
                            )
                            ||
                            (
                                req.channel.indexOf(ZationChannel.CUSTOM_ID_CHANNEL_PREFIX) !== -1 &&
                                !this.chConfigManager.getSocketGetOwnPubCustomIdCh(ChTools.getCustomIdChannelName(req.channel))
                            )
                            ||
                            (
                                req.channel.indexOf(ZationChannel.CUSTOM_CHANNEL_PREFIX) !== -1 &&
                                !this.chConfigManager.getSocketGetOwnPubCustomCh(ChTools.getCustomChannelName(req.channel))
                            )
                            ||
                            (
                                req.channel.indexOf(ZationChannel.AUTH_USER_GROUP_PREFIX) !== -1 &&
                                !this.chConfigManager.getSocketGetOwnPubAuthUserGroupCh()
                            )
                            ||
                            (
                                req.channel === ZationChannel.ALL &&
                                !this.chConfigManager.getSocketGetOwnPubAllCh()
                            )
                            ||
                            (
                                req.channel === ZationChannel.DEFAULT_USER_GROUP &&
                                !this.chConfigManager.getSocketGetOwnPubDefaultUserGroupCh()

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
                        //not same src
                        next();
                    }
                }
                else {
                    //no src sid
                    next();
                }
            }
        });

        //ZATION NEED NOTHING TO DO, ONLY CHECK USER EVENT
        this.scServer.addMiddleware(this.scServer.MIDDLEWARE_HANDSHAKE_SC, async (req, next) =>
        {
            const userMidRes = await
            this.zc.checkScMiddlewareEvent
            (this.zc.eventConfig.sc_middlewareHandshakeSc,next,this.getPreparedSmallBag(),req);

            if(userMidRes) {
                //check for version and system info
                const urlParts = url.parse(req.socket.request.url, true);
                const query = urlParts.query;
                if
                (
                    typeof query === 'object' &&
                    (typeof query.version === 'string') &&
                    typeof query.system === 'string')
                {
                    const socket : Socket = req.socket;
                    socket.zationClient = {
                            version : parseFloat(query.version),
                            system : query.system
                        };
                    next();
                }
                else{
                    const err = new Error('Cannot connect without providing a valid version and system key in URL query argument.');
                    err.name = 'BadQueryUrlArguments';
                    next(err)
                }
            }
        });

        //ZATION CHECK ORIGINS
        this.scServer.addMiddleware(this.scServer.MIDDLEWARE_HANDSHAKE_WS, async (req, next) =>
        {
            let origin = req.headers.origin;
            if (origin === 'null' || origin == null) {
                origin = '*';
            }
            let parts = url.parse(origin);
            // @ts-ignore
            if(this.originsEngine.check(parts.hostname,parts.protocol,parts.port)) {
                if(await this.zc.checkScMiddlewareEvent
                    (this.zc.eventConfig.sc_middlewareHandshakeWs,next,this.getPreparedSmallBag(),req)) {
                    next();
                }
            }
            else {
                //origin fail
                next(new Error('Failed to authorize socket handshake - Invalid origin: ' + req.origin));
            }
        });

        //ZATION NEED NOTHING TO DO, ONLY CHECK USER EVENT
        this.scServer.addMiddleware(this.scServer.MIDDLEWARE_EMIT, async (req, next) =>
        {
            if(await this.zc.checkScMiddlewareEvent
                (this.zc.eventConfig.sc_middlewareEmit,next,this.getPreparedSmallBag(),req)) {
                next();
            }
        });

        //ZATION ONLY CHECK USER EVENT AND AUTHENTICATE MIDDLEWARE
        // noinspection JSUnresolvedVariable
        this.scServer.addMiddleware(this.scServer.MIDDLEWARE_AUTHENTICATE, async (req, next) =>
        {
            const token = req.authToken;

            let userMidRes = true;
            if(eventConfig.sc_middlewareAuthenticate) {
                userMidRes = await this.zc.checkScMiddlewareEvent
                    (eventConfig.sc_middlewareAuthenticate,next,this.getPreparedSmallBag(),req);
            }

            let zationAuthMid = true;
            if(eventConfig.middlewareAuthenticate){
                zationAuthMid = await this.zc.checkAuthenticationMiddlewareEvent
                    (eventConfig.middlewareAuthenticate,next,this.getPreparedSmallBag(),new ZationTokenInfo(token));
            }

            if(userMidRes && zationAuthMid) {

                //check if the token is valid
                try {
                    TokenTools.checkToken(token,this.aePreparedPart);
                }
                catch (e) {
                    next(e);
                }

                //check the token check key
                if(this.zc.mainConfig.useTokenCheckKey) {
                    if(token[nameof<ZationToken>(s => s.zationCheckKey)] === this.zc.internalData.tokenCheckKey) {
                        next();
                    }
                    else {
                        next(new Error('Wrong or missing token check key!'));
                    }
                }
                else {
                    next();
                }
            }
        });
    }

    private initScServerEvents()
    {
        this.scServer.on('error', async (err) =>
        {
            await this.zc.emitEvent(this.zc.eventConfig.sc_serverError,this.getPreparedSmallBag(),err);
        });

        this.scServer.on('notice', async (note) =>
        {
            await this.zc.emitEvent(this.zc.eventConfig.sc_serverNotice,this.getPreparedSmallBag(),note);
        });

        this.scServer.on('handshake', async (socket) =>
        {
            //register before
            socket.on('connect', async (scConState) =>
            {
                // noinspection JSUnresolvedFunction
                await this.zc.emitEvent(this.zc.eventConfig.sc_socketConnect,this.getPreparedSmallBag(),socket,scConState);
            });

            await this.zc.emitEvent(this.zc.eventConfig.sc_serverHandshake,this.getPreparedSmallBag(),socket);
        });

        this.scServer.on('connectionAbort', async (socket,code,data) =>
        {
            await this.zc.emitEvent(this.zc.eventConfig.sc_serverConnectionAbort,this.getPreparedSmallBag(),socket,code,data);
        });

        this.scServer.on('disconnection', async (socket,code,data) =>
        {
            if(!!this.zc.eventConfig.socketDisconnection){
                await this.zc.emitEvent(this.zc.eventConfig.socketDisconnection,this.getPreparedSmallBag(),new SocketInfo(socket),code,data);
            }

            await this.zc.emitEvent(this.zc.eventConfig.sc_serverDisconnection,this.getPreparedSmallBag(),socket,code,data);
        });

        this.scServer.on('closure', async (socket,code,data) =>
        {
            await this.zc.emitEvent(this.zc.eventConfig.sc_serverClosure,this.getPreparedSmallBag(),socket,code,data);
        });

        this.scServer.on('subscription', async (socket,chName,chOptions) =>
        {
            let pro : Promise<void>[] = [];
            //trigger sub customCh event and update mapper
            if(chName.indexOf(ZationChannel.CUSTOM_ID_CHANNEL_PREFIX) !== -1) {
                const {name,id} = ChTools.getCustomIdChannelInfo(chName);
                this.mapCustomIdChToSc.map(`${name}.${id}`,socket);
                let func = this.chConfigManager.getOnSubCustomIdCh(name);
                if(!!func) {
                    pro.push(FuncTools.emitEvent(func,this.preparedSmallBag,new CIdChInfo(name,id),new SocketInfo(socket)));
                }
            }
            else if(chName.indexOf(ZationChannel.CUSTOM_CHANNEL_PREFIX) !== -1) {
                const name = ChTools.getCustomChannelName(chName);
                this.mapCustomChToSc.map(name,socket);
                let func = this.chConfigManager.getOnSubCustomCh(name);
                if(!!func) {
                    pro.push(FuncTools.emitEvent(func,this.preparedSmallBag,new CChInfo(name),new SocketInfo(socket)));
                }
            }
            else if(chName.indexOf(ZationChannel.USER_CHANNEL_PREFIX) !== -1) {
                const func = this.chConfigManager.getOnSubUserCh();
                if(!!func) {
                    const id = ChTools.getUserIdFromCh(chName);
                    pro.push(FuncTools.emitEvent(func,this.preparedSmallBag,id,new SocketInfo(socket)));
                }
            }
            else if(chName.indexOf(ZationChannel.AUTH_USER_GROUP_PREFIX) !== -1) {
                const func = this.chConfigManager.getOnSubAuthUserGroupCh();
                if(!!func) {
                    const group = ChTools.getUserAuthGroupFromCh(chName);
                    pro.push(FuncTools.emitEvent(func,this.preparedSmallBag,group,new SocketInfo(socket)));
                }
            }
            else if(chName === ZationChannel.DEFAULT_USER_GROUP) {
                const func = this.chConfigManager.getOnSubDefaultUserGroupCh();
                if(!!func) {
                    pro.push(FuncTools.emitEvent(func,this.preparedSmallBag,new SocketInfo(socket)));
                }
            }
            else if(chName === ZationChannel.ALL) {
                const func = this.chConfigManager.getOnSubAllCh();
                if(!!func) {
                    pro.push(FuncTools.emitEvent(func,this.preparedSmallBag,new SocketInfo(socket)));
                }
            }
            pro.push(this.zc.emitEvent(this.zc.eventConfig.sc_serverSubscription,this.getPreparedSmallBag(),socket,chName,chOptions));
            await Promise.all(pro);
        });

        this.scServer.on('unsubscription', async (socket,chName) =>
        {
            let pro : Promise<void>[] = [];
            //trigger sub customCh event and update mapper
            if(chName.indexOf(ZationChannel.CUSTOM_ID_CHANNEL_PREFIX) !== -1) {
                const {name,id} = ChTools.getCustomIdChannelInfo(chName);
                this.mapCustomIdChToSc.removeValueFromKey(`${name}.${id}`,socket);
                let func = this.chConfigManager.getOnUnsubCustomIdCh(name);
                if(!!func) {
                    pro.push(FuncTools.emitEvent(func,this.preparedSmallBag,new CIdChInfo(name,id),new SocketInfo(socket)));
                }
            }
            else if(chName.indexOf(ZationChannel.CUSTOM_CHANNEL_PREFIX) !== -1) {
                const name = ChTools.getCustomChannelName(chName);
                this.mapCustomChToSc.removeValueFromKey(name,socket);
                let func = this.chConfigManager.getOnUnsubCustomCh(name);
                if(!!func) {
                    pro.push(FuncTools.emitEvent(func,this.preparedSmallBag,new CChInfo(name),new SocketInfo(socket)));
                }
            }
            else if(chName.indexOf(ZationChannel.USER_CHANNEL_PREFIX) !== -1) {
                let func = this.chConfigManager.getOnUnsubUserCh();
                if(!!func) {
                    const id = ChTools.getUserIdFromCh(chName);
                    pro.push(FuncTools.emitEvent(func,this.preparedSmallBag,id,new SocketInfo(socket)));
                }
            }
            else if(chName.indexOf(ZationChannel.AUTH_USER_GROUP_PREFIX) !== -1) {
                let func = this.chConfigManager.getOnUnsubAuthUserGroupCh();
                if(!!func) {
                    const group = ChTools.getUserAuthGroupFromCh(chName);
                    pro.push(FuncTools.emitEvent(func,this.preparedSmallBag,group,new SocketInfo(socket)));
                }
            }
            else if(chName === ZationChannel.DEFAULT_USER_GROUP) {
                let func = this.chConfigManager.getOnUnsubDefaultUserGroupCh();
                if(!!func) {
                    pro.push(FuncTools.emitEvent(func,this.preparedSmallBag,new SocketInfo(socket)));
                }
            }
            else if(chName === ZationChannel.ALL) {
                let func = this.chConfigManager.getOnUnsubAllCh();
                if(!!func) {
                    pro.push(FuncTools.emitEvent(func,this.preparedSmallBag,new SocketInfo(socket)));
                }
            }
            pro.push(this.zc.emitEvent(this.zc.eventConfig.sc_serverUnsubscription,this.getPreparedSmallBag(),socket,chName));
            await Promise.all(pro);
        });

        this.scServer.on('authentication', async (socket,authToken) =>
        {
            await this.zc.emitEvent(this.zc.eventConfig.sc_serverAuthentication,this.getPreparedSmallBag(),socket,authToken);
        });

        this.scServer.on('deauthentication', async (socket,oldAuthToken) =>
        {
            await this.zc.emitEvent(this.zc.eventConfig.sc_serverDeauthentication,this.getPreparedSmallBag(),socket,oldAuthToken);
        });

        this.scServer.on('authenticationStateChange', async (socket,stateChangeData : any) =>
        {
            await this.zc.emitEvent(this.zc.eventConfig.sc_serverAuthenticationStateChange,this.getPreparedSmallBag(),socket,stateChangeData);
        });

        this.scServer.on('badSocketAuthToken', async (socket,badAuthStatus) =>
        {
            socket.emit('zationBadAuthToken',{});
            await this.zc.emitEvent(this.zc.eventConfig.sc_serverBadSocketAuthToken,this.getPreparedSmallBag(),socket,badAuthStatus);
        });

        this.scServer.on('ready', async () =>
        {
            await this.zc.emitEvent(this.zc.eventConfig.sc_serverReady,this.getPreparedSmallBag());
        });

    }

    private initSocketEvents(socket : Socket)
    {
        socket.on('error', async (err) =>
        {
            await this.zc.emitEvent(this.zc.eventConfig.sc_socketError,this.getPreparedSmallBag(),socket,err);
        });

        socket.on('raw', async (data) =>
        {
            await this.zc.emitEvent(this.zc.eventConfig.sc_socketRaw,this.getPreparedSmallBag(),socket,data);
        });

        socket.on('disconnect', async (code,data) =>
        {
            await this.zc.emitEvent(this.zc.eventConfig.sc_socketDisconnect,this.getPreparedSmallBag(),socket,code,data);
        });

        socket.on('connectAbort', async (code,data) =>
        {
            await this.zc.emitEvent(this.zc.eventConfig.sc_socketConnectAbort,this.getPreparedSmallBag(),socket,code,data);
        });

        socket.on('close', async (code,data) =>
        {
            // noinspection JSUnresolvedFunction
            let token = socket.getAuthToken();

            if(token!==null) {
                if(!!token.zationTokenId) {
                    this.mapTokenIdToSc.removeValueFromKey(token.zationTokenId,socket);
                }
                if(!!token.zationUserId) {
                    this.mapUserIdToSc.removeValueFromKey(token.zationUserId.toString(),socket);
                }
                if(!!token.zationAuthUserGroup) {
                    this.mapAuthUserGroupToSc.removeValueFromKey(token.zationAuthUserGroup,socket);
                }
                if(token.zationOnlyPanelToken){
                    this.panelUserSet.remove(socket);
                }
            }

            this.defaultUserGroupSet.remove(socket);

            await this.zc.emitEvent(this.zc.eventConfig.sc_socketClose,this.getPreparedSmallBag(),socket,code,data);
        });

        socket.on('subscribe', async (channel,channelOptions) =>
        {
            await this.zc.emitEvent(this.zc.eventConfig.sc_socketSubscribe,this.getPreparedSmallBag(),socket,channel,channelOptions);
        });

        socket.on('unsubscribe', async (channel) =>
        {
            await this.zc.emitEvent(this.zc.eventConfig.sc_socketUnsubscribe,this.getPreparedSmallBag(),socket,channel);
        });

        socket.on('badAuthToken', async (badAuthStatus) =>
        {
            await this.zc.emitEvent(this.zc.eventConfig.sc_socketBadAuthToken,this.getPreparedSmallBag(),socket,badAuthStatus);
        });

        socket.on('authenticate', async (token : ZationToken) =>
        {
            if(token!==null) {
                if(!!token.zationTokenId) {
                    this.mapTokenIdToSc.map(token.zationTokenId,socket);
                }
                if(!!token.zationUserId) {
                    this.mapUserIdToSc.map(token.zationUserId.toString(),socket);
                }
                if(!!token.zationAuthUserGroup) {
                    this.mapAuthUserGroupToSc.map(token.zationAuthUserGroup,socket);
                    this.defaultUserGroupSet.remove(socket);
                }
                else if(token.zationOnlyPanelToken){
                    this.panelUserSet.add(socket);
                    this.defaultUserGroupSet.remove(socket);
                }
            }
            await this.zc.emitEvent(this.zc.eventConfig.sc_socketAuthenticate,this.getPreparedSmallBag(),socket,token);
        });

        socket.on('deauthenticate', async (token : ZationToken) =>
        {
            if(token!==null) {
                if(!!token.zationTokenId) {
                    this.mapTokenIdToSc.removeValueFromKey(token.zationTokenId,socket);
                }
                if(!!token.zationUserId) {
                    this.mapUserIdToSc.removeValueFromKey(token.zationUserId.toString(),socket);
                }
                if(!!token.zationAuthUserGroup) {
                    this.mapAuthUserGroupToSc.removeValueFromKey(token.zationAuthUserGroup,socket);
                }
                if(token.zationOnlyPanelToken){
                    this.panelUserSet.remove(socket);
                }
            }
            //no token = default
            this.defaultUserGroupSet.add(socket);

            await this.zc.emitEvent(this.zc.eventConfig.sc_socketDeauthenticate,this.getPreparedSmallBag(),socket,token);
        });

        socket.on('authStateChange', async (stateChangeData : any) =>
        {
            await this.zc.emitEvent(this.zc.eventConfig.sc_socketAuthStateChange,this.getPreparedSmallBag(),socket,stateChangeData);
        });

        socket.on('message', async (msg) =>
        {
            await this.zc.emitEvent(this.zc.eventConfig.sc_socketMessage,this.getPreparedSmallBag(),socket,msg);
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

    //Part Channel Socket Access
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
                await this.zc.emitEvent(this.zc.eventConfig.workerMessage,this.preparedSmallBag,mainData.data);
                break;
        }
    }

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
                    const kickOutAction = (s : Socket) => {
                        const subs = s.subscriptions();
                        for(let i = 0; i < subs.length; i++) {
                            if(subs[i].indexOf(ch) !== -1) {
                                // noinspection TypeScriptValidateJSTypes
                                s.kickOut(ch);
                            }
                        }
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
                const emitAction = (s : Socket) => {
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
                const disconnectAction = (s : Socket) => {
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
                const deauthenticateAction = (s : Socket) => {
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

    private async updateTokens(map : Mapper<Socket>,actions : {action : SyncTokenActions,params : any[]}[],target,exceptSocketSids : string[]) {
        const filterExceptSocketIds : string[] = this.socketSidsFilter(exceptSocketSids);
        const promises : Promise<void>[] = [];
        map.forEach(target,(socket : Socket) => {
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

    private forAllSocketSids(ids : string[],action : Function)
    {
        const filterSocketIds : string[] = this.socketSidsFilter(ids);
        for(let i = 0; i < filterSocketIds.length; i++)
        {
            if(this.scServer.clients.hasOwnProperty(filterSocketIds[i])) {
                action(this.scServer.clients[filterSocketIds[i]]);
            }
        }
    }

    private forAllSockets(exceptSocketSids : string[],action : Function)
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

    private socketSidsFilter(socketSids : string[]) : string[]
    {
        const filteredIds : string[] = [];
        socketSids.forEach((sid) =>{
            const splitSid = IdTools.splitSid(sid);
            if (this.options.instanceId === splitSid[0] && this.id == splitSid[1]) {
                filteredIds.push(splitSid[2]);
            }
        });
        return filteredIds;
    }

    private forMappingSCId(mapper : Mapper<Socket>,ids : (string | number)[],exceptSocketSids : string[],action : Function) : void
    {
        const filterExceptSocketIds : string[] = this.socketSidsFilter(exceptSocketSids);
        for(let i = 0; i < ids.length; i++) {
            mapper.forEach(ids[i].toString(),(socket : Socket) => {
                if(!filterExceptSocketIds.includes(socket.id)) {
                    action(socket);
                }
            });
        }
    }

    private forMappingSCAll(mapper : Mapper<Socket>,exceptSocketSids : string[],action : Function) : void
    {
        const filterExceptSocketIds : string[] = this.socketSidsFilter(exceptSocketSids);
        mapper.forAllEach((socket : Socket) => {
            if(!filterExceptSocketIds.includes(socket.id)) {
                action(socket);
            }
        });
    }

    private forTokenIds(tokenIds : (number | string)[],exceptSocketSids : string[],action : Function) : void {
        this.forMappingSCId(this.mapTokenIdToSc,tokenIds,exceptSocketSids,action);
    }

    private forAuthUserGroups(groups : string[],all : boolean,exceptSocketSids : string[],action : Function) : void {
        if(all){
            this.forMappingSCAll(this.mapAuthUserGroupToSc,exceptSocketSids,action);
        }
        else{
            this.forMappingSCId(this.mapAuthUserGroupToSc,groups,exceptSocketSids,action);
        }
    }

    private forDefaultUserGroup(exceptSocketSids : string[],action : Function) : void {
        const filterExceptSocketIds : string[] = this.socketSidsFilter(exceptSocketSids);
        this.defaultUserGroupSet.forEach((socket : Socket) => {
            if(!filterExceptSocketIds.includes(socket.id)) {
                action(socket);
            }
        });
    }

    private forUserIds(userIds : (number | string)[],exceptSocketSids : string[],action : Function) : void {
        this.forMappingSCId(this.mapUserIdToSc,userIds,exceptSocketSids,action);
    }

    //Part background tasks

    private registerMasterEvent()
    {
        this.on('masterMessage',async (data,respond) =>
        {
            if(data['userBackgroundTask'] !== undefined) {
                const id = data['userBackgroundTask'];
                if(this.userBackgroundTasks.hasOwnProperty(id)) {
                    await this.invokeUserBackgroundTask(this.userBackgroundTasks[id]);
                }
            }
            respond(null);
        });
    }

    private async invokeUserBackgroundTask(task)
    {
        await FuncTools.emitEvent(task,this.preparedSmallBag);
    }

    private loadUserBackgroundTasks()
    {
        const bkTS = new BackgroundTasksSaver(
            (name,task) => {
                this.userBackgroundTasks[name] = task;
            });
        bkTS.saveUserBackgroundTasks(this.zc);
    }

    private checkAuthStart()
    {
        if(this.zc.mainConfig.authStart)
        {
            this.authStartActive = true;
            setTimeout(() =>
            {
                this.authStartActive = false;
            },this.zc.mainConfig.authStartDuration);
        }
    }

    private async loadClientJsData() : Promise<void>
    {
        try{
            let promises : Promise<void>[] = [];
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

    public sendToZationMaster(data : {action : WorkerMessageActions} | any) : Promise<any>
    {
        return new Promise<boolean>((resolve,reject) =>
        {
            this.sendToMaster(data,(err,data) => {
                if(err) {
                    reject(err);
                }
                else {
                    resolve(data);
                }
            });
        });
    }

    public async killServer(error : Error | string) : Promise<void>
    {
        await this.sendToZationMaster({action : WorkerMessageActions.KILL_SERVER, data : error});
    }

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

    private async initPanelUpdates() : Promise<void>
    {
        setInterval(async () => {
            if(this.panelEngine.isPanelInUse()) {
                this.panelEngine.update('mainUpdate',{
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
                    this.panelEngine.update('node',{
                        brokers : brokerInfo.brokers,
                        cBrokers : brokerInfo.cBrokers,
                        master : (await NodeInfo.getMasterInfo(this))
                    });
                }
            },4000);
        }

    }

    getServerVersion() : string
    {
        return this.serverVersion;
    }

    getServerStartedTime() : number
    {
        return this.serverStartedTimeStamp;
    }

    getWorkerId() : number
    {
        return this.id;
    }

    getIsAuthStartActive() : boolean
    {
        return this.authStartActive;
    }

    getWorkerStartedTime() : number
    {
        return this.workerStartedTimeStamp;
    }

    getZationConfig() : ZationConfig
    {
        return this.zc;
    }

    getPreparedSmallBag() : SmallBag
    {
        return this.preparedSmallBag;
    }

    getAEPreparedPart() : AEPreparedPart
    {
        return this.aePreparedPart;
    }

    // noinspection JSUnusedGlobalSymbols
    getChConfigManager() : ChConfigManager
    {
        return this.chConfigManager;
    }

    // noinspection JSUnusedGlobalSymbols
    getChAccessEngine() : ChAccessEngine
    {
        return this.chAccessEngine;
    }

    getControllerPrepare() : ControllerPrepare
    {
        return this.controllerPrepare;
    }

    // noinspection JSUnusedGlobalSymbols
    getServiceEngine() : ServiceEngine
    {
        return this.serviceEngine;
    }

    // noinspection JSUnusedGlobalSymbols
    getUserToScMapper() : Mapper<Socket>
    {
        return this.mapUserIdToSc;
    }

    // noinspection JSUnusedGlobalSymbols
    getTokenIdToScMapper() : Mapper<Socket>
    {
        return this.mapTokenIdToSc;
    }

    // noinspection JSUnusedGlobalSymbols
    getCustomChToScMapper() : Mapper<Socket>
    {
        return this.mapCustomChToSc;
    }

    // noinspection JSUnusedGlobalSymbols
    getCustomIdChToScMapper() : Mapper<Socket>
    {
        return this.mapCustomIdChToSc;
    }

    // noinspection JSUnusedGlobalSymbols
    getAuthUserGroupToScMapper() : Mapper<Socket>
    {
        return this.mapAuthUserGroupToSc;
    }

    // noinspection JSUnusedGlobalSymbols
    getDefaultUserGroupSet() : SocketSet
    {
        return this.defaultUserGroupSet;
    }

    // noinspection JSUnusedGlobalSymbols
    getPanelUserSet() : SocketSet
    {
        return this.panelUserSet;
    }

    // noinspection JSUnusedGlobalSymbols
    getWorkerVariableStorage() : object
    {
        return this.variableStorage;
    }

    // noinspection JSUnusedGlobalSymbols
    getPanelEngine() : PanelEngine
    {
        return this.panelEngine;
    }

    // noinspection JSUnusedGlobalSymbols
    getViewEngine() : ViewEngine
    {
        return this.viewEngine;
    }

    // noinspection JSUnusedGlobalSymbols
    setWorkerVariableStorage(obj : object) : void
    {
        this.variableStorage = obj;
    }

    getInputDataProcessor() : InputDataProcessor {
        return this.inputDataProcessor;
    }
}

new ZationWorker();

export = ZationWorker;