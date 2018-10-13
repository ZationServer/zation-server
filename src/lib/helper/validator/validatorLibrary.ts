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
        taskErrorBag.addTaskError(new TaskError(ValidatorErrors.inputIsNotTypeString,prepareErrorData));
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
        taskErrorBag.addTaskError(new TaskError(ValidatorErrors.inputIsNotTypeInt,prepareErrorData));
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
        taskErrorBag.addTaskError(new TaskError(ValidatorErrors.inputIsNotTypeFloat,prepareErrorData));
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
        taskErrorBag.addTaskError(new TaskError(ValidatorErrors.inputIsNotTypeDate,prepareErrorData));
        return input;
    }
};

typeLibrary[Const.Validator.TYPE.EMAIL] = (input,taskErrorBag,prepareErrorData) =>
{
    if(!EasyValidator.isEmail(input))
    {
        taskErrorBag.addTaskError(new TaskError(ValidatorErrors.inputIsNotTypeEmail,prepareErrorData));
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
        taskErrorBag.addTaskError(new TaskError(ValidatorErrors.inputIsNotTypeBoolean,prepareErrorData));
        return input;
    }
};

typeLibrary[Const.Validator.TYPE.SHA512] = (input,taskErrorBag,prepareErrorData) =>
{
    if(!EasyValidator.isSha512(input))
    {
        taskErrorBag.addTaskError(new TaskError(ValidatorErrors.inputIsNotTypeSha512,prepareErrorData));
    }
    return input;
};

typeLibrary[Const.Validator.TYPE.SHA256] = (input,taskErrorBag,prepareErrorData) =>
{
    if(!EasyValidator.isSha256(input))
    {
        taskErrorBag.addTaskError(new TaskError(ValidatorErrors.inputIsNotTypeSha256,prepareErrorData));
    }
    return input;
};

typeLibrary[Const.Validator.TYPE.SHA384] = (input,taskErrorBag,prepareErrorData) =>
{
    if(!EasyValidator.isSha384(input))
    {
        taskErrorBag.addTaskError(new TaskError(ValidatorErrors.inputIsNotTypeSha384,prepareErrorData));
    }
    return input;
};

typeLibrary[Const.Validator.TYPE.SHA1] = (input,taskErrorBag,prepareErrorData) =>
{
    if(!EasyValidator.isSha1(input))
    {
        taskErrorBag.addTaskError(new TaskError(ValidatorErrors.inputIsNotTypeSha1,prepareErrorData));
    }
    return input;
};

typeLibrary[Const.Validator.TYPE.MD5] = (input,taskErrorBag,prepareErrorData) =>
{
    if(!EasyValidator.isMd5(input))
    {
        taskErrorBag.addTaskError(new TaskError(ValidatorErrors.inputIsNotTypeMd5,prepareErrorData));
    }
    return input;
};

typeLibrary[Const.Validator.TYPE.HEX_COLOR] = (input,taskErrorBag,prepareErrorData) =>
{
    if(!EasyValidator.isHexColor(input))
    {
        taskErrorBag.addTaskError(new TaskError(ValidatorErrors.inputIsNotTypeHexColor,prepareErrorData));
    }
    return input;
};

typeLibrary[Const.Validator.TYPE.HEXADECIMAL] = (input,taskErrorBag,prepareErrorData) =>
{
    if(!EasyValidator.isHexadecimal(input))
    {
        taskErrorBag.addTaskError(new TaskError(ValidatorErrors.inputIsNotTypeHexadecimal,prepareErrorData));
    }
    return input;
};

typeLibrary[Const.Validator.TYPE.IP_4] = (input, taskErrorBag, prepareErrorData) =>
{
    if(!EasyValidator.isIP4(input))
    {
        taskErrorBag.addTaskError(new TaskError(ValidatorErrors.inputIsNotTypeIp4,prepareErrorData));
    }
    return input;
};

typeLibrary[Const.Validator.TYPE.IP_6] = (input,taskErrorBag,prepareErrorData) =>
{
    if(!EasyValidator.isIP6(input))
    {
        taskErrorBag.addTaskError(new TaskError(ValidatorErrors.inputIsNotTypeIp6,prepareErrorData));
    }
    return input;
};

typeLibrary[Const.Validator.TYPE.ISBN_10] = (input,taskErrorBag,prepareErrorData) =>
{
    if(!EasyValidator.isISB10(input))
    {
        taskErrorBag.addTaskError(new TaskError(ValidatorErrors.inputIsNotTypeIsbn10,prepareErrorData));
    }
    return input;
};

typeLibrary[Const.Validator.TYPE.ISBN_13] = (input,taskErrorBag,prepareErrorData) =>
{
    if(!EasyValidator.isISB13(input))
    {
        taskErrorBag.addTaskError(new TaskError(ValidatorErrors.inputIsNotTypeIsbn13,prepareErrorData));
    }
    return input;
};

typeLibrary[Const.Validator.TYPE.JSON] = (input,taskErrorBag,prepareErrorData) =>
{
    if(!EasyValidator.isJSON(input))
    {
        taskErrorBag.addTaskError(new TaskError(ValidatorErrors.inputIsNotTypeJson,prepareErrorData));
    }
    return input;
};

typeLibrary[Const.Validator.TYPE.URL] = (input,taskErrorBag,prepareErrorData) =>
{
    if(!EasyValidator.isUrl(input))
    {
        taskErrorBag.addTaskError(new TaskError(ValidatorErrors.inputIsNotTypeUrl,prepareErrorData));
    }
    return input;
};

typeLibrary[Const.Validator.TYPE.MIME_TYPE] = (input,taskErrorBag,prepareErrorData) =>
{
    if(!EasyValidator.isMimeType(input))
    {
        taskErrorBag.addTaskError(new TaskError(ValidatorErrors.inputIsNotTypeMimeType,prepareErrorData));
    }
    return input;
};

typeLibrary[Const.Validator.TYPE.MAC_ADDRESS] = (input,taskErrorBag,prepareErrorData) =>
{
    if(!EasyValidator.isMACAddress(input))
    {
        taskErrorBag.addTaskError(new TaskError(ValidatorErrors.inputIsNotTypeMacAddress,prepareErrorData));
    }
    return input;
};

typeLibrary[Const.Validator.TYPE.MOBILE_NUMBER] = (input,taskErrorBag,prepareErrorData) =>
{
    if(!EasyValidator.isMobilePhone(input))
    {
        taskErrorBag.addTaskError(new TaskError(ValidatorErrors.inputIsNotTypeMobileNumber,prepareErrorData));
    }
    return input;
};

typeLibrary[Const.Validator.TYPE.UUID_3] = (input,taskErrorBag,prepareErrorData) =>
{
    if(!EasyValidator.isUUID3(input))
    {
        taskErrorBag.addTaskError(new TaskError(ValidatorErrors.inputIsNotTypeUuid3,prepareErrorData));
    }
    return input;
};

typeLibrary[Const.Validator.TYPE.UUID_4] = (input,taskErrorBag,prepareErrorData) =>
{
    if(!EasyValidator.isUUID4(input))
    {
        taskErrorBag.addTaskError(new TaskError(ValidatorErrors.inputIsNotTypeUuid4,prepareErrorData));
    }
    return input;
};

typeLibrary[Const.Validator.TYPE.UUID_5] = (input,taskErrorBag,prepareErrorData) =>
{
    if(!EasyValidator.isUUID5(input))
    {
        taskErrorBag.addTaskError(new TaskError(ValidatorErrors.inputIsNotTypeUuid5,prepareErrorData));
    }
    return input;
};

typeLibrary[Const.Validator.TYPE.LAT_LONG] = (input,taskErrorBag,prepareErrorData) =>
{
    if(!EasyValidator.isLatLong(input))
    {
        taskErrorBag.addTaskError(new TaskError(ValidatorErrors.inputIsNotTypeLatLong,prepareErrorData));
    }
    return input;
};

typeLibrary[Const.Validator.TYPE.BASE64] = (input,taskErrorBag,prepareErrorData) =>
{
    if(!EasyValidator.isBase64(input))
    {
        taskErrorBag.addTaskError(new TaskError(ValidatorErrors.inputIsNotTypeBase64,prepareErrorData));
    }
    return input;
};

typeLibrary[Const.Validator.TYPE.ASCII] = (input,taskErrorBag,prepareErrorData) =>
{
    if(!EasyValidator.isAscii(input))
    {
        taskErrorBag.addTaskError(new TaskError(ValidatorErrors.inputIsNotTypeAscii,prepareErrorData));
    }
    return input;
};

typeLibrary[Const.Validator.TYPE.NUMBER] = (input,taskErrorBag,prepareErrorData) =>
{
    if(typeof input !== 'number')
    {
        taskErrorBag.addTaskError(new TaskError(ValidatorErrors.inputIsNotTypeNumber,prepareErrorData));
    }
    return input;
};

typeLibrary[Const.Validator.TYPE.USER_ID] = (input,taskErrorBag,prepareErrorData) =>
{
    if(!(EasyValidator.isString(input) || typeof input === 'number'))
    {
        taskErrorBag.addTaskError(new TaskError(ValidatorErrors.inputIsNotTypeUserId,prepareErrorData));
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
        taskErrorBag.addNewTaskError(ValidatorErrors.inputIsNotMatchWithRegex,
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
        taskErrorBag.addNewTaskError(ValidatorErrors.inputIsNotMatchWithEnum,
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
        taskErrorBag.addNewTaskError(ValidatorErrors.inputIsNotMatchWithPrivateEnum,prepareErrorData);
    }
    return input;
};

functionLibrary[Const.Validator.KEYS.FUNCTION_MIN_LENGTH] = (input,settings,taskErrorBag,prepareErrorData) =>
{
    if(input.length < settings)
    {

        taskErrorBag.addNewTaskError(ValidatorErrors.inputNotMatchWithMinLength,
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

        taskErrorBag.addNewTaskError(ValidatorErrors.inputNotMatchWithMaxLength,
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

        taskErrorBag.addNewTaskError(ValidatorErrors.inputNotMatchWithLength,
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

        taskErrorBag.addNewTaskError(ValidatorErrors.inputIsNotContains,
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
    if(!EasyValidator.equals(input,settings))
    {
        taskErrorBag.addNewTaskError(ValidatorErrors.inputIsNotEquals,
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
        taskErrorBag.addNewTaskError(ValidatorErrors.inputIsNotBiggerThan,
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
        taskErrorBag.addNewTaskError(ValidatorErrors.inputIsNotLesserThan,
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
        taskErrorBag.addNewTaskError(ValidatorErrors.inputIsNotStartsWith,
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
        taskErrorBag.addNewTaskError(ValidatorErrors.inputIsNotEndsWith,
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
        taskErrorBag.addNewTaskError(ValidatorErrors.inputIsNotUppercase,prepareErrorData);
    }
    else if((settings === Const.Validator.FORMAT_LETTERS.LOWER_CASE) && (!EasyValidator.isLowerCase(input)))
    {
        taskErrorBag.addNewTaskError(ValidatorErrors.inputIsNotLowercase,prepareErrorData);
    }
    return input;
};

export =
    {
        type : typeLibrary,
        function : functionLibrary
    };

