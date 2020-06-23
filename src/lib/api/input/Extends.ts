/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {Model, ModelConfig} from '../../main/config/definitions/parts/inputConfig';
import {modelPrototypeSymbol}    from '../../main/constants/model';
// noinspection TypeScriptPreferShortImport,ES6PreferShortImport
import {resolveModelConfigTranslatable} from '../configTranslatable/modelConfigTranslatable';
import {updateModel}                    from '../../main/models/modelUpdater';
import {isClassObjectModel}             from './decorator/ObjectModel';
import ConfigBuildError                 from '../../main/config/manager/configBuildError';
import {AnyReadonly}                    from '../../main/utils/typeUtils';

/**
 * This function can be used to let a value model extends another
 * value model or to let an object model extends another object model.
 * Notice that this function cannot be used with class model objects.
 * Notice that the change will happen on the referenced value and not on a clone.
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
export function $extends<S extends Model | ModelConfig>(subModel: S | Model,superModel: Model): S extends ModelConfig ? S : AnyReadonly {
    if(isClassObjectModel(subModel) || isClassObjectModel(superModel)){
        throw new ConfigBuildError('The $extends function can not be used with class object models. Please use the es6 class extends keyword.')
    }

    superModel = resolveModelConfigTranslatable(superModel);

    return updateModel(subModel,(resolvedModel) => {
        resolvedModel[modelPrototypeSymbol] = superModel;
    },false) as S extends ModelConfig ? S : AnyReadonly;
}