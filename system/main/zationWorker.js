/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

const SCWorker              = require('socketcluster/scworker');
const express               = require('express');
const cookieParser          = require('cookie-parser');
const bodyParser            = require('body-parser');
const mySql                 = require('mysql');
const nodeMailer            = require('nodemailer');
const fileUpload            = require('express-fileupload');

const Zation                = require('./zation');
const ZationConfig          = require('./zationConfig');
const Const                 = require('../helper/constante/constWrapper');
const ChannelEngine         = require('../helper/channel/channelEngine');
const ServiceWrapper        = require('../helper/services/serviceWrapper');
const TokenInfoStorage      = require('../helper/storage/tokenInfoStorage');
const MasterStorage         = require('../helper/storage/masterStorage');
const SystemBackgroundTask  = require('../helper/background/systemBackgroundTasks');

class Worker extends SCWorker
{
    // noinspection JSUnusedGlobalSymbols
    async run()
    {
        console.log('   >> Worker PID:', process.pid);

        //BackgroundStuff
        this._systemBackgroundTasks = [];
        this._userBackgroundTasks = {};

        let zcOptions = this.options.zationConfigWorkerTransport;

        this._zc = new ZationConfig(zcOptions.mainConfig,zcOptions.debug,true);
        this._zc.loadOtherConfigs();

        this._servieces = {};
        //Services
        if (this._zc.isMain(Const.Main.SERVICES_MYSQL_POOL)) {
            this._servieces['mySqlPoolWrapper'] =
                new ServiceWrapper
                (
                    mySql.createPool
                    (
                        this._zc.getMain(Const.Main.SERVICES_MYSQL_POOL)
                    ),'MySqlPool'
                );
        }

        if (this._zc.isMain(Const.Main.SERVICES_NODE_MAILER)) {
            this._servieces['nodeMailerWrapper'] =
                new ServiceWrapper
                (
                    nodeMailer.createTransport
                    (
                        this._zc.getMain(Const.Main.SERVICES_NODE_MAILER)
                    ),'nodeMailer'
                );
        }

        if(this._zc.getMain(Const.Main.AUTH_EXTRA_SECURE))
        {
            await this._initTokenInfoStorage();
        }

        this._loadUserBackgroundTasks();
        this._registerMasterEvent();

        this.zation = new Zation(this);

        //Server
        if (this._zc.getMain(Const.Main.USE_HTTP_SERVER)) {
            this._startHttpServer();
        }
        if (this._zc.getMain(Const.Main.USE_SOCKET_SERVER)) {
            this._startSocketServer();
        }

        //Fire event is started
        this._zc.emitEvent(Const.Event.ZATION_WORKER_IS_STARTED,
            (f) => {f(this._zc.getSomeInformation())});
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

            if (this._zc.isDebug())
            {
                console.log(`Socket with id: ${socket.id} is connected!`);
            }

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

        //loading express func
        this._zc.emitEvent(Const.Event.ZATION_EXPRESS,
            (f) => {f(this._app);});
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

                    if (id !== undefined && channel.indexOf(Const.Settings.SOCKET_USER_CHANNEL_PREFIX) !== -1) {
                        if (Const.Settings.SOCKET_USER_CHANNEL_PREFIX + id === channel) {
                            next();
                        }
                        else {
                            let err = new Error(`User: ${id} can\'t subscribe an other User Channel: ${channel}!`);
                            err.code = 4502;
                            next(err); //Block!
                        }
                    }
                    else if (group !== undefined && channel.indexOf(Const.Settings.SOCKET_AUTH_GROUP_PREFIX) !== -1) {
                        if (Const.Settings.SOCKET_AUTH_GROUP_PREFIX + group === channel) {
                            next();
                        }
                        else {
                            let err = new Error('User can\'t subscribe an other User Group Channel!');
                            err.code = 4522;
                            next(err); //Block!
                        }
                    }
                    else if (group !== undefined && channel === Const.Settings.SOCKET_DEFAULT_GROUP) {
                            let err = new Error('Auth User can\' subscribe default User Group Channel!');
                            err.code = 4523;
                            next(err); //Block!
                    }
                    else if (channel.indexOf(Const.Settings.SOCKET_SPECIAL_CHANNEL_PREFIX) !== -1) {
                        let chName = ChannelEngine.getSpecialChannelName(channel);
                        if (ChannelEngine.hasAccessToSubSpecialChannel(req.socket, chName)) {
                            next();
                        }
                        else {
                            let err = new Error('No access to sub this special channel!');
                            err.code = 4524;
                            next(err); //Block!
                        }
                    }
                    else {
                        next();
                    }
                }
                else {
                    if (channel.indexOf(Const.Settings.SOCKET_USER_CHANNEL_PREFIX) !== -1) {
                        let err = new Error('anonymous user can\'t subscribe a User Channel!');
                        err.code = 4501;
                        next(err); //Block!
                    }
                    else if (channel.indexOf(Const.Settings.SOCKET_AUTH_GROUP_PREFIX) !== -1) {
                        let err = new Error('anonymous user can\'t subscribe a User Group Channel!');
                        err.code = 4511;
                        next(err); //Block!
                    }
                    else if (channel === Const.Settings.SOCKET_DEFAULT_GROUP) {
                        next();
                    }
                    else if (channel.indexOf(Const.Settings.SOCKET_SPECIAL_CHANNEL_PREFIX) !== -1) {
                        let chName = ChannelEngine.getSpecialChannelName(channel);
                        if (ChannelEngine.hasAccessToSubSpecialChannel(req.socket, chName)) {
                            next();
                        }
                        else {
                            let err = new Error('No access to sub this special channel!');
                            err.code = 4524;
                            next(err); //Block!
                        }
                    }
                    else {
                        next();
                    }
                }
            }
        });

        //BLOCK USER CAN PUBLISH IN CATION CHANNELS
        this.scServer.addMiddleware(this.scServer.MIDDLEWARE_PUBLISH_IN, (req, next) => {

            if(this._zc.checkMiddlewareEvent(Const.Event.MIDDLEWARE_PUBLISH_IN,req,next))
            {
                if (req.channel.indexOf(Const.Settings.SOCKET_USER_CHANNEL_PREFIX) !== -1) {
                    let err = new Error('User can\'t publish in a User Channel!');
                    err.code = 4503;
                    next(err); //Block!
                }
                else if (req.channel.indexOf(Const.Settings.SOCKET_AUTH_GROUP_PREFIX) !== -1) {
                    let err = new Error('User can\'t publish in a User Group Channel!');
                    err.code = 4504;
                    next(err); //Block!
                }
                else if (req.channel === Const.Settings.SOCKET_ALL) {
                    let err = new Error('User can\'t publish in a all Channel!');
                    err.code = 4505;
                    next(err); //Block!
                }
                else if (req.channel === Const.Settings.SOCKET_DEFAULT_GROUP) {
                    let err = new Error('User can\'t publish in default user Group Channel!');
                    err.code = 4506;
                    next(err); //Block!
                }
                else if (req.channel.indexOf(Const.Settings.SOCKET_SPECIAL_CHANNEL_PREFIX) !== -1) {
                    let chName = ChannelEngine.getSpecialChannelName(req.channel);
                    if (ChannelEngine.hasAccessToPubInSpecialChannel(req.socket, chName)) {
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
            await SystemBackgroundTask.checkTokenInfoStorage(this._tokenInfoStorage);
        });
    }


    _registerMasterEvent()
    {
        this.on('masterMessage',(data,respond) =>
        {
            if(data['systemBackgroundTask'] !== undefined && data['systemBackgroundTask'])
            {
                for(let i = 0; i < this._systemBackgroundTasks.length; i++)
                {
                    this._invokeSystemBackgroundTask(this._systemBackgroundTasks[i]);
                }
            }
            else if(data['userBackgroundTask'] !== undefined)
            {
                let id = data['userBackgroundTask'];

                if(this._userBackgroundTasks.hasOwnProperty(id))
                {
                    this._invokeUserBackgroundTask(this._userBackgroundTasks[id]);
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
            task(this);
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
            f((refreshRate,task) =>
            {
                this._userBackgroundTasks[id] = task;
                id++;
            });
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

    getServices()
    {
        return this._servieces;
    }
    
}

new Worker();