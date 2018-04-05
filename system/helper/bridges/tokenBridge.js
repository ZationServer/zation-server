/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

const tokenEngine = require('../token/tokenTools');
const Jwt         = require('jsonwebtoken');

class TokenBridge
{
    constructor(isSocket,socket,req)
    {
        this._isSocket = isSocket;
        this._socket = socket;
        this._req = req;
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
            return this._req.zationAuthToken;
        }
    }

    setToken(data)
    {
        if(this._isSocket)
        {
            // noinspection JSUnresolvedFunction
            this._socket.setAuthToken(data);
        }
        else
        {
            try
            {



            }
            catch(e)
            {

            }
        }
    }



}