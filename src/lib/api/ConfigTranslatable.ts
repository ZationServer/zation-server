/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {Model, ParamInput, SingleModelInput} from "../main/config/definitions/inputConfig";

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