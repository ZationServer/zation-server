/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {RawSocket}        from "./socket";
import {RawZationToken}   from "../definitions/internal";
import {IncomingMessage}  from 'http';

export interface PubOutMiddlewareReq  {
    data: any,
    channel: string,
    socket: RawSocket,
    authTokenExpiredError?: any
}

export interface PubInMiddlewareReq extends PubOutMiddlewareReq {
    ackData: any
}

export interface SubMiddlewareReq  {
    data: Record<string,any>,
    channel: string,
    socket: RawSocket,
    waitForAuth?: boolean,
    authTokenExpiredError?: any
}

export interface HandshakeScMiddlewareReq  {
    socket: RawSocket
}

export interface HandshakeWsMiddlewareReq extends IncomingMessage, Record<string,any> {
}

export interface AuthMiddlewareReq  {
    socket: RawSocket,
    authToken: RawZationToken,
    signedToken: string
}