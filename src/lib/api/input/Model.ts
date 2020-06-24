/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {ImplicitModel}         from '../../main/config/definitions/parts/inputConfig';
import {ExplicitModel, markAsExplicitModel, setExplicitModelName} from '../../main/models/explicitModel';

/**
 * @description
 * This function creates an explicit model.
 * Explicit models can be directly used in the input config as single model input.
 * You also can attach a name to an explicit model that
 * will help to identify this model in case of errors.
 * @param model
 * @param name
 */
export function $model<T extends ImplicitModel>(model: T, name?: string): ExplicitModel<T> {
    markAsExplicitModel(model);
    if(name){setExplicitModelName(model,name);}
    return model;
}