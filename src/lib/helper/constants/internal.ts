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

export enum BackErrorInfo {
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
        i : any
        c ?: string,
        sc ?: string
    }
    a ?: {
        i : any,
    },
    v ?: {
        i : any,
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
    i ?: any,
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
export interface ErrorResponse {
    n : string,
    g ?: string,
    t : string
    d ?: string,
    zs : boolean,
    i ?: object | BackErrorInfo
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
    e : ErrorResponse[],
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
    zationAuthUserGroup : string
}

export interface PrepareZationToken {
    zationAuthUserGroup ?: string,
    zationUserId ?: string | number | undefined,
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
    USER_CHANNEL_PREFIX = 'Z_U.',
    AUTH_USER_GROUP_PREFIX = 'Z_AUG.',
    DEFAULT_USER_GROUP = 'Z_DUG',
    ALL = 'Z_ALL',
    PANEL_IN = 'Z_PI',
    PANEL_OUT = 'Z_PO',
    //Custom Channels
    CUSTOM_ID_CHANNEL_PREFIX = 'Z_CID_C.',
    CUSTOM_CHANNEL_ID = '.',
    CUSTOM_CHANNEL_PREFIX = 'Z_C_C.',
    //intern channels
    ALL_WORKER                  = 'Z_AW'
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



