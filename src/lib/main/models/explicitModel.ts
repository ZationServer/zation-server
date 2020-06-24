/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {ImplicitModel} from '../config/definitions/parts/inputConfig';

const explicitModelSymbol = Symbol();
export const explicitModelNameSymbol = Symbol();

export type ExplicitModel<T extends ImplicitModel = {}> = {
    /**
     * @internal
     */
    [explicitModelSymbol]: true,
    /**
     * @internal
     */
    [explicitModelNameSymbol]?: string
} & T;

export function markAsExplicitModel<T extends ImplicitModel>(model: T): asserts model is ExplicitModel<T> {
    model[explicitModelSymbol] = true;
}

export function setExplicitModelName(model: ExplicitModel, name: string) {
    Object.defineProperty(model,explicitModelNameSymbol,{
        value: name,
        enumerable: true,
        writable: false,
        configurable: false
    });
    return model;
}

export function isExplicitModel(value: any): value is ExplicitModel {
    return value && value[explicitModelSymbol] === true;
}