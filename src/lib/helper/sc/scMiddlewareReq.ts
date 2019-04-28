/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import PubData       from "../infoObjects/pubData";
import UpSocket, {HandshakeSocket, ScSocket} from "./socket";
import {ZationToken}     from "../constants/internal";
import {IncomingMessage} from 'http';

export interface PubOutMiddlewareReq  {
    data : PubData,
    channel : string,
    socket : UpSocket,
    authTokenExpiredError ?: any
}

export interface PubInMiddlewareReq extends PubOutMiddlewareReq {
    ackData : any
}

export interface SubMiddlewareReq  {
    data : Record<string,any>,
    channel : string,
    socket : UpSocket,
    waitForAuth ?: boolean,
    authTokenExpiredError ?: any
}

export interface HandshakeScMiddlewareReq  {
    socket : HandshakeSocket
}

export interface HandshakeWsMiddlewareReq extends IncomingMessage, Record<string,any> {
}

export interface AuthMiddlewareReq  {
    socket : HandshakeSocket,
    authToken : ZationToken,
    signedToken : string
}

export interface EmitMiddlewareReq  {
    socket : UpSocket,
    event : string,
    data : any,
    authTokenExpiredError ?: any
}