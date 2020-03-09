/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {Model, ResolvedModel}                                      from '../../main/config/definitions/parts/inputConfig';
import {isModelConfigTranslatable, resolveModelConfigTranslatable} from '../ConfigTranslatable';
import {modelDefaultSymbol, modelOptionalSymbol}                   from '../../main/constants/model';

function changeOptionalOfResolvedModel(model: ResolvedModel,value: boolean,defaultValue?: any) {
    const options = Array.isArray(model) ? (model[1] || {}) : model;
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
        changeOptionalOfResolvedModel(modelFlatCopy as ResolvedModel,value,defaultValue);
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
export function $optional(model: Model,defaultValue?: any): Model {
    return updateOptional(model,true,defaultValue);
}

export function $required(model: Model): Model {
    return updateOptional(model,false);
}