/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {ModelConfig}        from '../../main/config/definitions/parts/inputConfig';
import {createModel}        from '../../main/model/modelCreator';
import {DeepReadonly}       from '../../main/utils/typeUtils';

export function $model<T extends ModelConfig>(model: T | ModelConfig,name?: string): DeepReadonly<T> {
    return createModel(model,name) as DeepReadonly<T>;
}