/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {AnyModelTranslatable, ImplicitModel, Model}                from '../../main/config/definitions/parts/inputConfig';
import {AnyReadonly}                                               from '../../main/utils/typeUtils';
import {resolveIfModelTranslatable}                                from '../configTranslatable/modelTranslatable';
import {createOptionalModel, OptionalModel, unwrapIfOptionalModel} from '../../main/models/optionalModel';
import {ExplicitModel}                                             from '../../main/models/explicitModel';

/**
 * @description
 * Make this model optional so the client doesn't need to provide it.
 * You optionally can pass in a default value that will be
 * used when the client has not provided the data for this model.
 * @param model
 * @param defaultValue
 * Define a default value that will be used
 * if the input had not provided the value.
 */
export function $optional<T extends Model | AnyModelTranslatable>(model: T,defaultValue?: any): T extends ExplicitModel | ImplicitModel ? OptionalModel<T> : OptionalModel<AnyReadonly> {
    return createOptionalModel(unwrapIfOptionalModel(resolveIfModelTranslatable(model)),defaultValue) as any;
}