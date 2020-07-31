/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {ImplicitModel, Model} from '../config/definitions/parts/inputConfig';
import {ExplicitModel}        from './explicitModel';

const metaModelSymbol = Symbol();

export interface ModelMetaData {
    /**
     * Indicates if the inner model is optional.
     */
    optional?: boolean;
    /**
     * Indicates the default value when the data for the model
     * is not provided by the client.
     */
    default?: any;
    /**
     * Indicates if the inner model can be null.
     */
    canBeNull?: boolean;
}

export interface MetaModel<T extends ExplicitModel | ImplicitModel = {}> extends ModelMetaData {
    /**
     * The inner wrapped model.
     */
    model: T;
    /**
     * @internal
     */
    [metaModelSymbol]: true
}

export function createMetaModel<T extends ExplicitModel | ImplicitModel = {}>(model: T): MetaModel<T> {
    return {
        [metaModelSymbol]: true,
        model: model
    };
}

export function isMetaModel(value: any): value is MetaModel {
    return value && value[metaModelSymbol] === true;
}

export function getModelMetaData<T extends Model>(model: T): ModelMetaData {
    return isMetaModel(model) ? model : {};
}

export function isOptionalMetaModel(value: any): boolean {
    return value && value[metaModelSymbol] === true && (value as MetaModel).optional as boolean;
}

export function addNewMetaToModel<T extends Model>(model: T, meta: ModelMetaData): T extends ImplicitModel | ExplicitModel ? MetaModel<T> : T {
    if(isMetaModel(model)) return ({...model,...meta} as T extends ImplicitModel | ExplicitModel ? MetaModel<T> : T);
    return {...createMetaModel(model as ImplicitModel | ExplicitModel),...meta} as T extends ImplicitModel | ExplicitModel ? MetaModel<T> : T;
}

export function unwrapIfMetaModel<T extends object>(value: T): ExplicitModel | ImplicitModel {
    if(isMetaModel(value)) return value.model;
    return value;
}