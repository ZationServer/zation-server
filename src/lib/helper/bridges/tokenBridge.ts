/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import ZationConfig = require("../../main/zationConfig");
import TokenTools   = require('../token/tokenTools');

class TokenBridge
{
    private readonly webSocket : boolean;
    private readonly socket : any;
    private readonly req : any;
    private readonly zc : ZationConfig;

    private newToken : boolean;
    private plainTokenTemp : object;
    
    constructor(isWebSocket : boolean,socket : any,req : any,zc : ZationConfig)
    {
        this.webSocket = isWebSocket;
        this.socket = socket;
        this.req = req;
        this.zc = zc;

        this.newToken = false;
        this.plainTokenTemp = {};
    }

    isWebSocket() : boolean
    {
        return this.webSocket;
    }

    getSocket() : any
    {
        return this.socket;
    }

    tokenIsThere() : boolean
    {
        let token = this.getToken();
        return token !== undefined && token !== null;
    }

    deauthenticate() : void
    {
        if(this.webSocket)
        {
            this.socket.deauthenticate();
        }
    }

    hasToken() : boolean
    {
        let token = this.getToken();
        return  token !== undefined && token !== null;
    }

    getToken() : any
    {
        if(this.webSocket)
        {
            // noinspection JSUnresolvedFunction
            return this.socket.getAuthToken();
        }
        else
        {
            // noinspection JSUnresolvedVariable
            if(this.newToken)
            {
                return this.plainTokenTemp;
            }
            else
            {
                return this.req.zationToken;
            }
        }
    }

    setToken(data : object) : void
    {
        this.newToken = true;

        if(this.webSocket)
        {
            // noinspection JSUnresolvedFunction
            this.socket.setAuthToken(data);
        }
        else
        {
            this.plainTokenTemp = data;
        }
    }

    async getSignedToken() : Promise<any>
    {
        return await TokenTools.signToken(this.plainTokenTemp,this.zc);
    }

    getPlainToken() : object
    {
        return this.plainTokenTemp;
    }

    isNewToken() : boolean
    {
        return this.newToken;
    }
}

export = TokenBridge;