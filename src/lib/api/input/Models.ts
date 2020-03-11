/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {ModelConfig}             from '../../main/config/definitions/parts/inputConfig';
import {createReusableModel}     from '../../main/models/reusableModelCreator';
import {DeepReadonly}            from '../../main/utils/typeUtils';

/**
 * This function creates several reusable models.
 * The advantage against disposable models is that you
 * can reuse the model in different versions.
 * These versions differ by the optionality and the default value.
 * Zation will check all versions of the models like one model.
 * In addition, reusable models can have a name that will help
 * you to identify models in case of errors.
 * In this case, the key of each pair will be used as a model name.
 * Another advantage is that you can use reusable models
 * directly in the input config as single model input.
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
export function $models<T extends Record<string,ModelConfig>>(models: T | Record<string,ModelConfig>): DeepReadonly<T> {
    for(let k in models){
        if(models.hasOwnProperty(k)){
            // @ts-ignore
            models[k] = createReusableModel(models[k],k) as any;
        }
    }
    return models as DeepReadonly<T>;
}