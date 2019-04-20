/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

// noinspection TypeScriptPreferShortImport
import {ControllerConfig} from "../configs/appConfig";
import AuthEngine         from "./authEngine";
import Logger           = require("../logger/logger");
import {ZationAccess}     from "../constants/internal";
import ZationTokenInfo    from "../infoObjects/zationTokenInfo";

export type AuthAccessCheckFunction = (authEngine : AuthEngine) => Promise<boolean>;

export default class AuthAccessChecker
{
    /**
     * Returns a Closures for checking the access to a controller.
     * @param controllerConfig
     */
    static createControllerAccessChecker(controllerConfig : ControllerConfig) : AuthAccessCheckFunction {

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

        if(typeof accessValue === 'string') {
            if(accessValue === ZationAccess.ALL) {
                return async () => {
                    return accessProcess(true);
                };
            }
            else if(accessValue === ZationAccess.ALL_AUTH) {
                return async (authEngine) => {
                    return accessProcess(authEngine.isAuth());
                };
            }
            else if(accessValue === ZationAccess.ALL_NOT_AUTH) {
                return async (authEngine) => {
                    return accessProcess(authEngine.isDefault());
                };
            }
            else {
                return async (authEngine) => {
                    return accessProcess(authEngine.getUserGroup() === accessValue);
                };
            }
        }
        else if(Array.isArray(accessValue)) {
            return async (authEngine) => {
                let found = false;
                for(let i = 0; i < accessValue.length;i++) {
                    if((typeof accessValue[i] === 'string' && accessValue[i] === authEngine.getUserGroup())
                        ||
                        (typeof accessValue[i] === 'number' && accessValue[i] === authEngine.getUserId())) {
                        found = true;
                        break;
                    }
                }
                return accessProcess(found);
            };
        }
        else if(typeof accessValue === 'function') {
            return async (authEngine) => {
                const token = authEngine.getSHBridge().getToken();
                const smallBag = authEngine.getWorker().getPreparedSmallBag();

                return accessProcess(
                    (await accessValue(smallBag,token !== null ? new ZationTokenInfo(token) : null))
                );
            };
        }
        else if(typeof accessValue === 'number') {
            return async (authEngine) => {
                return accessProcess(authEngine.getUserId() === accessValue);
            };
        }
        else {
            return async () => {
                return false;
            }
        }
    }
}

