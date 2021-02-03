/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {Model as AnyModel}                  from '../../../main/models/model';
import {TypeofModel}                        from '../../../main/models/typeofModel';

export class MetaModelProp {constructor(readonly model: AnyModel) {}}
let returnMetaPropModelMode = false;
/**
 * @internal
 * @param value
 */
export function setReturnMetaPropModelMode(value: boolean) {
    returnMetaPropModelMode = value;
}

/**
 * A function that creates a model property with
 * the corresponding type for a class-based ObjectModel.
 * @param model
 * @param value
 * The value that should be set to the property in the constructor.
 * Only for advance usage.
 */
export function Model<T extends AnyModel>(model: T, value?: TypeofModel<T>): TypeofModel<T> {
    if(returnMetaPropModelMode) return new MetaModelProp(model) as any;
    else return value as any;
}