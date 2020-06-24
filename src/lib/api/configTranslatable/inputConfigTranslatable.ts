/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {ParamInput, SingleModelInput} from '../../main/config/definitions/parts/inputConfig';

export const inputConfigTranslateSymbol = Symbol();

/**
 * Interface for define that the object can be translated to an input config.
 */
export interface InputConfigTranslatable {
    [inputConfigTranslateSymbol]: () => ParamInput | SingleModelInput
}

/**
 * Makes an object InputConfigTranslatable or removes it when the value is undefined.
 * @param object
 * @param value
 */
export function updateInputConfigTranslatable<T>(object: T,value?: undefined | (() => ParamInput | SingleModelInput)) {
    object[inputConfigTranslateSymbol] = value;
}

/**
 * Returns if the object implements the interface: InputConfigTranslatable.
 * @param obj
 */
export const isInputConfigTranslatable = (obj: any): obj is InputConfigTranslatable => {
    return obj && typeof obj[inputConfigTranslateSymbol] === 'function';
};

/**
 * In case of a InputConfigTranslatable object,
 * it will return the resolved input config otherwise, it returns the object self.
 */
export function resolveIfInputConfigTranslatable<T>(obj: T): T extends InputConfigTranslatable ? ParamInput | SingleModelInput : T {
    if(isInputConfigTranslatable(obj)) return obj[inputConfigTranslateSymbol]() as any;
    return obj as any;
}