/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {Model, ParamInput, ResolvedModel, SingleModelInput} from '../main/config/definitions/parts/inputConfig';

/**
 * Interface for define that the object can be translated to a input config.
 */
export interface InputConfigTranslatable {
    __toInputConfig(): ParamInput | SingleModelInput
}

// noinspection JSUnusedGlobalSymbols
/**
 * Returns if the object implements the interface
 * is input config translatable.
 * @param obj
 */
export const isInputConfigTranslatable = (obj: any): obj is InputConfigTranslatable => {
    return obj && typeof obj['__toInputConfig'] === 'function';
};

/**
 * Interface for define that the object can be translated to a model config.
 */
export interface ModelConfigTranslatable {
    __toModelConfig(): Model
}

/**
 * Returns if the object implements the interface
 * is model config translatable.
 * @param obj
 */
export const isModelConfigTranslatable = (obj: any): obj is ModelConfigTranslatable => {
    return obj && typeof obj['__toModelConfig'] === 'function';
};

/**
 * Will resolve model config translatable object and returns the target object.
 */
export function resolveModelConfigTranslatable(obj: object): ResolvedModel {
    const resolvedObjects: object[] = [];
    while (isModelConfigTranslatable(obj) && !resolvedObjects.includes(obj)){
        resolvedObjects.push(obj);
        obj = obj.__toModelConfig();
    }
    return obj;
}