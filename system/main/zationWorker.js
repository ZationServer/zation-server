/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

const SCWorker            = require('socketcluster/scworker');
const express             = require('express');
const cookieParser        = require('cookie-parser');
const bodyParser          = require('body-parser');
const mySql               = require('mysql');
const nodeMailer          = require('nodemailer');
const fileUpload          = require('express-fileupload');

const Zation              = require('./zation');
const Const               = require('../helper/constante/constWrapper');
const ChannelController   = require('../helper/channel/channelEngine');
const ServiceWrapper      = require('../helper/services/serviceWrapper');

class Worker extends SCWorker
{
    // noinspection JSUnusedGlobalSymbols
    run()
    {
        console.log('   >> Worker PID:', process.pid);
        this._systemBackgroundTasks = [];
        this._userBackgroundTasks = {};
        this._zc = this.options.cationInformation;
        this._zc.loadOtherConfigs();

        this.zation = new Zation(this._zc);

        //Server
        if (this._zc.getMain(Const.Main.USE_HTTP_SERVER)) {
            this._startHttpServer();
        }
        if (this._zc.getMain(Const.Main.USE_SOCKET_SERVER)) {
            this._startSocketServer();
        }

        this.servieces = {};
        //Services
        if (this._zc.isMain(Const.Main.SERVICES_MYSQL_POOL)) {
            this.servieces['mySqlPoolWrapper'] =
                new ServiceWrapper
                (
                    mySql.createPool
                    (
                        this._zc.getMain(Const.Main.SERVICES_MYSQL_POOL)
                    ),'MySqlPool'
                );
        }

        if (this._zc.isMain(Const.Main.SERVICES_NODE_MAILER)) {
            this.servieces['nodeMailerWrapper'] =
                new ServiceWrapper
                (
                    nodeMailer.createTransport
                    (
                        this._zc.getMain(Const.Main.SERVICES_NODE_MAILER)
                    ),'nodeMailer'
                );
        }

        this._registerMasterEvent();

        //Fire event is started
        this._zc.emitEvent(Const.Event.ZATION_WORKER_IS_STARTED,
            (f) => {f(this._zc.getSomeInformation())});

    }

    _startSocketServer()
    {
        this.initSocketMiddleware();
        this.initScServerEvents();

        //START SOCKET SERVER
        this.scServer.on('connection', (socket) => {

            this.initSocketEvents(socket);

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
                        scServer: this.scServer,
                        services: this.servieces
                    });
            });

        });

        this._zc.emitEvent(Const.Event.ZATION_SOCKET_SERVER_IS_STARTED,
            (f) => {f(this._zc.getSomeInformation())});
    }

    _startHttpServer()
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

        // noinspection JSUnresolvedFunction
        this.app.all('/zation', (req, res) => {
            //Run Zation
            // noinspection JSUnusedLocalSymbols
            let p = this.zation.run(
                {
                    isSocket: false,
                    res: res,
                    req: req,
                    scServer: this.scServer,
                    services: this.servieces
                });
        });

        this._zc.emitEvent(Const.Event.ZATION_HTTP_SERVER_IS_STARTED,
            (f) => {f(this._zc.getSomeInformation())});

        //loading express func
        this._zc.emitEvent(Const.Event.ZATION_EXPRESS,
            (f) => {f(this.app);});
    }

    initSocketMiddleware()
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
                        let chName = ChannelController.getSpecialChannelName(channel);
                        if (ChannelController.hasAccessToSubSpecialChannel(req.socket, chName)) {
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
                        let chName = ChannelController.getSpecialChannelName(channel);
                        if (ChannelController.hasAccessToSubSpecialChannel(req.socket, chName)) {
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
                    let chName = ChannelController.getSpecialChannelName(req.channel);
                    if (ChannelController.hasAccessToPubInSpecialChannel(req.socket, chName)) {
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

    initScServerEvents()
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

    initSocketEvents(socket)
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


}

new Worker();