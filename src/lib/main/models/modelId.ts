/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {ModelConfig}          from '../config/definitions/parts/inputConfig';

let idCounter = 0;
export const modelIdSymbol = Symbol();

export function setUniqueModelId(model: ModelConfig) {
    Object.defineProperty(model,modelIdSymbol,{
        value: idCounter,
        enumerable: true,
        writable: false,
        configurable: false
    });
    idCounter++;
}
