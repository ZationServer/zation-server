/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

// noinspection TypeScriptPreferShortImport
import {SystemAccessConfig, VersionAccessConfig} from "../config/definitions/parts/configComponents";
import UpSocket from '../sc/socket';

export type VersionSystemAccessCheckFunction = (socket: UpSocket) => boolean;

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
            return (socket) =>  {
                const system = socket.clientSystem;
                if(preparedVersionChecker.hasOwnProperty(system)) {
                    return preparedVersionChecker[system](socket.clientVersion);
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
            return (socket) =>  {
                return systemAccess.includes(socket.clientSystem);
            }
        }
        else {
            return () => {return true;};
        }
    }
}

