/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {Model, ModelConfig} from '../../main/config/definitions/parts/inputConfig';

export const modelConfigTranslateSymbol = Symbol();

/**
 * Interface for define that the object can be translated to a model config.
 */
export interface ModelConfigTranslatable {
    [modelConfigTranslateSymbol]: () => ModelConfig
}

/**
 * Makes an object ModelConfigTranslatable or removes it when the value is undefined.
 * @param object
 * @param value
 */
export function updateModelConfigTranslatable<T>(object: T,value?: undefined | (() => ModelConfig)) {
    object[modelConfigTranslateSymbol] = value;
}

/**
 * Returns if the object implements the interface: ModelConfigTranslatable.
 * @param obj
 */
export const isModelConfigTranslatable = (obj: any): obj is ModelConfigTranslatable => {
    return obj && typeof obj[modelConfigTranslateSymbol] === 'function';
};

/**
 * In case of a ModelConfigTranslatable object,
 * it will return the resolved model otherwise, it returns the object self.
 */
export function resolveModelConfigTranslatable(obj: ModelConfigTranslatable | Model): ModelConfig {
    if(isModelConfigTranslatable(obj)){
        return obj[modelConfigTranslateSymbol]();
    }
    return obj as ModelConfig;
}