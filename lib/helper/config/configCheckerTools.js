/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

const ConfigError = require('./../config/configError');

class ConfigCheckerTools
{
    static assertProperty(key,obj,types,isOptional,target,configName,configErrorBag)
    {
        let targetText = `${target}property '${key}'`;
        if(obj[key] === undefined)
        {
            if(!isOptional)
            {
                configErrorBag.addConfigError(new ConfigError(configName,`${target}key: '${key}' need to be set.`));
                return false;
            }
        }
        else
        {
            if(!ConfigCheckerTools._isCorrectType(obj[key],types))
            {
                configErrorBag.addConfigError(new ConfigError(configName,
                    `${targetText} has a not allowed type '${typeof obj[key]}'! This types are allowed: ${types.toString()}.`));
                return false;
            }
        }
        return true;
    }

    static assertStructure(structure,obj,target,configName,configErrorBag)
    {
        let allowedKeys = [];
        for(let k in structure)
        {
            if(structure.hasOwnProperty(k))
            {
                allowedKeys.push(k);

                //check type
                ConfigCheckerTools.assertProperty
                (k,obj,structure[k]['types'],structure[k]['isOptional'],target,configName,configErrorBag);

                if(obj[k] !== undefined)
                {
                    //check enum
                    if(structure[k]['enum'] !== undefined)
                    {
                        let allowedEnum = structure[k]['enum'];
                        if(!allowedEnum.includes(obj[k]))
                        {
                            configErrorBag.addConfigError(new ConfigError(configName,
                                `${target}value: '${obj[k]}' in key: '${k}' is not allowed. Allowed values are: ${allowedEnum.toString()}.`));
                        }
                    }
                    if(structure[k]['stringOnlyEnum'] !== undefined && typeof obj[k] === 'string')
                    {
                        let allowedStrings = structure[k]['stringOnlyEnum'];
                        if(!allowedStrings.includes(obj[k]))
                        {
                            configErrorBag.addConfigError(new ConfigError(configName,
                                `${target}string value: '${obj[k]}' is not allowed. Allowed string values are: ${allowedStrings.toString()}.`));
                        }
                    }
                }
            }
        }

        //check only allowed keys in
        for(let k in obj)
        {
            if(obj.hasOwnProperty(k) && !allowedKeys.includes(k))
            {
                configErrorBag.addConfigError(new ConfigError(configName,
                    `${target}key: '${k}' is not allowed. Allowed keys are: ${allowedKeys.toString()}.`));
            }
        }
    }


    static assertEqualsOne(values,searchValue,target,configName,configErrorBag,message)
    {
        let found = false;
        for(let i = 0; i < values.length; i++)
        {
            if(values[i] === searchValue)
            {
                found = true;
                break;
            }
        }
        if(!found)
        {
            configErrorBag.addConfigError(new ConfigError(configName,
                `${target} ${message}`));
            return false;
        }
        return true;
    }

    static _isCorrectType(value,types)
    {
        let typeOk = (value,type) =>
        {
            if(type === 'array')
            {
                return Array.isArray(value);
            }
            if(type === 'object')
            {
                return typeof value === 'object' && !Array.isArray(value);
            }
            else
            {
                return typeof value === type;
            }
        };

        if(Array.isArray(types))
        {
            for(let i = 0; i < types.length; i++)
            {
                if(typeOk(value,types[i]))
                {
                    return true;
                }
            }
        }
        else
        {
            return typeOk(value,types);
        }
    }

}

module.exports = ConfigCheckerTools;