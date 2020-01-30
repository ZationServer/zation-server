/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

// noinspection TypeScriptPreferShortImport
import AuthEngine         from "./authEngine";
import ZationTokenWrapper from "../internalApi/zationTokenWrapper";
import Bag                from "../../api/Bag";
import AccessUtils        from "../access/accessUtils";
import {AuthAccessConfig, NormalAuthAccessCustomFunction} from "../config/definitions/configComponents";

export type TokenStateAccessCheckFunction = (authEngine : AuthEngine) => Promise<boolean>;

export default class AuthAccessChecker
{
    /**
     * Returns a closure for checking the token state access to a controller.
     * @param accessConfig
     * @param bag
     */
    static createAuthAccessChecker(accessConfig : AuthAccessConfig<NormalAuthAccessCustomFunction>, bag : Bag) : TokenStateAccessCheckFunction {

        const info = AuthAccessChecker.processAuthAccessInfo(accessConfig);

        if(info){
            const {value,invertResult} = info;
            return AccessUtils.createAccessChecker<TokenStateAccessCheckFunction,NormalAuthAccessCustomFunction>
            (value,invertResult,(func) => {
                return async (authEngine) => {
                    const token = authEngine.getSHBridge().getToken();
                    return func(bag,token !== null ? new ZationTokenWrapper(token) : null);
                };
            });
        }
        //access is not defined
        return async () => {
            return false;
        };
    }

    static processAuthAccessInfo(accessConfig : AuthAccessConfig<any>) :
        {value: any, invertResult: boolean} | undefined
    {
        const notAccess = accessConfig.notAccess;
        const access    = accessConfig.access;

        //double keyword is checked in the starter checkConfig
        //search One
        if(access !== undefined) {
            return {
                invertResult: false,
                value : accessConfig.access
            };
        }
        else if(notAccess !== undefined) {
            return {
                invertResult: true,
                value : accessConfig.notAccess
            };
        }
        else {
           return undefined;
        }
    }
}