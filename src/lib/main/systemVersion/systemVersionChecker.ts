/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import BaseSHBridge       from "../bridges/baseSHBridge";
// noinspection TypeScriptPreferShortImport
import {SystemAccessConfig, VersionAccessConfig} from "../config/definitions/parts/configComponents";

export type VersionSystemAccessCheckFunction = (shBridge: BaseSHBridge) => boolean;

type VersionCheckFunction = (version: number) => boolean;

export default class SystemVersionChecker
{
    /**
     * Returns a Closures for checking the version.
     * @param versionAccessConfig
     */
    static createVersionChecker(versionAccessConfig: VersionAccessConfig): VersionSystemAccessCheckFunction {
        const versionAccess = versionAccessConfig.versionAccess;
        if(typeof versionAccess === 'object') {
            const preparedVersionChecker: Record<string,VersionCheckFunction> = {};
            for(const system in versionAccess){
                if(versionAccess.hasOwnProperty(system)){
                    const setting = versionAccess[system];
                    if(Array.isArray(setting)){
                        preparedVersionChecker[system] = (version) => {return setting.includes(version);};
                    }
                    else if(typeof setting === 'number'){
                        preparedVersionChecker[system] = (version) => {return version >= setting}
                    }
                }
            }
            return (shBridge) =>  {
                const system = shBridge.getSystem();
                if(preparedVersionChecker.hasOwnProperty(system)) {
                    return preparedVersionChecker[system](shBridge.getVersion());
                }
                return true;
            }
        }
        else {
            return () => {return true;};
        }
    }

    /**
     * Returns a Closures for checking the system.
     * @param systemAccessConfig
     */
    static createSystemChecker(systemAccessConfig: SystemAccessConfig): VersionSystemAccessCheckFunction {
        const systemAccess = systemAccessConfig.systemAccess;
        if(Array.isArray(systemAccess)) {
            return (shBridge) =>  {
                return systemAccess.includes(shBridge.getSystem());
            }
        }
        else {
            return () => {return true;};
        }
    }
}

