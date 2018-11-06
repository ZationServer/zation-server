/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import {ScServer} from "../helper/sc/scServer";

require('cache-require-paths');
import ChTools = require("../helper/channel/chTools");
import FuncTools = require("../helper/tools/funcTools");
import express = require('express');
import cookieParser = require('cookie-parser');
import bodyParser = require('body-parser');
import fileUpload = require('express-fileupload');
import url        = require('url');

import Zation = require('./zation');
import ZationConfig = require('./zationConfig');
import ConfigPreCompiler = require('../helper/config/configPreCompiler');
import Logger = require('../helper/logger/logger');
import ServiceEngine = require('../helper/services/serviceEngine');
import SmallBag = require('../api/SmallBag');
import AEPreparedPart = require('../helper/auth/aePreparedPart');
import ChConfigManager = require("../helper/channel/chConfigManager");
import ControllerPrepare = require('../helper/controller/controllerPrepare');

import BackgroundTasksSaver = require("../helper/background/backgroundTasksWorkerSaver");
import Mapper = require("../helper/tools/mapper");
import IdTools = require("../helper/tools/idTools");
import CIdChInfo = require("../helper/infoObjects/cIdChInfo");
import SocketInfo = require("../helper/infoObjects/socketInfo");
import CChInfo = require("../helper/infoObjects/cChInfo");
import HashSet = require('hashset');
import process = require("process");

const  SCWorker : any        = require('socketcluster/scworker');
import {ChAccessEngine} from '../helper/channel/chAccessEngine';
import {WorkerChTaskActions} from "../helper/constants/workerChTaskActions";
import {Socket} from "../helper/sc/socket";
import {WorkerChTargets} from "../helper/constants/workerChTargets";
import PanelEngine = require("../helper/panel/panelEngine");
import {ZationChannel, ZationToken} from "../helper/constants/internal";
import ZationTokenInfo = require("../helper/infoObjects/zationTokenInfo");

class ZationWorker extends SCWorker
{
    private userBackgroundTasks : object;

    private workerStartedTimeStamp : number;
    private serverStartedTimeStamp : number;
    private serverVersion : string;
    private zc : ZationConfig;

    public scServer : ScServer;
    private serviceEngine : ServiceEngine;
    private preparedSmallBag : SmallBag;
    private controllerPrepare : ControllerPrepare;
    private aePreparedPart : AEPreparedPart;
    private panelEngine : PanelEngine;
    private chAccessEngine : ChAccessEngine;
    private chConfigManager : ChConfigManager;
    private zation : Zation;

    private authStartActive : boolean;

    private app : any;

    private mapUserIdToScId : Mapper<Socket> = new Mapper<Socket>();
    private mapTokenIdToScId : Mapper<Socket> = new Mapper<Socket>();

    private mapCustomChToSc : Mapper<Socket> = new Mapper<Socket>();
    private mapCustomIdChToSc : Mapper<Socket> = new Mapper<Socket>();

    private mapAuthUserGroupToSc : Mapper<Socket> = new Mapper<Socket>();
    private defaultUserGroup  = new HashSet();

    private variableStorage : object = {};

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

        let zcOptions = this.options.zationConfigWorkerTransport;

        this.zc = new ZationConfig(zcOptions,true);

        //setLogger
        Logger.setZationConfig(this.zc);

        await this.setUpLogInfo();

        await this.startZWorker();
    }

    private async startZWorker()
    {
        Logger.printStartDebugInfo(`Worker with id ${this.id} begin start process.`,false,true);

        Logger.startStopWatch();
        this.zc.loadOtherConfigs();
        Logger.printStartDebugInfo(`Worker with id ${this.id} loads other zation config files.`,true);

        Logger.startStopWatch();
        let preCompiler = new ConfigPreCompiler(this.zc);
        preCompiler.preCompile();
        Logger.printStartDebugInfo(`Worker with id ${this.id} preCompile configs.`, true);

        //Services
        Logger.startStopWatch();
        this.serviceEngine = new ServiceEngine(this.zc);
        await this.serviceEngine.init();
        Logger.printStartDebugInfo(`Worker with id ${this.id} creates service engine.`,true);

        Logger.startStopWatch();
        this.preparedSmallBag = new SmallBag(this);
        Logger.printStartDebugInfo(`Worker with id ${this.id} prepares a small bag.`,true);

        Logger.startStopWatch();
        this.panelEngine = new PanelEngine(this);
        Logger.printStartDebugInfo
        (
            this.zc.mainConfig.usePanel ?
                `Worker with id ${this.id} creates panel engine.` :
                `Worker with id ${this.id} checks for panel engine.`,
            true
        );

        //prepareController
        Logger.startStopWatch();
        this.controllerPrepare = new ControllerPrepare(this.zc,this);
        await this.controllerPrepare.prepare();
        Logger.printStartDebugInfo(`Worker with id ${this.id} prepares controller.`,true);

        Logger.startStopWatch();
        this.aePreparedPart = new AEPreparedPart(this.zc,this);
        Logger.printStartDebugInfo(`Worker with id ${this.id} prepares auth engine part.`,true);

        Logger.startStopWatch();
        this.chConfigManager = new ChConfigManager(this.zc);
        Logger.printStartDebugInfo(`Worker with id ${this.id} init channel config manager.`,true);

        Logger.startStopWatch();
        this.chAccessEngine= new ChAccessEngine(this.chConfigManager,this.preparedSmallBag);
        Logger.printStartDebugInfo(`Worker with id ${this.id} init channel access engine.`,true);

        Logger.startStopWatch();
        this.loadUserBackgroundTasks();
        Logger.printStartDebugInfo(`Worker with id ${this.id} loads user background tasks.`,true);

        Logger.startStopWatch();
        this.registerMasterEvent();
        Logger.printStartDebugInfo(`Worker with id ${this.id} registers by master event.`,true);

        Logger.startStopWatch();
        await this.registerWorkerChannel();
        Logger.printStartDebugInfo(`Worker with id ${this.id} registers worker channel.`,true);

        Logger.startStopWatch();
        this.zation = new Zation(this);
        Logger.printStartDebugInfo(`Worker with id ${this.id} creates zation.`,true);

        Logger.startStopWatch();
        this.checkAuthStart();
        Logger.printStartDebugInfo(`Worker with id ${this.id} checks for authStart.`,true);

        //Server
        Logger.startStopWatch();
        await this.startHttpServer();
        Logger.printStartDebugInfo(`Worker with id ${this.id} starts http server.`,true);

        Logger.startStopWatch();
        await this.startWebSocketServer();
        Logger.printStartDebugInfo(`Worker with id ${this.id} starts web socket server.`,true);

        //Fire ExpressEvent
        Logger.startStopWatch();
        await this.zc.emitEvent(this.zc.eventConfig.express,this.preparedSmallBag,this.app);
        Logger.printStartDebugInfo(`Worker with id ${this.id} process express event.`,true);

        //Fire ScServerEvent
        Logger.startStopWatch();
        await this.zc.emitEvent(this.zc.eventConfig.scServer,this.preparedSmallBag,this.scServer);
        Logger.printStartDebugInfo(`Worker with id ${this.id} process scServer event.`,true);

        Logger.printStartDebugInfo(`Worker with id ${this.id} is started.`,false);

        //Fire event is started
        await this.zc.emitEvent
        (this.zc.eventConfig.workerIsStarted,this.preparedSmallBag,this.zc.getSomeInformation(),this);
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

        //START SOCKET SERVER
        this.scServer.on('connection', async (socket : Socket,conSate) => {

            //init sc variables
            socket.zationSocketVariables = {};
            socket.sid = IdTools.buildSid(this.options.instanceId,this.id,socket.id);

            this.initSocketEvents(socket);
            this.defaultUserGroup.add(socket);

            Logger.printDebugInfo(`Socket with id: ${socket.id} is connected!`);

            socket.on('ZATION.SERVER.REQUEST', (data, respond) => {
                // noinspection JSUnusedLocalSymbols
                const p = this.zation.run(
                    {
                        isWebSocket: true,
                        input: data,
                        socket: socket,
                        respond: respond,
                     });
            });

            await this.zc.emitEvent(this.zc.eventConfig.scServerConnection,this.getPreparedSmallBag(),socket,conSate);
            await this.zc.emitEvent(this.zc.eventConfig.socket,this.getPreparedSmallBag(),new SocketInfo(socket));

        });

        await this.zc.emitEvent(this.zc.eventConfig.wsServerIsStarted,this.zc.getSomeInformation());
    }

    private async startHttpServer()
    {
        this.app = express();

        const path = this.zc.mainConfig.path;

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
            this.app.use(`${path}/panel`, express.static(__dirname + '/../public/panel'));
        }

        // noinspection JSUnresolvedFunction
        this.app.get(`/zation/serverSettings.js`,(req,res) =>
        {
            res.type('.js');
            res.send(this.options.zationServerSettingsJsFile);
        });

        if(this.zc.mainConfig.clientJsPrepare) {
            // noinspection JSUnresolvedFunction
            this.app.get(`${path}/client.js`,(req,res) =>
            {
                res.type('.js');
                res.send(this.options.zationFullClientJsFile);
            });
        }

        //REQUEST

        // noinspection JSUnresolvedFunction
        this.app.all(`${path}`, (req, res) => {
            //Run Zation
            // noinspection JSUnusedLocalSymbols
            let p = this.zation.run(
                {
                    isisWebSocket: false,
                    res: res,
                    req: req,
                });
        });

        await this.zc.emitEvent(this.zc.eventConfig.httpServerIsStarted,this.zc.getSomeInformation());
    }

    getFullWorkerId()
    {
        return `${this.id}.${process.pid}`;
    }

    private initSocketMiddleware()
    {
        this.scServer.addMiddleware(this.scServer.MIDDLEWARE_SUBSCRIBE, async (req, next) => {

            const userMidRes = await
                this.zc.checkScMiddlewareEvent
                (this.zc.eventConfig.scMiddlewareSubscribe,next,this.getPreparedSmallBag(),req);

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

        //BLOCK USER CAN CLIENT_PUBLISH_ACCESS IN ZATION CHANNELS
        this.scServer.addMiddleware(this.scServer.MIDDLEWARE_PUBLISH_IN, async (req, next) =>
        {
            const channel = req.channel;

            //add ssi to pub data
            const addSrcSid = ()=> {
                if(typeof req.data === "object") {
                    req.data['ssi'] = req.socket.sid;
                }
            };

            const userMidRes = await
            this.zc.checkScMiddlewareEvent
            (this.zc.eventConfig.scMiddlewarePublishIn,next,this.getPreparedSmallBag(),req);

            if(userMidRes)
            {
                if (req.channel.indexOf(ZationChannel.USER_CHANNEL_PREFIX) !== -1) {
                    let err : any = new Error('User can\'t publish in a User Channel!');
                    err.code = 4546;
                    next(err); //Block!
                }
                else if (req.channel.indexOf(ZationChannel.CUSTOM_ID_CHANNEL_PREFIX) !== -1) {
                    addSrcSid();
                    next(await this.chAccessEngine.checkAccessClientPubCustomIdCh(req.socket,channel,req.data));
                }
                else if (req.channel.indexOf(ZationChannel.CUSTOM_CHANNEL_PREFIX) !== -1) {
                    addSrcSid();
                    next(await this.chAccessEngine.checkAccessClientPubCustomCh(req.socket,channel,req.data));
                }
                else if (req.channel.indexOf(ZationChannel.AUTH_USER_GROUP_PREFIX) !== -1) {
                    let err : any = new Error('User can\'t publish in a User GROUP Channel!');
                    err.code = 4536;
                    next(err); //Block!
                }
                else if (req.channel === ZationChannel.ALL) {
                    let err : any = new Error('User can\'t publish in a all Channel!');
                    err.code = 4556;
                    next(err); //Block!
                }
                else if (req.channel === ZationChannel.DEFAULT_USER_GROUP) {
                    let err : any = new Error('User can\'t publish in default user GROUP Channel!');
                    err.code = 4526;
                    next(err); //Block!
                }
                else if(req.channel === ZationChannel.PANEL_OUT) {
                    let err : any = new Error('User can\'t publish in panel out channel!');
                    err.code = 4506;
                    next(err); //Block!
                }
                else if(req.channel === ZationChannel.PANEL_IN) {
                    const authToken = req.socket.getAuthToken();
                    if(authToken !== null &&
                        authToken[nameof<ZationToken>(s => s.zationPanelAccess)] !== undefined &&
                        authToken[nameof<ZationToken>(s => s.zationPanelAccess)])
                    {
                        addSrcSid();
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
            const userMidRes = await
                this.zc.checkScMiddlewareEvent
                (this.zc.eventConfig.scMiddlewarePublishOut,next,this.getPreparedSmallBag(),req);

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
            (this.zc.eventConfig.scMiddlewareHandshakeSc,next,this.getPreparedSmallBag(),req);

            if(userMidRes) {
                //check for version and system info
                const urlParts = url.parse(req.socket.request.url, true);
                const query = urlParts.query;
                if
                (
                    typeof query === 'object' &&
                    (typeof query.version === 'string' || typeof query.version === 'number') &&
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

        //ZATION NEED NOTHING TO DO, ONLY CHECK USER EVENT
        this.scServer.addMiddleware(this.scServer.MIDDLEWARE_HANDSHAKE_WS, async (req, next) =>
        {
            const userMidRes = await
            this.zc.checkScMiddlewareEvent
            (this.zc.eventConfig.scMiddlewareHandshakeWs,next,this.getPreparedSmallBag(),req);

            if(userMidRes) {
                next();
            }
        });

        //ZATION NEED NOTHING TO DO, ONLY CHECK USER EVENT
        this.scServer.addMiddleware(this.scServer.MIDDLEWARE_EMIT, async (req, next) =>
        {
            const userMidRes = await
            this.zc.checkScMiddlewareEvent
            (this.zc.eventConfig.scMiddlewareEmit,next,this.getPreparedSmallBag(),req);

            if(userMidRes) {
                next();
            }
        });

        //ZATION ONLY CHECK USER EVENT AND AUTHENTICATE MIDDLEWARE
        // noinspection JSUnresolvedVariable
        this.scServer.addMiddleware(this.scServer.MIDDLEWARE_AUTHENTICATE, async (req, next) =>
        {
            const token = req.authToken;

            const userMidRes = await
            this.zc.checkScMiddlewareEvent
            (this.zc.eventConfig.scMiddlewareAuthenticate,next,this.getPreparedSmallBag(),req);

            const zationAuthMid = await
            this.zc.checkAuthenticationMiddlewareEvent
            (this.zc.eventConfig.middlewareAuthenticate,next,this.getPreparedSmallBag(),new ZationTokenInfo(token));

            if(userMidRes && zationAuthMid) {
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
            await this.zc.emitEvent(this.zc.eventConfig.scServerError,this.getPreparedSmallBag(),err);
        });

        this.scServer.on('notice', async (note) =>
        {
            await this.zc.emitEvent(this.zc.eventConfig.scServerNotice,this.getPreparedSmallBag(),note);
        });

        this.scServer.on('handshake', async (socket) =>
        {
            await this.zc.emitEvent(this.zc.eventConfig.scServerHandshake,this.getPreparedSmallBag(),socket);
        });

        this.scServer.on('connectionAbort', async (socket) =>
        {
            await this.zc.emitEvent(this.zc.eventConfig.scServerConnectionAbort,this.getPreparedSmallBag(),socket);
        });

        this.scServer.on('disconnection', async (socket) =>
        {
            await this.zc.emitEvent(this.zc.eventConfig.socketDisconnection,this.getPreparedSmallBag(),new SocketInfo(socket));
            await this.zc.emitEvent(this.zc.eventConfig.scServerDisconnection,this.getPreparedSmallBag(),socket);
        });

        this.scServer.on('closure', async (socket) =>
        {
            await this.zc.emitEvent(this.zc.eventConfig.scServerClosure,this.getPreparedSmallBag(),socket);
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
                    pro.push(FuncTools.emitEvent(func,this.smallBag,new CIdChInfo(name,id),new SocketInfo(socket)));
                }
            }
            else if(chName.indexOf(ZationChannel.CUSTOM_CHANNEL_PREFIX) !== -1) {
                const name = ChTools.getCustomChannelName(chName);
                this.mapCustomChToSc.map(name,socket);
                let func = this.chConfigManager.getOnSubCustomCh(name);
                if(!!func) {
                    pro.push(FuncTools.emitEvent(func,this.smallBag,new CChInfo(name),new SocketInfo(socket)));
                }
            }
            else if(chName.indexOf(ZationChannel.USER_CHANNEL_PREFIX) !== -1) {
                let func = this.chConfigManager.getOnSubUserCh();
                if(!!func) {
                    const id = ChTools.getUserIdFromCh(chName);
                    pro.push(FuncTools.emitEvent(func,this.smallBag,id,new SocketInfo(socket)));
                }
            }
            else if(chName.indexOf(ZationChannel.AUTH_USER_GROUP_PREFIX) !== -1) {
                let func = this.chConfigManager.getOnSubAuthUserGroupCh();
                if(!!func) {
                    const group = ChTools.getUserAuthGroupFromCh(chName);
                    pro.push(FuncTools.emitEvent(func,this.smallBag,group,new SocketInfo(socket)));
                }
            }
            else if(chName === ZationChannel.DEFAULT_USER_GROUP) {
                let func = this.chConfigManager.getOnSubDefaultUserGroupCh();
                if(!!func) {
                    pro.push(FuncTools.emitEvent(func,this.smallBag,new SocketInfo(socket)));
                }
            }
            else if(chName === ZationChannel.ALL) {
                let func = this.chConfigManager.getOnSubAllCh();
                if(!!func) {
                    pro.push(FuncTools.emitEvent(func,this.smallBag,new SocketInfo(socket)));
                }
            }
            pro.push(this.zc.emitEvent(this.zc.eventConfig.scServerSubscription,this.getPreparedSmallBag(),socket,chName,chOptions));
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
                    pro.push(FuncTools.emitEvent(func,this.smallBag,new CIdChInfo(name,id),new SocketInfo(socket)));
                }
            }
            else if(chName.indexOf(ZationChannel.CUSTOM_CHANNEL_PREFIX) !== -1) {
                const name = ChTools.getCustomChannelName(chName);
                this.mapCustomChToSc.removeValueFromKey(name,socket);
                let func = this.chConfigManager.getOnUnsubCustomCh(name);
                if(!!func) {
                    pro.push(FuncTools.emitEvent(func,this.smallBag,new CChInfo(name),new SocketInfo(socket)));
                }
            }
            else if(chName.indexOf(ZationChannel.USER_CHANNEL_PREFIX) !== -1) {
                let func = this.chConfigManager.getOnUnsubUserCh();
                if(!!func) {
                    const id = ChTools.getUserIdFromCh(chName);
                    pro.push(FuncTools.emitEvent(func,this.smallBag,id,new SocketInfo(socket)));
                }
            }
            else if(chName.indexOf(ZationChannel.AUTH_USER_GROUP_PREFIX) !== -1) {
                let func = this.chConfigManager.getOnUnsubAuthUserGroupCh();
                if(!!func) {
                    const group = ChTools.getUserAuthGroupFromCh(chName);
                    pro.push(FuncTools.emitEvent(func,this.smallBag,group,new SocketInfo(socket)));
                }
            }
            else if(chName === ZationChannel.DEFAULT_USER_GROUP) {
                let func = this.chConfigManager.getOnUnsubDefaultUserGroupCh();
                if(!!func) {
                    pro.push(FuncTools.emitEvent(func,this.smallBag,new SocketInfo(socket)));
                }
            }
            else if(chName === ZationChannel.ALL) {
                let func = this.chConfigManager.getOnUnsubAllCh();
                if(!!func) {
                    pro.push(FuncTools.emitEvent(func,this.smallBag,new SocketInfo(socket)));
                }
            }
            pro.push(this.zc.emitEvent(this.zc.eventConfig.scServerUnsubscription,this.getPreparedSmallBag(),socket,chName));
            await Promise.all(pro);
        });

        this.scServer.on('authentication', async (socket,authToken) =>
        {
            await this.zc.emitEvent(this.zc.eventConfig.scServerAuthentication,this.getPreparedSmallBag(),socket,authToken);
        });

        this.scServer.on('deauthentication', async (socket,oldAuthToken) =>
        {
            await this.zc.emitEvent(this.zc.eventConfig.scServerDeauthentication,this.getPreparedSmallBag(),socket,oldAuthToken);
        });

        this.scServer.on('badSocketAuthToken', async (socket,obj) =>
        {
            socket.emit('zationBadAuthToken',{});
            await this.zc.emitEvent(this.zc.eventConfig.scServerBadSocketAuthToken,this.getPreparedSmallBag(),socket,obj);
        });

        this.scServer.on('ready', async () =>
        {
            await this.zc.emitEvent(this.zc.eventConfig.scServerReady,this.getPreparedSmallBag());
        });

    }

    private initSocketEvents(socket)
    {
        socket.on('error', async (err) =>
        {
            await this.zc.emitEvent(this.zc.eventConfig.socketError,this.getPreparedSmallBag(),socket,err);
        });

        socket.on('raw', async () =>
        {
            await this.zc.emitEvent(this.zc.eventConfig.socketRaw,this.getPreparedSmallBag(),socket);
        });

        socket.on('connect', async (scConState) =>
        {
            // noinspection JSUnresolvedFunction
            await this.zc.emitEvent(this.zc.eventConfig.socketConnect,this.getPreparedSmallBag(),socket,scConState);
        });

        socket.on('disconnect', async () =>
        {
            await this.zc.emitEvent(this.zc.eventConfig.socketDisconnect,this.getPreparedSmallBag(),socket);
        });

        socket.on('connectAbort', async () =>
        {
            await this.zc.emitEvent(this.zc.eventConfig.socketConnectAbort,this.getPreparedSmallBag(),socket);
        });

        socket.on('close', async () =>
        {
            // noinspection JSUnresolvedFunction
            let token = socket.getAuthToken();

            if(token!==null) {
                if(!!token.zationTokenId) {
                    this.mapTokenIdToScId.removeValueFromKey(token.zationTokenId,socket);
                }
                if(!!token.zationUserId) {
                    this.mapUserIdToScId.removeValueFromKey(token.zationUserId,socket);
                }
                if(!!token.zationAuthUserGroup) {
                    this.mapAuthUserGroupToSc.removeValueFromKey(token.zationAuthUserGroup,socket);
                }
            }

            this.defaultUserGroup.remove(socket);

            await this.zc.emitEvent(this.zc.eventConfig.socketClose,this.getPreparedSmallBag(),socket);
        });

        socket.on('subscribe', async () =>
        {
            await this.zc.emitEvent(this.zc.eventConfig.socketSubscribe,this.getPreparedSmallBag(),socket);
        });

        socket.on('unsubscribe', async () =>
        {
            await this.zc.emitEvent(this.zc.eventConfig.socketUnsubscribe,this.getPreparedSmallBag(),socket);
        });

        socket.on('badAuthToken', async (arg) =>
        {
            await this.zc.emitEvent(this.zc.eventConfig.socketBadAuthToken,this.getPreparedSmallBag(),socket,arg);
        });

        socket.on('authenticate', async (token : ZationToken) =>
        {
            if(token!==null) {
                if(!!token.zationTokenId) {
                    this.mapTokenIdToScId.map(token.zationTokenId,socket);
                }
                if(!!token.zationUserId) {
                    this.mapUserIdToScId.map(token.zationUserId.toString(),socket);
                }
                if(!!token.zationAuthUserGroup) {
                    this.mapAuthUserGroupToSc.map(token.zationAuthUserGroup,socket);
                    this.defaultUserGroup.remove(socket);
                }
            }
            await this.zc.emitEvent(this.zc.eventConfig.socketAuthenticate,this.getPreparedSmallBag(),socket,token);
        });

        socket.on('deauthenticate', async (token : ZationToken) =>
        {
            if(token!==null) {
                if(!!token.zationTokenId) {
                    this.mapTokenIdToScId.removeValueFromKey(token.zationTokenId,socket);
                }
                if(!!token.zationUserId) {
                    this.mapUserIdToScId.removeValueFromKey(token.zationUserId.toString(),socket);
                }
                if(!!token.zationAuthUserGroup) {
                    this.mapAuthUserGroupToSc.removeValueFromKey(token.zationAuthUserGroup,socket);
                }
            }
            //no token = default
            this.defaultUserGroup.add(socket);

            await this.zc.emitEvent(this.zc.eventConfig.socketDeauthenticate,this.getPreparedSmallBag(),socket,token);
        });

        socket.on('authStateChange', async () =>
        {
            await this.zc.emitEvent(this.zc.eventConfig.socketAuthStateChange,this.getPreparedSmallBag(),socket);
        });

        socket.on('message', async (msg) =>
        {
            await this.zc.emitEvent(this.zc.eventConfig.socketMessage,this.getPreparedSmallBag(),socket,msg);
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
            if(!Array.isArray(data.ids)) {
                return;
            }

            const ids : any[] = data.ids;
            const exceptSocketSids = data.exceptSocketSids;
            const mainData = data.mainData;
            const emitData = mainData.data;

            switch (data.action) {
                case WorkerChTaskActions.KICK_OUT:
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
                        }
                    }
                    break;
                case WorkerChTaskActions.EMIT:
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
                    }
                    break;
                case WorkerChTaskActions.DISCONNECT:
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
                    }
                    break;
                case WorkerChTaskActions.DEAUTHENTICATE:
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
                    }
                    break;
                case WorkerChTaskActions.MESSAGE:
                    switch (data.target) {
                        case WorkerChTargets.THIS_WORKER:
                            await this.zc.emitEvent(this.zc.eventConfig.workerMessage,this.preparedSmallBag,emitData);
                            break;
                    }
                    break;
            }

        });
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
            if (this.options.instanceId === splitSid[0] && this.id === splitSid[1]) {
                filteredIds.push(splitSid[2]);
            }
        });
        return filteredIds;
    }

    private forMappingSC(mapper : Mapper<Socket>,ids : (string | number)[],exceptSocketSids : string[],action : Function) : void
    {
        const filterExceptSocketIds : string[] = this.socketSidsFilter(exceptSocketSids);
        for(let i = 0; i < ids.length; i++)
        {
            const id = ids[i].toString();
            if(mapper.isKeyExist(id))
            {
                const sockets = mapper.getValues(id);
                for(let i = 0; i < sockets.length; i++)
                {
                    if(!filterExceptSocketIds.includes(sockets[i].id))
                    {
                        action(sockets[i]);
                    }
                }
            }
        }
    }

    private forTokenIds(tokenIds : (number | string)[],exceptSocketSids : string[],action : Function) : void {
        this.forMappingSC(this.mapTokenIdToScId,tokenIds,exceptSocketSids,action);
    }

    private forUserIds(userIds : (number | string)[],exceptSocketSids : string[],action : Function) : void {
        this.forMappingSC(this.mapUserIdToScId,userIds,exceptSocketSids,action);
    }

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
    getUserToScIdMapper() : Mapper<Socket>
    {
        return this.mapUserIdToScId;
    }

    // noinspection JSUnusedGlobalSymbols
    getTokenIdToScIdMapper() : Mapper<Socket>
    {
        return this.mapTokenIdToScId;
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
    getDefaultUserGroupsMap() : any
    {
        return this.defaultUserGroup;
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
    setWorkerVariableStorage(obj : object) : void
    {
        this.variableStorage = obj;
    }
}

new ZationWorker();

export = ZationWorker;