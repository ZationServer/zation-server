/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import UpSocket              from "../sc/socket";
import {PrepareZationToken, ZationToken} from "../constants/internal";
import BaseSHBridge        from "../bridges/baseSHBridge";
import AEPreparedPart      from "../auth/aePreparedPart";
import BackError           from "../../api/BackError";
import AuthenticationError from "../error/authenticationError";
import {MainBackErrors}    from "../zationBackErrors/mainBackErrors";
import ZationConfigFull    from "../configManager/zationConfigFull";
import JwtSignOptions          from "../constants/jwt";
import ObjectUtils         from "../utils/objectUtils";
import ZationConfig        from "../configManager/zationConfig";
import JwtVerifyOptions from "../constants/jwt";
const  Jwt : any         = require('jsonwebtoken');
const uniqid             = require('uniqid');

export default class TokenUtils
{
    /**
     * Set custom token variables with BaseSHBridge.
     * @param customVar
     * @param shBridge
     */
    static async setCustomVar(customVar : object,shBridge : BaseSHBridge) : Promise<void>
    {
        let token = shBridge.getToken();
        if(token !== null) {
            token = {...token};
            token.zationCustomVariables = customVar;
            await shBridge.setToken(token);
        }
        else {
            throw new AuthenticationError(`Can't set token variable when the token is not available.`);
        }
    }

    /**
     * Set custom token variables on a socket.
     * @param customVar
     * @param socket
     */
    static async setSocketCustomVar(customVar : object, socket : UpSocket) : Promise<void>
    {
        let token = socket.authToken;
        if(token !== null) {
            token = {...token};
            token.zationCustomVariables = customVar;
            await TokenUtils.setSocketTokenAsync(socket,token);
        }
        else {
            throw new AuthenticationError(`Can't set token variable when socket is not authenticated.`);
        }
    }

    /**
     * Set the token of a socket async.
     * @param socket
     * @param data
     * @param jwtOptions
     */
    static async setSocketTokenAsync(socket : UpSocket, data : object, jwtOptions : JwtSignOptions = {}) {
        return new Promise<void>((resolve, reject) => {
            socket.setAuthToken(data,jwtOptions,(err) => {
                if(err){
                    reject(new AuthenticationError('Failed to set the auth token. Error => ' +
                        err.toString()))
                }
                else {
                    resolve();
                }
            });
        });
    }

    /**
     * Combine old token with new token.
     * @param token
     * @param newData
     */
    static combineTokens(token : PrepareZationToken | null,newData : PrepareZationToken) : object {
        if(token === null) {
            return newData;
        }
        else {
            const tokenClone = {...token};
            for(let k in newData) {
                if(newData.hasOwnProperty(k)) {
                    tokenClone[k] = newData[k];
                }
            }
            return tokenClone;
        }
    }

    static generateToken(tokenCheckKey : string) : PrepareZationToken {
        return {
            zationTokenId : uniqid(),
            zationCheckKey : tokenCheckKey
        };
    }

    /**
     * Get a custom token variables.
     * @param token
     */
    static getCustomTokenVariables(token : ZationToken | null) : object {
        return TokenUtils.getTokenVariable(nameof<ZationToken>(s => s.zationCustomVariables),token)
            || {};
    }

    /**
     * Get a token variable with a socket.
     * @param key
     * @param token
     */
    static getTokenVariable(key : string,token : ZationToken | null) : any {
        if(token !== null) {
            return token[key]
        }
        else {
            throw new AuthenticationError('Can\'t access token variable when the token is not available.');
        }
    }

    /**
     * Verify a signedToken.
     * @param signedToken
     * @param zc
     * @param jwtOptions
     */
    static async verifyToken(signedToken,zc : ZationConfigFull,jwtOptions : JwtVerifyOptions = {})
    {
        return new Promise((resolve, reject) =>
        {
            Jwt.verify(signedToken,zc.getVerifyKey(),jwtOptions,(err, decoded) => {
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

    /**
     * Sign a token.
     * @param data
     * @param zc
     * @param jwtOptions
     */
    static async signToken(data : object,zc : ZationConfig,jwtOptions : JwtSignOptions) : Promise<string>
    {
        return new Promise((resolve, reject) =>
        {
            const options = zc.getJwtSignOptions();
            ObjectUtils.addObToOb(options,jwtOptions);

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