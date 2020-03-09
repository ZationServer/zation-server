/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {Model}                from '../../main/config/definitions/parts/inputConfig';
import {modelPrototypeSymbol} from '../../main/constants/model';

export function $extends(subModel: Model,superModel: Model): Model {
    Object.defineProperty(superModel,modelPrototypeSymbol,{
        value: superModel,
        enumerable: false,
        writable: true,
        configurable: false
    });
    return subModel;
}