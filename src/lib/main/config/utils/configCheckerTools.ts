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
     * Asserts a property.
     * @param key
     * @param obj
     * @param types
     * @param isOptional
     * @param configName
     * @param configErrorBag
     * @param target
     */
    static assertProperty(key : string,obj : object,types : string[] | string,isOptional : boolean,configName : string,configErrorBag : ErrorBag<ConfigError>,target : Target = new Target()) : boolean
    {
        const targetText = `${target.getTarget()} property '${key}'`;
        if(obj[key] === undefined) {
            if(!isOptional) {
                configErrorBag.addError(new ConfigError(configName,`${targetText} need to be set.`));
                return false;
            }
        }
        else {
            if(!ConfigCheckerTools.isCorrectTypes(obj[key],types)) {
                const type = ConfigCheckerTools.getTypeOf(obj[key]);
                configErrorBag.addError(new ConfigError(configName,
                    `${targetText} has a not allowed type '${type}'! This types are allowed: ${types.toString()}.`));
                return false;
            }
        }
        return true;
    }

    /**
     * Asserts a structure of an object.
     * @param structure
     * @param obj
     * @param configName
     * @param configErrorBag
     * @param target
     */
    static assertStructure(structure : object,obj : object | undefined,configName : string,configErrorBag : ErrorBag<ConfigError>,target : Target = new Target())
    {
        if(typeof obj !== 'object') {
            configErrorBag.addError(new ConfigError(configName,
                `${target.getTarget()} needs to be from type object!`));
            return;
        }

        const allowedKeys : any = [];
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
                    //check array only types
                    if(structure[k]['arrayType'] !== undefined)
                    {
                        const allowedType = structure[k]['arrayType'];

                        if(Array.isArray(obj[k])) {
                            let array = obj[k];
                            for(let i = 0; i < array.length; i++) {
                                if(allowedType && !ConfigCheckerTools.isCorrectType(array[i],allowedType)) {
                                    configErrorBag.addError(new ConfigError(configName,
                                        `${target.getTarget()} value: '${array[i]}' in property array: '${k}' is not allowed. Allowed type is: ${allowedType}.`));
                                }
                            }
                        }
                    }

                    //check enum
                    if(structure[k]['enum'] !== undefined)
                    {
                        const allowedEnum = structure[k]['enum'];

                        if(Array.isArray(obj[k]))
                        {
                            let array = obj[k];
                            for(let i = 0; i < array.length; i++)
                            {
                                if(!allowedEnum.includes(array[i])) {
                                    configErrorBag.addError(new ConfigError(configName,
                                        `${target.getTarget()} value: '${array[i]}' in property array: '${k}' is not allowed. Allowed values are: ${allowedEnum.toString()}.`));
                                }
                            }
                        }
                        else
                        {
                            if(!allowedEnum.includes(obj[k]))
                            {
                                configErrorBag.addError(new ConfigError(configName,
                                    `${target.getTarget()} value: '${obj[k]}' in property: '${k}' is not allowed. Allowed values are: ${allowedEnum.toString()}.`));
                            }
                        }
                    }
                    if(structure[k]['stringOnlyEnum'] !== undefined && typeof obj[k] === 'string')
                    {
                        let allowedStrings = structure[k]['stringOnlyEnum'];
                        if(!allowedStrings.includes(obj[k]))
                        {
                            configErrorBag.addError(new ConfigError(configName,
                                `${target.getTarget()} string value: '${obj[k]}' is not allowed. Allowed string values are: ${allowedStrings.toString()}.`));
                        }
                    }
                }
            }
        }

        //check only allowed keys in
        for(let k in obj) {
            if(obj.hasOwnProperty(k) && !allowedKeys.includes(k)) {
                configErrorBag.addError(new ConfigError(configName,
                    `${target.getTarget()} property: '${k}' is not allowed. Allowed keys are: ${allowedKeys.toString()}.`));
            }
        }
    }

    /**
     * Asserts if an array contains a value.
     * @param values
     * @param searchValue
     * @param configName
     * @param configErrorBag
     * @param message
     * @param target
     */
    static assertEqualsOne(values : any[],searchValue,configName : string,configErrorBag : ErrorBag<ConfigError>,message : string,target : Target = new Target()) : boolean
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
                `${target.getTarget()} ${message}`));
            return false;
        }
        return true;
    }

    /**
     * Returns the type of the value in deep.
     * @param value
     */
    static getTypeOf(value)
    {
        if(Array.isArray(value)) {
            return 'array';
        }
        else if(value === null){
            return 'null';
        }
        else {
            return typeof value;
        }
    }

    /**
     * Checks if the value is of the type.
     * @param value
     * @param type ['array','null','object','boolean','number','string']
     */
    private static isCorrectType(value : any,type : string) : boolean {
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
    }

    /**
     * Checks if the value is any of these types.
     * @param value
     * @param types ['array','null','object','boolean','number','string']
     */
    private static isCorrectTypes(value : any,types : any[] | any) : boolean
    {
        if(Array.isArray(types)) {
            for(let i = 0; i < types.length; i++) {
                if(ConfigCheckerTools.isCorrectType(value,types[i])) {
                    return true;
                }
            }
            return false;
        }
        else {
            return ConfigCheckerTools.isCorrectType(value,types);
        }
    }

}