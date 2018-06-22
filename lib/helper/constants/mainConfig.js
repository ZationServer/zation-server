/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

class MainConfig {}

MainConfig.KEYS = {};
MainConfig.KEYS.PORT                                  = 'port';
MainConfig.KEYS.HOSTNAME                              = 'hostname';
MainConfig.KEYS.DEBUG                                 = 'debug';
MainConfig.KEYS.START_DEBUG                           = 'startDebug';
MainConfig.KEYS.SHOW_CONFIG_WARNINGS                  = 'showConfigWarnings';
MainConfig.KEYS.ENVIRONMENT                           = 'environment';
MainConfig.KEYS.TIME_ZONE                             = 'timeZone';
MainConfig.KEYS.WORKERS                               = 'workers';
MainConfig.KEYS.BROKERS                               = 'brokers';
MainConfig.KEYS.APP_NAME                              = 'appName';
MainConfig.KEYS.SECURE                                = 'secure';
MainConfig.KEYS.HTTPS_CONFIG                          = 'httpsConfig';
MainConfig.KEYS.USE_AUTH                              = 'useAuth';
MainConfig.KEYS.USE_PROTOCOL_CHECK                    = 'useProtocolCheck';
MainConfig.KEYS.SEND_ERRORS_DESC                      = 'sendErrorDescription';
MainConfig.KEYS.SYSTEM_BACKGROUND_TASK_REFRESH_RATE   = 'systemBackgroundTaskRefreshRate';

MainConfig.KEYS.USE_PANEL                             = 'usePanel';
MainConfig.KEYS.PANEL_USER                            = 'panelUser';
MainConfig.KEYS.CLIENT_JS_PREPARE                     = 'clientJsPrepare';

//Temp
MainConfig.KEYS.USE_TEMP_DB_TOKEN_INFO                = 'useTempDbTokenInfo';
MainConfig.KEYS.USE_TEMP_DB_ERROR_INFO                = 'useTempDbErrorInfo';
MainConfig.KEYS.TEMP_DB_ERROR_INFO_LIVE_TIME          = 'tempDbErrorInfoLiveTime';
MainConfig.KEYS.TEMP_DB_ENGINE                        = 'tempDbEngine';

MainConfig.TEMP_DB_ENGINE = {};
MainConfig.TEMP_DB_ENGINE.MONGO                = 'mongo';
MainConfig.TEMP_DB_ENGINE.MASTER_MEMORY        = 'masterMemory';

MainConfig.KEYS.TEMP_DB_Name                   = 'tempDbName';
MainConfig.KEYS.TEMP_DB_CONFIG                 = 'tempDbConfig';

MainConfig.KEYS.EXTRA_SECURE_AUTH              = 'extraSecureAuth';

MainConfig.KEYS.AUTH_START                     = 'authStart';
MainConfig.KEYS.AUTH_START_DURATION_MS         = 'authStartDuration';

//ADVANCE
MainConfig.KEYS.POST_KEY_WORD                  = 'postKeyWord';

MainConfig.KEYS.CONTROLLER             = 'controller';
MainConfig.KEYS.CONFIG                 = 'configs';

MainConfig.KEYS.APP_CONFIG             = 'app.config';
MainConfig.KEYS.CHANNEL_CONFIG         = 'channel.config';
MainConfig.KEYS.MAIN_CONFIG            = 'main.config';
MainConfig.KEYS.ERROR_CONFIG           = 'error.config';
MainConfig.KEYS.EVENT_CONFIG           = 'event.config';

MainConfig.KEYS.AUTH_KEY               = 'authKey';
MainConfig.KEYS.AUTH_DEFAULT_EXPIRY    = 'authDefaultExpiry';
MainConfig.KEYS.AUTH_ALGORITHM         = 'authAlgorithm';
MainConfig.KEYS.AUTH_PRIVATE_KEY       = 'authPrivateKey';
MainConfig.KEYS.AUTH_PUBLIC_KEY        = 'authPublicKey';

//Services
MainConfig.KEYS.SERVICES              = 'services';

MainConfig.SERVICES = {};
MainConfig.SERVICES.MYSQL          = 'mySql';
MainConfig.SERVICES.NODE_MAILER    = 'nodeMailer';
MainConfig.SERVICES.POSTGRES_SQL   = 'postgresSql';
MainConfig.SERVICES.MONGO_DB       = 'mongoDb';

MainConfig.KEYS.CUSTOM_SERVICES    = 'customServices';

MainConfig.CUSTOM_SERVICES = {};
MainConfig.CUSTOM_SERVICES.CREATE  = 'create';
MainConfig.CUSTOM_SERVICES.GET     = 'get';

MainConfig.OPTIONS = {};
MainConfig.OPTIONS.AUTO            = 'auto';

module.exports = MainConfig;