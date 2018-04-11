/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

const TokenBridge = require('./tokenBridge');

//Socket and Http Bridge
class SHBridge
{
    constructor({isSocket,socketData,socketRespond,socket,httpRes,httpReq,httpData})
    {
        this._isSocket = isSocket;
        this._socketData = socketData;
        this._socketRespond = socketRespond;
        this._socket = socket;
        this._httpRes = httpRes;
        this._httpReq = httpReq;
        this._httpData = httpData;

        this._tokenBridge = new TokenBridge(isSocket,socket,httpReq);
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


}

module.exports = SHBridge;