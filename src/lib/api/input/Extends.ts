/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {Model}                   from '../../main/config/definitions/parts/inputConfig';
import {modelPrototypeSymbol}    from '../../main/constants/model';
// noinspection TypeScriptPreferShortImport
import {resolveModelConfigTranslatable} from '../configTranslatable/modelConfigTranslatable';
import {DeepReadonly}                   from '../../main/utils/typeUtils';
import {updateModel}                    from '../../main/model/modelUpdater';

/**
 * This function can be used to let a value model extends another
 * value model or to let an object model extends another object model.
 * Notice that the change will happen on the referenced value and not on a clone.
 *
 * Value models will inherit all the properties of another value model.
 * But it's able to overwrite properties.
 *
 * In the case of object models, the sub-model will inherit all properties,
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
export function $extends<S extends Model>(subModel: S | Model,superModel: Model): DeepReadonly<S> {
    superModel = resolveModelConfigTranslatable(superModel);

    return updateModel(subModel,(resolvedModel) => {
        resolvedModel[modelPrototypeSymbol] = superModel;
    },false) as DeepReadonly<S>;
}