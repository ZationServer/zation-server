/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import ConfigError    = require('./configError');
import Target         = require('./target');
import ConfigErrorBag = require("./configErrorBag");

class ConfigCheckerTools
{
    static assertProperty(key : string,obj : object,types : string[] | string,isOptional : boolean,configName : string,configErrorBag : ConfigErrorBag,target : Target = new Target()) : boolean
    {
        let targetText = `${target.getTarget()} property '${key}'`;
        if(obj[key] === undefined) {
            if(!isOptional) {
                configErrorBag.addConfigError(new ConfigError(configName,`${targetText} need to be set.`));
                return false;
            }
        }
        else {
            if(!ConfigCheckerTools.isCorrectType(obj[key],types)) {
                const type = ConfigCheckerTools.getTypeOf(obj[key]);
                configErrorBag.addConfigError(new ConfigError(configName,
                    `${targetText} has a not allowed type '${type}'! This types are allowed: ${types.toString()}.`));
                return false;
            }
        }
        return true;
    }

    static getTypeOf(value)
    {
        if(Array.isArray(value)) {
            return 'array';
        }
        else {
            return typeof value;
        }
    }

    static assertStructure(structure : object,obj : object | undefined,configName : string,configErrorBag : ConfigErrorBag,target : Target = new Target())
    {
        if(typeof obj !== 'object')
        {
            configErrorBag.addConfigError(new ConfigError(configName,
                `${target.getTarget()} needs to be from type object!`));
            return;
        }

        let allowedKeys : any = [];
        for(let k in structure)
        {
            if(structure.hasOwnProperty(k))
            {
                allowedKeys.push(k);

                //check type
                ConfigCheckerTools.assertProperty
                (k,obj,structure[k]['types'],structure[k]['isOptional'],configName,configErrorBag,target);

                if(obj[k] !== undefined)
                {
                    //check enum
                    if(structure[k]['enum'] !== undefined)
                    {
                        let allowedEnum = structure[k]['enum'];

                        if(Array.isArray(obj[k]))
                        {
                            let array = obj[k];
                            for(let i = 0; i < array.length; i++)
                            {
                                if(!allowedEnum.includes(array[i]))
                                {
                                    configErrorBag.addConfigError(new ConfigError(configName,
                                        `${target.getTarget()} value: '${array[i]}' in property array: '${k}' is not allowed. Allowed values are: ${allowedEnum.toString()}.`));
                                }
                            }
                        }
                        else
                        {
                            if(!allowedEnum.includes(obj[k]))
                            {
                                configErrorBag.addConfigError(new ConfigError(configName,
                                    `${target.getTarget()} value: '${obj[k]}' in property: '${k}' is not allowed. Allowed values are: ${allowedEnum.toString()}.`));
                            }
                        }
                    }
                    if(structure[k]['stringOnlyEnum'] !== undefined && typeof obj[k] === 'string')
                    {
                        let allowedStrings = structure[k]['stringOnlyEnum'];
                        if(!allowedStrings.includes(obj[k]))
                        {
                            configErrorBag.addConfigError(new ConfigError(configName,
                                `${target.getTarget()} string value: '${obj[k]}' is not allowed. Allowed string values are: ${allowedStrings.toString()}.`));
                        }
                    }
                }
            }
        }

        //check only allowed keys in
        for(let k in obj) {
            if(obj.hasOwnProperty(k) && !allowedKeys.includes(k)) {
                configErrorBag.addConfigError(new ConfigError(configName,
                    `${target.getTarget()} property: '${k}' is not allowed. Allowed keys are: ${allowedKeys.toString()}.`));
            }
        }
    }


    static assertEqualsOne(values : any[],searchValue,configName : string,configErrorBag : ConfigErrorBag,message : string,target : Target = new Target()) : boolean
    {
        let found = false;
        for(let i = 0; i < values.length; i++) {
            if(values[i] === searchValue) {
                found = true;
                break;
            }
        }
        if(!found) {
            configErrorBag.addConfigError(new ConfigError(configName,
                `${target.getTarget()} ${message}`));
            return false;
        }
        return true;
    }

    private static isCorrectType(value : any,types : any[] | any) : boolean | undefined
    {
        const typeOk = (value,type) => {
            if(type === 'array') {
                return Array.isArray(value);
            }
            if(type === 'null') {
                return value === null;
            }
            if(type === 'object') {
                return typeof value === 'object' && !Array.isArray(value);
            }
            else {
                return typeof value === type;
            }
        };

        if(Array.isArray(types)) {
            for(let i = 0; i < types.length; i++)
            {
                if(typeOk(value,types[i]))
                {
                    return true;
                }
            }
        }
        else {
            return typeOk(value,types);
        }
    }

}

export = ConfigCheckerTools;