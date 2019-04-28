/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import {ZationToken}        from "../constants/internal";
import {IncomingMessage}    from "http";
import BaseShBridgeSocket   from "../bridges/baseShBridgeSocket";
import AuthEngine           from "../auth/authEngine";
import SocketInfo           from "../infoObjects/socketInfo";

export type OnHandlerFunction = (data : any, response : ResponseFunction) => void
export type ResponseFunction = (err ?: any | number, responseData ?: any) => void

/**
 * Normal socket from socket cluster.
 */
export interface ScSocket {
    id : string;
    request : IncomingMessage;
    remoteAddress : string;
    exchange : any;
    state : string;
    authState : string;
    authToken : ZationToken | null;
    CONNECTING : string;
    OPEN : string;
    CLOSED : string;
    AUTHENTICATED : string;
    UNAUTHENTICATED : string;

    getState() : string;
    disconnect(code ?: any, data ?: any) : void;
    emit(event : string, data : object, callback ?: ResponseFunction) : void;
    on(event : string, handler : OnHandlerFunction) : void;
    off(event ?: string, handler ?: Function) : void;
    send(data : any, options ?: object) : void;
    getAuthToken() : ZationToken | null;

    /**
     * Set the auth token of the socket.
     * This is method is used internally;
     * if you do not use it carefully,
     * it can create a not valid zation token and break the worker memory stored information.
     * So please use the Bag or SmallBag to change token variables.
     * @param data
     * @param options
     * @param callback
     */
    setAuthToken(data : object, options ?: object,callback ?: Function) : void;
    deauthenticate() : void;
    kickOut(channel ?: string, message ?: string, callback ?: Function) : void;
    subscriptions() : string[];
    isSubscribed(channelName : string) : boolean;
}

/**
 * Socket after sc handshake.
 */
export interface HandshakeSocket extends ScSocket {
    handshakeVariables : Record<string,any>;
    zationClient : {
        version : number,
        system : string
    }
}

/**
 * Socket after socket upgrade.
 */
export default interface UpSocket extends HandshakeSocket {
    sid : string;
    tid : string;

    zationSocketVariables : Record<string,any>;
    baseSHBridge : BaseShBridgeSocket;
    authEngine : AuthEngine;
    socketInfo : SocketInfo;
}

