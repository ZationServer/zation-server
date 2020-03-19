/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {ErrorGroup}       from "../constants/errorGroup";
// noinspection TypeScriptPreferShortImport
import {ErrorType}        from "./../constants/errorType";
import BackErrorConstruct from "../constants/backErrorConstruct";

export const ValidatorBackErrors = {
    valueIsNotTypeObject: {
        name         : 'valueIsNotTypeObject',
        group        : ErrorGroup.TypeError,
        description  : 'Value is not from type Object.',
        type         : ErrorType.ValidationError,
        sendInfo     : true,
        //INFO
        // value
        // path
        fromZationSystem: true
    } as BackErrorConstruct,

    valueIsNotTypeArray: {
        name         : 'valueIsNotTypeArray',
        group        : ErrorGroup.TypeError,
        description  : 'Value is not from type Array.',
        type         : ErrorType.ValidationError,
        sendInfo     : true,
        //INFO
        // value
        // path
        fromZationSystem: true
    } as BackErrorConstruct,

    valueIsNotTypeString: {
        name         : 'valueIsNotTypeString',
        group        : ErrorGroup.TypeError,
        description  : 'Value is not from type String.',
        type         : ErrorType.ValidationError,
        sendInfo     : true,
        //INFO
        // value
        // path
        fromZationSystem: true
    } as BackErrorConstruct,

    valueIsNotTypeChar: {
        name         : 'valueIsNotTypeChar',
        group        : ErrorGroup.TypeError,
        description  : 'Value is not from type Char.',
        type         : ErrorType.ValidationError,
        sendInfo     : true,
        //INFO
        // value
        // path
        fromZationSystem: true
    } as BackErrorConstruct,

    valueIsNotTypeNull: {
        name         : 'valueIsNotTypeNull',
        group        : ErrorGroup.TypeError,
        description  : 'Value is not from type Null.',
        type         : ErrorType.ValidationError,
        sendInfo     : true,
        //INFO
        // value
        // path
        fromZationSystem: true
    } as BackErrorConstruct,

    valueIsNotTypeInt: {
        name         : 'valueIsNotTypeInt',
        group        : ErrorGroup.TypeError,
        description  : 'Value is not from type Int.',
        type         : ErrorType.ValidationError,
        sendInfo     : true,
        //INFO
        // value
        // path
        fromZationSystem: true
    } as BackErrorConstruct,

    valueIsNotTypeFloat: {
        name         : 'valueIsNotTypeFloat',
        group        : ErrorGroup.TypeError,
        description  : 'Value is not from type Float.',
        type         : ErrorType.ValidationError,
        sendInfo     : true,
        //INFO
        // value
        // path
        fromZationSystem: true
    } as BackErrorConstruct,

    valueIsNotTypeNumber: {
        name         : 'valueIsNotTypeNumber',
        group        : ErrorGroup.TypeError,
        description  : 'Value is not from type number.',
        type         : ErrorType.ValidationError,
        sendInfo     : true,
        //INFO
        // value
        // path
        fromZationSystem: true
    } as BackErrorConstruct,

    valueIsNotTypeDate: {
        name         : 'valueIsNotTypeDate',
        group        : ErrorGroup.TypeError,
        description  : 'Value is not from type Date.',
        type         : ErrorType.ValidationError,
        sendInfo     : true,
        //INFO
        // value
        // path
        fromZationSystem: true
    } as BackErrorConstruct,

    valueIsNotTypeEmail: {
        name         : 'valueIsNotTypeEmail',
        group        : ErrorGroup.TypeError,
        description  : 'Value is not from type Email.',
        type         : ErrorType.ValidationError,
        sendInfo     : true,
        //INFO
        // value
        // path
        fromZationSystem: true
    } as BackErrorConstruct,

    valueIsNotTypeBoolean: {
        name         : 'valueIsNotTypeBoolean',
        group        : ErrorGroup.TypeError,
        description  : 'Value is not from type Boolean.',
        type         : ErrorType.ValidationError,
        sendInfo     : true,
        //INFO
        // value
        // path
        fromZationSystem: true
    } as BackErrorConstruct,

    valueIsNotTypeSha512: {
        name         : 'valueIsNotTypeSha512',
        group        : ErrorGroup.TypeError,
        description  : 'Value is not from type Sha512.',
        type         : ErrorType.ValidationError,
        sendInfo     : true,
        //INFO
        // value
        // path
        fromZationSystem: true
    } as BackErrorConstruct,

    valueIsNotTypeSha256: {
        name         : 'valueIsNotTypeSha256',
        group        : ErrorGroup.TypeError,
        description  : 'Value is not from type Sha256.',
        type         : ErrorType.ValidationError,
        sendInfo     : true,
        //INFO
        // value
        // path
        fromZationSystem: true
    } as BackErrorConstruct,

    valueIsNotTypeSha384: {
        name         : 'valueIsNotTypeSha384',
        group        : ErrorGroup.TypeError,
        description  : 'Value is not from type Sha384.',
        type         : ErrorType.ValidationError,
        sendInfo     : true,
        //INFO
        // value
        // path
        fromZationSystem: true
    } as BackErrorConstruct,

    valueIsNotTypeSha1: {
        name         : 'valueIsNotTypeSha1',
        group        : ErrorGroup.TypeError,
        description  : 'Value is not from type Sha1.',
        type         : ErrorType.ValidationError,
        sendInfo     : true,
        //INFO
        // value
        // path
        fromZationSystem: true
    } as BackErrorConstruct,

    valueIsNotTypeMd5: {
        name         : 'valueIsNotTypeMd5',
        group        : ErrorGroup.TypeError,
        description  : 'Value is not from type Md5.',
        type         : ErrorType.ValidationError,
        sendInfo     : true,
        //INFO
        // value
        // path
        fromZationSystem: true
    } as BackErrorConstruct,

    valueIsNotTypeHexColor: {
        name         : 'valueIsNotTypeHexColor',
        group        : ErrorGroup.TypeError,
        description  : 'Value is not from type HexColor.',
        type         : ErrorType.ValidationError,
        sendInfo     : true,
        //INFO
        // value
        // path
        fromZationSystem: true
    } as BackErrorConstruct,

    valueIsNotTypeHexadecimal: {
        name         : 'valueIsNotTypeHexadecimal',
        group        : ErrorGroup.TypeError,
        description  : 'Value is not from type hexadecimal.',
        type         : ErrorType.ValidationError,
        sendInfo     : true,
        //INFO
        // value
        // path
        fromZationSystem: true
    } as BackErrorConstruct,

    valueIsNotTypeIp4: {
        name         : 'valueIsNotTypeIp4',
        group        : ErrorGroup.TypeError,
        description  : 'Value is not from type Ip Version 4.',
        type         : ErrorType.ValidationError,
        sendInfo     : true,
        //INFO
        // value
        // path
        fromZationSystem: true
    } as BackErrorConstruct,

    valueIsNotTypeIp6: {
        name         : 'valueIsNotTypeIp6',
        group        : ErrorGroup.TypeError,
        description  : 'Value is not from type Ip Version 6.',
        type         : ErrorType.ValidationError,
        sendInfo     : true,
        //INFO
        // value
        // path
        fromZationSystem: true
    } as BackErrorConstruct,

    valueIsNotTypeIsbn10: {
        name         : 'valueIsNotTypeIsbn10',
        group        : ErrorGroup.TypeError,
        description  : 'Value is not from type Isbn Version 10.',
        type         : ErrorType.ValidationError,
        sendInfo     : true,
        //INFO
        // value
        // path
        fromZationSystem: true
    } as BackErrorConstruct,

    valueIsNotTypeIsbn13: {
        name         : 'valueIsNotTypeIsbn13',
        group        : ErrorGroup.TypeError,
        description  : 'Value is not from type Isbn Version 13.',
        type         : ErrorType.ValidationError,
        sendInfo     : true,
        //INFO
        // value
        // path
        fromZationSystem: true
    } as BackErrorConstruct,

    valueIsNotTypeJson: {
        name         : 'valueIsNotTypeJson',
        group        : ErrorGroup.TypeError,
        description  : 'Value is not from type JsonConverter.',
        type         : ErrorType.ValidationError,
        sendInfo     : true,
        //INFO
        // value
        // path
        fromZationSystem: true
    } as BackErrorConstruct,

    valueIsNotTypeUrl: {
        name         : 'valueIsNotTypeUrl',
        group        : ErrorGroup.TypeError,
        description  : 'Value is not from type Url.',
        type         : ErrorType.ValidationError,
        sendInfo     : true,
        //INFO
        // value
        // path
        fromZationSystem: true
    } as BackErrorConstruct,

    valueIsNotTypeMimeType: {
        name         : 'valueIsNotTypeMimeType',
        group        : ErrorGroup.TypeError,
        description  : 'Value is not from type Mime Type.',
        type         : ErrorType.ValidationError,
        sendInfo     : true,
        //INFO
        // value
        // path
        fromZationSystem: true
    } as BackErrorConstruct,

    valueIsNotTypeMacAddress: {
        name         : 'valueIsNotTypeMacAddress',
        group        : ErrorGroup.TypeError,
        description  : 'Value is not from type Max Address.',
        type         : ErrorType.ValidationError,
        sendInfo     : true,
        //INFO
        // value
        // path
        fromZationSystem: true
    } as BackErrorConstruct,

    valueIsNotTypeMobileNumber: {
        name         : 'valueIsNotTypeMobileNumber',
        group        : ErrorGroup.TypeError,
        description  : 'Value is not from type Mobile Number.',
        type         : ErrorType.ValidationError,
        sendInfo     : true,
        //INFO
        // value
        // path
        fromZationSystem: true
    } as BackErrorConstruct,

    valueIsNotTypeUuid3: {
        name         : 'valueIsNotTypeUuid3',
        group        : ErrorGroup.TypeError,
        description  : 'Value is not from type UUID Version 3.',
        type         : ErrorType.ValidationError,
        sendInfo     : true,
        //INFO
        // value
        // path
        fromZationSystem: true
    } as BackErrorConstruct,

    valueIsNotTypeUuid4: {
        name         : 'valueIsNotTypeUuid4',
        group        : ErrorGroup.TypeError,
        description  : 'Value is not from type UUID Version 4.',
        type         : ErrorType.ValidationError,
        sendInfo     : true,
        //INFO
        // value
        // path
        fromZationSystem: true
    } as BackErrorConstruct,

    valueIsNotTypeUuid5: {
        name         : 'valueIsNotTypeUuid5',
        group        : ErrorGroup.TypeError,
        description  : 'Value is not from type UUID Version 5.',
        type         : ErrorType.ValidationError,
        sendInfo     : true,
        //INFO
        // value
        // path
        fromZationSystem: true
    } as BackErrorConstruct,

    valueIsNotTypeBase64: {
        name         : 'valueIsNotTypeBase64',
        group        : ErrorGroup.TypeError,
        description  : 'Value is not from type Base64.',
        type         : ErrorType.ValidationError,
        sendInfo     : true,
        //INFO
        // value
        // path
        fromZationSystem: true
    } as BackErrorConstruct,

    valueIsNotTypeAscii: {
        name         : 'valueIsNotTypeAscii',
        group        : ErrorGroup.TypeError,
        description  : 'Value is not from type Ascii.',
        type         : ErrorType.ValidationError,
        sendInfo     : true,
        //INFO
        // value
        // path
        fromZationSystem: true
    } as BackErrorConstruct,

    valueIsNotTypeUserId: {
        name         : 'valueIsNotTypeUserId',
        group        : ErrorGroup.TypeError,
        description  : 'Value is not from type user id.',
        type         : ErrorType.ValidationError,
        sendInfo     : true,
        //INFO
        // value
        // path
        fromZationSystem: true
    } as BackErrorConstruct,

    valueIsNotTypeMongoId: {
        name         : 'valueIsNotTypeMongoId',
        group        : ErrorGroup.TypeError,
        description  : 'Value is not from type mongo id.',
        type         : ErrorType.ValidationError,
        sendInfo     : true,
        //INFO
        // value
        // path
        fromZationSystem: true
    } as BackErrorConstruct,

    valueIsNotTypeLatLong: {
        name         : 'valueIsNotTypeLatLong',
        group        : ErrorGroup.TypeError,
        description  : 'Value is not from type lat long.',
        type         : ErrorType.ValidationError,
        sendInfo     : true,
        //INFO
        // value
        // path
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
        // shouldStartsWith
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
        // shouldEndsWith
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

    noValidTypeWasFound: {
        name         : 'noValidTypeWasFound',
        group        : ErrorGroup.TypeError,
        description  : 'No valid type was found.',
        type         : ErrorType.ValidationError,
        sendInfo     : true,
        //INFO
        // value
        // path
        // types (types was checked on value)
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