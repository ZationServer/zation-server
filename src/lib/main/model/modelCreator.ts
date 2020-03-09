/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {ArrayModel, ModelConfig}              from '../config/definitions/parts/inputConfig';
import {modelNameSymbol}                      from '../constants/model';
import {setUniqueModelId}                     from './modelId';
import {DeepReadonly}                         from '../utils/typeUtils';

export function createModel(model: ModelConfig, name?: string): DeepReadonly<ModelConfig> {
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
    return createdModel;
}