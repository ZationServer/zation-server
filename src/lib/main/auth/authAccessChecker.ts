/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

// noinspection TypeScriptPreferShortImport
import AuthEngine         from "./authEngine";
import ZationTokenInfo    from "../internalApi/zationTokenInfo";
import Bag                from "../../api/Bag";
import AccessUtils        from "../access/accessUtils";
import {NormalAuthAccessFunction, AuthAccessConfig} from "../config/definitions/configComponents";

export type TokenStateAccessCheckFunction = (authEngine : AuthEngine) => Promise<boolean>;

export default class AuthAccessChecker
{
    /**
     * Returns a Closures for checking the token state access to a controller.
     * @param accessConfig
     * @param bag
     */
    static createAuthAccessChecker(accessConfig : AuthAccessConfig<NormalAuthAccessFunction>, bag : Bag) : TokenStateAccessCheckFunction {

        const info = AuthAccessChecker.processAuthAccessInfo(accessConfig);

        if(info){
            const {accessValue,accessProcess} = info;
            return AccessUtils.createAccessChecker<TokenStateAccessCheckFunction,NormalAuthAccessFunction>
            (accessValue,accessProcess,(func) => {
                return async (authEngine) => {
                    const token = authEngine.getSHBridge().getToken();
                    return accessProcess((await func(bag,token !== null ? new ZationTokenInfo(token) : null)));
                };
            });
        }
        //access is not defined
        return async () => {
            return false;
        };
    }

    static processAuthAccessInfo(accessConfig : AuthAccessConfig<any>) :
        {accessValue : any, accessProcess : (bool : boolean) => boolean} | undefined
    {
        const notAccess = accessConfig.notAccess;
        const access    = accessConfig.access;

        //double keyword is checked in the starter checkConfig
        //search One
        if(notAccess !== undefined) {
            return {
                accessProcess : (b) => !b,
                accessValue : accessConfig.notAccess
            };
        }
        else if(access !== undefined) {
            return {
                accessProcess : (b) => b,
                accessValue : accessConfig.access
            };
        }
        else {
           return undefined;
        }
    }
}