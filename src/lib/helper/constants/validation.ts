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
    nameof<ValuePropertyConfig>(s => s.maxValue),
    nameof<ValuePropertyConfig>(s => s.minValue)
];

export const OnlyStringFunctions = [
    nameof<ValuePropertyConfig>(s => s.endsWith),
    nameof<ValuePropertyConfig>(s => s.startsWith),
    nameof<ValuePropertyConfig>(s => s.regex),
    nameof<ValuePropertyConfig>(s => s.contains),
    nameof<ValuePropertyConfig>(s => s.length),
    nameof<ValuePropertyConfig>(s => s.minLength),
    nameof<ValuePropertyConfig>(s => s.maxLength),
    nameof<ValuePropertyConfig>(s => s.letters),
    nameof<ValuePropertyConfig>(s => s.charClass),

    //base64 is also a string
    nameof<ValuePropertyConfig>(s => s.minByteSize),
    nameof<ValuePropertyConfig>(s => s.maxByteSize)
];

export const OnlyDateFunctions = [
    nameof<ValuePropertyConfig>(s => s.before),
    nameof<ValuePropertyConfig>(s => s.after)
];

export const OnlyBase64Functions = [
    nameof<ValuePropertyConfig>(s => s.mimeType),
    nameof<ValuePropertyConfig>(s => s.subType)
];