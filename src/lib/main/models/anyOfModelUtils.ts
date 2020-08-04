/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {DefinitionModel} from './definitionModel';
import {getModelName}    from './modelName';

export function processAnyOfKey(key: string, value: DefinitionModel, isArray: boolean): string {
    const modelName = getModelName(value);
    return isArray ? (typeof modelName === 'string' ? modelName : key) : key;
}