/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import ChAccessEngine      from '../channel/chAccessEngine';
import ZationWorker      = require("../../main/zationWorker");
import Socket              from "../sc/socket";
import {ZationToken}       from "../constants/internal";
import BaseSHBridge        from "../bridges/baseSHBridge";
import AEPreparedPart      from "../auth/aePreparedPart";
import BackError           from "../../api/BackError";
import AuthenticationError from "../error/authenticationError";
import {MainBackErrors}    from "../zationBackErrors/mainBackErrors";
import ZationConfig        from "../../main/zationConfig";
const  Jwt : any         = require('jsonwebtoken');

export default class TokenTools
{
    /**
     * Change token variables.
     * @param data
     * @param shBridge
     * @param worker
     * @param updateOnly
     */
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

    /**
     * Change custom token variables.
     * @param customVar
     * @param shBridge
     * @param worker
     */
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

    /**
     * Change custom token variables with a socket.
     * @param customVar
     * @param socket
     * @param worker
     */
    static async changeSocketCustomVar(customVar : object, socket : Socket, worker : ZationWorker) : Promise<boolean>
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


    /**
     * Combine old token with new token.
     * @param token
     * @param newData
     */
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

    /**
     * Create a new token.
     * @param data
     * @param shBridge
     * @param worker
     */
    static async createNewToken(data : object,shBridge : BaseSHBridge,worker : ZationWorker) : Promise<boolean> {
        return await TokenTools.changeToken(data,shBridge,worker,false);
    }


    /**
     * Update token variables.
     * @param data
     * @param shBridge
     * @param worker
     */
    static async updateToken(data : object,shBridge : BaseSHBridge,worker : ZationWorker) : Promise<boolean> {
        return await TokenTools.changeToken(data,shBridge,worker,true);
    }

    /**
     * Update the custom token variables.
     * @param customVar
     * @param shBridge
     * @param worker
     */
    static async updateCustomTokenVar(customVar : object,shBridge : BaseSHBridge,worker : ZationWorker) : Promise<boolean> {
        return await TokenTools.changeCustomVar(customVar,shBridge,worker);
    }

    /**
     * Get a token variable.
     * @param key
     * @param shBridge
     */
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

    /**
     * Get a custom token variable with a socket.
     * @param socket
     */
    static getSocketCustomTokenVariables(socket : Socket) : object {
        const ctv = TokenTools.getSocketTokenVariable(
        nameof<ZationToken>(s => s.zationCustomVariables),socket);
        return ctv !== undefined ? ctv : {};
    }

    /**
     * Get a token variable with a socket.
     * @param key
     * @param socket
     */
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
                        reject(new BackError(MainBackErrors.tokenExpiredError,{expiredAt : err.expiredAt}));
                    }
                    else if(err.name === 'JsonWebTokenError') {
                        reject(new BackError(MainBackErrors.jsonWebTokenError,err));
                    }
                    else {
                        reject(new BackError(MainBackErrors.unknownTokenVerifyError,{err : err.toString()}));
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
                    reject(new BackError(MainBackErrors.unknownTokenSignError,{err : err.toString()}));
                }
                else {
                    resolve(signedToken);
                }
            });
        });
    }

    /**
     * Check if a token is valid with server configuration.
     * @param token
     * @param ae
     */
    static checkToken(token : ZationToken | null, ae : AEPreparedPart) {
        if(token !== null)
        {
            const authUserGroup = token.zationAuthUserGroup;
            if(authUserGroup !== undefined) {
                if(token.zationOnlyPanelToken){
                    throw new BackError(MainBackErrors.tokenWithAuthGroupAndOnlyPanel);
                }
                if (!ae.isAuthGroup(authUserGroup)) {
                    //saved authGroup is in Server not define
                    //noinspection JSUnresolvedFunction
                    throw new BackError(MainBackErrors.inTokenSavedAuthGroupIsNotFound,
                        {
                            savedAuthGroup: authUserGroup,
                            authGroupsInZationConfig: ae.getAuthGroups()
                        });
                }
            }
            else {
                if(!(typeof token.zationOnlyPanelToken === 'boolean' && token.zationOnlyPanelToken)) {
                    //token without auth group and it is not a only panel token.
                    throw new BackError(MainBackErrors.tokenWithoutAuthGroup);
                }
            }
        }
    }

}