/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

let ErrorType = require('../constante/errorTypes');

module.exports = {

    paramIsNotAString : {
        name          : 'paramIsNotAString',
        description   : 'Param is not a String!',
        type          : ErrorType.VALIDATOR_ERROR,
        sendInfo      : true,
        //INFO
        // paramValue (paramValue)
        // paramName (paramName)
        isSystemError : true
    },

    paramIsNotAInt : {
        name          : 'paramIsNotAInt',
        description   : 'Param is not a Int!',
        type          : ErrorType.VALIDATOR_ERROR,
        sendInfo      : true,
        //INFO
        // paramValue (paramValue)
        // paramName (paramName)
        isSystemError : true
    },

    paramIsNotAFloat : {
        name          : 'paramIsNotAFloat',
        description   : 'Param is not a Float!',
        type          : ErrorType.VALIDATOR_ERROR,
        sendInfo      : true,
        //INFO
        // paramValue (paramValue)
        // paramName (paramName)
        isSystemError : true
    },

    paramIsNotADate : {
        name          : 'paramIsNotADate',
        description   : 'Param is not a Date!',
        type          : ErrorType.VALIDATOR_ERROR,
        sendInfo      : true,
        //INFO
        // paramValue (paramValue)
        // paramName (paramName)
        isSystemError : true
    },

    paramIsNotAEmail : {
        name          : 'paramIsNotAEmail',
        description   : 'Param is not a Email!',
        type          : ErrorType.VALIDATOR_ERROR,
        sendInfo      : true,
        //INFO
        // paramValue (paramValue)
        // paramName (paramName)
        isSystemError : true
    },

    paramIsNotABoolean : {
        name          : 'paramIsNotABoolean',
        description   : 'Param is not a Boolean!',
        type          : ErrorType.VALIDATOR_ERROR,
        sendInfo      : true,
        //INFO
        // paramValue (paramValue)
        // paramName (paramName)
        isSystemError : true
    },

    paramIsNotASha512 : {
        name          : 'paramIsNotASha512',
        description   : 'Param is not a Sha512!',
        type          : ErrorType.VALIDATOR_ERROR,
        sendInfo      : true,
        //INFO
        // paramValue (paramValue)
        // paramName (paramName)
        isSystemError : true
    },

    paramIsNotASha256 : {
        name          : 'paramIsNotASha256',
        description   : 'Param is not a Sha256!',
        type          : ErrorType.VALIDATOR_ERROR,
        sendInfo      : true,
        //INFO
        // paramValue (paramValue)
        // paramName (paramName)
        isSystemError : true
    },

    paramIsNotASha384 : {
        name          : 'paramIsNotASha384',
        description   : 'Param is not a Sha384!',
        type          : ErrorType.VALIDATOR_ERROR,
        sendInfo      : true,
        //INFO
        // paramValue (paramValue)
        // paramName (paramName)
        isSystemError : true
    },

    paramIsNotASha1 : {
        name          : 'paramIsNotASha1',
        description   : 'Param is not a Sha1!',
        type          : ErrorType.VALIDATOR_ERROR,
        sendInfo      : true,
        //INFO
        // paramValue (paramValue)
        // paramName (paramName)
        isSystemError : true
    },

    paramIsNotAMd5 : {
        name          : 'paramIsNotAMd5',
        description   : 'Param is not a Md5!',
        type          : ErrorType.VALIDATOR_ERROR,
        sendInfo      : true,
        //INFO
        // paramValue (paramValue)
        // paramName (paramName)
        isSystemError : true
    },

    paramIsNotAHexColor : {
        name          : 'paramIsNotAHexColor',
        description   : 'Param is not a HexColor!',
        type          : ErrorType.VALIDATOR_ERROR,
        sendInfo      : true,
        //INFO
        // paramValue (paramValue)
        // paramName (paramName)
        isSystemError : true
    },

    paramIsNotAHexadecimal : {
        name          : 'paramIsNotAHexadecimal',
        description   : 'Param is not a hexadecimal!',
        type          : ErrorType.VALIDATOR_ERROR,
        sendInfo      : true,
        //INFO
        // paramValue (paramValue)
        // paramName (paramName)
        isSystemError : true
    },

    paramIsNotAIp5 : {
        name          : 'paramIsNotAIp5',
        description   : 'Param is not a Ip Version 5!',
        type          : ErrorType.VALIDATOR_ERROR,
        sendInfo      : true,
        //INFO
        // paramValue (paramValue)
        // paramName (paramName)
        isSystemError : true
    },

    paramIsNotAIp6 : {
        name          : 'paramIsNotAIp6',
        description   : 'Param is not a Ip Version 6!',
        type          : ErrorType.VALIDATOR_ERROR,
        sendInfo      : true,
        //INFO
        // paramValue (paramValue)
        // paramName (paramName)
        isSystemError : true
    },

    paramIsNotAIsbn10 : {
        name          : 'paramIsNotAIsbn10',
        description   : 'Param is not a Isbn Version 10!',
        type          : ErrorType.VALIDATOR_ERROR,
        sendInfo      : true,
        //INFO
        // paramValue (paramValue)
        // paramName (paramName)
        isSystemError : true
    },

    paramIsNotAIsbn13 : {
        name          : 'paramIsNotAIsbn13',
        description   : 'Param is not a Isbn Version 13!',
        type          : ErrorType.VALIDATOR_ERROR,
        sendInfo      : true,
        //INFO
        // paramValue (paramValue)
        // paramName (paramName)
        isSystemError : true
    },

    paramIsNotAJson : {
        name          : 'paramIsNotAJson',
        description   : 'Param is not a Json!',
        type          : ErrorType.VALIDATOR_ERROR,
        sendInfo      : true,
        //INFO
        // paramValue (paramValue)
        // paramName (paramName)
        isSystemError : true
    },

    paramIsNotAUrl : {
        name          : 'paramIsNotAUrl',
        description   : 'Param is not a Url!',
        type          : ErrorType.VALIDATOR_ERROR,
        sendInfo      : true,
        //INFO
        // paramValue (paramValue)
        // paramName (paramName)
        isSystemError : true
    },

    paramIsNotAMimeType : {
        name          : 'paramIsNotAMimeType',
        description   : 'Param is not a Mime Type!',
        type          : ErrorType.VALIDATOR_ERROR,
        sendInfo      : true,
        //INFO
        // paramValue (paramValue)
        // paramName (paramName)
        isSystemError : true
    },

    paramIsNotAMacAddress : {
        name          : 'paramIsNotAMacAddress',
        description   : 'Param is not a Max Address!',
        type          : ErrorType.VALIDATOR_ERROR,
        sendInfo      : true,
        //INFO
        // paramValue (paramValue)
        // paramName (paramName)
        isSystemError : true
    },

    paramIsNotAMobileNumber : {
        name          : 'paramIsNotAMobileNumber',
        description   : 'Param is not a Mobile Number!',
        type          : ErrorType.VALIDATOR_ERROR,
        sendInfo      : true,
        //INFO
        // paramValue (paramValue)
        // paramName (paramName)
        isSystemError : true
    },

    paramIsNotAUuid3 : {
        name          : 'paramIsNotAUuid3',
        description   : 'Param is not a UUID Version 3!',
        type          : ErrorType.VALIDATOR_ERROR,
        sendInfo      : true,
        //INFO
        // paramValue (paramValue)
        // paramName (paramName)
        isSystemError : true
    },

    paramIsNotAUuid4 : {
        name          : 'paramIsNotAUuid4',
        description   : 'Param is not a UUID Version 4!',
        type          : ErrorType.VALIDATOR_ERROR,
        sendInfo      : true,
        //INFO
        // paramValue (paramValue)
        // paramName (paramName)
        isSystemError : true
    },

    paramIsNotAUuid5 : {
        name          : 'paramIsNotAUuid5',
        description   : 'Param is not a UUID Version 5!',
        type          : ErrorType.VALIDATOR_ERROR,
        sendInfo      : true,
        //INFO
        // paramValue (paramValue)
        // paramName (paramName)
        isSystemError : true
    },

    paramIsNotALatLong : {
        name          : 'paramIsNotALatLong',
        description   : 'Param is not a LatLong!',
        type          : ErrorType.VALIDATOR_ERROR,
        sendInfo      : true,
        //INFO
        // paramValue (paramValue)
        // paramName (paramName)
        isSystemError : true
    },

    paramIsNotABase64 : {
        name          : 'paramIsNotABase64',
        description   : 'Param is not a Base64!',
        type          : ErrorType.VALIDATOR_ERROR,
        sendInfo      : true,
        //INFO
        // paramValue (paramValue)
        // paramName (paramName)
        isSystemError : true
    },

    paramIsNotAAscii : {
        name          : 'paramIsNotAAscii',
        description   : 'Param is not a Ascii!',
        type          : ErrorType.VALIDATOR_ERROR,
        sendInfo      : true,
        //INFO
        // paramValue (paramValue)
        // paramName (paramName)
        isSystemError : true
    },

    paramNotMatchWithMinLength : {
        name          : 'paramNotMatchWithMinLength',
        description   : 'Param not match with min length!',
        type          : ErrorType.VALIDATOR_ERROR,
        sendInfo      : true,
        //INFO
        // paramValue (paramValue)
        // paramName (paramName)
        // minLength (minLength)
        isSystemError : true
    },

    paramNotMatchWithMaxLength : {
        name          : 'paramNotMatchWithMaxLength',
        description   : 'Param not match with max length!',
        type          : ErrorType.VALIDATOR_ERROR,
        sendInfo      : true,
        //INFO
        // paramValue (paramValue)
        // paramName (paramName)
        // maxLength (maxLength)
        isSystemError : true
    },

    paramNotMatchWithLength : {
        name          : 'paramNotMatchWithLength',
        description   : 'Param not match with length!',
        type          : ErrorType.VALIDATOR_ERROR,
        sendInfo      : true,
        //INFO
        // paramValue (paramValue)
        // paramName (paramName)
        // length (length)
        isSystemError : true
    },

    paramIsNotUppercase : {
        name          : 'paramIsNotUpperCase',
        description   : 'Param is not uppercase!',
        type          : ErrorType.VALIDATOR_ERROR,
        sendInfo      : true,
        //INFO
        // paramValue (paramValue)
        // paramName (paramName)
        isSystemError : true
    },

    paramIsNotLowercase : {
        name          : 'paramIsNotLowercase',
        description   : 'Param is not lowercase!',
        type          : ErrorType.VALIDATOR_ERROR,
        sendInfo      : true,
        //INFO
        // paramValue (paramValue)
        // paramName (paramName)
        isSystemError : true
    },

    paramNotMatchWithContains : {
        name          : 'paramNotMatchWithContains',
        description   : 'Param is not contains!',
        type          : ErrorType.VALIDATOR_ERROR,
        sendInfo      : true,
        //INFO
        // paramValue (paramValue)
        // paramName (paramName)
        // shouldContain (shouldContain)
        isSystemError : true
    },

    paramIsNotEquals : {
        name          : 'paramIsNotEquals',
        description   : 'Param is not equals!',
        type          : ErrorType.VALIDATOR_ERROR,
        sendInfo      : true,
        //INFO
        // paramValue (paramValue)
        // paramName (paramName)
        // shouldEqual (shouldEqual)
        isSystemError : true
    },

    paramIsNotBiggerThan : {
        name          : 'paramIsNotBiggerThan',
        description   : 'Param is not bigger than!',
        type          : ErrorType.VALIDATOR_ERROR,
        sendInfo      : true,
        //INFO
        // paramValue (paramValue)
        // paramName (paramName)
        // shouldBiggerThan (shouldBiggerThan)
        isSystemError : true
    },

    paramIsNotLesserThan : {
        name          : 'paramIsNotLesserThan',
        description   : 'Param is not lesser than!',
        type          : ErrorType.VALIDATOR_ERROR,
        sendInfo      : true,
        //INFO
        // paramValue (paramValue)
        // paramName (paramName)
        // shouldLesserThan (shouldLesserThan)
        isSystemError : true
    },

    paramIsNotMatchWithRegex : {
        name          : 'paramIsNotMatchWithRegex',
        description   : 'Param is not match with regex!',
        type          : ErrorType.VALIDATOR_ERROR,
        sendInfo      : true,
        //INFO
        // paramValue (paramValue)
        // paramName (paramName)
        // regex (regex)
        isSystemError : true
    },

    paramIsNotStartsWith : {
        name          : 'paramIsNotStartsWith',
        description   : 'Param is not starts with!',
        type          : ErrorType.VALIDATOR_ERROR,
        sendInfo      : true,
        //INFO
        // paramValue (paramValue)
        // paramName (paramName)
        // shouldStartsWith (shouldStartsWith)
        isSystemError : true
    },

    paramIsNotEndsWith : {
        name          : 'paramIsNotEndsWith',
        description   : 'Param is not ends with!',
        type          : ErrorType.VALIDATOR_ERROR,
        sendInfo      : true,
        //INFO
        // paramValue (paramValue)
        // paramName (paramName)
        // shouldEndsWith (shouldEndsWith)
        isSystemError : true
    },

};