/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {AnyModelTranslatable, Model} from '../../main/config/definitions/parts/inputConfig';

/**
 * Marks model or ModelTranslatable as a single input.
 * Notice that it is not necessary to mark explicit models as a single input.
 * @param model
 */
export function $single<T extends Model | AnyModelTranslatable>(model: T): [T] {
    return [model];
}