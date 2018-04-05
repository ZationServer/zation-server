/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

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
}

module.exports = SHBridge;