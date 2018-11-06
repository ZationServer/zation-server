/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import {ValuePropertyConfig} from "../configs/appConfig";

export enum FormatLetters {
    UPPER_CASE              = 'uppercase',
    LOWER_CASE              = 'lowercase'
}

export const OnlyNumberFunctions = [
    nameof<ValuePropertyConfig>(s => s.lesserThan),
    nameof<ValuePropertyConfig>(s => s.biggerThan)
];

export const OnlyStringFunctions = [
    nameof<ValuePropertyConfig>(s => s.endsWith),
    nameof<ValuePropertyConfig>(s => s.startsWith),
    nameof<ValuePropertyConfig>(s => s.regex),
    nameof<ValuePropertyConfig>(s => s.contains),
    nameof<ValuePropertyConfig>(s => s.length),
    nameof<ValuePropertyConfig>(s => s.minLength),
    nameof<ValuePropertyConfig>(s => s.maxLength),
    nameof<ValuePropertyConfig>(s => s.isLetters)
];

