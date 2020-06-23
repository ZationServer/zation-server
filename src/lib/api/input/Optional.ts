/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {Model, ModelConfig}                      from '../../main/config/definitions/parts/inputConfig';
import {modelDefaultSymbol, modelOptionalSymbol} from '../../main/constants/model';
import {updateModel}                             from '../../main/models/modelUpdater';
import {AnyReadonly}                             from '../../main/utils/typeUtils';

function changeOptionalOfResolvedModel(model: ModelConfig, value: boolean, defaultValue?: any) {
    let options;
    if(Array.isArray(model)){
        options = model[1] || {};
        model[1] = options;
    }
    else {
        options = model;
    }
    options[modelOptionalSymbol] = value;
    options[modelDefaultSymbol] = defaultValue;
}

/**
 * Make this model optional so the client doesn't need to provide it.
 * Notice that when you pass in a disposable model the model will be cloned,
 * changed and Zation handles it as a totally different model.
 * That is not a problem when only use the newly created model.
 * But if you want to use the same model in different versions
 * its recommended to use reusable models.
 * Then you should look at the $model and $models functions.
 * You optionally can pass in a default value that will be
 * used when the client has not provided the data for this model.
 * @param model
 * @param defaultValue
 * Define a default value that will be used
 * if the input had not provided the value.
 */
export function $optional<T extends Model | ModelConfig>(model: T,defaultValue?: any): T extends ModelConfig ? T : AnyReadonly {
    return updateModel(model,(resolvedModel) =>
        changeOptionalOfResolvedModel(resolvedModel,true,defaultValue),true) as T extends ModelConfig ? T : AnyReadonly;
}