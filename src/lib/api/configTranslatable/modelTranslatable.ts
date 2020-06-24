/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {Model} from '../../main/config/definitions/parts/inputConfig';

export const modelTranslateSymbol = Symbol();

/**
 * Interface for define that the object can be translated to a model.
 */
export interface ModelTranslatable {
    [modelTranslateSymbol]: () => Model
}

/**
 * Makes an object ModelTranslatable or removes it when the value is undefined.
 * @param object
 * @param value
 */
export function updateModelTranslatable<T>(object: T, value?: undefined | (() => Model)) {
    object[modelTranslateSymbol] = value;
}

/**
 * Returns if the object implements the interface: ModelTranslatable.
 * @param obj
 */
export const isModelTranslatable = (obj: any): obj is ModelTranslatable => {
    return obj && typeof obj[modelTranslateSymbol] === 'function';
};

/**
 * In case of a ModelTranslatable object,
 * it will return the resolved model otherwise, it returns the object self.
 */
export function resolveIfModelTranslatable<T>(obj: T): T extends ModelTranslatable ? Model : T {
    if(isModelTranslatable(obj)) return obj[modelTranslateSymbol]() as any;
    return obj as any;
}