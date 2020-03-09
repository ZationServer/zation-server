/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {Model}                   from '../../main/config/definitions/parts/inputConfig';
import {modelPrototypeSymbol}    from '../../main/constants/model';
import {isModelConfigTranslatable, resolveModelConfigTranslatable} from '../ConfigTranslatable';
import {DeepReadonly}                                              from '../../main/utils/typeUtils';

export function $extends<S extends Model>(subModel: S | Model,superModel: Model): DeepReadonly<S> {
    superModel = resolveModelConfigTranslatable(superModel);
    if(isModelConfigTranslatable(subModel)) {
        const tmpToModelConfig = subModel.__toModelConfig;
        subModel.__toModelConfig = () => {
            const tmp = resolveModelConfigTranslatable(tmpToModelConfig());
            tmp[modelPrototypeSymbol] = superModel;
            return tmp;
        }
    }
    else {
        subModel[modelPrototypeSymbol] = superModel;
    }
    return subModel as DeepReadonly<S>;
}