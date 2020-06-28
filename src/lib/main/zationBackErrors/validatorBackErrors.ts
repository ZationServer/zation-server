/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {ErrorGroup}       from "../definitions/errorGroup";
// noinspection TypeScriptPreferShortImport
import {ErrorType}        from "../definitions/errorType";
import BackErrorConstruct from "../definitions/backErrorConstruct";

export const ValidatorBackErrors = {
    valueNotMatchesWithType: {
        name         : 'valueNotMatchesWithType',
        description  : 'Value not matches with type.',
        type         : ErrorType.ValidationError,
        sendInfo     : true,
        //INFO
        // value
        // path
        // type
        fromZationSystem: true
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
        fromZationSystem: true
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
        fromZationSystem: true
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
        fromZationSystem: true
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
        fromZationSystem: true
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
        fromZationSystem: true
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
        fromZationSystem: true
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
        fromZationSystem: true
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
        fromZationSystem: true
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
        fromZationSystem: true
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
        fromZationSystem: true
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
        fromZationSystem: true
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
        fromZationSystem: true
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
        fromZationSystem: true
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
        fromZationSystem: true
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
        fromZationSystem: true
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
        fromZationSystem: true
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
        fromZationSystem: true
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
        fromZationSystem: true
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
        fromZationSystem: true
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
        fromZationSystem: true
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
        fromZationSystem: true
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
        fromZationSystem: true
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
        fromZationSystem: true
    } as BackErrorConstruct,

    noAnyOfMatch: {
        name         : 'noAnyOfMatch',
        description  : 'No anyOf match.',
        type         : ErrorType.ValidationError,
        sendInfo     : true,
        //INFO
        // value
        // path
        fromZationSystem: true
    } as BackErrorConstruct
};