/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

export enum HttpGetRequest
{
    VERSION                      = 'v',
    SYSTEM                       = 's',
    AUTH_REQ                     = 'a',
    VALI_REQ                     = 'vr',
    CONTROLLER                   = 'c',
    SYSTEM_CONTROLLER            = 'sc',
    INPUT                        = 'i',
    TOKEN                        = 't'
}

export enum ZationHttpInfo {
    DEAUTHENTICATE = 'deauthenticate'
}

export enum TaskErrorInfo {
    MAIN = 'main'
}

//legend
/*
INPUT                        = 'i',
TASK                         = 't',
VERSION                      = 'v',
SYSTEM                       = 's',
AUTH                         = 'a',
TOKEN                        = 'to',
 */
export interface ZationRequest {
    s ?: string,
    to ?: string,
    t ?: {
        i : object | any[]
        c ?: string,
        sc ?: string
    }
    a ?: {
        i : object | any[],
    },
    v ?: {
        i : any[] | object,
        c ?: string,
        sc ?: string
    } | number
}

//legend
/*
i = input
c = controller
sc = systemController
 */
export interface ZationTask {
    i : object | any[],
    c ?: string,
    sc ?: string
}

//legend
/*
i = input with objects (inputPath,value) (to check)
c = controller
sc = systemController
 */
export interface ZationValidationCheck {
    i : {ip : string, v : any}[]
    c ?: string,
    sc ?: string
}

//legend
/*
n = name
g = group
t = type
d = description
zs = from zation system
i = info
 */
export interface ResponseTaskError {
    n : string,
    g ?: string,
    t : string
    d ?: string,
    zs : boolean,
    i ?: object | TaskErrorInfo
}

//legend
/*
e = errors
s = successful
r = result
t = token (st = signedToken,pt = plainToken)
zhi = zation http info
 */
export interface ZationResponse {
    e : ResponseTaskError[],
    s : boolean,
    r : ResponseResult
    t ?: {
        st : string,
        pt : object
    },
    zhi ?: string[]
}

//legend
/*
r = main result
s = result status code
 */
export interface ResponseResult {
    r ?: any,
    s ?: string | number
}

export enum ZationAccess {
    ALL_AUTH                = 'allAuth',
    ALL_NOT_AUTH            = 'allNotAuth',
    ALL                     = 'all'
}

export interface ZationToken extends PrepareZationToken{
    zationTokenId : string,
    zationUserId ?: string | number,
    exp : number,
}

export interface PrepareZationToken {
    zationAuthUserGroup ?: string,
    zationUserId ?: string | number | null,
    zationTokenId ?: string,
    zationPanelAccess ?: boolean,
    zationOnlyPanelToken ?: boolean,
    exp ?: number,
    zationCheckKey ?: string,
    zationCustomVariables ?: object
}

export interface ConfigScriptSave {
    appConfig ?: string | object,
    channelConfig ?: string | object,
    errorConfig ?: string | object,
    eventConfig ?: string | object,
    serviceConfig ?: string | object
}

export enum ZationChannel {
    //Zation Main Channels
    USER_CHANNEL_PREFIX         = 'ZATION.USER.',
    AUTH_USER_GROUP_PREFIX      = 'ZATION.AUTH_USER_GROUP.',
    DEFAULT_USER_GROUP          = 'ZATION.DEFAULT_USER_GROUP',
    ALL                         = 'ZATION.ALL',
    PANEL_IN                    = 'ZATION.PANEL_IN',
    PANEL_OUT                   = 'ZATION.PANEL_OUT',
    //Custom Channels
    CUSTOM_ID_CHANNEL_PREFIX    = 'ZATION.CUSTOM_ID_CHANNEL.',
    CUSTOM_CHANNEL_ID           = '.CH_ID.',
    CUSTOM_CHANNEL_PREFIX       = 'ZATION.CUSTOM_CHANNEL.',
    //intern channels
    ALL_WORKER                  = 'ZATION.ALL_WORKER'
}

export const DefaultUserGroupFallBack = 'default';

//CN = CONFIG_NAMES
export enum ConfigNames
{
    APP             = 'App     :',
    CHANNEL         = 'Channel :',
    MAIN            = 'Main    :',
    ERROR           = 'Error   :',
    EVENT           = 'Event   :',
    SERVICE         = 'Service :',
    STARTER         = 'Starter :'
}


