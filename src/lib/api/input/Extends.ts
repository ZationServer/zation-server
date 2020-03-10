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

export function $extends<S extends Model>(subModel: S | Model,superModel: Model,createNewModel: boolean = false): DeepReadonly<S> {
    superModel = resolveModelConfigTranslatable(superModel);

    return updateModel(subModel,(resolvedModel) => {
        resolvedModel[modelPrototypeSymbol] = superModel;
    },createNewModel) as DeepReadonly<S>;
}