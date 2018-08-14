/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */
import Const                         = require('./../constants/constWrapper');

export interface MainConfig
{
    [Const.Main.KEYS.PORT] ?: number;
    [Const.Main.KEYS.HOSTNAME] ?: string;
    [Const.Main.KEYS.PATH] ?: string;
    [Const.Main.KEYS.DEBUG] ?: boolean;
    [Const.Main.KEYS.START_DEBUG] ?: boolean;
    [Const.Main.KEYS.SHOW_CONFIG_WARNINGS] ?: boolean;
    [Const.Main.KEYS.ENVIRONMENT] ?: 'dev' | 'prod';
    [Const.Main.KEYS.TIME_ZONE] ?: string;
    [Const.Main.KEYS.WORKERS] ?: 'auto' | number;
    [Const.Main.KEYS.BROKERS] ?: 'auto' | number;
    [Const.Main.KEYS.APP_NAME] ?: string;
    [Const.Main.KEYS.SECURE] ?: boolean;
    [Const.Main.KEYS.HTTPS_CONFIG] ?: HttpsConfig;
    [Const.Main.KEYS.USE_AUTH] ?: boolean;
    [Const.Main.KEYS.USE_PROTOCOL_CHECK] ?: boolean;
    [Const.Main.KEYS.SEND_ERRORS_DESC] ?: boolean;
    [Const.Main.KEYS.SYSTEM_BACKGROUND_TASK_REFRESH_RATE] ?: number;
    [Const.Main.KEYS.ZATION_CONSOLE_LOG] ?: boolean;
    [Const.Main.KEYS.SC_CONSOLE_LOG] ?: boolean;
    [Const.Main.KEYS.LEADER_INSTANCE] ?: boolean;
    [Const.Main.KEYS.USE_SC_UWS] ?: boolean;

    [Const.Main.KEYS.USE_PANEL] ?: boolean;
    [Const.Main.KEYS.PANEL_USER] ?: PanelUserConfig | PanelUserConfig[];
    [Const.Main.KEYS.CLIENT_JS_PREPARE] ?: boolean;

    //TEMP DB
    [Const.Main.KEYS.USE_TEMP_DB_TOKEN_INFO] ?: boolean;
    [Const.Main.KEYS.USE_TEMP_DB_ERROR_INFO] ?: boolean;
    [Const.Main.KEYS.TEMP_DB_ERROR_INFO_LIVE_TIME] ?: number;
    [Const.Main.KEYS.TEMP_DB_ENGINE] ?: string;
    [Const.Main.KEYS.TEMP_DB_Name] ?: string;
    [Const.Main.KEYS.TEMP_DB_CONFIG] ?: object;
    //End TEMP DB

    [Const.Main.KEYS.EXTRA_SECURE_AUTH] ?: boolean;

    [Const.Main.KEYS.AUTH_START] ?: boolean;
    [Const.Main.KEYS.AUTH_START_DURATION_MS] ?: number;

    [Const.Main.KEYS.POST_KEY_WORD] ?: string;
    [Const.Main.KEYS.AUTH_KEY] ?: string;
    [Const.Main.KEYS.AUTH_DEFAULT_EXPIRY] ?: number;
    [Const.Main.KEYS.AUTH_ALGORITHM] ?: string;
    [Const.Main.KEYS.AUTH_PRIVATE_KEY] ?: string;
    [Const.Main.KEYS.AUTH_PUBLIC_KEY] ?: string;

}

export interface PanelUserConfig {
    [Const.Main.PANEL_USER.USER_NAME] : string;
    [Const.Main.PANEL_USER.PASSWORD] : string;
}


export interface HttpsConfig {
    key ?: string;
    cert ?: string;
}
