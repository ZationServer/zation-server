/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {DefinitionModel} from './definitionModel';

const modelNameSymbol = Symbol();

export function setModelName(model: DefinitionModel, name: string) {
    Object.defineProperty(model,modelNameSymbol,{
        value: name,
        enumerable: true,
        writable: false,
        configurable: false
    });
}

export function getModelName(model: DefinitionModel): string | undefined {
    return model && model[modelNameSymbol];
}