/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {Model, SingleModelInput} from '../../main/config/definitions/parts/inputConfig';

/**
 * Marks a disposable model as a single input model.
 * @param model
 */
export function $single(model: Model): SingleModelInput {
    return [model];
}