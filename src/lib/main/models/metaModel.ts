/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {DefinitionModel} from './definitionModel';

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

export interface MetaModel<T extends DefinitionModel = {}> extends ModelMetaData {
    /**
     * The inner wrapped definition model.
     */
    definitionModel: T;
    /**
     * @internal
     */
    [metaModelSymbol]: true
}

export function createMetaModel<T extends DefinitionModel = {}>(model: T): MetaModel<T> {
    return {
        [metaModelSymbol]: true,
        definitionModel: model
    };
}

export function isMetaModel(value: any): value is MetaModel {
    return value && value[metaModelSymbol] === true;
}

export function getModelMetaData<T extends DefinitionModel>(model: T): ModelMetaData {
    return isMetaModel(model) ? model : {};
}

export function isOptionalMetaModel(value: any): boolean {
    return value && value[metaModelSymbol] === true && (value as MetaModel).optional as boolean;
}

export function addNewMetaToModel<T extends DefinitionModel>(model: T, meta: ModelMetaData): T extends DefinitionModel ? MetaModel<T> : T {
    if(isMetaModel(model)) return ({...model,...meta} as T extends DefinitionModel ? MetaModel<T> : T);
    return {...createMetaModel(model as DefinitionModel),...meta} as T extends DefinitionModel ? MetaModel<T> : T;
}

export function unwrapIfMetaModel<T extends object>(value: T): | DefinitionModel {
    if(isMetaModel(value)) return value.definitionModel;
    return value;
}