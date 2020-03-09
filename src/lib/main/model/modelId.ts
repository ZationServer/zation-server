/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {Model} from '../config/definitions/parts/inputConfig';

let idCounter = 0;
export const modelIdSymbol = Symbol();

export function setUniqueModelId(model: Model) {
    model[modelIdSymbol] = idCounter;
    idCounter++;
}
