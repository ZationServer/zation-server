/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {ImplicitModel}                          from '../config/definitions/parts/inputConfig';
import {ExplicitModel, explicitModelNameSymbol} from './explicitModel';

export function processAnyOfKey(key: string, value: ExplicitModel | ImplicitModel, isArray: boolean): string {
    return isArray ? (typeof value[explicitModelNameSymbol] === 'string' ? value[explicitModelNameSymbol]: key) : key;
}