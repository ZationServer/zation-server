//Import Modules
const SCWorker          = require('socketcluster/scworker');
const express           = require('express');
const cookieParser      = require('cookie-parser');
const expressSession    = require('express-session');
const bodyParser        = require('body-parser');
const MySql             = require('mysql');
const NodeMailer        = require('nodemailer');
const fileUpload        = require('express-fileupload');

const Zation            = require('./zation');
const CA                = require('../helper/constante/settings');
const ConfigTools       = require('../helper/tools/configTools');
const ChannelController = require('../helper/channelSystem/channelController');
const ServiceWrapper    = require('../helper/services/serviceWrapper');
const Events            = require('../helper/constante/events');

class Worker extends SCWorker
{
    // noinspection JSUnusedGlobalSymbols
    run()
    {
        console.log('   >> Worker PID:', process.pid);

        this.config = this.options.cationInformation.config;
        this.debug = this.options.cationInformation.debug;

        //Add Events
        this.config['events'] = EventZation;

        this.zation = new Zation(this.config, this.debug);

        this.servieces = {};


        //Server
        if (this.config[CA.START_CONFIG_USE_HTTP_SERVER]) {
            this.startHttpServer();
        }
        if (this.config[CA.START_CONFIG_USE_SOCKET_SERVER]) {
            this.startSocketServer();
        }

        //Services
        if (this.config[CA.START_CONFIG_MYSQL_POOL] !== undefined) {
            this.servieces['mySqlPoolWrapper'] =
                new ServiceWrapper(MySql.createPool(this.config[CA.START_CONFIG_MYSQL_POOL]),'MySqlPool');
        }

        if (this.config[CA.START_CONFIG_NODE_MAILER] !== undefined) {
            this.servieces['nodeMailerWrapper'] =
                new ServiceWrapper(NodeMailer.createTransport(this.config[CA.START_CONFIG_NODE_MAILER],'nodeMailer'));
        }

        //Fire event is started
        ConfigTools.emitEvent(EventCation[Events.CATION_IS_STARTED],
            (f) => {f({port: this.config[CA.START_CONFIG_PORT]})});

    }

    startSocketServer()
    {
        this.initSocketMiddleware();
        this.initScServerEvents();

        //START SOCKET SERVER
        this.scServer.on('connection', (socket) => {

            this.initSocketEvents(socket);

            ConfigTools.emitEvent(EventCation[Events.SC_SERVER_CONNECTION],(f) => {f(socket);});

            if (this.debug)
            {
                console.log(`Socket with id: ${socket.id} is connected!`);
            }

            socket.on('cationRequest', (data, respond) => {
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

        ConfigTools.emitEvent(EventCation[Events.CATION_SOCKET_SERVER_IS_STARTED],
            (f) => {f({port: this.config[CA.START_CONFIG_PORT]})});
    }

    startHttpServer()
    {
        this.app = express();
        //startCookieParser
        // noinspection JSUnresolvedFunction
        this.app.use(cookieParser());

        //find SessionStore
        let sessionStore = this.config[CA.START_CONFIG_SESSION_STORE];
        if (sessionStore !== undefined) {
            let sessionStoreName = sessionStore[CA.START_CONFIG_STORE];
            if (sessionStoreName === CA.START_CONFIG_STORE_REDIS) {
                let redis = require('connect-redis')(expressSession);
                this.config[CA.START_CONFIG_SESSION_CONFIG]['store']
                    = new redis(sessionStore[CA.START_CONFIG_SESSION_CONFIG]);
            }
            else if (sessionStoreName === CA.START_CONFIG_STORE_MONGO_DB) {
                let mongoDb = require('connect-mongo')(expressSession);
                this.config[CA.START_CONFIG_SESSION_CONFIG]['store']
                    = new mongoDb(sessionStore[CA.START_CONFIG_SESSION_CONFIG]);
            }
            else {
                this.printWarning(`The Session Store: ${sessionStoreName} is not supported!`);
            }
        }

        //FileParser
        // noinspection JSUnresolvedFunction
        this.app.use(fileUpload());
        //BodyParser
        // noinspection JSUnresolvedFunction
        this.app.use(bodyParser.json());
        // noinspection JSUnresolvedFunction
        this.app.use(bodyParser.urlencoded({extended: true}));

        //startSession
        // noinspection JSUnresolvedFunction
        this.app.use(expressSession(this.config[CA.START_CONFIG_SESSION_CONFIG]));


        //Set Server
        this.httpServer.on('request', this.app);

        ConfigTools.emitEvent(EventCation[Events.CATION_HTTP_SERVER_IS_STARTED],
            (f) => {f({port: this.config[CA.START_CONFIG_PORT]})});

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

        //loading express func
        ConfigTools.emitEvent(EventCation[Events.CATION_EXPRESS],
            (f) => {f(this.app);});
    }

    initSocketMiddleware()
    {
        //BLOCK SUBSCRIBE FROM OTHER USER CHANNELS
        this.scServer.addMiddleware(this.scServer.MIDDLEWARE_SUBSCRIBE, (req, next) => {

            if(ConfigTools.checkMiddlewareEvent(EventCation[Events.MIDDLEWARE_SUBSCRIBE],req,next))
            {
                let authToken = req.socket.getAuthToken();
                let channel = req.channel;

                if (authToken !== null) {
                    let id = authToken[CA.CLIENT_AUTH_ID];
                    let authType = authToken[CA.CLIENT_AUTH_GROUP];

                    if (id !== undefined && channel.indexOf(CA.SOCKET_USER_CHANNEL_PREFIX) !== -1) {
                        if (CA.SOCKET_USER_CHANNEL_PREFIX + id === channel) {
                            next();
                        }
                        else {
                            let err = new Error(`User: ${id} can\'t subscribe an other User Channel: ${channel}!`);
                            err.code = 4502;
                            next(err); //Block!
                        }
                    }
                    else if (authType !== undefined && channel.indexOf(CA.SOCKET_AUTH_GROUP_PREFIX) !== -1) {
                        if (CA.SOCKET_AUTH_GROUP_PREFIX + authType === channel) {
                            next();
                        }
                        else {
                            let err = new Error('User can\'t subscribe an other User Group Channel!');
                            err.code = 4522;
                            next(err); //Block!
                        }
                    }
                    else if (authType !== undefined && channel === CA.SOCKET_DEFAULT_GROUP) {
                            let err = new Error('Auth User can\' subscribe default User Group Channel!');
                            err.code = 4523;
                            next(err); //Block!
                    }
                    else if (channel.indexOf(CA.SOCKET_SPECIAL_CHANNEL_PREFIX) !== -1) {
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
                    if (channel.indexOf(CA.SOCKET_USER_CHANNEL_PREFIX) !== -1) {
                        let err = new Error('anonymous user can\'t subscribe a User Channel!');
                        err.code = 4501;
                        next(err); //Block!
                    }
                    else if (channel.indexOf(CA.SOCKET_AUTH_GROUP_PREFIX) !== -1) {
                        let err = new Error('anonymous user can\'t subscribe a User Group Channel!');
                        err.code = 4511;
                        next(err); //Block!
                    }
                    else if (channel === CA.SOCKET_DEFAULT_GROUP) {
                        next();
                    }
                    else if (channel.indexOf(CA.SOCKET_SPECIAL_CHANNEL_PREFIX) !== -1) {
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

            if(ConfigTools.checkMiddlewareEvent(EventCation[Events.MIDDLEWARE_PUBLISH_IN],req,next))
            {
                if (req.channel.indexOf(CA.SOCKET_USER_CHANNEL_PREFIX) !== -1) {
                    let err = new Error('User can\'t publish in a User Channel!');
                    err.code = 4503;
                    next(err); //Block!
                }
                else if (req.channel.indexOf(CA.SOCKET_AUTH_GROUP_PREFIX) !== -1) {
                    let err = new Error('User can\'t publish in a User Group Channel!');
                    err.code = 4504;
                    next(err); //Block!
                }
                else if (req.channel === CA.SOCKET_ALL) {
                    let err = new Error('User can\'t publish in a all Channel!');
                    err.code = 4505;
                    next(err); //Block!
                }
                else if (req.channel === CA.SOCKET_DEFAULT_GROUP) {
                    let err = new Error('User can\'t publish in default user Group Channel!');
                    err.code = 4506;
                    next(err); //Block!
                }
                else if (req.channel.indexOf(CA.SOCKET_SPECIAL_CHANNEL_PREFIX) !== -1) {
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
            if(ConfigTools.checkMiddlewareEvent(EventCation[Events.MIDDLEWARE_PUBLISH_OUT],req,next))
            {
                next();
            }
        });

        //CATION NEED NOTHING TO DO, ONLY CHECK USER EVENT
        this.scServer.addMiddleware(this.scServer.MIDDLEWARE_HANDSHAKE_SC, (req,next) =>
        {
            if(ConfigTools.checkMiddlewareEvent(EventCation[Events.MIDDLEWARE_HANDSHAKE_SC],req,next))
            {
                next();
            }
        });

        //CATION NEED NOTHING TO DO, ONLY CHECK USER EVENT
        this.scServer.addMiddleware(this.scServer.MIDDLEWARE_HANDSHAKE_WS, (req,next) =>
        {
            if(ConfigTools.checkMiddlewareEvent(EventCation[Events.MIDDLEWARE_HANDSHAKE_WS],req,next))
            {
                next();
            }
        });

        //CATION NEED NOTHING TO DO, ONLY CHECK USER EVENT
        this.scServer.addMiddleware(this.scServer.MIDDLEWARE_EMIT, (req,next) =>
        {
            if(ConfigTools.checkMiddlewareEvent(EventCation[Events.MIDDLEWARE_EMIT],req,next))
            {
                next();
            }
        });

    }

    initScServerEvents()
    {
        this.scServer.on('error', (err) =>
        {
            ConfigTools.emitEvent(EventCation[Events.SC_SERVER_ERROR],(f) => {f(err);});
        });

        this.scServer.on('notice', (note) =>
        {
            ConfigTools.emitEvent(EventCation[Events.SC_SERVER_NOTICE],(f) => {f(note);});
        });

        this.scServer.on('handshake', (socket) =>
        {
            ConfigTools.emitEvent(EventCation[Events.SC_SERVER_HANDSHAKE],(f) => {f(socket);});
        });

        this.scServer.on('connectionAbort', (socket) =>
        {
            ConfigTools.emitEvent(EventCation[Events.SC_SERVER_CONNECTION_ABORT],(f) => {f(socket);});
        });

        this.scServer.on('disconnection', (socket) =>
        {
            ConfigTools.emitEvent(EventCation[Events.SC_SERVER_DISCONNECTION],(f) => {f(socket);});
        });

        this.scServer.on('closure', (socket) =>
        {
            ConfigTools.emitEvent(EventCation[Events.SC_SERVER_CLOSURE],(f) => {f(socket);});
        });

        this.scServer.on('subscription', (socket) =>
        {
            ConfigTools.emitEvent(EventCation[Events.SC_SERVER_SUBSCRIPTION],(f) => {f(socket);});
        });

        this.scServer.on('unsubscription', (socket) =>
        {
            ConfigTools.emitEvent(EventCation[Events.SC_SERVER_UNSUBSCRIPTION],(f) => {f(socket);});
        });

        this.scServer.on('authentication', (socket) =>
        {
            ConfigTools.emitEvent(EventCation[Events.SC_SERVER_AUTHENTICATION],(f) => {f(socket);});
        });

        this.scServer.on('deauthentication', (socket) =>
        {
            ConfigTools.emitEvent(EventCation[Events.SC_SERVER_DEAUTHENTICATION],(f) => {f(socket);});
        });

        this.scServer.on('badSocketAuthToken', (socket) =>
        {
            ConfigTools.emitEvent(EventCation[Events.SC_SERVER_BAD_SOCKET_AUTH_TOKEN],(f) => {f(socket);});
        });

    }

    initSocketEvents(socket)
    {
        socket.on('error', (err) =>
        {
            ConfigTools.emitEvent(EventCation[Events.SOCKET_ERROR],(f) => {f(socket,err);});
        });

        socket.on('raw', () =>
        {
            ConfigTools.emitEvent(EventCation[Events.SOCKET_RAW],(f) => {f(socket);});
        });

        socket.on('connect', (scCon) =>
        {
            ConfigTools.emitEvent(EventCation[Events.SOCKET_CONNECT],(f) => {f(socket,scCon);});
        });

        socket.on('disconnect', () =>
        {
            ConfigTools.emitEvent(EventCation[Events.SOCKET_DISCONNECT],(f) => {f(socket);});
        });

        socket.on('connectAbort', () =>
        {
            ConfigTools.emitEvent(EventCation[Events.SOCKET_CONNECT_ABORT],(f) => {f(socket);});
        });

        socket.on('close', () =>
        {
            ConfigTools.emitEvent(EventCation[Events.SOCKET_CLOSE],(f) => {f(socket);});
        });

        socket.on('subscribe', () =>
        {
            ConfigTools.emitEvent(EventCation[Events.SOCKET_SUBSCRIBE],(f) => {f(socket);});
        });

        socket.on('unsubscribe', () =>
        {
            ConfigTools.emitEvent(EventCation[Events.SOCKET_UNSUBSCRIBE],(f) => {f(socket);});
        });

        socket.on('badAuthToken', (arg) =>
        {
            ConfigTools.emitEvent(EventCation[Events.SOCKET_BAD_AUTH_TOKEN],(f) => {f(socket,arg);});
        });

        socket.on('authenticate', (token) =>
        {
            ConfigTools.emitEvent(EventCation[Events.SOCKET_AUTHENTICATE],(f) => {f(socket,token);});
        });

        socket.on('deauthenticate', (token) =>
        {
            ConfigTools.emitEvent(EventCation[Events.SOCKET_DEAUTHENTICATE],(f) => {f(socket,token);});
        });

        socket.on('message', (msg) =>
        {
            ConfigTools.emitEvent(EventCation[Events.SOCKET_MESSAGE],(f) => {f(socket,msg);});
        });

    }

    printWarning(txt)
    {
        if (this.debug) {
            console.log(`CATION WARNING : ${txt}`);
        }
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
}

new Worker();