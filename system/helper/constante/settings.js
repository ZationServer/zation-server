/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

class Settings {}

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
Settings.INPUT_TOKEN                    = 'to';

Settings.PARAM_DATA_PARAMS              = 'params';
Settings.PARAM_DATA_PARAMS_Missing      = 'paramsMissing';

Settings.CLIENT_AUTH_GROUP              = 'zationAuthGroup';
Settings.CLIENT_AUTH_ID                 = 'zationAuthId';
Settings.CLIENT_TOKEN_ID                = 'zationTokenId';
//ZATION SOCKET CHANNELS
Settings.SOCKET_USER_CHANNEL_PREFIX     = 'ZATION.USER.';
Settings.SOCKET_AUTH_GROUP_PREFIX       = 'ZATION.AUTH_GROUP.';
Settings.SOCKET_DEFAULT_GROUP           = 'ZATION.DEFAULT_GROUP';
Settings.SOCKET_ALL                     = 'ZATION.ALL';

Settings.SOCKET_SPECIAL_CHANNEL_PREFIX  = 'ZATION.SPECIAL_CHANNEL.';
Settings.SOCKET_SPECIAL_CHANNEL_ID      = '.CH_ID.';

//Generate Info to check Access for specialChannels
Settings.CHANNEL_INFO_AUTH_GROUP        = 'authGroup';
Settings.CHANNEL_INFO_IS_AUTH_IN        = 'authIn';
Settings.CHANNEL_INFO_ID                = 'id';
Settings.CHANNEL_INFO_SOCKET            = 'socket';

//Zation User Channel Events
Settings.USER_CHANNEL_AUTH_OUT          = 'zationAuthOut';
Settings.USER_CHANNEL_RE_AUTH           = 'zationReAuth';

Settings.TOKEN_INFO_STORAGE_KEY         = 'ZATION_TOKEN_INFO';

Settings.TOKEN_INFO_WITH_ID             = 'ID_INFO_TOKEN';
Settings.TOKEN_INFO_WITHOUT_ID          = 'INFO_TOKEN';


module.exports = Settings;