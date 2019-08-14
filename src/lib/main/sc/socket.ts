/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {ZationToken}        from "../constants/internal";
import {IncomingMessage}    from "http";
import BaseSHBridgeSocket   from "../bridges/baseSHBridgeSocket";
import AuthEngine           from "../auth/authEngine";
import ZSocket              from "../internalApi/ZSocket";
import DataBox              from "../../api/dataBox/DataBox";
import DataBoxFamily        from "../../api/dataBox/DataBoxFamily";

export type OnHandlerFunction = (data : any, response : RespondFunction) => void
export type RespondFunction = (err ?: any | number, responseData ?: any) => void

export interface RawSocket {
    readonly id : string;
    readonly request : IncomingMessage;
    readonly remoteAddress : string;
    readonly exchange : any;
    readonly state : string;
    readonly authState : string;
    authToken : ZationToken | null;
    readonly CONNECTING : string;
    readonly OPEN : string;
    readonly CLOSED : string;
    readonly AUTHENTICATED : string;
    readonly UNAUTHENTICATED : string;

    getState() : string;
    disconnect(code ?: any, data ?: any) : void;
    emit(event : string, data : object, callback ?: RespondFunction) : void;
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
export interface HandshakeSocket extends RawSocket {
    readonly handshakeVariables : Record<string,any>;
    readonly zationClient : {
        readonly version : number,
        readonly system : string,
    },
    readonly apiLevel : number | undefined
}

/**
 * Socket after socket upgrade.
 */
export default interface UpSocket extends HandshakeSocket {
    readonly sid : string;
    readonly tid : string;

    zationSocketVariables : Record<string,any>;
    dataBoxes : (DataBox | DataBoxFamily)[];
    readonly baseSHBridge : BaseSHBridgeSocket;
    readonly authEngine : AuthEngine;
    readonly zSocket : ZSocket;
}
