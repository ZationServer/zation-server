/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {PrepareZationToken, RawZationToken} from "../constants/internal";
import {JwtSignFunction, JwtSignOptions, JwtVerifyFunction, JwtVerifyOptions} from "../constants/jwt";
import AuthConfig          from "../auth/authConfig";
import BackError           from "../../api/BackError";
import {MainBackErrors}    from "../zationBackErrors/mainBackErrors";
import ZationConfigFull    from "../config/manager/zationConfigFull";
import ObjectUtils         from "../utils/objectUtils";
import ZationConfig        from "../config/manager/zationConfig";
const  Jwt: any         = require('jsonwebtoken');
const uniqid            = require('uniqid');

export default class TokenUtils
{
    static generateToken(tokenCheckKey: string): PrepareZationToken {
        return {
            tid: uniqid(),
            clusterKey: tokenCheckKey
        };
    }

    /**
     * Verify a signedToken.
     * @param signedToken
     * @param zc
     * @param jwtOptions
     */
    static async verifyToken(signedToken,zc: ZationConfigFull,jwtOptions: JwtVerifyOptions = {}): Promise<Record<string,any>>
    {
        return new Promise((resolve, reject) =>
        {
            (Jwt.verify as JwtVerifyFunction)(signedToken,zc.getVerifyKey(),jwtOptions,(err, decoded) => {
                if(err) {
                    if(err.name === 'TokenExpiredError') {
                        reject(new BackError(MainBackErrors.tokenExpiredError,{expiredAt: err.expiredAt}));
                    }
                    else if(err.name === 'JsonWebTokenError') {
                        reject(new BackError(MainBackErrors.jsonWebTokenError,err));
                    }
                    else {
                        reject(new BackError(MainBackErrors.unknownTokenVerifyError,{err: err.toString()}));
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
    static async signToken(data: object,zc: ZationConfig,jwtOptions: JwtSignOptions): Promise<string>
    {
        return new Promise((resolve, reject) =>
        {
            const options = zc.getJwtSignOptions();
            ObjectUtils.mergeTwoObjects(options,jwtOptions);

            (Jwt.sign as JwtSignFunction)(data,zc.getSignKey(),options,(err,signedToken) => {
                if(err) {
                    reject(new BackError(MainBackErrors.unknownTokenSignError,{err: err.toString()}));
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
    static checkToken(token: RawZationToken | null, ae: AuthConfig) {
        if(token != null)
        {
            const authUserGroup = token.authUserGroup;
            if(authUserGroup !== undefined) {
                if(token.onlyPanelToken){
                    throw new BackError(MainBackErrors.tokenWithAuthUserGroupAndOnlyPanel);
                }
                if (!ae.isValidAuthUserGroup(authUserGroup)) {
                    throw new BackError(MainBackErrors.inTokenSavedAuthUserGroupIsNotFound,
                        {
                            savedAuthUserGroup: authUserGroup,
                            authUserGroupsInZationConfig: ae.getAuthUserGroups()
                        });
                }
            }
            else {
                if(!(typeof token.onlyPanelToken === 'boolean' && token.onlyPanelToken)) {
                    throw new BackError(MainBackErrors.tokenWithoutAuthUserGroup);
                }
            }
        }
    }

    /**
     * Creates a closure for checking the token cluster key.
     */
    static createTokenClusterKeyChecker(zc: ZationConfig): TokenClusterKeyCheckFunction {
        if(zc.mainConfig.useTokenClusterKeyCheck){
            return (token) => {
                if(token.clusterKey !== zc.internalData.tokenClusterKey) {
                    throw new Error('Wrong or missing token cluster key in the token.')
                }
            }
        }
        else {
            return () => {};
        }
    }

}

export type TokenClusterKeyCheckFunction = (token: RawZationToken) => void;