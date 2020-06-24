/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {ImplicitModel} from '../config/definitions/parts/inputConfig';
import {ExplicitModel} from './explicitModel';

const optionalModelSymbol = Symbol();

export interface OptionalModel<T extends ExplicitModel | ImplicitModel = {}> {
    optional: T;
    default?: any;
    /**
     * @internal
     */
    [optionalModelSymbol]: true
}

export function createOptionalModel<T extends ExplicitModel | ImplicitModel = {}>(model: T,defaultValue?: any): OptionalModel<T> {
    return {
        [optionalModelSymbol]: true,
        optional: model,
        default: defaultValue
    };
}

export function isOptionalModel(value: any): value is OptionalModel{
    return value && value[optionalModelSymbol] === true;
}

export function unwrapIfOptionalModel<T extends object>(value: T): ExplicitModel | ImplicitModel {
    if(isOptionalModel(value)) return value.optional;
    return value;
}