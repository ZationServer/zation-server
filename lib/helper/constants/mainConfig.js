/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

class MainConfig {}

MainConfig.PORT                                = 'port';
MainConfig.HOSTNAME                            = 'hostname';
MainConfig.DEBUG                               = 'debug';
MainConfig.START_DEBUG                         = 'startDebug';
MainConfig.ENVIRONMENT                         = 'environment';
MainConfig.TIME_ZONE                           = 'timeZone';
MainConfig.WORKERS                             = 'workers';
MainConfig.BROKERS                             = 'brokers';
MainConfig.APP_NAME                            = 'appName';
MainConfig.SECURE                              = 'secure';
MainConfig.HTTPS_CONFIG                        = 'httpsConfig';
MainConfig.USE_AUTH                            = 'useAuth';
MainConfig.USE_PROTOCOL_CHECK                  = 'useProtocolCheck';
MainConfig.SEND_ERRORS_DESC                    = 'sendErrorDescription';
MainConfig.SYSTEM_BACKGROUND_TASK_REFRESH_RATE = 'systemBackgroundTaskRefreshRate';

MainConfig.USE_PANEL                           = 'userPanel';
MainConfig.PANEL_USER                          = 'panelUser';
MainConfig.CLIENT_JS_PREPARE                   = 'clientJsPrepare';

//Temp
MainConfig.USE_TEMP_DB_TOKEN_INFO              = 'useTempDbTokenInfo';
MainConfig.USE_TEMP_DB_ERROR_INFO              = 'useTempDbErrorInfo';
MainConfig.TEMP_DB_ERROR_INFO_LIVE_TIME        = 'tempDbErrorInfoLiveTime';
MainConfig.TEMP_DB_ENGINE                      = 'tempDbEngine';

MainConfig.TEMP_DB_ENGINE_MONGO                = 'mongo';
MainConfig.TEMP_DB_ENGINE_MASTER_MEMORY        = 'masterMemory';

MainConfig.TEMP_DB_Name                        = 'tempDbName';

MainConfig.TEMP_DB_CONFIG                      = 'tempDbConfig';
MainConfig.EXTRA_SECURE_AUTH                   = 'extraSecureAuth';

MainConfig.AUTH_START                          = 'authStart';
MainConfig.AUTH_START_DURATION_MS              = 'authStartDuration';

//ADVANCE
MainConfig.POST_KEY_WORD                       = 'postKeyWord';

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