/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {DefinitionModel} from '../../main/models/definitionModel';
import {setModelName}    from '../../main/models/modelName';

/**
 * @description
 * This function helps you to create several models.
 * The key of each pair will be used as a model name.
 * The names will help you to identify the models in case of errors easier.
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
export function $models<T extends Record<string,DefinitionModel>>(models: T): T {
    for(const k in models){
        if(models.hasOwnProperty(k))
            setModelName(models[k],k)
    }
    return models;
}