/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import Const                         = require('./../constants/constWrapper');
import {MongoClientOptions}            from "mongodb";
import {ServerOptions}                 from "https";

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
    [Const.Main.KEYS.HTTPS_CONFIG] ?: ServerOptions;
    [Const.Main.KEYS.USE_AUTH] ?: boolean;
    [Const.Main.KEYS.USE_PROTOCOL_CHECK] ?: boolean;
    [Const.Main.KEYS.SEND_ERRORS_DESC] ?: boolean;
    [Const.Main.KEYS.SYSTEM_BACKGROUND_TASK_REFRESH_RATE] ?: number;
    [Const.Main.KEYS.ZATION_CONSOLE_LOG] ?: boolean;
    [Const.Main.KEYS.SC_CONSOLE_LOG] ?: boolean;
    [Const.Main.KEYS.USE_SC_UWS] ?: boolean;

    [Const.Main.KEYS.USE_PANEL] ?: boolean;
    [Const.Main.KEYS.PANEL_USER] ?: PanelUserConfig | PanelUserConfig[];
    [Const.Main.KEYS.CLIENT_JS_PREPARE] ?: boolean;

    [Const.Main.KEYS.EXTRA_SECURE_AUTH] ?: boolean;

    [Const.Main.KEYS.AUTH_START] ?: boolean;
    [Const.Main.KEYS.AUTH_START_DURATION_MS] ?: number;

    [Const.Main.KEYS.POST_KEY_WORD] ?: string;
    [Const.Main.KEYS.AUTH_KEY] ?: string;
    [Const.Main.KEYS.AUTH_DEFAULT_EXPIRY] ?: number;
    [Const.Main.KEYS.AUTH_ALGORITHM] ?: string;
    [Const.Main.KEYS.AUTH_PRIVATE_KEY] ?: string;
    [Const.Main.KEYS.AUTH_PUBLIC_KEY] ?: string;

    //TempStorage
    [Const.Main.KEYS.TEMP_STORAGE_ENGINE] ?: string;
    [Const.Main.KEYS.TEMP_STORAGE_MONGO_DB_OPTIONS] ?: (TempStorageOptions & MongoClientOptions);

    //Cluster
    [Const.Main.KEYS.CLUSTER_AUTH_KEY] ?: string | null;
    [Const.Main.KEYS.CLUSTER_SECRET_KEY] ?: string | null;
    [Const.Main.KEYS.STATE_SERVER_HOST] ?: string | null;
    [Const.Main.KEYS.STATE_SERVER_PORT] ?: number | null;

    [Const.Main.KEYS.CLUSTER_SHARE_TOKEN_AUTH] ?: boolean;
    [Const.Main.KEYS.CLUSTER_MAPPING_ENGINE] ?: string | null;
    [Const.Main.KEYS.CLUSTER_CLIENT_POOL_SIZE] ?: number | null;
    [Const.Main.KEYS.CLUSTER_INSTANCE_IP] ?: string | null;
    [Const.Main.KEYS.CLUSTER_INSTANCE_IP_FAMILY] ?: string | null;
    [Const.Main.KEYS.CLUSTER_STATE_SERVER_CONNECT_TIMEOUT] ?: number | null;
    [Const.Main.KEYS.CLUSTER_STATE_SERVER_ACK_TIMEOUT] ?: number | null;
    [Const.Main.KEYS.CLUSTER_STATE_SERVER_RECONNECT_RANDOMNESS] ?: number | null;

    //Sc
    [Const.Main.KEYS.SC_LOG_LEVEL] ?: number;
    [Const.Main.KEYS.SOCKET_CHANNEL_LIMIT] ?: number;
    [Const.Main.KEYS.CRASH_WORKER_ON_ERROR] ?: boolean;
    [Const.Main.KEYS.REBOOT_WORKER_ON_CRASH] ?: boolean;
    [Const.Main.KEYS.KILL_MASTER_ON_SIGNAL] ?: boolean;
    [Const.Main.KEYS.INSTANCE_ID] ?: string | null;
    [Const.Main.KEYS.KILL_WORKER_MEMORY_THRESHOLD] ?: number | null;
    [Const.Main.KEYS.CONNECT_TIMEOUT] ?: number;
    [Const.Main.KEYS.HANDSHAKE_TIMEOUT] ?: number;
    [Const.Main.KEYS.ACK_TIMEOUT] ?: number;
    [Const.Main.KEYS.IPC_ACK_TIMEOUT] ?: number;
    [Const.Main.KEYS.SOCKET_UPGRADE_TIMEOUT] ?: number;
    [Const.Main.KEYS.ORIGINS] ?: string;
    [Const.Main.KEYS.PING_INTERVAL] ?: number;
    [Const.Main.KEYS.PING_TIMEOUT] ?: number;
    [Const.Main.KEYS.PROCESS_TERM_TIME_OUT] ?: number;
    [Const.Main.KEYS.PROPAGATE_ERRORS] ?: boolean;
    [Const.Main.KEYS.PROPAGATE_WARNINGS] ?: boolean;
    [Const.Main.KEYS.MIDDLEWARE_EMIT_WARNINGS] ?: boolean;
    [Const.Main.KEYS.REBOOT_ON_SIGNAL] ?: boolean;
    [Const.Main.KEYS.DOWNGRADE_TO_USER] ?: boolean;
    [Const.Main.KEYS.SOCKET_ROOT] ?: string | null;
    [Const.Main.KEYS.SCHEDULING_POLICY] ?: string | null;
    [Const.Main.KEYS.ALLOW_CLIENT_PUBLISH] ?: boolean;
    [Const.Main.KEYS.TCP_SYN_BACKLOG] ?: any | null;
    [Const.Main.KEYS.WORKER_STATUS_INTERVAL] ?: number;
    [Const.Main.KEYS.PUB_SUB_BATCH_DURATION] ?: number | null;
}

export interface PanelUserConfig {
    [Const.Main.PANEL_USER.USER_NAME] : string;
    [Const.Main.PANEL_USER.PASSWORD] : string;
}

export interface TempStorageOptions {
    url : string,
    db : string
}
