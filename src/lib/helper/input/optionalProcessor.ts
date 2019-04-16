/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import {AnyOfModelConfig, Model, ModelOptional} from "../configs/appConfig";
import Iterator = require("../tools/iterator");

export class OptionalProcessor
{
    static async process(config : AnyOfModelConfig | Model) : Promise<{isOptional : boolean,defaultValue : any}>
    {
        //fallback
        let isOptional = false;
        let defaultValue = undefined;

        if(config.hasOwnProperty(nameof<ModelOptional>(s => s.isOptional))) {
            isOptional = config[nameof<ModelOptional>(s => s.isOptional)];
            defaultValue = config[nameof<ModelOptional>(s => s.default)];
        }
        else if(config.hasOwnProperty(nameof<AnyOfModelConfig>(s => s.anyOf))) {
            await Iterator.breakIterate(async (key, value) => {
                if(value.hasOwnProperty(nameof<ModelOptional>(s => s.isOptional))){
                    isOptional = value[nameof<ModelOptional>(s => s.isOptional)];
                    defaultValue = value[nameof<ModelOptional>(s => s.default)];
                    //break;
                    return true;
                }
            },config[nameof<AnyOfModelConfig>(s => s.anyOf)]);
        }

        return {
            isOptional : isOptional,
            defaultValue : defaultValue
        }
    }
}

