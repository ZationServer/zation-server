/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {modelPrototypeSymbol}           from '../../main/definitions/model';
import {resolveIfModelTranslatable}     from '../configTranslatable/modelTranslatable';
import {isClassObjectModel}             from './decorator/ObjectModel';
import ConfigBuildError                 from '../../main/config/manager/configBuildError';
import {MetaModel, unwrapIfMetaModel}   from '../../main/models/metaModel';
import {Model}                          from '../../main/models/model';
import {DefinitionModel}                from '../../main/models/definitionModel';

/**
 * This function can be used to let a value model extends another
 * value model or to let an object model extends another object model.
 * Notice that this function cannot be used with class model objects.
 * Notice that this extend function will not return a new model and
 * does change the model instance directly.
 *
 * Value models will inherit all the properties of another value model.
 * But it's able to overwrite properties.
 *
 * In the case of normal object models, the sub-model will inherit all properties,
 * with the possibility to overwrite them.
 * It also affects the prototype,
 * because the sub-object model prototype will get the super-model prototype as a prototype.
 * Also, the super-model constructor-functions will be called
 * before the constructor-functions of the sub-object model.
 * In addition, the convert-function will also be called
 * with the result of the super convert function.
 * @param subModel
 * @param superModel
 */
export function $extends<S extends Model>(subModel: S, superModel: Model):
    S extends DefinitionModel | MetaModel ? S : any
{
    if(isClassObjectModel(subModel) || isClassObjectModel(superModel)){
        throw new ConfigBuildError('The $extends function can not be used with class object models. Please use the es6 class extends keyword.')
    }
    const tmpSubModel = subModel;

    subModel = unwrapIfMetaModel(resolveIfModelTranslatable(subModel)) as any;
    superModel = unwrapIfMetaModel(resolveIfModelTranslatable(superModel));

    if(Array.isArray(subModel)){
        throw new ConfigBuildError('An array model can not extend another model.')
    }
    subModel[modelPrototypeSymbol] = superModel;

    return tmpSubModel as any;
}