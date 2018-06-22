/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

const ConfigError = require('./../config/configError');
const ObjectPath  = require('./../tools/objectPath');

class ConfigCheckerTools
{
    static assertProperty(key,obj,types,isOptional,target,configName,configErrorBag)
    {
        let targetText = `${target} property ${key}`;
        if(obj[key] === undefined)
        {
            if(!isOptional)
            {
                configErrorBag.addConfigError(new ConfigError(configName,`${target} is not set and not Optional!`));
                return false;
            }
        }
        else
        {
            if(!ConfigCheckerTools._isCorrectType(obj[key],types))
            {
                configErrorBag.addConfigError(new ConfigError(configName,
                    `${targetText} has not a allowed type! This types are allowed: ${types.toString()}`));
                return false;
            }
        }
        return true;
    }

    static assertProperties(keys,obj,types,isOptional,target,configName,configErrorBag)
    {
        for(let i = 0; i < keys.length; i++)
        {
            ConfigCheckerTools.assertProperty(keys[i],obj,types,isOptional,target,configName,configErrorBag);
        }
    }

    // noinspection JSUnusedGlobalSymbols
    static assertDependency(path,obj,target,configName,configErrorBag)
    {
        if(ObjectPath.getPath(obj,path) === undefined)
        {
            configErrorBag.addConfigError(new ConfigError(configName,
                `${target} dependency is not found in object: ${path}. (split with '.')`));
        }
    }


    // noinspection JSUnusedGlobalSymbols
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