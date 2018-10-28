/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import TokenBridge   = require('./tokenBridge');
import ZationConfig  = require("../../main/zationConfig");
import Const         = require("../constants/constWrapper");
import {Socket}        from "../sc/socket";
const  IP : any      = require('ip');

//Socket and Http Bridge
class SHBridge
{
    private readonly webSocket : boolean;
    private readonly socketData : object;
    private readonly socketRespond : Function;
    private readonly socket : any;
    private readonly httpRes : any;
    private readonly httpReq : any;
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

    getZationData() : object
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
            return this.getZationData()[Const.Settings.REQUEST_INPUT.VERSION];
        }
    }

    getSystem() : string
    {
        if(this.webSocket) {
            return this.socket.zationClient.system;
        }
        else {
            return this.getZationData()[Const.Settings.REQUEST_INPUT.SYSTEM];
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
            this.httpRes['zationInfo'].push(Const.Settings.ZATION_HTTP_INFO.DEAUTHENTICATE);
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

    getResponse() : any
    {
        return this.httpRes;
    }

    getRequest() : any {
        return this.httpReq;
    }

    isWebSocket() : boolean {
        return this.webSocket;
    }

}

export = SHBridge;