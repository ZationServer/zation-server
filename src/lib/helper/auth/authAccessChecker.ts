/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

// noinspection TypeScriptPreferShortImport
import AuthEngine         from "./authEngine";
import ZationTokenInfo    from "../internalApi/zationTokenInfo";
import Bag                from "../../api/Bag";
import AccessUtils        from "../access/accessUtils";
import {AuthAccessFunction, AuthAccessConfig} from "../config/definitions/configComponents";

export type TokenStateAccessCheckFunction = (authEngine : AuthEngine) => Promise<boolean>;

export default class AuthAccessChecker
{
    /**
     * Returns a Closures for checking the token state access to a controller.
     * @param accessConfig
     * @param bag
     */
    static createAuthAccessChecker(accessConfig : AuthAccessConfig, bag : Bag) : TokenStateAccessCheckFunction {

        const notAccess = accessConfig.notAccess;
        const access    = accessConfig.access;

        let accessProcess : (boolean) => boolean;
        let accessValue;

        //double keyword is checked in the starter checkConfig
        //search One
        if(notAccess !== undefined) {
            accessProcess = (b) => !b;
            accessValue = accessConfig.notAccess;
        }
        else if(access !== undefined) {
            accessProcess = (b) => b;
            accessValue = accessConfig.access;
        }
        else {
            //access is not defined
            return async () => {
                return false;
            };
        }

        return AccessUtils.createAccessChecker<TokenStateAccessCheckFunction,AuthAccessFunction>
        (accessValue,accessProcess,(func) => {
            return async (authEngine) => {
                const token = authEngine.getSHBridge().getToken();
                return accessProcess((await func(bag,token !== null ? new ZationTokenInfo(token) : null)));
            };
        });
    }
}

