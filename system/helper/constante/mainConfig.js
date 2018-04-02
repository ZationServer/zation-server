class MainConfig {}

MainConfig.PORT                   = 'port';
MainConfig.SOCKET                 = 'sockets';
MainConfig.WORKERS                = 'workers';
MainConfig.BROKERS                = 'brokers';
MainConfig.APP_NAME               = 'appName';
MainConfig.USE_SOCKET_SERVER      = 'useSocketServer';
MainConfig.USE_HTTP_SERVER        = 'useHttpServer';
MainConfig.SESSION_SECRET_KEY     = 'sessionSecretKey';
MainConfig.SESSION_STORE          = 'sessionStore';
MainConfig.SECURE                 = 'secure';
MainConfig.STORE                  = 'store';
MainConfig.STORE_REDIS            = 'redis';
MainConfig.MONGO_DB               = 'mongoDb';
MainConfig.STORE_CONFIG           = 'config';
MainConfig.SESSION_CONFIG         = 'sessionConfig';
MainConfig.HTTPS_CONFIG           = 'httpsConfig';
MainConfig.POST_KEY_WORD          = 'postKeyWord';
MainConfig.USE_AUTH               = 'useAuth';
MainConfig.USE_PROTOCOL_CHECK     = 'useProtocolCheck';
MainConfig.SEND_ERRORS_DESC       = 'sendErrorDescription';

//Services
MainConfig.SERVICES_MYSQL_POOL    = 'mySqlPool';
MainConfig.SERVICES_NODE_MAILER   = 'nodeMailer';

MainConfig.AUTO                   = 'auto';

module.exports = MainConfig;