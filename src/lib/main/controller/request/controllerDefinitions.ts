/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {BackErrorInfo} from "../../constants/internal";

export class HttpGetReq {
    static readonly VERSION = 'v';
    static readonly SYSTEM = 's';
    static readonly AUTH_REQ = 'a';
    static readonly VALI_REQ = 'vr';
    static readonly CONTROLLER = 'c';
    static readonly SYSTEM_CONTROLLER = 'sc';
    static readonly API_LEVEL = 'al';
    static readonly INPUT = 'i';
    static readonly TOKEN = 't';
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
    s?: string,
    to?: string,
    al?: number,
    t?: ZationTask
    a?: {
        i: any,
    },
    v?: ZationValidationCheck | number
}

//legend
/*
i = input
c = controller
sc = systemController
 */
export interface ZationTask {
    i: any,
    c?: string,
    sc?: string
}

//legend
/*
i = input with objects (path,value) (to check)
c = controller
sc = systemController
 */
export interface ZationValidationCheck {
    i: ValidationCheckPair[]
    c?: string,
    sc?: string
}

export interface ValidationCheckPair {
    p: string | string[],
    v: any
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
    n: string,
    g?: string,
    t: string
    d?: string,
    zs: boolean,
    i?: object | BackErrorInfo
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
    e: ResponseError[],
    r: ResponseResult
    t?: {
        st: string,
        pt: object
    },
    zhi?: string[]
}

//legend
/*
r = main result
s = result status code
 */
export interface ResponseResult {
    r?: any,
    s?: string | number
}