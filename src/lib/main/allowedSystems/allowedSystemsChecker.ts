/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {AppConfig} from '../config/definitions/main/appConfig';

export type AllowedSystemsCheckFunction = (system: string, version: number) => boolean;

export default class AllowedSystemsChecker
{
    /**
     * Returns a Closures for checking the allowed systems.
     * @param value
     */
    static createAllowedSystemsChecker(value: AppConfig['allowedSystems']): AllowedSystemsCheckFunction {
        if(typeof value === 'object') {
            const preparedVersionChecker: Record<string,(version: number) => boolean> = {};
            for(const system in value){
                if(value.hasOwnProperty(system)){
                    const setting = value[system];
                    if(Array.isArray(setting)){
                        preparedVersionChecker[system] = (version) => setting.includes(version);
                    }
                    else if(typeof setting === 'number'){
                        preparedVersionChecker[system] = (version) => version >= setting;
                    }
                    else preparedVersionChecker[system] = () => true;
                }
            }
            return (system,version) =>  {
                if(preparedVersionChecker.hasOwnProperty(system))
                    return preparedVersionChecker[system](version);
                return false;
            }
        }
        else return () => true;
    }
}

