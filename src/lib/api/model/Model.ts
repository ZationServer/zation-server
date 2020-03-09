/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {Model}                          from '../../main/config/definitions/parts/inputConfig';
import {modelNameSymbol}                from '../../main/constants/model';
import {setUniqueModelId}               from '../../main/model/modelId';

export function $model(model: Model,name?: string): Model {
    if(name !== undefined) {
        model[modelNameSymbol] = name;
    }
    setUniqueModelId(model);
    return model;
}