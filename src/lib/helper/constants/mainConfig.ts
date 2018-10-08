/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

class KEYS {
    static readonly PORT                                  = 'port';
    static readonly HOSTNAME                              = 'hostname';
    static readonly PATH                                  = 'path';
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
    static readonly USE_HTTP_METHOD_CHECK                 = 'useHttpMethodCheck';
    static readonly SEND_ERRORS_DESC                      = 'sendErrorDescription';
    static readonly ZATION_CONSOLE_LOG                    = 'zationConsoleLog';
    static readonly SC_CONSOLE_LOG                        = 'scConsoleLog';
    static readonly USE_SC_UWS                            = 'useScUws';
    static readonly USE_TOKEN_CHECK_KEY                   = 'useTokenCheckKey';

    static readonly USE_PANEL                             = 'usePanel';
    static readonly PANEL_USER                            = 'panelUser';
    static readonly CLIENT_JS_PREPARE                     = 'clientJsPrepare';

    //Auth Start
    static readonly AUTH_START                     = 'authStart';
    static readonly AUTH_START_DURATION_MS         = 'authStartDuration';

    //Cluster
    static readonly CLUSTER_AUTH_KEY                      = 'clusterAuthKey';
    static readonly CLUSTER_SECRET_KEY                    = 'clusterSecretKey';
    static readonly STATE_SERVER_HOST                     = 'stateServerHost';
    static readonly STATE_SERVER_PORT                     = 'stateServerPort';

    static readonly CLUSTER_SHARE_TOKEN_AUTH              = 'clusterShareTokenAuth';
    static readonly CLUSTER_MAPPING_ENGINE                = 'clusterMappingEngine';
    static readonly CLUSTER_CLIENT_POOL_SIZE              = 'clusterClientPoolSize';
    static readonly CLUSTER_INSTANCE_IP                   = 'clusterInstanceIp';
    static readonly CLUSTER_INSTANCE_IP_FAMILY            = 'clusterInstanceIpFamily';
    static readonly CLUSTER_STATE_SERVER_CONNECT_TIMEOUT  = 'clusterStateServerConnectTimeout';
    static readonly CLUSTER_STATE_SERVER_ACK_TIMEOUT      = 'clusterStateServerAckTimeout';
    static readonly CLUSTER_STATE_SERVER_RECONNECT_RANDOMNESS = 'clusterStateServerReconnectRandomness';

    //Sc
    static readonly SC_LOG_LEVEL                          = 'scLogLevel';
    static readonly SOCKET_CHANNEL_LIMIT                  = 'socketChannelLimit';
    static readonly CRASH_WORKER_ON_ERROR                 = 'crashWorkerOnError';
    static readonly REBOOT_WORKER_ON_CRASH                = 'rebootWorkerOnCrash';
    static readonly KILL_MASTER_ON_SIGNAL                 = 'killMasterOnSignal';
    static readonly INSTANCE_ID                           = 'instanceId';
    static readonly KILL_WORKER_MEMORY_THRESHOLD          = 'killWorkerMemoryThreshold';
    static readonly CONNECT_TIMEOUT                       = 'connectTimeout';
    static readonly HANDSHAKE_TIMEOUT                     = 'handshakeTimeout';
    static readonly ACK_TIMEOUT                           = 'ackTimeout';
    static readonly IPC_ACK_TIMEOUT                       = 'ipcAckTimeout';
    static readonly SOCKET_UPGRADE_TIMEOUT                = 'socketUpgradeTimeout';
    static readonly ORIGINS                               = 'origins';
    static readonly PING_INTERVAL                         = 'pingInterval';
    static readonly PING_TIMEOUT                          = 'pingTimeout';
    static readonly PROCESS_TERM_TIME_OUT                 = 'processTermTimeout';
    static readonly PROPAGATE_ERRORS                      = 'propagateErrors';
    static readonly PROPAGATE_WARNINGS                    = 'true';
    static readonly MIDDLEWARE_EMIT_WARNINGS              = 'middlewareEmitWarnings';
    static readonly REBOOT_ON_SIGNAL                      = 'rebootOnSignal';
    static readonly DOWNGRADE_TO_USER                     = 'downgradeToUser';
    static readonly SOCKET_ROOT                           = 'socketRoot';
    static readonly SCHEDULING_POLICY                     = 'schedulingPolicy';
    static readonly ALLOW_CLIENT_PUBLISH                  = 'allowClientPublish';
    static readonly TCP_SYN_BACKLOG                       = 'tcpSynBacklog';
    static readonly WORKER_STATUS_INTERVAL                = 'workerStatusInterval';
    static readonly PUB_SUB_BATCH_DURATION                = 'pubSubBatchDuration';

    //ADVANCE
    static readonly POST_KEY               = 'postKey';

    static readonly AUTH_KEY               = 'authKey';
    static readonly AUTH_DEFAULT_EXPIRY    = 'authDefaultExpiry';
    static readonly AUTH_ALGORITHM         = 'authAlgorithm';
    static readonly AUTH_PRIVATE_KEY       = 'authPrivateKey';
    static readonly AUTH_PUBLIC_KEY        = 'authPublicKey';
}

class OPTIONS {
    static readonly AUTO            = 'auto';
}

class PANEL_USER {
    static readonly PASSWORD            = 'password';
    static readonly USER_NAME           = 'userName';
}

class HTTPS_CONFIG {
    static readonly CER            = 'cert';
    static readonly KEY            = 'key';
}

class MainConfig
{
    public static readonly OPTIONS = OPTIONS;
    public static readonly KEYS = KEYS;
    public static readonly PANEL_USER = PANEL_USER;
    public static readonly HTTPS_CONFIG = HTTPS_CONFIG;
}



export = MainConfig;