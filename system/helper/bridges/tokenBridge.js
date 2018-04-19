/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

const TokenTools  = require('../token/tokenTools');

class TokenBridge
{
    constructor(isSocket,socket,req,zc)
    {
        this._isSocket = isSocket;
        this._socket = socket;
        this._req = req;
        this._zc = zc;
    }

    isSocket()
    {
        return this._isSocket;
    }

    getSocket()
    {
        return this._socket;
    }

    tokenIsThere()
    {
        let token = this.getToken();
        return token !== undefined && token !== null;
    }

    getToken()
    {
        if(this._isSocket)
        {
            // noinspection JSUnresolvedFunction
            return this._socket.getAuthToken();
        }
        else
        {
            // noinspection JSUnresolvedVariable
            return this._req.zationToken;
        }
    }

    async setToken(data)
    {
        if(this._isSocket)
        {
            // noinspection JSUnresolvedFunction
            this._socket.setAuthToken(data);
        }
        else
        {
            await this._res.signedToken = TokenTools.signToken(data,this._zc);

        }
    }



}