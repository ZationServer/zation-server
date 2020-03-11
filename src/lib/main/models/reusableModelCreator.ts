/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {ArrayModel, Model, ModelConfig}       from '../config/definitions/parts/inputConfig';
import {modelNameSymbol}                      from '../constants/model';
import {setUniqueModelId}                     from './modelId';
import {DeepReadonly}                         from '../utils/typeUtils';

const reusableModelSymbol = Symbol();

export function createReusableModel(model: ModelConfig, name?: string): DeepReadonly<ModelConfig> {
    let createdModel: ModelConfig = {};

    if(Array.isArray(model)) {
        createdModel = {
            array: model[0],
            ...(typeof model[1] === 'object' ? model[1] : {})
        } as ArrayModel
    }
    else {
        createdModel = {...model};
    }

    if(name !== undefined) {
        Object.defineProperty(createdModel,modelNameSymbol,{
            value: name,
            enumerable: true,
            writable: false,
            configurable: false
        });
    }
    setUniqueModelId(createdModel);
    
    createdModel[reusableModelSymbol] = true;

    return createdModel;
}

export function isReusableModel(value: any): value is Model {
    return value && value[reusableModelSymbol];
}