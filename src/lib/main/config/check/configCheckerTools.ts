/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import Target         from "./target";
import ConfigError    from "../../error/configError";
import ErrorBag       from '../../error/errorBag';

export default class ConfigCheckerTools
{

    /**
     * Asserts if an array contains a value.
     * @param values
     * @param searchValue
     * @param configName
     * @param configErrorBag
     * @param message
     * @param target
     */
    static assertEqualsOne(values: any[],searchValue,configName: string,configErrorBag: ErrorBag<ConfigError>,message: string,target: Target = new Target()): boolean
    {
        let found = false;
        for(let i = 0; i < values.length; i++) {
            if(values[i] === searchValue) {
                found = true;
                break;
            }
        }
        if(!found) {
            configErrorBag.addError(new ConfigError(configName,
                `${target.toString()} ${message}`));
            return false;
        }
        return true;
    }


}