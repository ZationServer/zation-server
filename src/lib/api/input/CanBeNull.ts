/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {AnyModelTranslatable, ImplicitModel, Model}                from '../../main/config/definitions/parts/inputConfig';
import {AnyReadonly}                                               from '../../main/utils/typeUtils';
import {resolveIfModelTranslatable}                                from '../configTranslatable/modelTranslatable';
import {addNewMetaToModel, MetaModel}                              from '../../main/models/metaModel';
import {ExplicitModel}                                             from '../../main/models/explicitModel';

/**
 * @description
 * Marks that the client is allowed to send
 * null instead of the value for the model.
 * @param model
 */
export function $canBeNull<T extends Model | AnyModelTranslatable>(model: T): T extends ExplicitModel | ImplicitModel ? MetaModel<T> : MetaModel<AnyReadonly> {
    return addNewMetaToModel(resolveIfModelTranslatable(model) as any,{canBeNull: true});
}