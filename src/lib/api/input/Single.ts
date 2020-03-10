/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {Model, SingleModelInput} from '../../main/config/definitions/parts/inputConfig';

export function $single(model: Model): SingleModelInput {
    return [model];
}