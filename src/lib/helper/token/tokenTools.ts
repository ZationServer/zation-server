/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import TaskError        = require('../../api/TaskError');
import MainErrors       = require('../zationTaskErrors/mainTaskErrors');
import {ChAccessEngine}   from '../channel/chAccessEngine';
import ZationWorker     = require("../../main/zationWorker");
import ZationConfig     = require("../../main/zationConfig");
import {Socket}           from "../sc/socket";
import {ZationToken}      from "../constants/internal";
import AuthenticationError = require("../error/authenticationError");
import {BaseSHBridge}     from "../bridges/baseSHBridge";
const  Jwt : any        = require('jsonwebtoken');

class TokenTools
{
    private static async changeToken(data : object,shBridge : BaseSHBridge,worker : ZationWorker,updateOnly : boolean = true) : Promise<boolean>
    {
        let suc = false;
        if(data !== undefined) {
            if (!updateOnly || (updateOnly && !data.hasOwnProperty(nameof<ZationToken>(s => s.zationTokenId)) &&
                !data.hasOwnProperty(nameof<ZationToken>(s => s.zationCheckKey)))) {
                const token = shBridge.getToken();
                if((typeof token === 'object') || (!updateOnly)) {
                    await shBridge.setToken(TokenTools.combineTokenAndProcess(token,data));
                    suc = true;
                }
                if(shBridge.isWebSocket()) {
                    ChAccessEngine.checkSocketZationChAccess(shBridge.getSocket());
                    await worker.getChAccessEngine().checkSocketCustomChAccess(shBridge.getSocket());
                }
            }
        }
        return suc;
    }

    private static async changeCustomVar(customVar : object,shBridge : BaseSHBridge,worker : ZationWorker) : Promise<boolean>
    {
        let suc = false;
        if(typeof customVar === 'object') {
            const token = shBridge.getToken();
            if(typeof token === 'object' && token !== null) {
                token.zationCustomVariables = customVar;
                await shBridge.setToken(token);
                suc = true;
            }
            if(shBridge.isWebSocket()) {
                await worker.getChAccessEngine().checkSocketCustomChAccess(shBridge.getSocket());
            }
        }
        return suc;
    }

    static async changeCustomVarWithSocket(customVar : object,socket : Socket,worker : ZationWorker) : Promise<boolean>
    {
        let suc = false;
        if(typeof customVar === 'object') {
            const token = socket.getAuthToken();
            if(typeof token === 'object' && token !== null) {
                token.zationCustomVariables = customVar;
                await new Promise((resolve,reject) => {
                    socket.setAuthToken(token,{},(err) => {
                        if(err){
                            reject(new AuthenticationError('Failed to set the auth token. Error => ' +
                                err.toString()))
                        }
                        else {resolve();}
                    });
                });
                suc = true;
            }
            await worker.getChAccessEngine().checkSocketCustomChAccess(socket);
        }
        return suc;
    }

    private static combineTokenAndProcess(token : object | null,newData : object) : object
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

    static async createNewToken(data : object,shBridge : BaseSHBridge,worker : ZationWorker) : Promise<boolean> {
        return await TokenTools.changeToken(data,shBridge,worker,false);
    }

    static async updateToken(data : object,shBridge : BaseSHBridge,worker : ZationWorker) : Promise<boolean> {
        return await TokenTools.changeToken(data,shBridge,worker,true);
    }

    static async updateCustomTokenVar(customVar : object,shBridge : BaseSHBridge,worker : ZationWorker) : Promise<boolean> {
        return await TokenTools.changeCustomVar(customVar,shBridge,worker);
    }

    //ClientData
    static getTokenVariable(key : any,shBridge : BaseSHBridge) : any
    {
        const token = shBridge.getToken();
        if(token !== null) {
            return token[key];
        }
        else {
            return undefined;
        }
    }

    static getCustomTokenVariablesWithSocket(socket : Socket) : object {
        const ctv = TokenTools.getSocketTokenVariable(
        nameof<ZationToken>(s => s.zationCustomVariables),socket);
        return ctv !== undefined ? ctv : {};
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
            Jwt.verify(token,zc.getVerifyKey(),zc.getJwtOptions(),(err,decoded) => {
                if(err) {
                    if(err.name === 'TokenExpiredError') {
                        reject(new TaskError(MainErrors.tokenExpiredError,{expiredAt : err.expiredAt}));
                    }
                    else if(err.name === 'JsonWebTokenError') {
                        reject(new TaskError(MainErrors.jsonWebTokenError,err));
                    }
                    else {
                        reject(new TaskError(MainErrors.unknownTokenVerifyError,{err : err.toString()}));
                    }
                }
                else {
                    resolve(decoded);
                }
            });
        });
    }

    static async signToken(data : object,zc : ZationConfig) : Promise<string>
    {
        return new Promise((resolve, reject) =>
        {
            const options = zc.getJwtOptions();

            if(data['exp'] === undefined) {
                options['expiresIn'] = zc.mainConfig.authDefaultExpiry;
            }

            Jwt.sign(data,zc.getSignKey(),options,(err,signedToken) => {
                if(err) {
                    reject(new TaskError(MainErrors.unknownTokenSignError,{err : err.toString()}));
                }
                else {
                    resolve(signedToken);
                }
            });
        });
    }

}

export = TokenTools;