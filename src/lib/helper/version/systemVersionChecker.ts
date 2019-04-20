/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import BaseSHBridge       from "../bridges/baseSHBridge";
import BackError          from "../../api/BackError";
import {MainBackErrors}   from "../zationBackErrors/mainBackErrors";
// noinspection TypeScriptPreferShortImport
import {ControllerConfig} from "../../helper/configs/appConfig";

export type VersionSystemAccessCheckFunction = (shBridge : BaseSHBridge) => void;

export default class SystemVersionChecker
{
    /**
     * Returns a Closures for checking the version.
     * @param controllerConfig
     */
    static createVersionChecker(controllerConfig : ControllerConfig) : VersionSystemAccessCheckFunction {
        const versionAccess = controllerConfig.versionAccess;
        if(typeof versionAccess === 'object') {
            return (shBridge) =>  {
                const system = shBridge.getSystem();
                if(versionAccess.hasOwnProperty(system)) {
                    const version = shBridge.getVersion();
                    const sVersion = versionAccess[system];
                    if((Array.isArray(sVersion) && !sVersion.includes(version)) || (typeof sVersion === 'number' && sVersion > version)) {
                        throw new BackError(MainBackErrors.versionNotCompatible,{version : version});
                    }
                }
            }
        }
        else {
            return () => {};
        }
    }

    /**
     * Returns a Closures for checking the system.
     * @param controllerConfig
     */
    static createSystemChecker(controllerConfig : ControllerConfig) : VersionSystemAccessCheckFunction {
        const systemAccess = controllerConfig.systemAccess;
        if(Array.isArray(systemAccess)) {
            return (shBridge) =>  {
                if(!systemAccess.includes(shBridge.getSystem())) {
                    throw new BackError(MainBackErrors.systemNotCompatible,{system : shBridge.getSystem()});
                }
            }
        }
        else {
            return () => {};
        }
    }
}

