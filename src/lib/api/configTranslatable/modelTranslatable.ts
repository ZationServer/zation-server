/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

// noinspection ES6PreferShortImport
import {DirectModel} from '../../main/models/model';

export const modelTranslateSymbol = Symbol();

/**
 * Interface for define that the object can be translated to a model.
 */
export interface ModelTranslatable<M extends DirectModel = any> {
    [modelTranslateSymbol]: () => M
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
export function resolveIfModelTranslatable<T>(obj: T): T extends ModelTranslatable ? DirectModel : T {
    if(isModelTranslatable(obj)) return obj[modelTranslateSymbol]() as any;
    return obj as any;
}