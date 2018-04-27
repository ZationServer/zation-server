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
const Const                 = require('../helper/constante/constWrapper');
const ChAccessEngine        = require('../helper/channel/chAccessEngine');
const ServiceEngine         = require('../helper/services/serviceEngine');
const TokenInfoStorage      = require('../helper/token/tokenInfoStorage');
const MasterStorage         = require('../helper/storage/masterStorage');
const SystemBackgroundTask  = require('../helper/background/systemBackgroundTasks');
const SmallBag              = require('../api/SmallBag');
const PrepareClientJs       = require('./../helper/tools/prepareClientJs');

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

        this._zc.printStartDebugInfo(`Worker with id ${this.id} begin start process!`);

        this._zc.printStartDebugInfo(`Worker with id ${this.id} load other zation config files.`);

        this._zc.loadOtherConfigs();

        this._zc.printStartDebugInfo(`Worker with id ${this.id} starts to prepare client js.`);
        this._preparedClientJs = PrepareClientJs.buildClientJs();

        //Services
        this._zc.printStartDebugInfo(`Worker with id ${this.id} create service engine.`);
        this._servieceEngine = new ServiceEngine(this._zc);
        await this._servieceEngine.init();

        if(this._zc.isExtraSecureAuth())
        {
            this._zc.printStartDebugInfo(`Worker with id ${this.id} init token info storage.`);
            await this._initTokenInfoStorage();
        }

        this._zc.printStartDebugInfo(`Worker with id ${this.id} prepare a small bag.`);
        this._preapreSmallBag = new SmallBag(this);

        this._zc.printStartDebugInfo(`Worker with id ${this.id} load user background tasks.`);
        this._loadUserBackgroundTasks();

        this._zc.printStartDebugInfo(`Worker with id ${this.id} register by master event.`);
        this._registerMasterEvent();

        this._zc.printStartDebugInfo(`Worker with id ${this.id} create zation.`);
        this.zation = new Zation(this);

        //Server
        if (this._zc.getMain(Const.Main.USE_HTTP_SERVER))
        {
            this._zc.printStartDebugInfo(`Worker with id ${this.id} start http server.`);
            this._startHttpServer();
        }
        if (this._zc.getMain(Const.Main.USE_SOCKET_SERVER))
        {
            this._zc.printStartDebugInfo(`Worker with id ${this.id} start socket server.`);
            this._startSocketServer();
        }

        //Fire ExpressEvent
        if (this._zc.getMain(Const.Main.USE_HTTP_SERVER))
        {
            this._zc.emitEvent(Const.Event.ZATION_EXPRESS,
                (f) => {f(this._preapreSmallBag,this._app);});
        }

        //

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

            this._zc.printDebugInfo(`Socket with id: ${socket.id} is connected!`);

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

            socket.on('zationHeartbeat', async (data,respond) =>
            {
                let token = socket.getToken();
                if(token !== null)
                {
                    await this._tokenInfoStorage.setLastActivity(token);
                    respond();
                }
            })

        });

        this._zc.emitEvent(Const.Event.ZATION_SOCKET_SERVER_IS_STARTED,
            (f) => {f(this._zc.getSomeInformation())});
    }

    _startHttpServer()
    {
        let path = this._zc.getMain(Const.Main.PATH);

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
        this._app.use(`/${path}/assets`, express.static(__dirname + '/../public/assets'));

        // noinspection JSUnresolvedFunction
        this._app.use(`/${path}/css`, express.static(__dirname + '/../public/css'));

        // noinspection JSUnresolvedFunction
        this._app.use(`/${path}/js`, express.static(__dirname + '/../public/js'));

        // noinspection JSUnresolvedFunction
        this._app.use(`/${path}/panel`, express.static(__dirname + '/../public/panel'));

        // noinspection JSUnresolvedFunction
        this._app.get(`/${path}/client`,(req,res) =>
        {
            res.type('.js');
            res.send(this._preparedClientJs);
        });

        //REQUEST

        // noinspection JSUnresolvedFunction
        this._app.all(`/${path}`, (req, res) => {
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
        //BLOCK SUBSCRIBE FROM OTHER USER CHANNELS
        this.scServer.addMiddleware(this.scServer.MIDDLEWARE_SUBSCRIBE, (req, next) => {

            if(this._zc.checkMiddlewareEvent(Const.Event.MIDDLEWARE_SUBSCRIBE,req,next))
            {
                // noinspection JSUnresolvedFunction
                let authToken = req.socket.getAuthToken();
                let channel = req.channel;

                if (authToken !== null) {
                    let id = authToken[Const.Settings.CLIENT_AUTH_ID];
                    let group = authToken[Const.Settings.CLIENT_AUTH_GROUP];

                    if (id !== undefined && channel.indexOf(Const.Settings.CHANNEL_USER_CHANNEL_PREFIX) !== -1) {
                        if (Const.Settings.CHANNEL_USER_CHANNEL_PREFIX + id === channel) {
                            this._zc.printDebugInfo(`Socket with id: ${req.socket.id} subscribes user channel ${id}`);
                            next();
                        }
                        else {
                            let err = new Error(`User: ${id} can\'t subscribe an other User Channel: ${channel}!`);
                            err.code = 4502;
                            next(err); //Block!
                        }
                    }
                    else if (group !== undefined && channel.indexOf(Const.Settings.CHANNEL_AUTH_GROUP_PREFIX) !== -1) {
                        if (Const.Settings.CHANNEL_AUTH_GROUP_PREFIX + group === channel) {

                            this._zc.printDebugInfo
                            (`Socket with id: ${req.socket.id} subscribes group channel ${group}`);

                            next();
                        }
                        else {
                            let err = new Error('User can\'t subscribe an other User Group Channel!');
                            err.code = 4522;
                            next(err); //Block!
                        }
                    }
                    else if (group !== undefined && channel === Const.Settings.CHANNEL_DEFAULT_GROUP) {
                            let err = new Error('Auth User can\' subscribe default User Group Channel!');
                            err.code = 4523;
                            next(err); //Block!
                    }
                    else if (channel.indexOf(Const.Settings.CHANNEL_SPECIAL_CHANNEL_PREFIX) !== -1) {
                        let chName = ChAccessEngine.getSpecialChannelName(channel);
                        if (ChAccessEngine.hasAccessToSubSpecialChannel(req.socket, chName)) {

                            this._zc.printDebugInfo
                            (`Socket with id: ${req.socket.id} subscribes special channel ${chName}`);

                            next();
                        }
                        else {
                            let err = new Error('No access to sub this special channel!');
                            err.code = 4524;
                            next(err); //Block!
                        }
                    }
                    else {
                        this._zc.printDebugInfo(`Socket with id: ${req.socket.id} subscribes ${channel}`);
                        next();
                    }
                }
                else {
                    if (channel.indexOf(Const.Settings.CHANNEL_USER_CHANNEL_PREFIX) !== -1) {
                        let err = new Error('anonymous user can\'t subscribe a User Channel!');
                        err.code = 4501;
                        next(err); //Block!
                    }
                    else if (channel.indexOf(Const.Settings.CHANNEL_AUTH_GROUP_PREFIX) !== -1) {
                        let err = new Error('anonymous user can\'t subscribe a User Group Channel!');
                        err.code = 4511;
                        next(err); //Block!
                    }
                    else if (channel === Const.Settings.CHANNEL_DEFAULT_GROUP) {
                        this._zc.printDebugInfo(`Socket with id: ${req.socket.id} subscribes default group channel`);
                        next();
                    }
                    else if (channel.indexOf(Const.Settings.CHANNEL_SPECIAL_CHANNEL_PREFIX) !== -1) {
                        let chName = ChAccessEngine.getSpecialChannelName(channel);
                        if (ChAccessEngine.hasAccessToSubSpecialChannel(req.socket, chName)) {

                            this._zc.printDebugInfo
                            (`Socket with id: ${req.socket.id} subscribes special channel ${chName}`);

                            next();
                        }
                        else {
                            let err = new Error('No access to sub this special channel!');
                            err.code = 4524;
                            next(err); //Block!
                        }
                    }
                    else {
                        this._zc.printDebugInfo(`Socket with id: ${req.socket.id} subscribes ${channel}`);
                        next();
                    }
                }
            }
        });

        //BLOCK USER CAN PUBLISH IN CATION CHANNELS
        this.scServer.addMiddleware(this.scServer.MIDDLEWARE_PUBLISH_IN, (req, next) => {

            if(this._zc.checkMiddlewareEvent(Const.Event.MIDDLEWARE_PUBLISH_IN,req,next))
            {
                if (req.channel.indexOf(Const.Settings.CHANNEL_USER_CHANNEL_PREFIX) !== -1) {
                    let err = new Error('User can\'t publish in a User Channel!');
                    err.code = 4503;
                    next(err); //Block!
                }
                else if (req.channel.indexOf(Const.Settings.CHANNEL_AUTH_GROUP_PREFIX) !== -1) {
                    let err = new Error('User can\'t publish in a User Group Channel!');
                    err.code = 4504;
                    next(err); //Block!
                }
                else if (req.channel === Const.Settings.CHANNEL_ALL) {
                    let err = new Error('User can\'t publish in a all Channel!');
                    err.code = 4505;
                    next(err); //Block!
                }
                else if (req.channel === Const.Settings.CHANNEL_DEFAULT_GROUP) {
                    let err = new Error('User can\'t publish in default user Group Channel!');
                    err.code = 4506;
                    next(err); //Block!
                }
                else if (req.channel.indexOf(Const.Settings.CHANNEL_SPECIAL_CHANNEL_PREFIX) !== -1) {
                    let chName = ChAccessEngine.getSpecialChannelName(req.channel);
                    if (ChAccessEngine.hasAccessToPubInSpecialChannel(req.socket, chName)) {
                        next();
                    }
                    else {
                        let err = new Error('No access to publish in this special channel!');
                        err.code = 4525;
                        next(err); //Block!
                    }
                }
                else {
                    next();
                }
            }
        });

        //CATION NEED NOTHING TO DO, ONLY CHECK USER EVENT
        this.scServer.addMiddleware(this.scServer.MIDDLEWARE_PUBLISH_OUT, (req,next) =>
        {
            if(this._zc.checkMiddlewareEvent(Const.Event.MIDDLEWARE_PUBLISH_OUT,req,next))
            {
                next();
            }
        });

        //CATION NEED NOTHING TO DO, ONLY CHECK USER EVENT
        this.scServer.addMiddleware(this.scServer.MIDDLEWARE_HANDSHAKE_SC, (req,next) =>
        {
            if(this._zc.checkMiddlewareEvent(Const.Event.MIDDLEWARE_HANDSHAKE_SC,req,next))
            {
                next();
            }
        });

        //CATION NEED NOTHING TO DO, ONLY CHECK USER EVENT
        this.scServer.addMiddleware(this.scServer.MIDDLEWARE_HANDSHAKE_WS, (req,next) =>
        {
            if(this._zc.checkMiddlewareEvent(Const.Event.MIDDLEWARE_HANDSHAKE_WS,req,next))
            {
                next();
            }
        });

        //CATION NEED NOTHING TO DO, ONLY CHECK USER EVENT
        this.scServer.addMiddleware(this.scServer.MIDDLEWARE_EMIT, (req,next) =>
        {
            if(this._zc.checkMiddlewareEvent(Const.Event.MIDDLEWARE_EMIT,req,next))
            {
                next();
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

        socket.on('connect', (scCon) =>
        {
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

        socket.on('close', () =>
        {
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

    async _initTokenInfoStorage()
    {
        let key = this._zc.getMain(Const.Settings.TOKEN_INFO_STORAGE_KEY);
        this._tokenInfoStorage = new TokenInfoStorage(await new MasterStorage(key,this));
        await this._tokenInfoStorage.init();

        this._addSystemBackgroundTask(async() =>
        {
            await SystemBackgroundTask.checkTokenInfoStorage(this._tokenInfoStorage,this._zc);
        });
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

    getTokenInfoStorage()
    {
        return this._tokenInfoStorage;
    }

    getZationConfig()
    {
        return this._zc;
    }

    // noinspection JSUnusedGlobalSymbols
    getServiceEngine()
    {
        return this._serviceEngine;
    }
    
}

new Worker();