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
    inputIsNotTypeObject: {
        name         : 'inputIsNotTypeObject',
        group        : ErrorGroup.TypeError,
        description  : 'Input is not from type Object!',
        type         : ErrorType.ValidationError,
        sendInfo     : true,
        //INFO
        // inputValue (inputValue)
        // inputPath (inputPath)
        fromZationSystem: true
    },

    inputIsNotTypeArray: {
        name         : 'inputIsNotTypeArray',
        group        : ErrorGroup.TypeError,
        description  : 'Input is not from type Array!',
        type         : ErrorType.ValidationError,
        sendInfo     : true,
        //INFO
        // inputValue (inputValue)
        // inputPath (inputPath)
        fromZationSystem: true
    },

    inputIsNotTypeString: {
        name         : 'inputIsNotTypeString',
        group        : ErrorGroup.TypeError,
        description  : 'Input is not from type String!',
        type         : ErrorType.ValidationError,
        sendInfo     : true,
        //INFO
        // inputValue (inputValue)
        // inputPath (inputPath)
        fromZationSystem: true
    },

    inputIsNotTypeChar: {
        name         : 'inputIsNotTypeChar',
        group        : ErrorGroup.TypeError,
        description  : 'Input is not from type Char!',
        type         : ErrorType.ValidationError,
        sendInfo     : true,
        //INFO
        // inputValue (inputValue)
        // inputPath (inputPath)
        fromZationSystem: true
    },

    inputIsNotTypeNull: {
        name         : 'inputIsNotTypeNull',
        group        : ErrorGroup.TypeError,
        description  : 'Input is not from type Null!',
        type         : ErrorType.ValidationError,
        sendInfo     : true,
        //INFO
        // inputValue (inputValue)
        // inputPath (inputPath)
        fromZationSystem: true
    },

    inputIsNotTypeInt: {
        name         : 'inputIsNotTypeInt',
        group        : ErrorGroup.TypeError,
        description  : 'Input is not from type Int!',
        type         : ErrorType.ValidationError,
        sendInfo     : true,
        //INFO
        // inputValue (inputValue)
        // inputPath (inputPath)
        fromZationSystem: true
    },

    inputIsNotTypeFloat: {
        name         : 'inputIsNotTypeFloat',
        group        : ErrorGroup.TypeError,
        description  : 'Input is not from type Float!',
        type         : ErrorType.ValidationError,
        sendInfo     : true,
        //INFO
        // inputValue (inputValue)
        // inputPath (inputPath)
        fromZationSystem: true
    },

    inputIsNotTypeNumber: {
        name         : 'inputIsNotTypeNumber',
        group        : ErrorGroup.TypeError,
        description  : 'Input is not from type number!',
        type         : ErrorType.ValidationError,
        sendInfo     : true,
        //INFO
        // inputValue (inputValue)
        // inputPath (inputPath)
        fromZationSystem: true
    },

    inputIsNotTypeDate: {
        name         : 'inputIsNotTypeDate',
        group        : ErrorGroup.TypeError,
        description  : 'Input is not from type Date!',
        type         : ErrorType.ValidationError,
        sendInfo     : true,
        //INFO
        // inputValue (inputValue)
        // inputPath (inputPath)
        fromZationSystem: true
    },

    inputIsNotTypeEmail: {
        name         : 'inputIsNotTypeEmail',
        group        : ErrorGroup.TypeError,
        description  : 'Input is not from type Email!',
        type         : ErrorType.ValidationError,
        sendInfo     : true,
        //INFO
        // inputValue (inputValue)
        // inputPath (inputPath)
        fromZationSystem: true
    },

    inputIsNotTypeBoolean: {
        name         : 'inputIsNotTypeBoolean',
        group        : ErrorGroup.TypeError,
        description  : 'Input is not from type Boolean!',
        type         : ErrorType.ValidationError,
        sendInfo     : true,
        //INFO
        // inputValue (inputValue)
        // inputPath (inputPath)
        fromZationSystem: true
    },

    inputIsNotTypeSha512: {
        name         : 'inputIsNotTypeSha512',
        group        : ErrorGroup.TypeError,
        description  : 'Input is not from type Sha512!',
        type         : ErrorType.ValidationError,
        sendInfo     : true,
        //INFO
        // inputValue (inputValue)
        // inputPath (inputPath)
        fromZationSystem: true
    },

    inputIsNotTypeSha256: {
        name         : 'inputIsNotTypeSha256',
        group        : ErrorGroup.TypeError,
        description  : 'Input is not from type Sha256!',
        type         : ErrorType.ValidationError,
        sendInfo     : true,
        //INFO
        // inputValue (inputValue)
        // inputPath (inputPath)
        fromZationSystem: true
    },

    inputIsNotTypeSha384: {
        name         : 'inputIsNotTypeSha384',
        group        : ErrorGroup.TypeError,
        description  : 'Input is not from type Sha384!',
        type         : ErrorType.ValidationError,
        sendInfo     : true,
        //INFO
        // inputValue (inputValue)
        // inputPath (inputPath)
        fromZationSystem: true
    },

    inputIsNotTypeSha1: {
        name         : 'inputIsNotTypeSha1',
        group        : ErrorGroup.TypeError,
        description  : 'Input is not from type Sha1!',
        type         : ErrorType.ValidationError,
        sendInfo     : true,
        //INFO
        // inputValue (inputValue)
        // inputPath (inputPath)
        fromZationSystem: true
    },

    inputIsNotTypeMd5: {
        name         : 'inputIsNotTypeMd5',
        group        : ErrorGroup.TypeError,
        description  : 'Input is not from type Md5!',
        type         : ErrorType.ValidationError,
        sendInfo     : true,
        //INFO
        // inputValue (inputValue)
        // inputPath (inputPath)
        fromZationSystem: true
    },

    inputIsNotTypeHexColor: {
        name         : 'inputIsNotTypeHexColor',
        group        : ErrorGroup.TypeError,
        description  : 'Input is not from type HexColor!',
        type         : ErrorType.ValidationError,
        sendInfo     : true,
        //INFO
        // inputValue (inputValue)
        // inputPath (inputPath)
        fromZationSystem: true
    },

    inputIsNotTypeHexadecimal: {
        name         : 'inputIsNotTypeHexadecimal',
        group        : ErrorGroup.TypeError,
        description  : 'Input is not from type hexadecimal!',
        type         : ErrorType.ValidationError,
        sendInfo     : true,
        //INFO
        // inputValue (inputValue)
        // inputPath (inputPath)
        fromZationSystem: true
    },

    inputIsNotTypeIp4: {
        name         : 'inputIsNotTypeIp4',
        group        : ErrorGroup.TypeError,
        description  : 'Input is not from type Ip Version 4!',
        type         : ErrorType.ValidationError,
        sendInfo     : true,
        //INFO
        // inputValue (inputValue)
        // inputPath (inputPath)
        fromZationSystem: true
    },

    inputIsNotTypeIp6: {
        name         : 'inputIsNotTypeIp6',
        group        : ErrorGroup.TypeError,
        description  : 'Input is not from type Ip Version 6!',
        type         : ErrorType.ValidationError,
        sendInfo     : true,
        //INFO
        // inputValue (inputValue)
        // inputPath (inputPath)
        fromZationSystem: true
    },

    inputIsNotTypeIsbn10: {
        name         : 'inputIsNotTypeIsbn10',
        group        : ErrorGroup.TypeError,
        description  : 'Input is not from type Isbn Version 10!',
        type         : ErrorType.ValidationError,
        sendInfo     : true,
        //INFO
        // inputValue (inputValue)
        // inputPath (inputPath)
        fromZationSystem: true
    },

    inputIsNotTypeIsbn13: {
        name         : 'inputIsNotTypeIsbn13',
        group        : ErrorGroup.TypeError,
        description  : 'Input is not from type Isbn Version 13!',
        type         : ErrorType.ValidationError,
        sendInfo     : true,
        //INFO
        // inputValue (inputValue)
        // inputPath (inputPath)
        fromZationSystem: true
    },

    inputIsNotTypeJson: {
        name         : 'inputIsNotTypeJson',
        group        : ErrorGroup.TypeError,
        description  : 'Input is not from type JsonConverter!',
        type         : ErrorType.ValidationError,
        sendInfo     : true,
        //INFO
        // inputValue (inputValue)
        // inputPath (inputPath)
        fromZationSystem: true
    },

    inputIsNotTypeUrl: {
        name         : 'inputIsNotTypeUrl',
        group        : ErrorGroup.TypeError,
        description  : 'Input is not from type Url!',
        type         : ErrorType.ValidationError,
        sendInfo     : true,
        //INFO
        // inputValue (inputValue)
        // inputPath (inputPath)
        fromZationSystem: true
    },

    inputIsNotTypeMimeType: {
        name         : 'inputIsNotTypeMimeType',
        group        : ErrorGroup.TypeError,
        description  : 'Input is not from type Mime Type!',
        type         : ErrorType.ValidationError,
        sendInfo     : true,
        //INFO
        // inputValue (inputValue)
        // inputPath (inputPath)
        fromZationSystem: true
    },

    inputIsNotTypeMacAddress: {
        name         : 'inputIsNotTypeMacAddress',
        group        : ErrorGroup.TypeError,
        description  : 'Input is not from type Max Address!',
        type         : ErrorType.ValidationError,
        sendInfo     : true,
        //INFO
        // inputValue (inputValue)
        // inputPath (inputPath)
        fromZationSystem: true
    },

    inputIsNotTypeMobileNumber: {
        name         : 'inputIsNotTypeMobileNumber',
        group        : ErrorGroup.TypeError,
        description  : 'Input is not from type Mobile Number!',
        type         : ErrorType.ValidationError,
        sendInfo     : true,
        //INFO
        // inputValue (inputValue)
        // inputPath (inputPath)
        fromZationSystem: true
    },

    inputIsNotTypeUuid3: {
        name         : 'inputIsNotTypeUuid3',
        group        : ErrorGroup.TypeError,
        description  : 'Input is not from type UUID Version 3!',
        type         : ErrorType.ValidationError,
        sendInfo     : true,
        //INFO
        // inputValue (inputValue)
        // inputPath (inputPath)
        fromZationSystem: true
    },

    inputIsNotTypeUuid4: {
        name         : 'inputIsNotTypeUuid4',
        group        : ErrorGroup.TypeError,
        description  : 'Input is not from type UUID Version 4!',
        type         : ErrorType.ValidationError,
        sendInfo     : true,
        //INFO
        // inputValue (inputValue)
        // inputPath (inputPath)
        fromZationSystem: true
    },

    inputIsNotTypeUuid5: {
        name         : 'inputIsNotTypeUuid5',
        group        : ErrorGroup.TypeError,
        description  : 'Input is not from type UUID Version 5!',
        type         : ErrorType.ValidationError,
        sendInfo     : true,
        //INFO
        // inputValue (inputValue)
        // inputPath (inputPath)
        fromZationSystem: true
    },

    inputIsNotTypeBase64: {
        name         : 'inputIsNotTypeBase64',
        group        : ErrorGroup.TypeError,
        description  : 'Input is not from type Base64!',
        type         : ErrorType.ValidationError,
        sendInfo     : true,
        //INFO
        // inputValue (inputValue)
        // inputPath (inputPath)
        fromZationSystem: true
    },

    inputIsNotTypeAscii: {
        name         : 'inputIsNotTypeAscii',
        group        : ErrorGroup.TypeError,
        description  : 'Input is not from type Ascii!',
        type         : ErrorType.ValidationError,
        sendInfo     : true,
        //INFO
        // inputValue (inputValue)
        // inputPath (inputPath)
        fromZationSystem: true
    },

    inputIsNotTypeUserId: {
        name         : 'inputIsNotTypeUserId',
        group        : ErrorGroup.TypeError,
        description  : 'Input is not from type user id!',
        type         : ErrorType.ValidationError,
        sendInfo     : true,
        //INFO
        // inputValue (inputValue)
        // inputPath (inputPath)
        fromZationSystem: true
    },

    inputIsNotTypeMongoId: {
        name         : 'inputIsNotTypeMongoId',
        group        : ErrorGroup.TypeError,
        description  : 'Input is not from type mongo id!',
        type         : ErrorType.ValidationError,
        sendInfo     : true,
        //INFO
        // inputValue (inputValue)
        // inputPath (inputPath)
        fromZationSystem: true
    },

    inputIsNotTypeLatLong: {
        name         : 'inputIsNotTypeLatLong',
        group        : ErrorGroup.TypeError,
        description  : 'Input is not from type lat long!',
        type         : ErrorType.ValidationError,
        sendInfo     : true,
        //INFO
        // inputValue (inputValue)
        // inputPath (inputPath)
        fromZationSystem: true
    },

    inputNotMatchWithMinLength: {
        name         : 'inputNotMatchWithMinLength',
        group        : ErrorGroup.ValueLengthError,
        description  : 'Input not match with min length!',
        type         : ErrorType.ValidationError,
        sendInfo     : true,
        //INFO
        // inputValue (inputValue)
        // inputPath (inputPath)
        // minLength (minLength)
        fromZationSystem: true
    },

    inputNotMatchWithMaxLength: {
        name         : 'inputNotMatchWithMaxLength',
        group        : ErrorGroup.ValueLengthError,
        description  : 'Input not match with max length!',
        type         : ErrorType.ValidationError,
        sendInfo     : true,
        //INFO
        // inputValue (inputValue)
        // inputPath (inputPath)
        // maxLength (maxLength)
        fromZationSystem: true
    },

    inputNotMatchWithLength: {
        name         : 'inputNotMatchWithLength',
        group        : ErrorGroup.ValueLengthError,
        description  : 'Input not match with length!',
        type         : ErrorType.ValidationError,
        sendInfo     : true,
        //INFO
        // inputValue (inputValue)
        // inputPath (inputPath)
        // length (length)
        fromZationSystem: true
    },

    inputIsNotUppercase: {
        name         : 'inputIsNotUpperCase',
        group        : ErrorGroup.LettersFormatError,
        description  : 'Input is not uppercase!',
        type         : ErrorType.ValidationError,
        sendInfo     : true,
        //INFO
        // inputValue (inputValue)
        // inputPath (inputPath)
        fromZationSystem: true
    },

    inputIsNotLowercase: {
        name         : 'inputIsNotLowercase',
        group        : ErrorGroup.LettersFormatError,
        description  : 'Input is not lowercase!',
        type         : ErrorType.ValidationError,
        sendInfo     : true,
        //INFO
        // inputValue (inputValue)
        // inputPath (inputPath)
        fromZationSystem: true
    },

    inputIsNotMatchWithCharClass: {
        name         : 'inputIsNotMatchWithCharClass',
        description  : 'Input is not match with char class!',
        type         : ErrorType.ValidationError,
        sendInfo     : true,
        //INFO
        // inputValue (inputValue)
        // inputPath (inputPath)
        // regex
        fromZationSystem: true
    },

    inputDateIsNotBefore: {
        name         : 'inputDateIsNotBefore',
        group        : ErrorGroup.DateError,
        description  : 'Input date is not before date!',
        type         : ErrorType.ValidationError,
        sendInfo     : true,
        //INFO
        // inputValue (inputValue)
        // inputPath (inputPath)
        // shouldBefore
        fromZationSystem: true
    },

    inputDateIsNotAfter: {
        name         : 'inputDateIsNotAfter',
        group        : ErrorGroup.DateError,
        description  : 'Input date is not after date!',
        type         : ErrorType.ValidationError,
        sendInfo     : true,
        //INFO
        // inputValue (inputValue)
        // inputPath (inputPath)
        // shouldAfter
        fromZationSystem: true
    },

    inputIsNotContains: {
        name         : 'inputIsNotContains',
        description  : 'Input is not contains!',
        type         : ErrorType.ValidationError,
        sendInfo     : true,
        //INFO
        // inputValue (inputValue)
        // inputPath (inputPath)
        // shouldContain (shouldContain)
        fromZationSystem: true
    },

    inputIsNotEquals: {
        name         : 'inputIsNotEquals',
        description  : 'Input is not equals!',
        type         : ErrorType.ValidationError,
        sendInfo     : true,
        //INFO
        // inputValue (inputValue)
        // inputPath (inputPath)
        // shouldEqual (shouldEqual)
        fromZationSystem: true
    },

    inputNotMatchWithMinValue: {
        name         : 'inputNotMatchWithMinValue',
        group        : ErrorGroup.NumberSizeError,
        description  : 'Input is not match with min value!',
        type         : ErrorType.ValidationError,
        sendInfo     : true,
        //INFO
        // inputValue (inputValue)
        // inputPath (inputPath)
        // minValue (min value)
        fromZationSystem: true
    },

    inputNotMatchWithMaxValue: {
        name         : 'inputNotMatchWithMaxValue',
        group        : ErrorGroup.NumberSizeError,
        description  : 'Input is not match with max value!',
        type         : ErrorType.ValidationError,
        sendInfo     : true,
        //INFO
        // inputValue (inputValue)
        // inputPath (inputPath)
        // maxValue (max value)
        fromZationSystem: true
    },

    inputIsNotMatchWithRegex: {
        name         : 'inputIsNotMatchWithRegex',
        description  : 'Input is not match with regex!',
        type         : ErrorType.ValidationError,
        sendInfo     : true,
        //INFO
        // inputValue (inputValue)
        // inputPath (inputPath)
        // regexName
        // regex
        fromZationSystem: true
    },

    inputIsNotStartsWith: {
        name         : 'inputIsNotStartsWith',
        description  : 'Input is not starts with!',
        type         : ErrorType.ValidationError,
        sendInfo     : true,
        //INFO
        // inputValue (inputValue)
        // inputPath (inputPath)
        // shouldStartsWith (shouldStartsWith)
        fromZationSystem: true
    },

    inputIsNotEndsWith: {
        name         : 'inputIsNotEndsWith',
        description  : 'Input is not ends with!',
        type         : ErrorType.ValidationError,
        sendInfo     : true,
        //INFO
        // inputValue (inputValue)
        // inputPath (inputPath)
        // shouldEndsWith (shouldEndsWith)
        fromZationSystem: true
    },

    inputIsNotMatchWithIn: {
        name         : 'inputIsNotMatchWithIn',
        group        : ErrorGroup.InError,
        description  : 'Input is not match with any value!',
        type         : ErrorType.ValidationError,
        sendInfo     : true,
        //INFO
        // inputValue (inputValue)
        // inputPath (inputPath)
        // values (In-Values Array)
        fromZationSystem: true
    },

    inputIsNotMatchWithPrivateIn: {
        name         : 'inputIsNotMatchWithPrivateIn',
        group        : ErrorGroup.InError,
        description  : 'Input is not match with any value!',
        type         : ErrorType.ValidationError,
        sendInfo     : true,
        //INFO
        // inputValue (inputValue)
        // inputPath (inputPath)
        fromZationSystem: true
    },

    inputArrayNotMatchWithMaxLength: {
        name         : 'inputArrayNotMatchWithMaxLength',
        group        : ErrorGroup.ArrayLengthError,
        description  : 'Input array not match with max length!',
        type         : ErrorType.ValidationError,
        sendInfo     : true,
        //INFO
        // inputValue (inputValue)
        // inputPath (inputPath)
        // maxLength (maxLength)
        fromZationSystem: true
    },

    inputArrayNotMatchWithMinLength: {
        name         : 'inputArrayNotMatchWithMinLength',
        group        : ErrorGroup.ArrayLengthError,
        description  : 'Input array not match with min length!',
        type         : ErrorType.ValidationError,
        sendInfo     : true,
        //INFO
        // inputValue (inputValue)
        // inputPath (inputPath)
        // minLength (minLength)
        fromZationSystem: true
    },

    inputArrayNotMatchWithLength: {
        name         : 'inputArrayNotMatchWithLength',
        group        : ErrorGroup.ArrayLengthError,
        description  : 'Input array not match with length!',
        type         : ErrorType.ValidationError,
        sendInfo     : true,
        //INFO
        // inputValue (inputValue)
        // inputPath (inputPath)
        // length (length)
        fromZationSystem: true
    },

    inputNotMatchWithMinByteSize: {
        name         : 'inputNotMatchWithMinByteSize',
        group        : ErrorGroup.ByteSizeError,
        description  : 'Input is not match with min byte size!',
        type         : ErrorType.ValidationError,
        sendInfo     : true,
        //INFO
        // inputValue (inputValue)
        // inputPath (inputPath)
        // minByteSize (min byte size)
        fromZationSystem: true
    },

    inputNotMatchWithMaxByteSize: {
        name         : 'inputNotMatchWithMaxByteSize',
        group        : ErrorGroup.ByteSizeError,
        description  : 'Input is not match with max byte size!',
        type         : ErrorType.ValidationError,
        sendInfo     : true,
        //INFO
        // inputValue (inputValue)
        // inputPath (inputPath)
        // maxByteSize (max byte size)
        fromZationSystem: true
    },

    inputNotMatchWithMimeType: {
        name         : 'inputNotMatchWithMimeType',
        group        : ErrorGroup.ContentTypeError,
        description  : 'Input is not match with mime type!',
        type         : ErrorType.ValidationError,
        sendInfo     : true,
        //INFO
        // inputValue (inputValue)
        // inputPath (inputPath)
        // mimeType (mime type that is allow)
        fromZationSystem: true
    },

    inputNotMatchWithMimeSubType: {
        name         : 'inputNotMatchWithMimeSubType',
        group        : ErrorGroup.ContentTypeError,
        description  : 'Input is not match with mime sub type!',
        type         : ErrorType.ValidationError,
        sendInfo     : true,
        //INFO
        // inputValue (inputValue)
        // inputPath (inputPath)
        // mimeSubType (mime sub type that is allow)
        fromZationSystem: true
    },

    noValidTypeWasFound: {
        name         : 'noValidTypeWasFound',
        group        : ErrorGroup.TypeError,
        description  : 'No valid type was found!',
        type         : ErrorType.ValidationError,
        sendInfo     : true,
        //INFO
        // inputValue (inputValue)
        // inputPath (inputPath)
        // types (types was checked on value)
        fromZationSystem: true
    },

    noAnyOfMatch: {
        name         : 'noAnyOfMatch',
        description  : 'No anyOf match!',
        type         : ErrorType.ValidationError,
        sendInfo     : true,
        //INFO
        // inputValue (inputValue)
        // inputPath (inputPath)
        fromZationSystem: true
    }
};