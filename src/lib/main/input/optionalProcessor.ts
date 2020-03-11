/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {AnyOfModel, Model}                 from "../config/definitions/parts/inputConfig";
import Iterator                                  from "../utils/iterator";
import {modelDefaultSymbol, modelOptionalSymbol} from '../constants/model';

export default class OptionalProcessor
{
    /**
     * Returns if a model is optional and what the default value is.
     * Works also with the anyOf model modifier.
     * @param config
     */
    static process(config: AnyOfModel | Model): {isOptional: boolean,defaultValue: any}
    {
        //fallback
        let isOptional = false;
        let defaultValue = undefined;

        if(config.hasOwnProperty(modelOptionalSymbol)) {
            isOptional = config[modelOptionalSymbol];
            defaultValue = config[modelDefaultSymbol];
        }
        else if(config.hasOwnProperty(nameof<AnyOfModel>(s => s.anyOf))) {
            Iterator.iterateSync((_, value) => {
                if(value.hasOwnProperty(modelOptionalSymbol)){
                    isOptional = value[modelOptionalSymbol];
                    defaultValue = value[modelDefaultSymbol];
                    //break;
                    return true;
                }
            },config[nameof<AnyOfModel>(s => s.anyOf)]);
        }

        return {
            isOptional: isOptional,
            defaultValue: defaultValue
        }
    }
}