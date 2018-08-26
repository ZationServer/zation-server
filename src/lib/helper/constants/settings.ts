/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

class ERROR_INFO
{
    static readonly MAIN                    = 'main';
}

class ERROR
{
    static readonly NAME                         = 'name';
    static readonly DESCRIPTION                  = 'description';
    static readonly TYPE                         = 'type';
    static readonly SEND_INFO                    = 'sendInfo';
    static readonly INFO                         = 'info';
    static readonly IS_FROM_ZATION_SYSTEM        = 'isFromZationSystem';
    static readonly IS_PRIVATE                   = 'isPrivate';
    static readonly IN_INFO                      = ERROR_INFO;
}

class REQUEST_INPUT
{
    static readonly INPUT                        = 'i';
    static readonly TASK                         = 't';
    static readonly VERSION                      = 'v';
    static readonly SYSTEM                       = 's';
    static readonly AUTH                         = 'a';
    static readonly TOKEN                        = 'to';
}

class RESPONSE_ERROR
{
    static readonly Name                         = 'n';
    static readonly TYPE                         = 't';
    static readonly FROM_ZATION_SYSTEM           = 'zs';
    static readonly DESCRIPTION                  = 'd';
    static readonly INFO                         = 'i';
}

class ZATION_HTTP_INFO
{
    static readonly DEAUTHENTICATE               = 'deauthenticate';
}

class RESPONSE
{
    static readonly ERRORS                       = 'e';
    static readonly SUCCESSFUL                   = 's';
    static readonly RESULT                       = 'r';
    static readonly TOKEN                        = 't';
    static readonly ZATION_INFO                  = 'zi';

    static readonly TOKEN_SIGNED                 = 'st';
    static readonly TOKEN_PLAIN                  = 'pt';

    static readonly RESULT_MAIN                  = 'r';
    static readonly RESULT_STATUS                = 's';

    static readonly ERROR                        = RESPONSE_ERROR;
}

class REQ_IN_C
{
    static readonly CONTROLLER        = 'c';
    static readonly SYSTEM_CONTROLLER = 'sc';
}

class VALIDATION_REQUEST_INPUT
{
    static readonly MAIN              = 'v';
    static readonly INPUT             = 'i';
    static readonly INPUT_KEY_PATH    = 'kp';
    static readonly INPUT_VALUE       = 'v';
}

class INTERNAL_DATA
{
    static readonly TOKEN_CHECK_KEY   = 'tokenCheckKey';
}

class TOKEN
{
    static readonly AUTH_USER_GROUP             = 'zationAuthUserGroup';
    static readonly USER_ID                     = 'zationUserId';
    static readonly TOKEN_ID                    = 'zationTokenId';
    static readonly PANEL_ACCESS                = 'zationPanelAccess';
    static readonly EXPIRE                      = 'exp';
    static readonly CHECK_KEY                   = 'zationCheckKey';
    static readonly CUSTOM_VARIABLES            = 'zationCustomVariables';
}

class SOCKET
{
    static readonly VARIABLES            = 'zationSocketVariables';
}

class CHANNEL
{
    //Zation Main Channels
    static readonly USER_CHANNEL_PREFIX       = 'ZATION.USER.';
    static readonly AUTH_USER_GROUP_PREFIX    = 'ZATION.AUTH_USER_GROUP.';
    static readonly DEFAULT_USER_GROUP        = 'ZATION.DEFAULT_USER_GROUP';
    static readonly ALL                       = 'ZATION.ALL';
    static readonly PANEL                     = 'ZATION.PANEL';

    //Custom Channels
    static readonly CUSTOM_ID_CHANNEL_PREFIX  = 'ZATION.CUSTOM_ID_CHANNEL.';
    static readonly CUSTOM_CHANNEL_ID         = '.CH_ID.';

    static readonly CUSTOM_CHANNEL_PREFIX     = 'ZATION.CUSTOM_CHANNEL.';

    //Internal Channels
    static readonly ALL_WORKER                = 'ZATION.ALL_WORKER';
    static readonly TOKEN_CHANNEL_PREFIX      = 'ZATION.TOKEN.';
}


class SOCKET_EMIT_EVENTS
{
    static readonly DEAUTHENTICATE        = 'ZATION.DEAUTHENTICATE';
    static readonly RE_AUTH               = 'ZATION.RE_AUTH';
}

class DEFAULT_USER_GROUP
{
    static readonly FALLBACK        = 'default';
}

class TEMP_DB
{
    static readonly TOKEN_INFO_NAME            = 'tokenInfo';
    static readonly ERROR_INFO_NAME            = 'errorInfo';
}

class CONNECTION_STATE_VALUES
{
    static readonly CON    = 'CON'; //connected
    static readonly DIS    = 'DIS'; //disconnected
}

class TOKEN_INFO
{
    static readonly USER_ID                 = 'USER_ID';
    static readonly AUTH_USER_GROUP         = 'AUTH_USER_GROUP';
    static readonly IS_BLOCKED              = 'IS_BLOCKED';
    static readonly EXPIRE                  = 'EXPIRE';
    static readonly CONNECTION_STATE        = 'CONNECTION_STATE';
    static readonly CREATED_REMOTE_ADDRESS  = 'CREATED_REMOTE_ADDRESS';
    
    static readonly CONNECTION_STATE_VALUES = CONNECTION_STATE_VALUES;
}

//CN = CONFIG_NAMES
class CN
{
    static readonly APP             = 'App     :';
    static readonly CHANNEL         = 'Channel :';
    static readonly MAIN            = 'Main    :';
    static readonly ERROR           = 'Error   :';
    static readonly EVENT           = 'Event   :';
    static readonly SERVICE         = 'Service :';
    static readonly STARTER         = 'Starter :';
}

class Settings
{
    static readonly ERROR = ERROR;
    static readonly REQUEST_INPUT = REQUEST_INPUT;
    static readonly VALIDATION_REQUEST_INPUT = VALIDATION_REQUEST_INPUT;
    static readonly CLIENT = TOKEN;
    static readonly CHANNEL = CHANNEL;
    static readonly USER_CHANNEL = SOCKET_EMIT_EVENTS;
    static readonly DEFAULT_USER_GROUP = DEFAULT_USER_GROUP;
    static readonly TEMP_DB = TEMP_DB;
    static readonly TOKEN_INFO = TOKEN_INFO;
    static readonly CN = CN;
    static readonly RESPONSE = RESPONSE;
    static readonly ZATION_HTTP_INFO = ZATION_HTTP_INFO;
    static readonly REQ_IN_C = REQ_IN_C;
    static readonly SOCKET = SOCKET;
    static readonly INTERNAL_DATA = INTERNAL_DATA;
}

export = Settings;