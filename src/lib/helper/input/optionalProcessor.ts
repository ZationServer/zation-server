/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import {AnyOfModelConfig, Model, ModelOptional} from "../configDefinitions/inputConfig";
import Iterator                                 from "../utils/iterator";

export default class OptionalProcessor
{
    /**
     * Returns if a model is optional and what the default value is.
     * Works also with the anyOf model modifier.
     * @param config
     */
    static process(config : AnyOfModelConfig | Model) : {isOptional : boolean,defaultValue : any}
    {
        //fallback
        let isOptional = false;
        let defaultValue = undefined;

        if(config.hasOwnProperty(nameof<ModelOptional>(s => s.isOptional))) {
            isOptional = config[nameof<ModelOptional>(s => s.isOptional)];
            defaultValue = config[nameof<ModelOptional>(s => s.default)];
        }
        else if(config.hasOwnProperty(nameof<AnyOfModelConfig>(s => s.anyOf))) {
            Iterator.iterateSync((key, value) => {
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