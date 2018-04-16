/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

class MainConfig {}

MainConfig.PORT                                = 'port';
MainConfig.DEBUG                               = 'debug';
MainConfig.TIME_ZONE                           = 'timeZone';
MainConfig.WORKERS                             = 'workers';
MainConfig.BROKERS                             = 'brokers';
MainConfig.APP_NAME                            = 'appName';
MainConfig.USE_SOCKET_SERVER                   = 'useSocketServer';
MainConfig.USE_HTTP_SERVER                     = 'useHttpServer';
MainConfig.SECURE                              = 'secure';
MainConfig.EXTRA_SECURE_AUTH                   = 'extraSecureAuth';
MainConfig.HTTPS_CONFIG                        = 'httpsConfig';
MainConfig.POST_KEY_WORD                       = 'postKeyWord';
MainConfig.USE_AUTH                            = 'useAuth';
MainConfig.USE_PROTOCOL_CHECK                  = 'useProtocolCheck';
MainConfig.SEND_ERRORS_DESC                    = 'sendErrorDescription';
MainConfig.SYSTEM_BACKGROUND_TASK_REFRESH_RATE = 'systemBackgroundTaskRefreshRate';

MainConfig.CONTROLLER             = 'controller';
MainConfig.CONFIG                 = 'configs';

MainConfig.APP_CONFIG             = 'app.config';
MainConfig.CHANNEL_CONFIG         = 'channel.config';
MainConfig.MAIN_CONFIG            = 'main.config';
MainConfig.ERROR_CONFIG           = 'error.config';
MainConfig.EVENT_CONFIG           = 'event.config';

MainConfig.AUTH_KEY               = 'authKey';
MainConfig.AUTH_DEFAULT_EXPIRY    = 'authDefaultExpiry';
MainConfig.AUTH_ALGORITHM         = 'authAlgorithm';
MainConfig.AUTH_PRIVATE_KEY       = 'authPrivateKey';
MainConfig.AUTH_PUBLIC_KEY        = 'authPublicKey';

//Services
MainConfig.SERVICES              = 'services';
MainConfig.SERVICES_MYSQL        = 'mySql';
MainConfig.SERVICES_NODE_MAILER  = 'nodeMailer';
MainConfig.SERVICES_POSTGRES_SQL = 'postgresSql';
MainConfig.SERVICES_MONGO_DB     = 'mongoDb';

MainConfig.AUTO                   = 'auto';

module.exports = MainConfig;