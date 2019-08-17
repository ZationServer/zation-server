/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {ValueModelConfig} from "../config/definitions/inputConfig";

export enum FormatLetters {
    UPPER_CASE              = 'uppercase',
    LOWER_CASE              = 'lowercase'
}

export enum TypeTypes {
    NUMBER,
    STRING,
    DATE,
    BASE64,
    ANY,
    OTHER
}

export const OnlyNumberFunctions = [
    nameof<ValueModelConfig>(s => s.maxValue),
    nameof<ValueModelConfig>(s => s.minValue)
];

export const OnlyStringFunctions = [
    nameof<ValueModelConfig>(s => s.endsWith),
    nameof<ValueModelConfig>(s => s.startsWith),
    nameof<ValueModelConfig>(s => s.regex),
    nameof<ValueModelConfig>(s => s.contains),
    nameof<ValueModelConfig>(s => s.length),
    nameof<ValueModelConfig>(s => s.minLength),
    nameof<ValueModelConfig>(s => s.maxLength),
    nameof<ValueModelConfig>(s => s.letters),
    nameof<ValueModelConfig>(s => s.charClass),

    //base64 is also a string
    nameof<ValueModelConfig>(s => s.minByteSize),
    nameof<ValueModelConfig>(s => s.maxByteSize)
];

export const OnlyDateFunctions = [
    nameof<ValueModelConfig>(s => s.before),
    nameof<ValueModelConfig>(s => s.after)
];

export const OnlyBase64Functions = [
    nameof<ValueModelConfig>(s => s.mimeType),
    nameof<ValueModelConfig>(s => s.mimeSubType)
];
