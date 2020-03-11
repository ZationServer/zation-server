/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {ModelConfig}         from '../../main/config/definitions/parts/inputConfig';
import {createReusableModel} from '../../main/models/reusableModelCreator';
import {DeepReadonly}        from '../../main/utils/typeUtils';

/**
 * This function creates a reusable model.
 * The advantage against disposable models is that you
 * can reuse the model in different versions.
 * These versions differ by the optionality and the default value.
 * Zation will check all versions of the models like one model.
 * In addition, reusable models can have a name that will help
 * you to identify models in case of errors.
 * Another advantage is that you can use reusable models
 * directly in the input config as single model input.
 * @param model
 * @param name
 */
export function $model<T extends ModelConfig>(model: T | ModelConfig,name?: string): DeepReadonly<T> {
    return createReusableModel(model,name) as DeepReadonly<T>;
}