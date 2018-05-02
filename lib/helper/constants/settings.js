/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

class Settings {}

Settings.ERROR_NAME                         = 'name';
Settings.ERROR_DESCRIPTION                  = 'description';
Settings.ERROR_TYPE                         = 'type';
Settings.ERROR_SEND_INFO                    = 'sendInfo';
Settings.ERROR_IS_FROM_ZATION_SYSTEM        = 'isFromZationSystem';
Settings.ERROR_IS_PRIVATE                   = 'isPrivate';

Settings.ERROR_INFO_MAIN                    = 'main';

Settings.INPUT_CONTROLLER                   = 'c';
Settings.INPUT_PARAMS                       = 'p';
Settings.INPUT_TASK                         = 't';
Settings.INPUT_VERSION                      = 'v';
Settings.INPUT_SYSTEM                       = 's';
Settings.INPUT_AUTH                         = 'a';
Settings.INPUT_TOKEN                        = 'to';

Settings.PARAM_DATA_PARAMS                  = 'params';
Settings.PARAM_DATA_PARAMS_MISSING          = 'paramsMissing';

Settings.CLIENT_AUTH_GROUP                  = 'zationAuthGroup';
Settings.CLIENT_AUTH_ID                     = 'zationAuthId';
Settings.CLIENT_TOKEN_ID                    = 'zationTokenId';
Settings.CLIENT_PANEL_ACCESS                = 'zationPanelAccess';
Settings.CLIENT_EXPIRE                      = 'exp';

//ZATION SOCKET CHANNELS
Settings.CHANNEL_USER_CHANNEL_PREFIX        = 'ZATION.USER.';
Settings.CHANNEL_AUTH_GROUP_PREFIX          = 'ZATION.AUTH_GROUP.';
Settings.CHANNEL_DEFAULT_GROUP              = 'ZATION.DEFAULT_GROUP';
Settings.CHANNEL_ALL                        = 'ZATION.ALL';
Settings.CHANNEL_PANNEL                     = 'ZATION.PANEL';

Settings.CHANNEL_SPECIAL_CHANNEL_PREFIX     = 'ZATION.SPECIAL_CHANNEL.';
Settings.CHANNEL_SPECIAL_CHANNEL_ID         = '.CH_ID.';

//Zation User Channel Events
Settings.USER_CHANNEL_AUTH_OUT              = 'zationAuthOut';
Settings.USER_CHANNEL_RE_AUTH               = 'zationReAuth';

//Temp
Settings.TEMP_DB_TOKEN_INFO_NAME            = 'tokenInfo';
Settings.TEMP_DB_ERROR_INFO_NAME            = 'errorInfo';

Settings.TOKEN_INFO_AUTH_ID                 = 'AUTH_ID';
Settings.TOKEN_INFO_AUTH_GROUP              = 'AUTH_GROUP';
Settings.TOKEN_INFO_IS_BLOCKED              = 'IS_BLOCKED';
Settings.TOKEN_INFO_EXPIRE                  = 'EXPIRE';
Settings.TOKEN_INFO_CONNECTION_STATE        = 'CONNECTION_STATE';
Settings.TOKEN_INFO_CREATED_REMOTE_ADDRESS  = 'CREATED_REMOTE_ADDRESS';

Settings.TOKEN_INFO_CONNECTION_STATE_CON    = 'CON'; //connected
Settings.TOKEN_INFO_CONNECTION_STATE_DIS    = 'DIS'; //disconnected

module.exports = Settings;