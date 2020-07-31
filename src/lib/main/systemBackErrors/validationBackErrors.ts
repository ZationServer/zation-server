/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {ErrorGroup}       from "../definitions/errorGroup";
// noinspection TypeScriptPreferShortImport
import {ErrorType}        from "../definitions/errorType";
import BackErrorConstruct from "../definitions/backErrorConstruct";

export const ValidationBackErrors = {
    valueNotMatchesWithType: {
        name         : 'valueNotMatchesWithType',
        description  : 'Value not matches with type.',
        type         : ErrorType.ValidationError,
        sendInfo     : true,
        //INFO
        // value
        // path
        // type
        custom: false
    } as BackErrorConstruct,

    valueNotMatchesWithMinLength: {
        name         : 'valueNotMatchesWithMinLength',
        group        : ErrorGroup.ValueLengthError,
        description  : 'Input not match with min length.',
        type         : ErrorType.ValidationError,
        sendInfo     : true,
        //INFO
        // value
        // path
        // minLength
        custom: false
    } as BackErrorConstruct,

    valueNotMatchesWithMaxLength: {
        name         : 'valueNotMatchesWithMaxLength',
        group        : ErrorGroup.ValueLengthError,
        description  : 'Input not match with max length.',
        type         : ErrorType.ValidationError,
        sendInfo     : true,
        //INFO
        // value
        // path
        // maxLength
        custom: false
    } as BackErrorConstruct,

    valueNotMatchesWithLength: {
        name         : 'valueNotMatchesWithLength',
        group        : ErrorGroup.ValueLengthError,
        description  : 'Input not match with length.',
        type         : ErrorType.ValidationError,
        sendInfo     : true,
        //INFO
        // value
        // path
        // length
        custom: false
    } as BackErrorConstruct,

    valueNotMatchesWithLettersFormat: {
        name         : 'valueNotMatchesWithLettersFormat',
        description  : 'Value not matches with letters format.',
        type         : ErrorType.ValidationError,
        sendInfo     : true,
        //INFO
        // value
        // path
        // format
        custom: false
    } as BackErrorConstruct,

    valueNotMatchesWithCharClass: {
        name         : 'valueNotMatchesWithCharClass',
        description  : 'Value not matches with char class.',
        type         : ErrorType.ValidationError,
        sendInfo     : true,
        //INFO
        // value
        // path
        // regex
        custom: false
    } as BackErrorConstruct,

    dateIsNotBefore: {
        name         : 'dateIsNotBefore',
        group        : ErrorGroup.DateError,
        description  : 'Input date is not before date.',
        type         : ErrorType.ValidationError,
        sendInfo     : true,
        //INFO
        // value
        // path
        // shouldBefore
        custom: false
    } as BackErrorConstruct,

    dateIsNotAfter: {
        name         : 'dateIsNotAfter',
        group        : ErrorGroup.DateError,
        description  : 'Input date is not after date.',
        type         : ErrorType.ValidationError,
        sendInfo     : true,
        //INFO
        // value
        // path
        // shouldAfter
        custom: false
    } as BackErrorConstruct,

    valueNotMatchesWithContains: {
        name         : 'valueNotMatchesWithContains',
        description  : 'Value is not contains.',
        type         : ErrorType.ValidationError,
        sendInfo     : true,
        //INFO
        // value
        // path
        // shouldContain
        custom: false
    } as BackErrorConstruct,

    valueNotMatchesWithEquals: {
        name         : 'valueNotMatchesWithEquals',
        description  : 'Value is not equals.',
        type         : ErrorType.ValidationError,
        sendInfo     : true,
        //INFO
        // value
        // path
        // shouldEqual
        custom: false
    } as BackErrorConstruct,

    valueNotMatchesWithMinValue: {
        name         : 'valueNotMatchesWithMinValue',
        group        : ErrorGroup.NumberSizeError,
        description  : 'Value not matches with min value.',
        type         : ErrorType.ValidationError,
        sendInfo     : true,
        //INFO
        // value
        // path
        // minValue
        custom: false
    } as BackErrorConstruct,

    valueNotMatchesWithMaxValue: {
        name         : 'valueNotMatchesWithMaxValue',
        group        : ErrorGroup.NumberSizeError,
        description  : 'Value not matches with max value.',
        type         : ErrorType.ValidationError,
        sendInfo     : true,
        //INFO
        // value
        // path
        // maxValue
        custom: false
    } as BackErrorConstruct,

    valueNotMatchesWithRegex: {
        name         : 'valueNotMatchesWithRegex',
        description  : 'Value not matches with regex.',
        type         : ErrorType.ValidationError,
        sendInfo     : true,
        //INFO
        // value
        // path
        // regexName
        // regex
        custom: false
    } as BackErrorConstruct,

    valueNotMatchesWithStartsWith: {
        name         : 'valueNotMatchesWithStartsWith',
        description  : 'Value not matches with starts with.',
        type         : ErrorType.ValidationError,
        sendInfo     : true,
        //INFO
        // value
        // path
        // shouldStartWith
        custom: false
    } as BackErrorConstruct,

    valueNotMatchesWithEndsWith: {
        name         : 'valueNotMatchesWithEndsWith',
        description  : 'Value not matches with ends with.',
        type         : ErrorType.ValidationError,
        sendInfo     : true,
        //INFO
        // value
        // path
        // shouldEndWith
        custom: false
    } as BackErrorConstruct,

    valueNotMatchesWithIn: {
        name         : 'valueNotMatchesWithIn',
        group        : ErrorGroup.InError,
        description  : 'Value not matches with any value.',
        type         : ErrorType.ValidationError,
        sendInfo     : true,
        //INFO
        // value
        // path
        // values (In-Values Array)
        custom: false
    } as BackErrorConstruct,

    valueNotMatchesWithPrivateIn: {
        name         : 'valueNotMatchesWithPrivateIn',
        group        : ErrorGroup.InError,
        description  : 'Value not matches with any value.',
        type         : ErrorType.ValidationError,
        sendInfo     : true,
        //INFO
        // value
        // path
        custom: false
    } as BackErrorConstruct,

    valueNotMatchesWithMinByteSize: {
        name         : 'valueNotMatchesWithMinByteSize',
        group        : ErrorGroup.ByteSizeError,
        description  : 'Value not matches with min byte size.',
        type         : ErrorType.ValidationError,
        sendInfo     : true,
        //INFO
        // value
        // path
        // minByteSize
        custom: false
    } as BackErrorConstruct,

    valueNotMatchesWithMaxByteSize: {
        name         : 'valueNotMatchesWithMaxByteSize',
        group        : ErrorGroup.ByteSizeError,
        description  : 'Value not matches with max byte size.',
        type         : ErrorType.ValidationError,
        sendInfo     : true,
        //INFO
        // value
        // path
        // maxByteSize
        custom: false
    } as BackErrorConstruct,

    valueNotMatchesWithMimeType: {
        name         : 'valueNotMatchesWithMimeType',
        group        : ErrorGroup.ContentTypeError,
        description  : 'Value not matches with mime type.',
        type         : ErrorType.ValidationError,
        sendInfo     : true,
        //INFO
        // value
        // path
        // mimeType (mime type that is allow)
        custom: false
    } as BackErrorConstruct,

    valueNotMatchesWithMimeSubType: {
        name         : 'valueNotMatchesWithMimeSubType',
        group        : ErrorGroup.ContentTypeError,
        description  : 'Value not matches with mime sub type.',
        type         : ErrorType.ValidationError,
        sendInfo     : true,
        //INFO
        // value
        // path
        // mimeSubType (mime sub type that is allow)
        custom: false
    } as BackErrorConstruct,

    arrayNotMatchesWithMaxLength: {
        name         : 'arrayNotMatchesWithMaxLength',
        group        : ErrorGroup.ArrayLengthError,
        description  : 'Array not matches with max length.',
        type         : ErrorType.ValidationError,
        sendInfo     : true,
        //INFO
        // value
        // path
        // maxLength
        custom: false
    } as BackErrorConstruct,

    arrayNotMatchesWithMinLength: {
        name         : 'arrayNotMatchesWithMinLength',
        group        : ErrorGroup.ArrayLengthError,
        description  : 'Array not matches with min length.',
        type         : ErrorType.ValidationError,
        sendInfo     : true,
        //INFO
        // value
        // path
        // minLength
        custom: false
    } as BackErrorConstruct,

    arrayNotMatchesWithLength: {
        name         : 'arrayNotMatchesWithLength',
        group        : ErrorGroup.ArrayLengthError,
        description  : 'Array not matches with length.',
        type         : ErrorType.ValidationError,
        sendInfo     : true,
        //INFO
        // value
        // path
        // length
        custom: false
    } as BackErrorConstruct,

    noAnyOfMatch: {
        name         : 'noAnyOfMatch',
        description  : 'No anyOf match.',
        type         : ErrorType.ValidationError,
        sendInfo     : true,
        //INFO
        // value
        // path
        // canBeNull
        custom: false
    } as BackErrorConstruct,

    inputNotAllowed: {
        name         : 'inputNotAllowed',
        description  : 'Input is not allowed.',
        type         : ErrorType.ValidationError,
        sendInfo     : true,
        custom: false
    } as BackErrorConstruct,

    inputRequired: {
        name         : 'inputRequired',
        description  : 'Input is required.',
        type         : ErrorType.ValidationError,
        sendInfo     : true,
        custom: false
    } as BackErrorConstruct,

    valueRequired: {
        name         : 'valueRequired',
        description  : 'Value is required.',
        type         : ErrorType.ValidationError,
        sendInfo     : true,
        custom: false
    } as BackErrorConstruct,

    invalidType: {
        name         : 'invalidType',
        description  : 'Invalid type',
        type         : ErrorType.ValidationError,
        sendInfo     : true,
        //INFO
        // path (full path to the value)
        // value (the input value)
        // expected (expected types)
        custom: false
    } as BackErrorConstruct,

    missingObjectProperty: {
        name         : 'missingObjectProperty',
        description  : 'Missing object property.',
        type         : ErrorType.ValidationError,
        sendInfo     : true,
        //INFO
        // object (the input object where the property is missing)
        // propertyName (name of missing property)
        // path (the full input path to missing property)
        custom: false
    } as BackErrorConstruct,

    unknownObjectProperty: {
        name         : 'unknownObjectProperty',
        description  : 'Unknown object property.',
        type         : ErrorType.ValidationError,
        sendInfo     : true,
        //INFO
        // propertyName (name of the unknown property)
        // path (full input path to unknown property)
        custom: false
    } as BackErrorConstruct
};