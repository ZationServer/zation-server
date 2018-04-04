/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

class MainConfig {}

MainConfig.PORT                                = 'port';
MainConfig.WORKERS                             = 'workers';
MainConfig.BROKERS                             = 'brokers';
MainConfig.APP_NAME                            = 'appName';
MainConfig.USE_SOCKET_SERVER                   = 'useSocketServer';
MainConfig.USE_HTTP_SERVER                     = 'useHttpServer';
MainConfig.SECURE                              = 'secure';
MainConfig.AUTH_EXTRA_SECURE                   = 'authExtraSecure';
MainConfig.HTTPS_CONFIG                        = 'httpsConfig';
MainConfig.POST_KEY_WORD                       = 'postKeyWord';
MainConfig.USE_AUTH                            = 'useAuth';
MainConfig.USE_PROTOCOL_CHECK                  = 'useProtocolCheck';
MainConfig.SEND_ERRORS_DESC                    = 'sendErrorDescription';
MainConfig.SYSTEM_BACKGROUND_TASK_REFRESH_RATE = 'systemBackgroundTaskRefreshRate';

MainConfig.AUTH_KEY               = 'authKey';
MainConfig.AUTH_KEY               = 'authKey';
MainConfig.AUTH_DEFAULT_EXPIRY    = 'authDefaultExpiry';
MainConfig.AUTH_ALGORITHM         = 'authAlgorithm';
MainConfig.AUTH_PRIVATE_KEY       = 'authPrivateKey';
MainConfig.AUTH_PUBLIC_KEY        = 'authPublicKey';

//Services
MainConfig.SERVICES_MYSQL_POOL    = 'mySqlPool';
MainConfig.SERVICES_NODE_MAILER   = 'nodeMailer';

MainConfig.AUTO                   = 'auto';

module.exports = MainConfig;