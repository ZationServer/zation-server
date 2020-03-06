/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {ValidationFunctions} from '../config/definitions/parts/validationFunctions';

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
    nameof<ValidationFunctions>(s => s.maxValue),
    nameof<ValidationFunctions>(s => s.minValue)
];

export const OnlyStringFunctions = [
    nameof<ValidationFunctions>(s => s.endsWith),
    nameof<ValidationFunctions>(s => s.startsWith),
    nameof<ValidationFunctions>(s => s.regex),
    nameof<ValidationFunctions>(s => s.contains),
    nameof<ValidationFunctions>(s => s.length),
    nameof<ValidationFunctions>(s => s.minLength),
    nameof<ValidationFunctions>(s => s.maxLength),
    nameof<ValidationFunctions>(s => s.letters),
    nameof<ValidationFunctions>(s => s.charClass),

    //base64 is also a string
    nameof<ValidationFunctions>(s => s.minByteSize),
    nameof<ValidationFunctions>(s => s.maxByteSize)
];

export const OnlyDateFunctions = [
    nameof<ValidationFunctions>(s => s.before),
    nameof<ValidationFunctions>(s => s.after)
];

export const OnlyBase64Functions = [
    nameof<ValidationFunctions>(s => s.mimeType),
    nameof<ValidationFunctions>(s => s.mimeSubType)
];
