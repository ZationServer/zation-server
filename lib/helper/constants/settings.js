/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

class Settings {}

Settings.ERROR = {};
Settings.ERROR.NAME                         = 'name';
Settings.ERROR.DESCRIPTION                  = 'description';
Settings.ERROR.TYPE                         = 'type';
Settings.ERROR.SEND_INFO                    = 'sendInfo';
Settings.ERROR.IS_FROM_ZATION_SYSTEM        = 'isFromZationSystem';
Settings.ERROR.IS_PRIVATE                   = 'isPrivate';

Settings.ERROR.INFO = {};
Settings.ERROR.INFO.MAIN                    = 'main';

Settings.REQUEST_INPUT = {};
Settings.REQUEST_INPUT.CONTROLLER                   = 'c';
Settings.REQUEST_INPUT.INPUT                        = 'i';
Settings.REQUEST_INPUT.TASK                         = 't';
Settings.REQUEST_INPUT.VERSION                      = 'v';
Settings.REQUEST_INPUT.SYSTEM                       = 's';
Settings.REQUEST_INPUT.AUTH                         = 'a';
Settings.REQUEST_INPUT.TOKEN                        = 'to';

Settings.VALIDATION_REQUEST_INPUT = {};
Settings.VALIDATION_REQUEST_INPUT.MAIN              = 'v';
Settings.VALIDATION_REQUEST_INPUT.CONTROLLER        = 'c';
Settings.VALIDATION_REQUEST_INPUT.INPUT             = 'i';
Settings.VALIDATION_REQUEST_INPUT.KEY_PATH          = 'kp';
Settings.VALIDATION_REQUEST_INPUT.VALUE             = 'v';

Settings.INPUT_DATA = {};
Settings.INPUT_DATA.INPUT                   = 'input';
Settings.INPUT_DATA.INPUT_MISSING           = 'inputMissing';

Settings.CLIENT = {};
Settings.CLIENT.AUTH_USER_GROUP             = 'zationAuthUserGroup';
Settings.CLIENT.USER_ID                     = 'zationUserId';
Settings.CLIENT.TOKEN_ID                    = 'zationTokenId';
Settings.CLIENT.PANEL_ACCESS                = 'zationPanelAccess';
Settings.CLIENT.EXPIRE                      = 'exp';

//ZATION SOCKET CHANNELS
Settings.CHANNEL = {};
Settings.CHANNEL.USER_CHANNEL_PREFIX        = 'ZATION.USER.';
Settings.CHANNEL.AUTH_USER_GROUP_PREFIX     = 'ZATION.AUTH_USER_GROUP.';
Settings.CHANNEL.DEFAULT_USER_GROUP         = 'ZATION.DEFAULT_USER_GROUP';
Settings.CHANNEL.ALL                        = 'ZATION.ALL';
Settings.CHANNEL.PANNEL                     = 'ZATION.PANEL';

Settings.CHANNEL.CUSTOM_CHANNEL_PREFIX     = 'ZATION.CUSTOM_CHANNEL.';
Settings.CHANNEL.CUSTOM_CHANNEL_ID         = '.CH_ID.';

//Zation User Channel Events
Settings.USER_CHANNEL = {};
Settings.USER_CHANNEL.AUTH_OUT              = 'zationAuthOut';
Settings.USER_CHANNEL.RE_AUTH               = 'zationReAuth';

//Groups
Settings.DEFAULT_USER_GROUP = {};
Settings.DEFAULT_USER_GROUP.FALLBACK        = 'default';

//Temp
Settings.TEMP_DB = {};
Settings.TEMP_DB.TOKEN_INFO_NAME            = 'tokenInfo';
Settings.TEMP_DB.ERROR_INFO_NAME            = 'errorInfo';

Settings.TOKEN_INFO = {};
Settings.TOKEN_INFO.USER_ID                 = 'USER_ID';
Settings.TOKEN_INFO.AUTH_USER_GROUP         = 'AUTH_USER_GROUP';
Settings.TOKEN_INFO.IS_BLOCKED              = 'IS_BLOCKED';
Settings.TOKEN_INFO.EXPIRE                  = 'EXPIRE';
Settings.TOKEN_INFO.CONNECTION_STATE        = 'CONNECTION_STATE';
Settings.TOKEN_INFO.CREATED_REMOTE_ADDRESS  = 'CREATED_REMOTE_ADDRESS';

Settings.TOKEN_INFO.CONNECTION_STATE_VALUES = {};
Settings.TOKEN_INFO.CONNECTION_STATE_VALUES.CON    = 'CON'; //connected
Settings.TOKEN_INFO.CONNECTION_STATE_VALUES.DIS    = 'DIS'; //disconnected

//CN = CONFIG_NAMES
Settings.CN = {};
Settings.CN.APP             = 'App     :';
Settings.CN.CHANNEL         = 'Channel :';
Settings.CN.MAIN            = 'Main    :';
Settings.CN.ERROR           = 'Error   :';
Settings.CN.EVENT           = 'Event   :';
Settings.CN.SERVICE         = 'Service :';

module.exports = Settings;