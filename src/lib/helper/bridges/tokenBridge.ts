/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import ZationConfig = require("../../main/zationConfig");
import TokenTools   = require('../token/tokenTools');
import {ZationToken} from "../constants/internal";
import {Socket}      from "../sc/socket";
import AuthenticationError = require("../error/authenticationError");

class TokenBridge
{
    private readonly webSocket : boolean;
    private readonly socket : Socket;
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

    deauthenticate() : void
    {
        if(this.webSocket) {
            this.socket.deauthenticate();
        }
    }

    hasToken() : boolean
    {
        let token = this.getToken();
        return  token !== undefined && token !== null;
    }

    getToken() : ZationToken | null
    {
        if(this.webSocket) {
            // noinspection JSUnresolvedFunction
            return this.socket.getAuthToken();
        }
        else
        {
            // noinspection JSUnresolvedVariable
            if(this.newToken) {
                // @ts-ignore
                return this.plainTokenTemp;
            }
            else {
                return this.req.zationToken;
            }
        }
    }

    async setToken(data : object) : Promise<void>
    {
        return new Promise<void>((resolve, reject) => {
            this.newToken = true;
            if(this.webSocket) {
                this.socket.setAuthToken(data,{},(err) => {
                    if(err){
                        reject(new AuthenticationError('Failed to set the auth token. Error => ' +
                        err.toString()))
                    }
                    else {resolve();}
                });
            }
            else {
                this.plainTokenTemp = data;
                resolve();
            }
        });
    }

    async getSignedToken() : Promise<any>
    {
        return await TokenTools.signToken(this.plainTokenTemp,this.zc);
    }

    getPlainToken() : ZationToken
    {
        // @ts-ignore
        return this.plainTokenTemp;
    }

    isNewToken() : boolean
    {
        return this.newToken;
    }
}

export = TokenBridge;