/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {DefinitionModel} from '../../main/models/definitionModel';
import {setModelName}    from '../../main/models/modelName';

/**
 * @description
 * This function helps you to create a new model.
 * If you pass a name as a second parameter, the created model is not anonymous.
 * This will help you to identify this model in case of errors easier.
 * @param model
 * @param name
 */
export function $model<T extends DefinitionModel>(model: T, name?: string): T {
    if(name) setModelName(model,name);
    return model;
}