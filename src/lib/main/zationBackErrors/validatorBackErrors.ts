/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {ErrorGroup}       from "../constants/errorGroup";
// noinspection TypeScriptPreferShortImport
import {ErrorType}        from "./../constants/errorType";
import BackErrorConstruct from "../constants/backErrorConstruct";

export const ValidatorBackErrors: Record<string,BackErrorConstruct> = {
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
    },

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
    },

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
    },

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
    },

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
    },

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
    },

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
    },

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
    },

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
    },

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
    },

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
    },

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
    },

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
    },

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
    },

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
    },

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
    },

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
    },

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
    },

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
    },

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
    },

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
    },

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
    },

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
    },

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
    },

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
    },

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
    },

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
    },

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
    },

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
    },

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
    },

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
    },

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
    },

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
    },

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
    },

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
    },

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
    },

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
    },

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
    },

    valueIsNotUppercase: {
        name         : 'valueIsNotUpperCase',
        group        : ErrorGroup.LettersFormatError,
        description  : 'Value is not uppercase.',
        type         : ErrorType.ValidationError,
        sendInfo     : true,
        //INFO
        // value
        // path
        fromZationSystem: true
    },

    valueIsNotLowercase: {
        name         : 'valueIsNotLowercase',
        group        : ErrorGroup.LettersFormatError,
        description  : 'Value is not lowercase.',
        type         : ErrorType.ValidationError,
        sendInfo     : true,
        //INFO
        // value
        // path
        fromZationSystem: true
    },

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
    },

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
    },

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
    },

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
    },

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
    },

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
    },

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
    },

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
    },

    valueNotMatchesWithStartsWith: {
        name         : 'valueNotMatchesWithStartsWith',
        description  : 'Value is not starts with.',
        type         : ErrorType.ValidationError,
        sendInfo     : true,
        //INFO
        // value
        // path
        // shouldStartsWith
        fromZationSystem: true
    },

    valueIsNotEndsWith: {
        name         : 'valueIsNotEndsWith',
        description  : 'Value is not ends with.',
        type         : ErrorType.ValidationError,
        sendInfo     : true,
        //INFO
        // value
        // path
        // shouldEndsWith
        fromZationSystem: true
    },

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
    },

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
    },

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
    },

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
    },

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
    },

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
    },

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
    },

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
    },

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
    },

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
    },

    noAnyOfMatch: {
        name         : 'noAnyOfMatch',
        description  : 'No anyOf match.',
        type         : ErrorType.ValidationError,
        sendInfo     : true,
        //INFO
        // value
        // path
        fromZationSystem: true
    }
};