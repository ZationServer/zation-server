/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {Model, ModelConfig} from '../../main/config/definitions/parts/inputConfig';

/**
 * Marks a disposable model as a single input model.
 * @param model
 */
export function $single<T extends Model | ModelConfig>(model: T): [T] {
    return [model];
}