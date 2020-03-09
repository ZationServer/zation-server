/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {Model}           from '../../main/config/definitions/parts/inputConfig';
import {modelNameSymbol} from '../../main/constants/model';

export function $models<T extends string>(models: Record<T,Model>): Record<T,Model> {
    for(let k in models){
        if(models.hasOwnProperty(k)){
            models[k][modelNameSymbol] = k;
        }
    }
    return models;
}