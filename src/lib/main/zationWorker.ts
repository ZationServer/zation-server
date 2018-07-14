/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import FuncTools             = require("../helper/tools/funcTools");
const  SCWorker : any        = require('socketcluster/scworker');
import express               = require('express');
import cookieParser          = require('cookie-parser');
import bodyParser            = require('body-parser');
import fileUpload            = require('express-fileupload');

import Zation                = require('./zation');
import ZationConfig          = require('./zationConfig');
import ConfigPreCompiler     = require('../helper/config/configPreCompiler');
import Logger                = require('../helper/logger/logger');
import Const                 = require('../helper/constants/constWrapper');
import ChAccessEngine        = require('../helper/channel/chAccessEngine');
import ServiceEngine         = require('../helper/services/serviceEngine');
import SystemBackgroundTask  = require('../helper/background/systemBackgroundTasks');
import SmallBag              = require('../api/SmallBag');
import PrepareClientJs       = require('../client/prepareClientJs');
import AEPreparedPart        = require('../helper/auth/aePreparedPart');
import ControllerPrepare     = require('../helper/controller/controllerPrepare');

import TempDbMongoDown       = require('../helper/tempDb/tempDbMongoDown');
import TempDbLevelDown       = require('../helper/tempDb/tempDbMemoryDown');
import TempDbUp              = require("../helper/tempDb/tempDbUp");
import BackgroundTasksSaver  = require("../helper/background/backgroundTasksSaver");

class ZationWorker extends SCWorker
{
    private systemBackgroundTasks : Function[];
    private userBackgroundTasks : object;

    private workerStartedTimeStamp : number;
    private serverStartedTimeStamp : number;
    private serverVersion : string;
    private zc : ZationConfig;

    private preparedClientJs : PrepareClientJs;
    private serviceEngine : ServiceEngine;
    private preparedSmallBag : SmallBag;
    private controllerPrepare : ControllerPrepare;
    private aePreparedPart : AEPreparedPart;
    private zation : Zation;

    private authStartActive : boolean;

    private tempDbUp : TempDbUp;

    private app : any;

    constructor()
    {
        super();
    }

    // noinspection JSUnusedGlobalSymbols
    async run()
    {
        //BackgroundStuff
        this.systemBackgroundTasks = [];
        this.userBackgroundTasks = {};

        this.workerStartedTimeStamp = Date.now();
        this.serverStartedTimeStamp = this.options.zationServerStartedTimeStamp;
        this.serverVersion = this.options.zationServerVersion;

        let zcOptions = this.options.zationConfigWorkerTransport;

        this.zc = new ZationConfig(zcOptions,true);

        //setLogger
        Logger.setZationConfig(this.zc);

        await this.setUpLogInfo();

        Logger.printStartDebugInfo(`Worker with id ${this.id} begin start process!`);

        Logger.printStartDebugInfo(`Worker with id ${this.id} load other zation config files.`);

        this.zc.loadOtherConfigs();

        Logger.printStartDebugInfo(`Worker with id ${this.id} preCompile configs!`);

        let preCompiler = new ConfigPreCompiler(this.zc);
        preCompiler.preCompile();

        Logger.printStartDebugInfo(`Worker with id ${this.id} starts to prepare client js.`);
        this.preparedClientJs = PrepareClientJs.buildClientJs();

        //Services
        Logger.printStartDebugInfo(`Worker with id ${this.id} create service engine.`);
        this.serviceEngine = new ServiceEngine(this.zc);
        await this.serviceEngine.init();

        if(this.zc.isUseErrorInfoTempDb() || this.zc.isUseTokenInfoTempDb())
        {
            Logger.printStartDebugInfo(`Worker with id ${this.id} init temp db.`);
            await this.initTempDb()
        }

        Logger.printStartDebugInfo(`Worker with id ${this.id} prepare a small bag.`);
        this.preparedSmallBag = new SmallBag(this);

        //prepareController
        Logger.printStartDebugInfo(`Worker with id ${this.id} starts to prepare controller.`);
        this.controllerPrepare = new ControllerPrepare(this.zc,this);
        await this.controllerPrepare.prepare();

        Logger.printStartDebugInfo(`Worker with id ${this.id} prepare auth engine part.`);
        this.aePreparedPart = new AEPreparedPart(this.zc,this);

        Logger.printStartDebugInfo(`Worker with id ${this.id} load user background tasks.`);
        this.loadUserBackgroundTasks();

        Logger.printStartDebugInfo(`Worker with id ${this.id} register by master event.`);
        this.registerMasterEvent();

        Logger.printStartDebugInfo(`Worker with id ${this.id} create zation.`);
        this.zation = new Zation(this);

        Logger.printStartDebugInfo(`Worker with id ${this.id} check for authStart.`);
        this.checkAuthStart();

        //Server
        Logger.printStartDebugInfo(`Worker with id ${this.id} start http server.`);
        await this.startHttpServer();

        Logger.printStartDebugInfo(`Worker with id ${this.id} start socket server.`);
        await this.startSocketServer();

        //Fire ExpressEvent
        await this.zc.emitEvent(Const.Event.ZATION_EXPRESS,this.preparedSmallBag,this.app);

        //Fire event is started
        await this.zc.emitEvent
        (Const.Event.ZATION_WORKER_IS_STARTED,this.preparedSmallBag,this.zc.getSomeInformation(),this);
    }

    private async setUpLogInfo()
    {
        this.on('error',(e) =>
        {
            Logger.printWarning(`Worker: '${this.getFullWorkerId()}' has an error: ${e.stack}!`);
        });
    }

    private async startSocketServer()
    {
        this.initSocketMiddleware();
        this.initScServerEvents();

        //START SOCKET SERVER
        this.scServer.on('connection', (socket) => {

            this.initSocketEvents(socket);

            this.zc.emitEvent(Const.Event.SC_SERVER_CONNECTION,socket);

            Logger.printDebugInfo(`Socket with id: ${socket.id} is connected!`);

            socket.on('zationRequest', (data, respond) => {
                // noinspection JSUnusedLocalSymbols
                let p = this.zation.run(
                    {
                        isSocket: true,
                        input: data,
                        socket: socket,
                        respond: respond,
                     });
            });

        });

        await this.zc.emitEvent(Const.Event.ZATION_WS_SERVER_IS_STARTED,this.zc.getSomeInformation());
    }

    private async startHttpServer()
    {
        this.app = express();

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

        // noinspection JSUnresolvedFunction
        this.app.use('/zation/assets', express.static(__dirname + '/../public/assets'));

        // noinspection JSUnresolvedFunction
        this.app.use('/zation/css', express.static(__dirname + '/../public/css'));

        // noinspection JSUnresolvedFunction
        this.app.use('/zation/js', express.static(__dirname + '/../public/js'));

        // noinspection JSUnresolvedFunction
        this.app.use('/zation/panel', express.static(__dirname + '/../public/panel'));

        // noinspection JSUnresolvedFunction
        this.app.get('/zation/client',(req,res) =>
        {
            res.type('.js');
            res.send(this.preparedClientJs);
        });

        //REQUEST

        // noinspection JSUnresolvedFunction
        this.app.all('/zation', (req, res) => {
            //Run Zation
            // noinspection JSUnusedLocalSymbols
            let p = this.zation.run(
                {
                    isSocket: false,
                    res: res,
                    req: req,
                });
        });

        await this.zc.emitEvent(Const.Event.ZATION_HTTP_SERVER_IS_STARTED,this.zc.getSomeInformation());
    }

    getFullWorkerId()
    {
        return `${this.id}.${this.workerStartedTimeStamp}`;
    }

    private initSocketMiddleware()
    {
        this.scServer.addMiddleware(this.scServer.MIDDLEWARE_SUBSCRIBE, (req, next) => {

            if(this.zc.checkMiddlewareEvent(Const.Event.MIDDLEWARE_SUBSCRIBE,req,next))
            {
                // noinspection JSUnresolvedFunction
                let authToken = req.socket.getAuthToken();
                let channel = req.channel;

                if (authToken !== null) {
                    let id = authToken[Const.Settings.CLIENT.USER_ID];
                    let group = authToken[Const.Settings.CLIENT.AUTH_USER_GROUP];

                    if (channel.indexOf(Const.Settings.CHANNEL.USER_CHANNEL_PREFIX) !== -1) {
                        if(id !== undefined)
                        {
                            if (Const.Settings.CHANNEL.USER_CHANNEL_PREFIX + id === channel) {
                                Logger.printDebugInfo(`Socket with id: ${req.socket.id} subscribes user channel ${id}`);
                                next();
                            }
                            else
                            {
                                let err : any = new Error(`User: ${id} can\'t subscribe an other User Channel: ${channel}!`);
                                err.code = 4543;
                                next(err); //Block!

                            }
                        }
                        else
                        {
                            let err : any = new Error(`User: with undefined id can\'t subscribe User Channel: ${channel}!`);
                            err.code = 4542;
                            next(err); //Block!
                        }
                    }
                    else if (channel.indexOf(Const.Settings.CHANNEL.AUTH_USER_GROUP_PREFIX) !== -1) {
                        if(group !== undefined)
                        {
                            if (Const.Settings.CHANNEL.AUTH_USER_GROUP_PREFIX + group === channel)
                            {

                                Logger.printDebugInfo
                                (`Socket with id: ${req.socket.id} subscribes group channel ${group}`);

                                next();
                            }
                            else
                            {
                                let err : any = new Error('User can\'t subscribe an other User Group Channel!');
                                err.code = 4533;
                                next(err); //Block!
                            }
                        }
                        else
                        {
                            let err : any = new Error(`User: with undefined group can\'t subscribe Group Channel!`);
                            err.code = 4532;
                            next(err); //Block!
                        }
                    }
                    else if (channel === Const.Settings.CHANNEL.DEFAULT_USER_GROUP) {
                            let err : any = new Error('Auth User can\' subscribe default User Group Channel!');
                            err.code = 4521;
                            next(err); //Block!
                    }
                    else if (channel.indexOf(Const.Settings.CHANNEL.CUSTOM_ID_CHANNEL_PREFIX) !== -1) {

                        next(ChAccessEngine.checkAccessSubCustomIdCh(req.socket,channel,this.preparedSmallBag,this.zc));

                    }
                    else if (channel.indexOf(Const.Settings.CHANNEL.CUSTOM_CHANNEL_PREFIX) !== -1) {

                        next(ChAccessEngine.checkAccessSubCustomCh(req.socket,channel,this.preparedSmallBag,this.zc));
                    }
                    else if (channel === Const.Settings.CHANNEL.PANEL)
                    {
                        if (authToken[Const.Settings.CLIENT.PANEL_ACCESS] !== undefined &&
                            authToken[Const.Settings.CLIENT.PANEL_ACCESS]) {

                            Logger.printDebugInfo
                            (`Socket with id: ${req.socket.id} subscribes panel channel`);

                            next();
                        }
                        else {
                            let err : any = new Error('User can\'t subscribe panel channel!');
                            err.code = 4502;
                            next(err); //Block!
                        }
                    }
                    else {
                        Logger.printDebugInfo(`Socket with id: ${req.socket.id} subscribes ${channel}`);
                        next();
                    }
                }
                else {
                    if (channel.indexOf(Const.Settings.CHANNEL.USER_CHANNEL_PREFIX) !== -1) {
                        let err : any = new Error('anonymous user can\'t subscribe a User Channel!');
                        err.code = 4541;
                        next(err); //Block!
                    }
                    else if (channel.indexOf(Const.Settings.CHANNEL.AUTH_USER_GROUP_PREFIX) !== -1) {
                        let err : any = new Error('anonymous user can\'t subscribe a User Group Channel!');
                        err.code = 4531;
                        next(err); //Block!
                    }
                    else if (channel === Const.Settings.CHANNEL.DEFAULT_USER_GROUP) {
                        Logger.printDebugInfo(`Socket with id: ${req.socket.id} subscribes default group channel`);
                        next();
                    }
                    else if (channel.indexOf(Const.Settings.CHANNEL.CUSTOM_ID_CHANNEL_PREFIX) !== -1) {

                        next(ChAccessEngine.checkAccessSubCustomIdCh(req.socket,channel,this.preparedSmallBag,this.zc));

                    }
                    else if (channel.indexOf(Const.Settings.CHANNEL.CUSTOM_CHANNEL_PREFIX) !== -1) {

                        next(ChAccessEngine.checkAccessSubCustomCh(req.socket,channel,this.preparedSmallBag,this.zc));
                    }
                    else if(channel === Const.Settings.CHANNEL.PANEL)
                    {
                        let err : any = new Error('anonymous user can\'t subscribe panel Channel!');
                        err.code = 4501;
                        next(err); //Block!
                    }
                    else {
                        Logger.printDebugInfo(`Socket with id: ${req.socket.id} subscribes ${channel}`);
                        next();
                    }
                }
            }
        });

        //BLOCK USER CAN PUBLISH IN ZATION CHANNELS
        this.scServer.addMiddleware(this.scServer.MIDDLEWARE_PUBLISH_IN, (req, next) =>
        {

            let channel = req.channel;

            if(this.zc.checkMiddlewareEvent(Const.Event.MIDDLEWARE_PUBLISH_IN,req,next))
            {
                if (req.channel.indexOf(Const.Settings.CHANNEL.USER_CHANNEL_PREFIX) !== -1) {
                    let err : any = new Error('User can\'t publish in a User Channel!');
                    err.code = 4546;
                    next(err); //Block!
                }
                else if (req.channel.indexOf(Const.Settings.CHANNEL.AUTH_USER_GROUP_PREFIX) !== -1) {
                    let err : any = new Error('User can\'t publish in a User Group Channel!');
                    err.code = 4536;
                    next(err); //Block!
                }
                else if (req.channel === Const.Settings.CHANNEL.ALL) {
                    let err : any = new Error('User can\'t publish in a all Channel!');
                    err.code = 4556;
                    next(err); //Block!
                }
                else if (req.channel === Const.Settings.CHANNEL.DEFAULT_USER_GROUP) {
                    let err : any = new Error('User can\'t publish in default user Group Channel!');
                    err.code = 4526;
                    next(err); //Block!
                }
                else if (req.channel.indexOf(Const.Settings.CHANNEL.CUSTOM_ID_CHANNEL_PREFIX) !== -1) {

                    next(ChAccessEngine.checkAccessPubCustomIdCh(req.socket,channel,this.preparedSmallBag,this.zc));

                }
                else if (req.channel.indexOf(Const.Settings.CHANNEL.CUSTOM_CHANNEL_PREFIX) !== -1) {

                    next(ChAccessEngine.checkAccessPubCustomCh(req.socket,channel,this.preparedSmallBag,this.zc));

                }
                else if(req.channel === Const.Settings.CHANNEL.PANEL)
                {
                    let err : any = new Error('User can\'t publish in panel channel!');
                    err.code = 4506;
                    next(err); //Block!
                }
                else {
                    next();
                }
            }
        });

        //ZATION NEED NOTHING TO DO, ONLY CHECK USER EVENT
        this.scServer.addMiddleware(this.scServer.MIDDLEWARE_PUBLISH_OUT, (req,next) =>
        {
            if(this.zc.checkMiddlewareEvent(Const.Event.MIDDLEWARE_PUBLISH_OUT,req,next))
            {
                next();
            }
        });

        //ZATION NEED NOTHING TO DO, ONLY CHECK USER EVENT
        this.scServer.addMiddleware(this.scServer.MIDDLEWARE_HANDSHAKE_SC, (req,next) =>
        {
            if(this.zc.checkMiddlewareEvent(Const.Event.MIDDLEWARE_HANDSHAKE_SC,req,next))
            {
                next();
            }
        });

        //ZATION NEED NOTHING TO DO, ONLY CHECK USER EVENT
        this.scServer.addMiddleware(this.scServer.MIDDLEWARE_HANDSHAKE_WS, (req,next) =>
        {
            if(this.zc.checkMiddlewareEvent(Const.Event.MIDDLEWARE_HANDSHAKE_WS,req,next))
            {
                next();
            }
        });

        //ZATION NEED NOTHING TO DO, ONLY CHECK USER EVENT
        this.scServer.addMiddleware(this.scServer.MIDDLEWARE_EMIT, (req,next) =>
        {
            if(this.zc.checkMiddlewareEvent(Const.Event.MIDDLEWARE_EMIT,req,next))
            {
                next();
            }
        });

        //ZATION CHECK TOKEN IS BLOCKED, ONLY CHECK USER EVENT
        // noinspection JSUnresolvedVariable
        this.scServer.addMiddleware(this.scServer.MIDDLEWARE_AUTHENTICATE, (req,next) =>
        {
            if(this.zc.checkMiddlewareEvent(Const.Event.MIDDLEWARE_AUTHENTICATE,req,next))
            {
                if(this.zc.isExtraSecureAuth())
                {
                    // noinspection JSUnresolvedVariable
                    let token = req.authToken;
                    this.getTempDbUp().isTokenUnblocked(token[Const.Settings.CLIENT.TOKEN_ID]).then((valid) =>
                    {
                        if(!valid)
                        {
                            req.socket.emit('zationBadAuthToken',{});
                            req.socket.deauthenticate();
                            let err = new Error('Token is blocked');
                            next(err,true);
                        }
                        else
                        {
                            next();
                        }
                    }
                    ).catch((e) =>
                    {
                        next(e);
                    });
                }
                else
                {
                    next();
                }
            }
        });
    }

    private initScServerEvents()
    {
        this.scServer.on('error', async (err) =>
        {
            await this.zc.emitEvent(Const.Event.SC_SERVER_ERROR,err);
        });

        this.scServer.on('notice', async (note) =>
        {
            await this.zc.emitEvent(Const.Event.SC_SERVER_NOTICE,note);
        });

        this.scServer.on('handshake', async (socket) =>
        {
            await this.zc.emitEvent(Const.Event.SC_SERVER_HANDSHAKE,socket);
        });

        this.scServer.on('connectionAbort', async (socket) =>
        {
            await this.zc.emitEvent(Const.Event.SC_SERVER_CONNECTION_ABORT,socket);
        });

        this.scServer.on('disconnection', async (socket) =>
        {
            await this.zc.emitEvent(Const.Event.SC_SERVER_DISCONNECTION,socket);
        });

        this.scServer.on('closure', async (socket) =>
        {
            await this.zc.emitEvent(Const.Event.SC_SERVER_CLOSURE,socket);
        });

        this.scServer.on('subscription', async (socket) =>
        {
            await this.zc.emitEvent(Const.Event.SC_SERVER_SUBSCRIPTION,socket);
        });

        this.scServer.on('unsubscription', async (socket) =>
        {
            await this.zc.emitEvent(Const.Event.SC_SERVER_UNSUBSCRIPTION,socket);
        });

        this.scServer.on('authentication', async (socket) =>
        {
            await this.zc.emitEvent(Const.Event.SC_SERVER_AUTHENTICATION,socket);
        });

        this.scServer.on('deauthentication', async (socket) =>
        {
            await this.zc.emitEvent(Const.Event.SC_SERVER_DEAUTHENTICATION,socket);
        });

        this.scServer.on('badSocketAuthToken', async (socket) =>
        {
            socket.emit('zationBadAuthToken',{});
            await this.zc.emitEvent(Const.Event.SC_SERVER_BAD_SOCKET_AUTH_TOKEN,socket);
        });

    }

    private initSocketEvents(socket)
    {
        socket.on('error', async (err) =>
        {
            await this.zc.emitEvent(Const.Event.SOCKET_ERROR,socket,err);
        });

        socket.on('raw', async () =>
        {
            await this.zc.emitEvent(Const.Event.SOCKET_RAW,socket);
        });

        socket.on('connect', async (scCon) =>
        {
            // noinspection JSUnresolvedFunction
            if(this.zc.isUseTokenInfoTempDb() && socket.getAuthToken() !== null)
            {
                //todo
                //await this.tempDbUp.tokenDisconnected()
            }
            await this.zc.emitEvent(Const.Event.SOCKET_CONNECT,socket,scCon);
        });

        socket.on('disconnect', async () =>
        {
            await this.zc.emitEvent(Const.Event.SOCKET_DISCONNECT,socket);
        });

        socket.on('connectAbort', async () =>
        {
            await this.zc.emitEvent(Const.Event.SOCKET_CONNECT_ABORT,socket);
        });

        socket.on('close', async () =>
        {
            // noinspection JSUnresolvedFunction
            let authToken = socket.getAuthToken();
            if(this.zc.isUseTokenInfoTempDb() && authToken !== null)
            {
                await this.tempDbUp.tokenDisconnected(authToken[Const.Settings.CLIENT.TOKEN_ID])
            }
            await this.zc.emitEvent(Const.Event.SOCKET_CLOSE,socket);
        });

        socket.on('subscribe', async () =>
        {
            await this.zc.emitEvent(Const.Event.SOCKET_SUBSCRIBE,socket);
        });

        socket.on('unsubscribe', async () =>
        {
            await this.zc.emitEvent(Const.Event.SOCKET_UNSUBSCRIBE,socket);
        });

        socket.on('badAuthToken', async (arg) =>
        {
            await this.zc.emitEvent(Const.Event.SOCKET_BAD_AUTH_TOKEN,socket,arg);
        });

        socket.on('authenticate', async (token) =>
        {
            await this.zc.emitEvent(Const.Event.SOCKET_AUTHENTICATE,socket,token);
        });

        socket.on('deauthenticate', async (token) =>
        {
            await this.zc.emitEvent(Const.Event.SOCKET_DEAUTHENTICATE,socket,token);
        });

        socket.on('message', async (msg) =>
        {
            await this.zc.emitEvent(Const.Event.SOCKET_MESSAGE,socket,msg);
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

    private async initTempDb()
    {
        if(this.zc.getMain(Const.Main.KEYS.TEMP_DB_ENGINE) === Const.Main.TEMP_DB_ENGINE.MASTER_MEMORY)
        {
            this.tempDbUp = new TempDbLevelDown(this,this.zc);
            await this.tempDbUp.init();
        }
        else if(this.zc.getMain(Const.Main.KEYS.TEMP_DB_ENGINE) === Const.Main.TEMP_DB_ENGINE.MONGO)
        {
            this.tempDbUp = new TempDbMongoDown(this.zc);
            await this.tempDbUp.init();
        }

        if(this.zc.getMain(Const.Main.KEYS.USE_TEMP_DB_TOKEN_INFO))
        {
            this.addSystemBackgroundTask(async() =>
            {
                await SystemBackgroundTask.checkTokenInfoTempDb(this.tempDbUp);
            });
        }

        if(this.zc.getMain(Const.Main.KEYS.USE_TEMP_DB_ERROR_INFO))
        {
            this.addSystemBackgroundTask(async() =>
            {
                await SystemBackgroundTask.checkErrorInfoTempDb(this.tempDbUp);
            });
        }
    }

    private registerMasterEvent()
    {
        this.on('masterMessage',async (data,respond) =>
        {
            if(data['userBackgroundTask'] !== undefined)
            {
                let id = data['userBackgroundTask'];

                if(this.userBackgroundTasks.hasOwnProperty(id))
                {
                    await this.invokeUserBackgroundTask(this.userBackgroundTasks[id]);
                }
            }
            else if(data['systemBackgroundTasks'] !== undefined && data['systemBackgroundTasks'])
            {
                for(let i = 0; i < this.systemBackgroundTasks.length; i++)
                {
                    this.invokeSystemBackgroundTask(this.systemBackgroundTasks[i]);
                }
            }
            respond(null);
        });
    }

    private addSystemBackgroundTask(func)
    {
        this.systemBackgroundTasks.push(func);
    }

    private async invokeUserBackgroundTask(task)
    {
        if(task !== undefined)
        {
            await FuncTools.emitEvent(task,this.preparedSmallBag);
        }
    }

    private invokeSystemBackgroundTask(task)
    {
        if(task !== undefined && typeof task === 'function')
        {
            task(this);
        }
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
        if(this.zc.getMain(Const.Main.KEYS.AUTH_START))
        {
            this.authStartActive = true;
            setTimeout(() =>
            {
                this.authStartActive = false;
            },this.zc.getMain(Const.Main.KEYS.AUTH_START_DURATION_MS));
        }
    }

    getTempDbUp() : TempDbUp
    {
        return this.tempDbUp;
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

    getControllerPrepare() : ControllerPrepare
    {
        return this.controllerPrepare;
    }

    // noinspection JSUnusedGlobalSymbols
    getServiceEngine() : ServiceEngine
    {
        return this.serviceEngine;
    }

}

new ZationWorker();

export = ZationWorker;