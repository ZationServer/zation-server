/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import {BackErrorInfo} from "../../constants/internal";

export enum HttpGetRequest
{
    VERSION                      = 'v',
    SYSTEM                       = 's',
    AUTH_REQ                     = 'a',
    VALI_REQ                     = 'vr',
    CONTROLLER                   = 'c',
    SYSTEM_CONTROLLER            = 'sc',
    API_LEVEL                    = 'al',
    INPUT                        = 'i',
    TOKEN                        = 't'
}

export enum ZationHttpInfo {
    DEAUTHENTICATE = 'deauthenticate'
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
    al ?: number,
    t ?: ZationTask
    a ?: {
        i : any,
    },
    v ?: ZationValidationCheck | number
}

//legend
/*
i = input
c = controller
sc = systemController
 */
export interface ZationTask {
    i : any,
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
    i : ValidationCheckPair[]
    c ?: string,
    sc ?: string
}

export interface ValidationCheckPair {
    ip : string | string[],
    v : any
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
export interface ResponseError {
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
successful = errors.length === 0
r = result
t = token (st = signedToken,pt = plainToken)
zhi = zation http info
 */
export interface ZationResponse {
    e : ResponseError[],
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