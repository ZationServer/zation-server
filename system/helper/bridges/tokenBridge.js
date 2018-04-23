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

        this._hasNewToken = false;

        this._plainTokenTemp = {};
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

    deauthenticate()
    {
        if(this._isSocket)
        {
            this._socket.deauthenticate();
        }
    }

    hasToken()
    {
        let token = this.getToken();
        return  token !== undefined && token !== null;
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
            if(this._hasNewToken)
            {
                return this._plainTokenTemp;
            }
            else
            {
                return this._req.zationToken;
            }
        }
    }

    setToken(data)
    {

        this._hasNewToken = true;

        if(this._isSocket)
        {
            // noinspection JSUnresolvedFunction
            this._socket.setAuthToken(data);
        }
        else
        {
            this._plainTokenTemp = data;
        }
    }

    async getSignedToken()
    {
        return await TokenTools.signToken(this._plainTokenTemp,this._zc);
    }

    getPlainToken()
    {
        return this._plainTokenTemp;
    }

    hasNewToken()
    {
        return this._hasNewToken;
    }
}

module.exports = TokenBridge;