/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import Const            = require('../constants/constWrapper');
import TaskError        = require('../../api/TaskError');
import MainErrors       = require('../zationTaskErrors/mainTaskErrors');
import {ChAccessEngine}   from '../channel/chAccessEngine';
import TokenBridge      = require("../bridges/tokenBridge");
import ZationWorker     = require("../../main/zationWorker");
import ZationConfig     = require("../../main/zationConfig");
import {Socket}           from "../sc/socket";
const  Jwt : any        = require('jsonwebtoken');

class TokenTools
{
    private static async changeToken(data : object,tokenBridge : TokenBridge,worker : ZationWorker,updateOnly : boolean = true) : Promise<boolean>
    {
        let suc = false;
        if(data !== undefined) {
            if (!updateOnly || (updateOnly && !data.hasOwnProperty(Const.Settings.TOKEN.TOKEN_ID))) {
                const token = tokenBridge.getToken();
                if((typeof token === 'object') || (!updateOnly)) {
                    await tokenBridge.setToken(TokenTools.combineTokenAndProcess(token,data));
                    suc = true;
                }
                if(tokenBridge.isWebSocket()) {
                    ChAccessEngine.checkSocketZationChAccess(tokenBridge.getSocket());
                    await worker.getChAccessEngine().checkSocketCustomChAccess(tokenBridge.getSocket());
                }
            }
        }
        return suc;
    }

    private static async changeCustomVar(customVar : object,tokenBridge : TokenBridge,worker : ZationWorker) : Promise<boolean>
    {
        let suc = false;
        if(typeof customVar === 'object') {
            const token = tokenBridge.getToken();
            if(typeof token === 'object') {
                token[Const.Settings.TOKEN.CUSTOM_VARIABLES] = customVar;
                await tokenBridge.setToken(token);
                suc = true;
            }
            if(tokenBridge.isWebSocket()) {
                await worker.getChAccessEngine().checkSocketCustomChAccess(tokenBridge.getSocket());
            }
        }
        return suc;
    }

    private static combineTokenAndProcess(token : object,newData : object) : object
    {
        if(token === null) {
            return newData;
        }
        else {
            for(let k in newData) {
                if(newData.hasOwnProperty(k)) {
                    if(newData[k] === null) {
                        delete token[k];
                    }
                    else {
                        token[k] = newData[k];
                    }
                }
            }
            return token;
        }
    }

    static async createNewToken(data : object,tokenBridge : TokenBridge,worker : ZationWorker) : Promise<boolean> {
        return await TokenTools.changeToken(data,tokenBridge,worker,false);
    }

    static async updateToken(data : object,tokenBridge : TokenBridge,worker : ZationWorker) : Promise<boolean> {
        return await TokenTools.changeToken(data,tokenBridge,worker,true);
    }

    static async updateCustomTokenVar(customVar : object,tokenBridge : TokenBridge,worker : ZationWorker) : Promise<boolean> {
        return await TokenTools.changeCustomVar(customVar,tokenBridge,worker);
    }

    //ClientData
    static getTokenVariable(key : any,tokenBridge : TokenBridge) : any
    {
        if(tokenBridge.hasToken()) {
            return tokenBridge.getToken()[key];
        }
        else {
            return undefined;
        }
    }

    static getSocketTokenVariable(key : any,socket : Socket) : any
    {
        // noinspection JSUnresolvedFunction
        let token = socket.getAuthToken();
        if(!!token) {
            return token[key];
        }
        else {
            return undefined;
        }
    }
    //Part Http Token

    static async verifyToken(token,zc : ZationConfig)
    {
        return new Promise((resolve, reject) =>
        {
            let algorithm = zc.getMain(Const.Main.KEYS.AUTH_ALGORITHM);

            Jwt.verify(token,zc.getVerifyKey(),{algorithm : algorithm},(err,decoded) => {
                if(err) {
                    if(err.name === 'TokenExpiredError') {
                        reject(new TaskError(MainErrors.tokenExpiredError,{expiredAt : err.expiredAt}));
                    }
                    else if(err.name === 'JsonWebTokenError') {
                        reject(new TaskError(MainErrors.jsonWebTokenError,err));
                    }
                    else {
                        reject(new TaskError(MainErrors.unknownTokenVerifyError,err));
                    }
                }
                else {
                    resolve(decoded);
                }
            });
        });
    }

    static async signToken(data : object,zc : ZationConfig)
    {
        return new Promise((resolve, reject) =>
        {
            let options = {};
            options['algorithm'] = zc.getMain(Const.Main.KEYS.AUTH_ALGORITHM);

            if(data['exp'] === undefined) {
                options['expiresIn'] = zc.getMain(Const.Main.KEYS.AUTH_DEFAULT_EXPIRY);
            }

            Jwt.sign(data,zc.getSignKey(),options,(err,signedToken) => {
                if(err) {
                    reject(new TaskError(MainErrors.unknownTokenSignError,err));
                }
                else {
                    resolve(signedToken);
                }
            });
        });
    }

}

export = TokenTools;