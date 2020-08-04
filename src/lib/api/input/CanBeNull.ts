/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {resolveIfModelTranslatable}                         from '../configTranslatable/modelTranslatable';
import {addNewMetaToModel, MetaModel}                       from '../../main/models/metaModel';
import {Model}                                              from '../../main/models/model';
import {DefinitionModel}                                    from '../../main/models/definitionModel';

/**
 * @description
 * Marks that the client is allowed to send
 * null instead of the value for the model.
 * @param model
 */
export function $canBeNull<T extends Model>(model: T):
    T extends DefinitionModel ? MetaModel<T> :
        T extends MetaModel ? T : MetaModel<any>
{
    return addNewMetaToModel(resolveIfModelTranslatable(model) as any,{canBeNull: true});
}