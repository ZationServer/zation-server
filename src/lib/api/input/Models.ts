/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {ImplicitModel}             from '../../main/config/definitions/parts/inputConfig';
import {ExplicitModel, markAsExplicitModel, setExplicitModelName} from '../../main/models/explicitModel';

/**
 * @description
 * This function creates several explicit models.
 * Explicit models can be directly used in the input config as single model input.
 * The key of each pair will be used as an explicit model name.
 * This will help you to identify the models in case of errors.
 * @param models
 * @example
 * const formModels = $models({
 *    name: {
 *        type: 'string'
 *    },
 *
 *    age: {
 *        type: 'int',
 *        minValue: 18
 *    }
 * });
 */
export function $models<T extends Record<string,ImplicitModel>>(models: T): {readonly [k in keyof T]: ExplicitModel<T[k]>} {
    const result: Record<string,ExplicitModel> = {};
    let tmpModelConfig;
    for(const k in models){
        if(models.hasOwnProperty(k)){
            tmpModelConfig = models[k];
            markAsExplicitModel(tmpModelConfig);
            setExplicitModelName(tmpModelConfig,k);
            result[k] = tmpModelConfig;
        }
    }
    return result as {readonly [k in keyof T]: ExplicitModel<T[k]>};
}