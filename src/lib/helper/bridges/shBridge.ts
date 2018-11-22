/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import TokenBridge   = require('./tokenBridge');
import ZationConfig  = require("../../main/zationConfig");
import {Socket}        from "../sc/socket";
import {ZationHttpInfo, ZationRequest} from "../constants/internal";
import * as core         from "express-serve-static-core";
import {IncomingMessage} from "http";
const  IP : any      = require('ip');

//Socket and Http Bridge
class SHBridge
{
    private readonly webSocket : boolean;
    private readonly socketData : object;
    private readonly socketRespond : Function;
    private readonly socket : Socket;
    private readonly httpRes : core.Response;
    private readonly httpReq : core.Request;
    private readonly httpData : object;
    private readonly zc : ZationConfig;

    private readonly tokenBridge : TokenBridge;
    
    constructor({isWebSocket,socketData,socketRespond,socket,httpRes,httpReq,httpData} : any, zc : ZationConfig)
    {
        this.webSocket = isWebSocket;
        this.socketData = socketData;
        this.socketRespond = socketRespond;
        this.socket = socket;
        this.httpRes = httpRes;
        this.httpReq = httpReq;
        this.httpData = httpData;
        this.zc = zc;

        this.tokenBridge = new TokenBridge(isWebSocket,socket,httpReq,zc);

        if(!this.isWebSocket() && this.httpRes['zationInfo'] === undefined)
        {
            this.httpRes['zationInfo'] = [];
        }
    }

    getHandshakeRequest() : IncomingMessage
    {
        if(this.isWebSocket()) {
            return this.socket.request;
        }
        else {
            return this.httpReq;
        }
    }

    getZationData() : ZationRequest
    {
        if(this.webSocket) {
            return this.socketData;
        }
        else {
            return this.httpData;
        }
    }

    getVersion() : number
    {
        if(this.webSocket) {
            return this.socket.zationClient.version;
        }
        else {
            //is checked before
            // @ts-ignore
            return this.getZationData().v;
        }
    }

    getSystem() : string
    {
        if(this.webSocket) {
            return this.socket.zationClient.system;
        }
        else {
            //is checked before
            // @ts-ignore
            return this.getZationData().v;
        }
    }

    getTokenBridge() : TokenBridge
    {
        return this.tokenBridge;
    }

    deauthenticate() : void
    {
        this.getTokenBridge().deauthenticate();
        if(!this.isWebSocket())
        {
            this.httpRes['zationInfo'].push(ZationHttpInfo.DEAUTHENTICATE);
        }
    }

    getSocket() : Socket
    {
        return this.socket;
    }

    getRemoteAddress() : any
    {
        if(this.webSocket) {
            return this.socket.remoteAddress;
        }
        else {
            return this.httpReq.headers['x-forwarded-for'] ||  this.httpReq.connection.remoteAddress;
        }
    }

    // noinspection JSUnusedGlobalSymbols
    getPublicRemoteAddress() : any
    {
        let reqId = this.getRemoteAddress();

        // noinspection TypeScriptValidateJSTypes
        if(IP.isPrivate(reqId)) {
            // noinspection TypeScriptValidateJSTypes
            return IP.address();
        }
        else {
            return reqId;
        }
    }

    getResponse() : core.Response
    {
        return this.httpRes;
    }

    getRequest() : core.Request {
        return this.httpReq;
    }

    isWebSocket() : boolean {
        return this.webSocket;
    }

}

export = SHBridge;