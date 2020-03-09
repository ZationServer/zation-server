/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {Model, ModelConfig}                                        from '../../main/config/definitions/parts/inputConfig';
import {isModelConfigTranslatable, resolveModelConfigTranslatable} from '../ConfigTranslatable';
import {modelDefaultSymbol, modelOptionalSymbol}                   from '../../main/constants/model';
import {DeepReadonly}                                              from '../../main/utils/typeUtils';

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

function updateOptional(model: Model,value: boolean,defaultValue?: any): Model {
    const modelFlatCopy: Model = {...model} as Model;

    if(isModelConfigTranslatable(modelFlatCopy)) {
        const tmpToModelConfig = modelFlatCopy.__toModelConfig;
        modelFlatCopy.__toModelConfig = () => {
            const tmpModel = resolveModelConfigTranslatable(tmpToModelConfig());
            changeOptionalOfResolvedModel(tmpModel,value,defaultValue);
            return tmpModel;
        };
    }
    else {
        changeOptionalOfResolvedModel(modelFlatCopy as ModelConfig,value,defaultValue);
    }

    return modelFlatCopy;
}

/**
 *
 * @param model
 * @param defaultValue
 * Define a default value that will be used
 * if the input had not provided the value.
 */
export function $optional<T extends ModelConfig>(model: T | ModelConfig,defaultValue?: any): DeepReadonly<T> {
    return updateOptional(model,true,defaultValue) as DeepReadonly<T>;
}

export function $required<T extends ModelConfig>(model: T | ModelConfig): DeepReadonly<T> {
    return updateOptional(model,false) as DeepReadonly<T>;
}