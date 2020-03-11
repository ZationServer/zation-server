/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {ModelConfig}     from '../config/definitions/parts/inputConfig';
import {modelNameSymbol} from '../constants/model';

export function processAnyOfKey(key: string,value: ModelConfig,isArray: boolean): string {
    return isArray ? (typeof value[modelNameSymbol] === 'string' ? value[modelNameSymbol]: key) : key;
}