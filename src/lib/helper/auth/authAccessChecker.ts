/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

// noinspection TypeScriptPreferShortImport
import {ControllerAccessFunction, ControllerConfig} from "../configDefinitions/appConfig";
import AuthEngine         from "./authEngine";
import ZationTokenInfo    from "../infoObjects/zationTokenInfo";
import Logger             from "../logger/logger";
import SmallBag           from "../../api/SmallBag";
import AccessUtils        from "../access/accessUtils";

export type TokenStateAccessCheckFunction = (authEngine : AuthEngine) => Promise<boolean>;

export default class AuthAccessChecker
{
    /**
     * Returns a Closures for checking the token state access to a controller.
     * @param controllerConfig
     * @param smallBag
     */
    static createTokenStateAccessChecker(controllerConfig : ControllerConfig, smallBag : SmallBag) : TokenStateAccessCheckFunction {

        const notAccess = controllerConfig.notAccess;
        const access    = controllerConfig.access;

        let accessProcess : (boolean) => boolean;
        let accessValue;

        //double keyword is checked in the starter checkConfig
        //search One
        if(notAccess !== undefined) {
            accessProcess = (b) => !b;
            accessValue = controllerConfig.notAccess;
        }
        else if(access !== undefined) {
            accessProcess = (b) => b;
            accessValue = controllerConfig.access;
        }
        else {
            //access is not defined
            return async () => {
                Logger.printDebugWarning('No controller access config found! Access will denied!');
                return false;
            };
        }

        return AccessUtils.createAccessChecker<TokenStateAccessCheckFunction,ControllerAccessFunction>
        (accessValue,accessProcess,(func) => {
            return async (authEngine) => {
                const token = authEngine.getSHBridge().getToken();
                return accessProcess((await func(smallBag,token !== null ? new ZationTokenInfo(token) : null)));
            };
        });
    }
}

