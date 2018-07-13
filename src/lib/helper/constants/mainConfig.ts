/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

class KEYS {
    static readonly PORT                                  = 'port';
    static readonly HOSTNAME                              = 'hostname';
    static readonly DEBUG                                 = 'debug';
    static readonly START_DEBUG                           = 'startDebug';
    static readonly SHOW_CONFIG_WARNINGS                  = 'showConfigWarnings';
    static readonly ENVIRONMENT                           = 'environment';
    static readonly TIME_ZONE                             = 'timeZone';
    static readonly WORKERS                               = 'workers';
    static readonly BROKERS                               = 'brokers';
    static readonly APP_NAME                              = 'appName';
    static readonly SECURE                                = 'secure';
    static readonly HTTPS_CONFIG                          = 'httpsConfig';
    static readonly USE_AUTH                              = 'useAuth';
    static readonly USE_PROTOCOL_CHECK                    = 'useProtocolCheck';
    static readonly SEND_ERRORS_DESC                      = 'sendErrorDescription';
    static readonly SYSTEM_BACKGROUND_TASK_REFRESH_RATE   = 'systemBackgroundTaskRefreshRate';
    static readonly ZATION_CONSOLE_LOG                    = 'zationConsoleLog';
    static readonly SC_CONSOLE_LOG                        = 'scConsoleLog';

    static readonly USE_PANEL                             = 'usePanel';
    static readonly PANEL_USER                            = 'panelUser';
    static readonly CLIENT_JS_PREPARE                     = 'clientJsPrepare';

    //Temp
    static readonly USE_TEMP_DB_TOKEN_INFO                = 'useTempDbTokenInfo';
    static readonly USE_TEMP_DB_ERROR_INFO                = 'useTempDbErrorInfo';
    static readonly TEMP_DB_ERROR_INFO_LIVE_TIME          = 'tempDbErrorInfoLiveTime';
    static readonly TEMP_DB_ENGINE                        = 'tempDbEngine';

    static readonly TEMP_DB_Name                   = 'tempDbName';
    static readonly TEMP_DB_CONFIG                 = 'tempDbConfig';


    static readonly EXTRA_SECURE_AUTH              = 'extraSecureAuth';

    static readonly AUTH_START                     = 'authStart';
    static readonly AUTH_START_DURATION_MS         = 'authStartDuration';

    //ADVANCE
    static readonly POST_KEY_WORD                  = 'postKeyWord';

    static readonly AUTH_KEY               = 'authKey';
    static readonly AUTH_DEFAULT_EXPIRY    = 'authDefaultExpiry';
    static readonly AUTH_ALGORITHM         = 'authAlgorithm';
    static readonly AUTH_PRIVATE_KEY       = 'authPrivateKey';
    static readonly AUTH_PUBLIC_KEY        = 'authPublicKey';
}

class TEMP_DB_ENGINE {
    static readonly MONGO                = 'mongo';
    static readonly MASTER_MEMORY        = 'masterMemory';
}

class OPTIONS {
    static readonly AUTO            = 'auto';
}

class MainConfig
{
    public static readonly TEMP_DB_ENGINE = TEMP_DB_ENGINE;
    public static readonly OPTIONS = OPTIONS;
    public static readonly KEYS = KEYS;
}



export = MainConfig;