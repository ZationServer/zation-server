/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

const TokenBridge   = require('./tokenBridge');
const TokenTools    = require('./../token/tokenTools');
const IP            = require('ip');

//Socket and Http Bridge
class SHBridge
{
    constructor({isSocket,socketData,socketRespond,socket,httpRes,httpReq,httpData},zc)
    {
        this._isSocket = isSocket;
        this._socketData = socketData;
        this._socketRespond = socketRespond;
        this._socket = socket;
        this._httpRes = httpRes;
        this._httpReq = httpReq;
        this._httpData = httpData;
        this._zc = zc;

        this._tokenBridge = new TokenBridge(isSocket,socket,httpReq,zc);
    }

    getZationData()
    {
        if(this._isSocket)
        {
            return this._socketData;
        }
        else
        {
            return this._httpData;
        }
    }

    getTokenBridge()
    {
        return this._tokenBridge;
    }

    getSocket()
    {
        return this._socket;
    }

    getRemoteAddress()
    {
        if(this._isSocket)
        {
            return this._socket.remoteAddress;
        }
        else
        {
            return this._httpReq.headers['x-forwarded-for'] ||  this._httpReq.connection.remoteAddress;
        }
    }

    getPublicRemoteAddress()
    {
        let reqId = this.getRemoteAddress();

        if(IP.isPrivate(reqId))
        {
            return IP.address();
        }
        else
        {
            return reqId;
        }
    }

    getResponse()
    {
        return this._httpRes;
    }

    getRequest()
    {
        return this._httpReq;
    }

    isSocket()
    {
        return this._isSocket;
    }

    getTokenVariable(key)
    {
        return TokenTools.getTokenVariable(key,this.getTokenBridge());
    }



}

module.exports = SHBridge;