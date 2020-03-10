/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {ModelConfig}     from '../../main/config/definitions/parts/inputConfig';
import {createModel}     from '../../main/model/modelCreator';
import {DeepReadonly}    from '../../main/utils/typeUtils';

export function $models<T extends Record<string,ModelConfig>>(models: T | Record<string,ModelConfig>): DeepReadonly<T> {
    for(let k in models){
        if(models.hasOwnProperty(k)){
            // @ts-ignore
            models[k] = createModel(models[k],k) as any;
        }
    }
    return models as DeepReadonly<T>;
}