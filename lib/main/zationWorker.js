/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

const SCWorker              = require('socketcluster/scworker');
const express               = require('express');
const cookieParser          = require('cookie-parser');
const bodyParser            = require('body-parser');
const fileUpload            = require('express-fileupload');

const Zation                = require('./zation');
const ZationConfig          = require('./zationConfig');
const ConfigPreCompiler     = require('./../helper/config/configPreCompiler');
const Logger                = require('./../helper/logger/logger');
const Const                 = require('../helper/constants/constWrapper');
const ChAccessEngine        = require('../helper/channel/chAccessEngine');
const ServiceEngine         = require('../helper/services/serviceEngine');
const SystemBackgroundTask  = require('../helper/background/systemBackgroundTasks');
const SmallBag              = require('../api/SmallBag');
const PrepareClientJs       = require('../client/prepareClientJs');
const AEPreparedPart        = require('./../helper/auth/aePreparedPart');

const TempDbMongoDown       = require('../helper/tempDb/tempDbMongoDown');
const TempDbLevelDown       = require('../helper/tempDb/tempDbMemoryDown');

class Worker extends SCWorker
{
    // noinspection JSUnusedGlobalSymbols
    async run()
    {
        //BackgroundStuff
        this._systemBackgroundTasks = [];
        this._userBackgroundTasks = {};

        this._workerStartedTimeStamp = Date.now();
        this._serverStartedTimeStamp = this.options.zationServerStartedTimeStamp;
        this._serverVersion = this.options.zationServerVersion;

        let zcOptions = this.options.zationConfigWorkerTransport;

        this._zc = new ZationConfig(zcOptions.mainConfig,true);
        
        //setLogger
        Logger._zc = this._zc;

        Logger.printStartDebugInfo(`Worker with id ${this.id} begin start process!`);

        Logger.printStartDebugInfo(`Worker with id ${this.id} load other zation config files.`);

        this._zc.loadOtherConfigs();

        Logger.printStartDebugInfo(`Worker with id ${this.id} preCompile configs!`);

        let preCompiler = new ConfigPreCompiler(this._zc);
        preCompiler.preCompile();

        Logger.printStartDebugInfo(`Worker with id ${this.id} starts to prepare client js.`);
        this._preparedClientJs = PrepareClientJs.buildClientJs();

        //Services
        Logger.printStartDebugInfo(`Worker with id ${this.id} create service engine.`);
        this._servieceEngine = new ServiceEngine(this._zc);
        await this._servieceEngine.init();

        if(this._zc.isUseErrorInfoTempDb() || this._zc.isUseTokenInfoTempDb())
        {
            Logger.printStartDebugInfo(`Worker with id ${this.id} init temp db.`);
            await this._initTempDb()
        }

        Logger.printStartDebugInfo(`Worker with id ${this.id} prepare a small bag.`);
        this._preapreSmallBag = new SmallBag(this);

        Logger.printStartDebugInfo(`Worker with id ${this.id} prepare auth engine part.`);
        this._aePreparedPart = new AEPreparedPart(this._zc,this);

        Logger.printStartDebugInfo(`Worker with id ${this.id} load user background tasks.`);
        this._loadUserBackgroundTasks();

        Logger.printStartDebugInfo(`Worker with id ${this.id} register by master event.`);
        this._registerMasterEvent();

        Logger.printStartDebugInfo(`Worker with id ${this.id} create zation.`);
        this.zation = new Zation(this);

        Logger.printStartDebugInfo(`Worker with id ${this.id} check for authStart.`);
        this._checkAuthStart();

        //Server
        Logger.printStartDebugInfo(`Worker with id ${this.id} start http server.`);
        this._startHttpServer();

        Logger.printStartDebugInfo(`Worker with id ${this.id} start socket server.`);
        this._startSocketServer();

        //Fire ExpressEvent
        this._zc.emitEvent(Const.Event.ZATION_EXPRESS,
            (f) => {f(this._preapreSmallBag,this._app);});

        //Fire event is started
        this._zc.emitEvent(Const.Event.ZATION_WORKER_IS_STARTED,
            (f) => {f(this._preapreSmallBag,this._zc.getSomeInformation(),this)});
    }

    _startSocketServer()
    {
        this._initSocketMiddleware();
        this._initScServerEvents();

        //START SOCKET SERVER
        this.scServer.on('connection', (socket) => {

            this._initSocketEvents(socket);

            this._zc.emitEvent(Const.Event.SC_SERVER_CONNECTION,
                (f) => {f(socket);});

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

        this._zc.emitEvent(Const.Event.ZATION_SOCKET_SERVER_IS_STARTED,
            (f) => {f(this._zc.getSomeInformation())});
    }

    _startHttpServer()
    {
        this._app = express();
        //startCookieParser
        // noinspection JSUnresolvedFunction
        this._app.use(cookieParser());
        //FileParser
        // noinspection JSUnresolvedFunction
        this._app.use(fileUpload());
        //BodyParser
        // noinspection JSUnresolvedFunction
        this._app.use(bodyParser.json());
        // noinspection JSUnresolvedFunction
        this._app.use(bodyParser.urlencoded({extended: true}));

        //Set Server
        this.httpServer.on('request', this._app);

        //PUBLIC FOLDER

        // noinspection JSUnresolvedFunction
        this._app.use('/zation/assets', express.static(__dirname + '/../public/assets'));

        // noinspection JSUnresolvedFunction
        this._app.use('/zation/css', express.static(__dirname + '/../public/css'));

        // noinspection JSUnresolvedFunction
        this._app.use('/zation/js', express.static(__dirname + '/../public/js'));

        // noinspection JSUnresolvedFunction
        this._app.use('/zation/panel', express.static(__dirname + '/../public/panel'));

        // noinspection JSUnresolvedFunction
        this._app.get('/zation/client',(req,res) =>
        {
            res.type('.js');
            res.send(this._preparedClientJs);
        });

        //REQUEST

        // noinspection JSUnresolvedFunction
        this._app.all('/zation', (req, res) => {
            //Run Zation
            // noinspection JSUnusedLocalSymbols
            let p = this.zation.run(
                {
                    isSocket: false,
                    res: res,
                    req: req,
                });
        });

        this._zc.emitEvent(Const.Event.ZATION_HTTP_SERVER_IS_STARTED,
            (f) => {f(this._zc.getSomeInformation())});
    }

    _getFullWorkerId()
    {
        return `${this.id}.${this._workerStartedTimeStamp}`;
    }

    _initSocketMiddleware()
    {
        this.scServer.addMiddleware(this.scServer.MIDDLEWARE_SUBSCRIBE, (req, next) => {

            if(this._zc.checkMiddlewareEvent(Const.Event.MIDDLEWARE_SUBSCRIBE,req,next))
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
                                let err = new Error(`User: ${id} can\'t subscribe an other User Channel: ${channel}!`);
                                err.code = 4543;
                                next(err); //Block!

                            }
                        }
                        else
                        {
                            let err = new Error(`User: with undefined id can\'t subscribe User Channel: ${channel}!`);
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
                                let err = new Error('User can\'t subscribe an other User Group Channel!');
                                err.code = 4533;
                                next(err); //Block!
                            }
                        }
                        else
                        {
                            let err = new Error(`User: with undefined group can\'t subscribe Group Channel!`);
                            err.code = 4532;
                            next(err); //Block!
                        }
                    }
                    else if (channel === Const.Settings.CHANNEL.DEFAULT_USER_GROUP) {
                            let err = new Error('Auth User can\' subscribe default User Group Channel!');
                            err.code = 4521;
                            next(err); //Block!
                    }
                    else if (channel.indexOf(Const.Settings.CHANNEL.CUSTOM_ID_CHANNEL_PREFIX) !== -1) {

                        next(ChAccessEngine.checkAccessSubCustomIdCh(req.socket,channel,this._preapreSmallBag,this._zc));

                    }
                    else if (channel.indexOf(Const.Settings.CHANNEL.CUSTOM_CHANNEL_PREFIX) !== -1) {

                        next(ChAccessEngine.checkAccessSubCustomCh(req.socket,channel,this._preapreSmallBag,this._zc));
                    }
                    else if (channel === Const.Settings.CHANNEL.PANNEL)
                    {
                        if (authToken[Const.Settings.CLIENT.PANEL_ACCESS] !== undefined &&
                            authToken[Const.Settings.CLIENT.PANEL_ACCESS]) {

                            Logger.printDebugInfo
                            (`Socket with id: ${req.socket.id} subscribes panel channel`);

                            next();
                        }
                        else {
                            let err = new Error('User can\'t subscribe panel channel!');
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
                        let err = new Error('anonymous user can\'t subscribe a User Channel!');
                        err.code = 4541;
                        next(err); //Block!
                    }
                    else if (channel.indexOf(Const.Settings.CHANNEL.AUTH_USER_GROUP_PREFIX) !== -1) {
                        let err = new Error('anonymous user can\'t subscribe a User Group Channel!');
                        err.code = 4531;
                        next(err); //Block!
                    }
                    else if (channel === Const.Settings.CHANNEL.DEFAULT_USER_GROUP) {
                        Logger.printDebugInfo(`Socket with id: ${req.socket.id} subscribes default group channel`);
                        next();
                    }
                    else if (channel.indexOf(Const.Settings.CHANNEL.CUSTOM_ID_CHANNEL_PREFIX) !== -1) {

                        next(ChAccessEngine.checkAccessSubCustomIdCh(req.socket,channel,this._preapreSmallBag,this._zc));

                    }
                    else if (channel.indexOf(Const.Settings.CHANNEL.CUSTOM_CHANNEL_PREFIX) !== -1) {

                        next(ChAccessEngine.checkAccessSubCustomCh(req.socket,channel,this._preapreSmallBag,this._zc));
                    }
                    else if(channel === Const.Settings.CHANNEL.PANNEL)
                    {
                        let err = new Error('anonymous user can\'t subscribe panel Channel!');
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
        this.scServer.addMiddleware(this.scServer.MIDDLEWARE_PUBLISH_IN, (req, next) => {

            if(this._zc.checkMiddlewareEvent(Const.Event.MIDDLEWARE_PUBLISH_IN,req,next))
            {
                if (req.channel.indexOf(Const.Settings.CHANNEL.USER_CHANNEL_PREFIX) !== -1) {
                    let err = new Error('User can\'t publish in a User Channel!');
                    err.code = 4546;
                    next(err); //Block!
                }
                else if (req.channel.indexOf(Const.Settings.CHANNEL.AUTH_USER_GROUP_PREFIX) !== -1) {
                    let err = new Error('User can\'t publish in a User Group Channel!');
                    err.code = 4536;
                    next(err); //Block!
                }
                else if (req.channel === Const.Settings.CHANNEL.ALL) {
                    let err = new Error('User can\'t publish in a all Channel!');
                    err.code = 4556;
                    next(err); //Block!
                }
                else if (req.channel === Const.Settings.CHANNEL.DEFAULT_USER_GROUP) {
                    let err = new Error('User can\'t publish in default user Group Channel!');
                    err.code = 4526;
                    next(err); //Block!
                }
                else if (req.channel.indexOf(Const.Settings.CHANNEL.CUSTOM_ID_CHANNEL_PREFIX) !== -1) {

                    next(ChAccessEngine.checkAccessPubCustomIdCh(req.socket,channel,this._preapreSmallBag,this._zc));

                }
                else if (req.channel.indexOf(Const.Settings.CHANNEL.CUSTOM_CHANNEL_PREFIX) !== -1) {

                    next(ChAccessEngine.checkAccessPubCustomCh(req.socket,channel,this._preapreSmallBag,this._zc));

                }
                else if(req.channel === Const.Settings.CHANNEL.PANNEL)
                {
                    let err = new Error('User can\'t publish in panel channel!');
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
            if(this._zc.checkMiddlewareEvent(Const.Event.MIDDLEWARE_PUBLISH_OUT,req,next))
            {
                next();
            }
        });

        //ZATION NEED NOTHING TO DO, ONLY CHECK USER EVENT
        this.scServer.addMiddleware(this.scServer.MIDDLEWARE_HANDSHAKE_SC, (req,next) =>
        {
            if(this._zc.checkMiddlewareEvent(Const.Event.MIDDLEWARE_HANDSHAKE_SC,req,next))
            {
                next();
            }
        });

        //ZATION NEED NOTHING TO DO, ONLY CHECK USER EVENT
        this.scServer.addMiddleware(this.scServer.MIDDLEWARE_HANDSHAKE_WS, (req,next) =>
        {
            if(this._zc.checkMiddlewareEvent(Const.Event.MIDDLEWARE_HANDSHAKE_WS,req,next))
            {
                next();
            }
        });

        //ZATION NEED NOTHING TO DO, ONLY CHECK USER EVENT
        this.scServer.addMiddleware(this.scServer.MIDDLEWARE_EMIT, (req,next) =>
        {
            if(this._zc.checkMiddlewareEvent(Const.Event.MIDDLEWARE_EMIT,req,next))
            {
                next();
            }
        });

        //ZATION CHECK TOKEN IS BLOCKED, ONLY CHECK USER EVENT
        // noinspection JSUnresolvedVariable
        this.scServer.addMiddleware(this.scServer.MIDDLEWARE_AUTHENTICATE, (req,next) =>
        {
            if(this._zc.checkMiddlewareEvent(Const.Event.MIDDLEWARE_AUTHENTICATE,req,next))
            {
                if(this._zc.isExtraSecureAuth())
                {
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

    _initScServerEvents()
    {
        this.scServer.on('error', (err) =>
        {
            this._zc.emitEvent(Const.Event.SC_SERVER_ERROR,(f) => {f(err);});
        });

        this.scServer.on('notice', (note) =>
        {
            this._zc.emitEvent(Const.Event.SC_SERVER_NOTICE,(f) => {f(note);});
        });

        this.scServer.on('handshake', (socket) =>
        {
            this._zc.emitEvent(Const.Event.SC_SERVER_HANDSHAKE,(f) => {f(socket);});
        });

        this.scServer.on('connectionAbort', (socket) =>
        {
            this._zc.emitEvent(Const.Event.SC_SERVER_CONNECTION_ABORT,(f) => {f(socket);});
        });

        this.scServer.on('disconnection', (socket) =>
        {
            this._zc.emitEvent(Const.Event.SC_SERVER_DISCONNECTION,(f) => {f(socket);});
        });

        this.scServer.on('closure', (socket) =>
        {
            this._zc.emitEvent(Const.Event.SC_SERVER_CLOSURE,(f) => {f(socket);});
        });

        this.scServer.on('subscription', (socket) =>
        {
            this._zc.emitEvent(Const.Event.SC_SERVER_SUBSCRIPTION,(f) => {f(socket);});
        });

        this.scServer.on('unsubscription', (socket) =>
        {
            this._zc.emitEvent(Const.Event.SC_SERVER_UNSUBSCRIPTION,(f) => {f(socket);});
        });

        this.scServer.on('authentication', (socket) =>
        {
            this._zc.emitEvent(Const.Event.SC_SERVER_AUTHENTICATION,(f) => {f(socket);});
        });

        this.scServer.on('deauthentication', (socket) =>
        {
            this._zc.emitEvent(Const.Event.SC_SERVER_DEAUTHENTICATION,(f) => {f(socket);});
        });

        this.scServer.on('badSocketAuthToken', (socket) =>
        {
            socket.emit('zationBadAuthToken',{});
            this._zc.emitEvent(Const.Event.SC_SERVER_BAD_SOCKET_AUTH_TOKEN,(f) => {f(socket);});
        });

    }

    _initSocketEvents(socket)
    {
        socket.on('error', (err) =>
        {
            this._zc.emitEvent(Const.Event.SOCKET_ERROR,(f) => {f(socket,err);});
        });

        socket.on('raw', () =>
        {
            this._zc.emitEvent(Const.Event.SOCKET_RAW,(f) => {f(socket);});
        });

        socket.on('connect', async (scCon) =>
        {
            if(this._zc.isUseTokenInfoTempDb() && socket.getAuthToken() !== null)
            {
                await this._tempDbUp.tokenDisconnected()
            }
            this._zc.emitEvent(Const.Event.SOCKET_CONNECT,(f) => {f(socket,scCon);});
        });

        socket.on('disconnect', () =>
        {
            this._zc.emitEvent(Const.Event.SOCKET_DISCONNECT,(f) => {f(socket);});
        });

        socket.on('connectAbort', () =>
        {
            this._zc.emitEvent(Const.Event.SOCKET_CONNECT_ABORT,(f) => {f(socket);});
        });

        socket.on('close', async () =>
        {
            let authToken = socket.getAuthToken();
            if(this._zc.isUseTokenInfoTempDb() && authToken !== null)
            {
                await this._tempDbUp.tokenDisconnected(authToken[Const.Settings.CLIENT.TOKEN_ID])
            }
            this._zc.emitEvent(Const.Event.SOCKET_CLOSE,(f) => {f(socket);});
        });

        socket.on('subscribe', () =>
        {
            this._zc.emitEvent(Const.Event.SOCKET_SUBSCRIBE,(f) => {f(socket);});
        });

        socket.on('unsubscribe', () =>
        {
            this._zc.emitEvent(Const.Event.SOCKET_UNSUBSCRIBE,(f) => {f(socket);});
        });

        socket.on('badAuthToken', (arg) =>
        {
            this._zc.emitEvent(Const.Event.SOCKET_BAD_AUTH_TOKEN,(f) => {f(socket,arg);});
        });

        socket.on('authenticate', (token) =>
        {
            this._zc.emitEvent(Const.Event.SOCKET_AUTHENTICATE,(f) => {f(socket,token);});
        });

        socket.on('deauthenticate', (token) =>
        {
            this._zc.emitEvent(Const.Event.SOCKET_DEAUTHENTICATE,(f) => {f(socket,token);});
        });

        socket.on('message', (msg) =>
        {
            this._zc.emitEvent(Const.Event.SOCKET_MESSAGE,(f) => {f(socket,msg);});
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

    async _initTempDb()
    {
        if(this._zc.getMain(Const.Main.KEYS.TEMP_DB_ENGINE) === Const.Main.TEMP_DB_ENGINE.MASTER_MEMORY)
        {
            this._tempDbUp = new TempDbLevelDown(this,this._zc);
            await this._tempDbUp.init();
        }
        else if(this._zc.getMain(Const.Main.KEYS.TEMP_DB_ENGINE) === Const.Main.TEMP_DB_ENGINE.MONGO)
        {
            this._tempDbUp = new TempDbMongoDown(this._zc);
            await this._tempDbUp.init();
        }

        if(this._zc.getMain(Const.Main.KEYS.USE_TEMP_DB_TOKEN_INFO))
        {
            this._addSystemBackgroundTask(async() =>
            {
                await SystemBackgroundTask.checkTokenInfoTempDb(this._tempDbUp);
            });
        }

        if(this._zc.getMain(Const.Main.KEYS.USE_TEMP_DB_ERROR_INFO))
        {
            this._addSystemBackgroundTask(async() =>
            {
                await SystemBackgroundTask.checkErrorInfoTempDb(this._tempDbUp);
            });
        }
    }

    _registerMasterEvent()
    {
        this.on('masterMessage',(data,respond) =>
        {
            if(data['userBackgroundTask'] !== undefined)
            {
                let id = data['userBackgroundTask'];

                if(this._userBackgroundTasks.hasOwnProperty(id))
                {
                    this._invokeUserBackgroundTask(this._userBackgroundTasks[id]);
                }
            }
            else if(data['systemBackgroundTasks'] !== undefined && data['systemBackgroundTasks'])
            {
                for(let i = 0; i < this._systemBackgroundTasks.length; i++)
                {
                    this._invokeSystemBackgroundTask(this._systemBackgroundTasks[i]);
                }
            }
            respond(null);
        });
    }

    _addSystemBackgroundTask(func)
    {
        this._systemBackgroundTasks.push(func);
    }

    _invokeUserBackgroundTask(task)
    {
        if(task !== undefined && typeof task === 'function')
        {
            task(this._preapreSmallBag);
        }
    }

    _invokeSystemBackgroundTask(task)
    {
        if(task !== undefined && typeof task === 'function')
        {
            task(this);
        }
    }

    _loadUserBackgroundTasks()
    {
        this._zc.emitEvent(Const.Event.ZATION_BACKGROUND_TASK,(f) =>
        {
            let id = 0;
            f(
                //EveryTask
                (time,task) =>
                {
                    this._userBackgroundTasks[id] = task;
                    id++;
                },
                //AtTask
                (time,task) =>
                {
                    this._userBackgroundTasks[id] = task;
                    id++;
                }
            );
        });
    }

    _checkAuthStart()
    {
        if(this._zc.getMain(Const.Main.KEYS.AUTH_START))
        {
            this._authStartActive = true;
            setTimeout(() =>
            {
                this._authStartActive = false;
            },this._zc.getMain(Const.Main.KEYS.AUTH_START_DURATION_MS));
        }
    }

    getTempDbUp()
    {
        return this._tempDbUp;
    }

    getZationConfig()
    {
        return this._zc;
    }

    getPreparedSmallBag()
    {
        return this._preapreSmallBag;
    }

    getAEPreparedPart()
    {
        return this._aePreparedPart;
    }

    // noinspection JSUnusedGlobalSymbols
    getServiceEngine()
    {
        return this._serviceEngine;
    }
    
}

new Worker();