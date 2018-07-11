/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

/*
Validation Library from Zation
 */

import ValidatorErrors = require('../zationTaskErrors/validatorTaskErrors');
import EasyValidator   = require('./easyValidator');
import Const           = require('../constants/constWrapper');
import TaskError       = require('../../api/TaskError');

//TYPE VALIDATION LIBRARY

let typeLibrary = {};

typeLibrary[Const.Validator.TYPE.STRING] = (input,taskErrorBag,prepareErrorData) =>
{
    if(!EasyValidator.isString(input))
    {
        taskErrorBag.addTaskError(new TaskError(ValidatorErrors.inputIsNotAString,prepareErrorData));
    }
    return input;
};

typeLibrary[Const.Validator.TYPE.INT] = (input,taskErrorBag,prepareErrorData) =>
{
    if(EasyValidator.isInt(input))
    {
        return parseInt(input);
    }
    else
    {
        taskErrorBag.addTaskError(new TaskError(ValidatorErrors.inputIsNotAInt,prepareErrorData));
        return input;
    }
};

typeLibrary[Const.Validator.TYPE.FLOAT] = (input,taskErrorBag,prepareErrorData) =>
{
    if(EasyValidator.isFloat(input))
    {
        return parseFloat(input);
    }
    else
    {
        taskErrorBag.addTaskError(new TaskError(ValidatorErrors.inputIsNotAFloat,prepareErrorData));
        return input;
    }
};

typeLibrary[Const.Validator.TYPE.DATE] = (input,taskErrorBag,prepareErrorData) =>
{
    let date = EasyValidator.isDate(input);
    if(date !== null)
    {
        return date;
    }
    else
    {
        taskErrorBag.addTaskError(new TaskError(ValidatorErrors.inputIsNotADate,prepareErrorData));
        return input;
    }
};

typeLibrary[Const.Validator.TYPE.EMAIL] = (input,taskErrorBag,prepareErrorData) =>
{
    if(!EasyValidator.isEmail(input))
    {
        taskErrorBag.addTaskError(new TaskError(ValidatorErrors.inputIsNotAEmail,prepareErrorData));
        return input;
    }
    return input;
};

typeLibrary[Const.Validator.TYPE.BOOLEAN] = (input,taskErrorBag,prepareErrorData) =>
{
    if(EasyValidator.isBoolean(input))
    {
        return EasyValidator.stringToBool(input);
    }
    else
    {
        taskErrorBag.addTaskError(new TaskError(ValidatorErrors.inputIsNotABoolean,prepareErrorData));
        return input;
    }
};

typeLibrary[Const.Validator.TYPE.SHA512] = (input,taskErrorBag,prepareErrorData) =>
{
    if(!EasyValidator.isSha512(input))
    {
        taskErrorBag.addTaskError(new TaskError(ValidatorErrors.inputIsNotASha512,prepareErrorData));
    }
    return input;
};

typeLibrary[Const.Validator.TYPE.SHA256] = (input,taskErrorBag,prepareErrorData) =>
{
    if(!EasyValidator.isSha256(input))
    {
        taskErrorBag.addTaskError(new TaskError(ValidatorErrors.inputIsNotASha256,prepareErrorData));
    }
    return input;
};

typeLibrary[Const.Validator.TYPE.SHA384] = (input,taskErrorBag,prepareErrorData) =>
{
    if(!EasyValidator.isSha384(input))
    {
        taskErrorBag.addTaskError(new TaskError(ValidatorErrors.inputIsNotASha384,prepareErrorData));
    }
    return input;
};

typeLibrary[Const.Validator.TYPE.SHA1] = (input,taskErrorBag,prepareErrorData) =>
{
    if(!EasyValidator.isSha1(input))
    {
        taskErrorBag.addTaskError(new TaskError(ValidatorErrors.inputIsNotASha1,prepareErrorData));
    }
    return input;
};

typeLibrary[Const.Validator.TYPE.MD5] = (input,taskErrorBag,prepareErrorData) =>
{
    if(!EasyValidator.isMd5(input))
    {
        taskErrorBag.addTaskError(new TaskError(ValidatorErrors.inputIsNotAMd5,prepareErrorData));
    }
    return input;
};

typeLibrary[Const.Validator.TYPE.HEX_COLOR] = (input,taskErrorBag,prepareErrorData) =>
{
    if(!EasyValidator.isHexColor(input))
    {
        taskErrorBag.addTaskError(new TaskError(ValidatorErrors.inputIsNotAHexColor,prepareErrorData));
    }
    return input;
};

typeLibrary[Const.Validator.TYPE.HEXADECIMAL] = (input,taskErrorBag,prepareErrorData) =>
{
    if(!EasyValidator.isHexadecimal(input))
    {
        taskErrorBag.addTaskError(new TaskError(ValidatorErrors.inputIsNotAHexadecimal,prepareErrorData));
    }
    return input;
};

typeLibrary[Const.Validator.TYPE.IP_5] = (input,taskErrorBag,prepareErrorData) =>
{
    if(!EasyValidator.isIP5(input))
    {
        taskErrorBag.addTaskError(new TaskError(ValidatorErrors.inputIsNotAIp5,prepareErrorData));
    }
    return input;
};

typeLibrary[Const.Validator.TYPE.IP_6] = (input,taskErrorBag,prepareErrorData) =>
{
    if(!EasyValidator.isIP6(input))
    {
        taskErrorBag.addTaskError(new TaskError(ValidatorErrors.inputIsNotAIp6,prepareErrorData));
    }
    return input;
};

typeLibrary[Const.Validator.TYPE.ISBN_10] = (input,taskErrorBag,prepareErrorData) =>
{
    if(!EasyValidator.isISB10(input))
    {
        taskErrorBag.addTaskError(new TaskError(ValidatorErrors.inputIsNotAIsbn10,prepareErrorData));
    }
    return input;
};

typeLibrary[Const.Validator.TYPE.ISBN_13] = (input,taskErrorBag,prepareErrorData) =>
{
    if(!EasyValidator.isISB13(input))
    {
        taskErrorBag.addTaskError(new TaskError(ValidatorErrors.inputIsNotAIsbn13,prepareErrorData));
    }
    return input;
};

typeLibrary[Const.Validator.TYPE.JSON] = (input,taskErrorBag,prepareErrorData) =>
{
    if(!EasyValidator.isJSON(input))
    {
        taskErrorBag.addTaskError(new TaskError(ValidatorErrors.inputIsNotAJson,prepareErrorData));
    }
    return input;
};

typeLibrary[Const.Validator.TYPE.URL] = (input,taskErrorBag,prepareErrorData) =>
{
    if(!EasyValidator.isUrl(input))
    {
        taskErrorBag.addTaskError(new TaskError(ValidatorErrors.inputIsNotAUrl,prepareErrorData));
    }
    return input;
};

typeLibrary[Const.Validator.TYPE.MIME_TYPE] = (input,taskErrorBag,prepareErrorData) =>
{
    if(!EasyValidator.isMimeType(input))
    {
        taskErrorBag.addTaskError(new TaskError(ValidatorErrors.inputIsNotAMimeType,prepareErrorData));
    }
    return input;
};

typeLibrary[Const.Validator.TYPE.MAC_ADDRESS] = (input,taskErrorBag,prepareErrorData) =>
{
    if(!EasyValidator.isMACAddress(input))
    {
        taskErrorBag.addTaskError(new TaskError(ValidatorErrors.inputIsNotAMacAddress,prepareErrorData));
    }
    return input;
};

typeLibrary[Const.Validator.TYPE.MOBILE_NUMBER] = (input,taskErrorBag,prepareErrorData) =>
{
    if(!EasyValidator.isMobilePhone(input))
    {
        taskErrorBag.addTaskError(new TaskError(ValidatorErrors.inputIsNotAMobileNumber,prepareErrorData));
    }
    return input;
};

typeLibrary[Const.Validator.TYPE.UUID_3] = (input,taskErrorBag,prepareErrorData) =>
{
    if(!EasyValidator.isUUID3(input))
    {
        taskErrorBag.addTaskError(new TaskError(ValidatorErrors.inputIsNotAUuid3,prepareErrorData));
    }
    return input;
};

typeLibrary[Const.Validator.TYPE.UUID_4] = (input,taskErrorBag,prepareErrorData) =>
{
    if(!EasyValidator.isUUID4(input))
    {
        taskErrorBag.addTaskError(new TaskError(ValidatorErrors.inputIsNotAUuid4,prepareErrorData));
    }
    return input;
};

typeLibrary[Const.Validator.TYPE.UUID_5] = (input,taskErrorBag,prepareErrorData) =>
{
    if(!EasyValidator.isUUID5(input))
    {
        taskErrorBag.addTaskError(new TaskError(ValidatorErrors.inputIsNotAUuid5,prepareErrorData));
    }
    return input;
};

typeLibrary[Const.Validator.TYPE.LAT_LONG] = (input,taskErrorBag,prepareErrorData) =>
{
    if(!EasyValidator.isLatLong(input))
    {
        taskErrorBag.addTaskError(new TaskError(ValidatorErrors.inputIsNotALatLong,prepareErrorData));
    }
    return input;
};

typeLibrary[Const.Validator.TYPE.BASE64] = (input,taskErrorBag,prepareErrorData) =>
{
    if(!EasyValidator.isBase64(input))
    {
        taskErrorBag.addTaskError(new TaskError(ValidatorErrors.inputIsNotABase64,prepareErrorData));
    }
    return input;
};

typeLibrary[Const.Validator.TYPE.ASCII] = (input,taskErrorBag,prepareErrorData) =>
{
    if(!EasyValidator.isAscii(input))
    {
        taskErrorBag.addTaskError(new TaskError(ValidatorErrors.inputIsNotAAscii,prepareErrorData));
    }
    return input;
};

//FUNCTION VALIDATION LIBRARY

let functionLibrary = {};

functionLibrary[Const.Validator.KEYS.FUNCTION_REGEX] = (input,settings,taskErrorBag,prepareErrorData) =>
{
    let regex  = new RegExp(settings);
    if(!regex.test(input))
    {
        taskErrorBag.addTaskErrorFast(ValidatorErrors.inputIsNotMatchWithRegex,
            {
                inputValue : prepareErrorData.inputValue,
                inputPath : prepareErrorData.inputPath,
                regex : settings
            });
    }
    return input;
};

functionLibrary[Const.Validator.KEYS.FUNCTION_ENUM] = (input,settings,taskErrorBag,prepareErrorData) =>
{
    if(!EasyValidator.validEnum(settings,input))
    {
        taskErrorBag.addTaskErrorFast(ValidatorErrors.inputIsNotMatchWithEnum,
            {
                inputValue : prepareErrorData.inputValue,
                inputPath : prepareErrorData.inputPath,
                enum : settings
            });
    }
    return input;
};

functionLibrary[Const.Validator.KEYS.FUNCTION_PRIVATE_ENUM] = (input,settings,taskErrorBag,prepareErrorData) =>
{
    if(!EasyValidator.validEnum(settings,input))
    {
        taskErrorBag.addTaskErrorFast(ValidatorErrors.inputIsNotMatchWithPrivateEnum,prepareErrorData);
    }
    return input;
};

functionLibrary[Const.Validator.KEYS.FUNCTION_MIN_LENGTH] = (input,settings,taskErrorBag,prepareErrorData) =>
{
    if(input.length < settings)
    {

        taskErrorBag.addTaskErrorFast(ValidatorErrors.inputNotMatchWithMinLength,
            {
                inputValue : prepareErrorData.inputValue,
                inputPath : prepareErrorData.inputPath,
                minLength : settings
            });
    }
    return input;
};

functionLibrary[Const.Validator.KEYS.FUNCTION_MAX_LENGTH] = (input,settings,taskErrorBag,prepareErrorData) =>
{
    if(input.length > settings)
    {

        taskErrorBag.addTaskErrorFast(ValidatorErrors.inputNotMatchWithMaxLength,
            {
                inputValue : prepareErrorData.inputValue,
                inputPath : prepareErrorData.inputPath,
                maxLength : settings

            });
    }
    return input;
};

functionLibrary[Const.Validator.KEYS.FUNCTION_LENGTH] = (input,settings,taskErrorBag,prepareErrorData) =>
{
    if(input.length !== settings)
    {

        taskErrorBag.addTaskErrorFast(ValidatorErrors.inputNotMatchWithLength,
            {
                inputValue : prepareErrorData.inputValue,
                inputPath : prepareErrorData.inputPath,
                length : settings

            });
    }
    return input;
};

functionLibrary[Const.Validator.KEYS.FUNCTION_CONTAINS] = (input,settings,taskErrorBag,prepareErrorData) =>
{
    if(input.indexOf(settings) === -1)
    {

        taskErrorBag.addTaskErrorFast(ValidatorErrors.inputNotMatchWithContains,
            {
                inputValue : prepareErrorData.inputValue,
                inputPath : prepareErrorData.inputPath,
                shouldContain : settings
            });
    }
    return input;
};

functionLibrary[Const.Validator.KEYS.FUNCTION_EQUALS] = (input,settings,taskErrorBag,prepareErrorData) =>
{
    if(input !== settings)
    {
        taskErrorBag.addTaskErrorFast(ValidatorErrors.inputIsNotEquals,
            {
                inputValue : prepareErrorData.inputValue,
                inputPath : prepareErrorData.inputPath,
                shouldEquals : settings

            });
    }
    return input;
};

functionLibrary[Const.Validator.KEYS.FUNCTION_BIGGER_THAN] = (input,settings,taskErrorBag,prepareErrorData) =>
{
    if(input < settings)
    {
        taskErrorBag.addTaskErrorFast(ValidatorErrors.inputIsNotBiggerThan,
            {
                inputValue : prepareErrorData.inputValue,
                inputPath : prepareErrorData.inputPath,
                shouldBiggerThan : settings

            });
    }
    return input;
};

functionLibrary[Const.Validator.KEYS.FUNCTION_LESSER_THAN] = (input,settings,taskErrorBag,prepareErrorData) =>
{
    if(input > settings)
    {
        taskErrorBag.addTaskErrorFast(ValidatorErrors.inputIsNotLesserThan,
            {
                inputValue : prepareErrorData.inputValue,
                inputPath : prepareErrorData.inputPath,
                shouldLesserThan : settings
            });
    }
    return input;
};

functionLibrary[Const.Validator.KEYS.FUNCTION_STARTS_WITH] = (input,settings,taskErrorBag,prepareErrorData) =>
{
    if(!input.startsWith(settings))
    {
        taskErrorBag.addTaskErrorFast(ValidatorErrors.inputIsNotStartsWith,
            {
                inputValue : prepareErrorData.inputValue,
                inputPath : prepareErrorData.inputPath,
                shouldStartsWith : settings

            });
    }
    return input;
};

functionLibrary[Const.Validator.KEYS.FUNCTION_ENDS_WITH] = (input,settings,taskErrorBag,prepareErrorData) =>
{
    if(!input.endsWith(settings))
    {
        taskErrorBag.addTaskErrorFast(ValidatorErrors.inputIsNotEndsWith,
            {
                inputValue : prepareErrorData.inputValue,
                inputPath : prepareErrorData.inputPath,
                shouldEndsWith : settings

            });
    }
    return input;
};

functionLibrary[Const.Validator.KEYS.FORMAT_IS_LETTERS] = (input,settings,taskErrorBag,prepareErrorData) =>
{
    if((settings === Const.Validator.FORMAT_LETTERS.UPPER_CASE) && (!EasyValidator.isUpperCase(input)))
    {
        taskErrorBag.addTaskErrorFast(ValidatorErrors.inputIsNotUppercase,prepareErrorData);
    }
    else if((settings === Const.Validator.FORMAT_LETTERS.LOWER_CASE) && (!EasyValidator.isLowerCase(input)))
    {
        taskErrorBag.addTaskErrorFast(ValidatorErrors.inputIsNotLowercase,prepareErrorData);
    }
    return input;
};

export =
    {
        type : typeLibrary,
        function : functionLibrary
    };

