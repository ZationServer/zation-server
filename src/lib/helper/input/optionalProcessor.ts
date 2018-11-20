/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import {AnyOfProperty, Property, PropertyOptional} from "../configs/appConfig";
import Iterator = require("../tools/iterator");

export class OptionalProcessor
{
    static async process(config : AnyOfProperty | Property) : Promise<{isOptional : boolean,defaultValue : any}>
    {
        //fallback
        let isOptional = false;
        let defaultValue = undefined;

        if(config.hasOwnProperty(nameof<PropertyOptional>(s => s.isOptional))) {
            isOptional = config[nameof<PropertyOptional>(s => s.isOptional)];
            defaultValue = config[nameof<PropertyOptional>(s => s.default)];
        }
        else if(config.hasOwnProperty(nameof<AnyOfProperty>(s => s.anyOf))) {
            await Iterator.breakIterate(async (key, value) => {
                if(value.hasOwnProperty(nameof<PropertyOptional>(s => s.isOptional))){
                    isOptional = value[nameof<PropertyOptional>(s => s.isOptional)];
                    defaultValue = value[nameof<PropertyOptional>(s => s.default)];
                    //break;
                    return true;
                }
            },config[nameof<AnyOfProperty>(s => s.anyOf)]);
        }

        return {
            isOptional : isOptional,
            defaultValue : defaultValue
        }
    }
}

