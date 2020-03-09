/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {ArrayModel, ArraySettings, Model} from '../../main/config/definitions/parts/inputConfig';

export function $array(body: Model, options: ArraySettings = {}): ArrayModel {
    return {
        ...options,
        array: body
    };
}