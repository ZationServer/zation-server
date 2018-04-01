class Settings {}

Settings.CATION_AUTH_CONTROLLER         = 'authController';
Settings.CATION_CONTROLLER              = 'controller';
Settings.CATION_AUTH_GROUPS             = 'groups';
Settings.CATION_VERSION_CONTROL         = 'versionControl';
Settings.CATION_ACCESS_DEFAULT          = 'accessDefault';

Settings.CATION_SERVER_SOCKET_ACCESS     = 'socketAccess';
Settings.CATION_SERVER_HTTP_ACCESS       = 'httpAccess';


Settings.CONTROLLER_NAME                = 'name';
Settings.CONTROLLER_PATH                = 'path';
Settings.CONTROLLER_PARAMS              = 'params';
Settings.CONTROLLER_BEFORE_HANDLE       = 'beforeHandle';
Settings.CONTROLLER_RESULT              = 'result';
Settings.CONTROLLER_PARAMS_CAN_MISSING  = 'paramsCanMissing';
Settings.CONTROLLER_SYSTEM_CONTROLLER   = 'systemController';

Settings.CONTROLLER_NOT_ACCESS          = 'notAccess';
Settings.CONTROLLER_ACCESS              = 'access';

Settings.ACCESS_ALL_AUTH                = 'allAuth';
Settings.ACCESS_ALL_NOT_AUTH            = 'allNotAuth';
Settings.ACCESS_ALL                     = 'all';

Settings.PARAMS_NAME                    = 'name';
Settings.PARAMS_TYPE                    = 'type';
Settings.PARAMS_IS_OPTIONAL             = 'isOptional';

Settings.ERROR_NAME                     = 'name';
Settings.ERROR_DESCRIPTION              = 'description';
Settings.ERROR_TYPE                     = 'type';
Settings.ERROR_SEND_INFO                = 'sendInfo';
Settings.ERROR_IS_SYSTEM_ERROR          = 'isSystemError';
Settings.ERROR_IS_PRIVATE               = 'isPrivate';

Settings.ERROR_INFO_MAIN                = 'main';

Settings.INPUT_CONTROLLER               = 'c';
Settings.INPUT_PARAMS                   = 'p';
Settings.INPUT_TASK                     = 't';
Settings.INPUT_VERSION                  = 'v';
Settings.INPUT_SYSTEM                   = 's';
Settings.INPUT_AUTH                     = 'a';

Settings.PARAM_DATA_PARAMS              = 'params';
Settings.PARAM_DATA_PARAMS_Missing      = 'paramsMissing';

Settings.AUTH_DEFAULT_GROUP             = 'defaultGroup';
Settings.AUTH_AUTH_GROUPS               = 'authGroups';

Settings.CLIENT_AUTH_GROUP              = 'cationAuthGroup';
Settings.CLIENT_AUTH_ID                 = 'cationAuthId';

//CATION SOCKET CHANNELS
Settings.SOCKET_USER_CHANNEL_PREFIX     = 'CATION.USER.';
Settings.SOCKET_AUTH_GROUP_PREFIX       = 'CATION.AUTH_GROUP.';
Settings.SOCKET_DEFAULT_GROUP           = 'CATION.DEFAULT_GROUP';
Settings.SOCKET_ALL                     = 'CATION.ALL';

Settings.SOCKET_SPECIAL_CHANNEL_PREFIX  = 'CATION.SPECIAL_CHANNEL.';
Settings.SOCKET_SPECIAL_CHANNEL_ID      = '.CH_ID.';

//CHANNEL CONFIG
Settings.CHANNEL_PUBLISH                = 'publish';
Settings.CHANNEL_SUBSCRIBE              = 'subscribe';
Settings.CHANNEL_SPECIAL_CHANNELS       = 'specialChannels';
Settings.CHANNEL_DEFAULT_RIGHTS         = 'defaultRights';


//Generate Info to check Access for specialChannels
Settings.CHANNEL_INFO_AUTH_GROUP   = 'authGroup';
Settings.CHANNEL_INFO_IS_AUTH_IN        = 'authIn';
Settings.CHANNEL_INFO_ID                = 'id';
Settings.CHANNEL_INFO_SOCKET            = 'socket';

//Cation User Channel Events
Settings.USER_CHANNEL_AUTH_OUT          = 'cationAuthOut';
Settings.USER_CHANNEL_RE_AUTH           = 'cationReAuth';


//Main Config
Settings.START_CONFIG_DEBUG_MODE             = 'debugMode';
Settings.START_CONFIG_PORT                   = 'port';
Settings.START_CONFIG_SOCKET                 = 'sockets';
Settings.START_CONFIG_WORKERS                = 'workers';
Settings.START_CONFIG_BROKERS                = 'brokers';
Settings.START_CONFIG_APP_NAME               = 'appName';
Settings.START_CONFIG_AUTO                   = 'auto';
Settings.START_CONFIG_USE_SOCKET_SERVER      = 'useSocketServer';
Settings.START_CONFIG_USE_HTTP_SERVER        = 'useHttpServer';
Settings.START_CONFIG_SESSION_SECRET_KEY     = 'sessionSecretKey';
Settings.START_CONFIG_SESSION_STORE          = 'sessionStore';
Settings.START_CONFIG_SECURE                 = 'secure';
Settings.START_CONFIG_STORE                  = 'store';
Settings.START_CONFIG_STORE_REDIS            = 'redis';
Settings.START_CONFIG_STORE_MONGO_DB         = 'mongoDb';
Settings.START_CONFIG_STORE_CONFIG           = 'config';
Settings.START_CONFIG_SESSION_CONFIG         = 'sessionConfig';
Settings.START_CONFIG_HTTPS_CONFIG           = 'httpsConfig';
Settings.START_CONFIG_CONTROLLER_LOCATION    = 'controllerLocation';
Settings.START_CONFIG_POST_KEY_WORD          = 'postKeyWord';
Settings.START_CONFIG_USE_AUTH               = 'useAuth';
Settings.START_CONFIG_USE_PROTOCOL_CHECK     = 'useProtocolCheck';
Settings.START_CONFIG_SEND_ERRORS_DESC       = 'sendErrorDescription';
Settings.START_CONFIG_MYSQL_POOL             = 'mySqlPool';
Settings.START_CONFIG_NODE_MAILER            = 'nodeMailer';

module.exports = Settings;