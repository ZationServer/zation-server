/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

/*
Validation Library from Zation

Contains validator functions
The validator functions only invoke if precondition is true.
It not contains the type check.
 */

import ValidatorErrors = require('../zationTaskErrors/validatorTaskErrors');
import EasyValidator   = require('./easyValidator');
import Const           = require('../constants/constWrapper');
import TaskError       = require('../../api/TaskError');

const functionLibrary = {};
const typeLibrary = {};


typeLibrary[Const.Validator.TYPE.OBJECT] = (input,taskErrorBag,prepareErrorData) =>
{
    if(!EasyValidator.isObject(input)) {
        taskErrorBag.addTaskError(new TaskError(ValidatorErrors.inputIsNotTypeObject,prepareErrorData));
    }
};

typeLibrary[Const.Validator.TYPE.ARRAY] = (input,taskErrorBag,prepareErrorData) =>
{
    if(!EasyValidator.isArray(input)) {
        taskErrorBag.addTaskError(new TaskError(ValidatorErrors.inputIsNotTypeArray,prepareErrorData));
    }
};

typeLibrary[Const.Validator.TYPE.STRING] = (input,taskErrorBag,prepareErrorData) =>
{
    if(!EasyValidator.isString(input)) {
        taskErrorBag.addTaskError(new TaskError(ValidatorErrors.inputIsNotTypeString,prepareErrorData));
    }
};

typeLibrary[Const.Validator.TYPE.INT] = (input,taskErrorBag,prepareErrorData,strictType) =>
{
    if(!Number.isInteger(input)){
        if(!(!strictType && EasyValidator.isStringInt(input))) {
            taskErrorBag.addTaskError(new TaskError(ValidatorErrors.inputIsNotTypeInt,prepareErrorData));
        }
    }
};

typeLibrary[Const.Validator.TYPE.FLOAT] = (input,taskErrorBag,prepareErrorData,strictType) =>
{
    if(!EasyValidator.isFloat(input)) {
        if(!(!strictType && EasyValidator.isStringFloat(input))) {
            taskErrorBag.addTaskError(new TaskError(ValidatorErrors.inputIsNotTypeFloat,prepareErrorData));
        }
    }
};

typeLibrary[Const.Validator.TYPE.NUMBER] = (input,taskErrorBag,prepareErrorData,strictType) =>
{
    if(!EasyValidator.isNumber(input)) {
        if(!(!strictType && EasyValidator.isStringNumber(input))) {
            taskErrorBag.addTaskError(new TaskError(ValidatorErrors.inputIsNotTypeNumber,prepareErrorData));
        }
    }
};

typeLibrary[Const.Validator.TYPE.DATE] = (input,taskErrorBag,prepareErrorData) =>
{
    if(!EasyValidator.isDate(input)) {
        taskErrorBag.addTaskError(new TaskError(ValidatorErrors.inputIsNotTypeDate,prepareErrorData));
    }
};

typeLibrary[Const.Validator.TYPE.EMAIL] = (input,taskErrorBag,prepareErrorData) =>
{
    if(!EasyValidator.isEmail(input)) {
        taskErrorBag.addTaskError(new TaskError(ValidatorErrors.inputIsNotTypeEmail,prepareErrorData));
    }
};

typeLibrary[Const.Validator.TYPE.BOOLEAN] = (input,taskErrorBag,prepareErrorData,strictType) =>
{
    if(!EasyValidator.isBoolean(input)) {
        if(!(!strictType && (EasyValidator.isStringBoolean(input) || EasyValidator.isNumberBoolean(input)))) {
            taskErrorBag.addTaskError(new TaskError(ValidatorErrors.inputIsNotTypeBoolean,prepareErrorData));
        }
    }
};

typeLibrary[Const.Validator.TYPE.SHA512] = (input,taskErrorBag,prepareErrorData) =>
{
    if(!EasyValidator.isSha512(input)) {
        taskErrorBag.addTaskError(new TaskError(ValidatorErrors.inputIsNotTypeSha512,prepareErrorData));
    }
};

typeLibrary[Const.Validator.TYPE.SHA256] = (input,taskErrorBag,prepareErrorData) =>
{
    if(!EasyValidator.isSha256(input)) {
        taskErrorBag.addTaskError(new TaskError(ValidatorErrors.inputIsNotTypeSha256,prepareErrorData));
    }
};

typeLibrary[Const.Validator.TYPE.SHA384] = (input,taskErrorBag,prepareErrorData) =>
{
    if(!EasyValidator.isSha384(input)) {
        taskErrorBag.addTaskError(new TaskError(ValidatorErrors.inputIsNotTypeSha384,prepareErrorData));
    }
};

typeLibrary[Const.Validator.TYPE.SHA1] = (input,taskErrorBag,prepareErrorData) =>
{
    if(!EasyValidator.isSha1(input)) {
        taskErrorBag.addTaskError(new TaskError(ValidatorErrors.inputIsNotTypeSha1,prepareErrorData));
    }
};

typeLibrary[Const.Validator.TYPE.MD5] = (input,taskErrorBag,prepareErrorData) =>
{
    if(!EasyValidator.isMd5(input)) {
        taskErrorBag.addTaskError(new TaskError(ValidatorErrors.inputIsNotTypeMd5,prepareErrorData));
    }
};

typeLibrary[Const.Validator.TYPE.HEX_COLOR] = (input,taskErrorBag,prepareErrorData) =>
{
    if(!EasyValidator.isHexColor(input)) {
        taskErrorBag.addTaskError(new TaskError(ValidatorErrors.inputIsNotTypeHexColor,prepareErrorData));
    }
};

typeLibrary[Const.Validator.TYPE.HEXADECIMAL] = (input,taskErrorBag,prepareErrorData) =>
{
    if(!EasyValidator.isHexadecimal(input)) {
        taskErrorBag.addTaskError(new TaskError(ValidatorErrors.inputIsNotTypeHexadecimal,prepareErrorData));
    }
};

typeLibrary[Const.Validator.TYPE.IP_4] = (input, taskErrorBag, prepareErrorData) =>
{
    if(!EasyValidator.isIP4(input)) {
        taskErrorBag.addTaskError(new TaskError(ValidatorErrors.inputIsNotTypeIp4,prepareErrorData));
    }
};

typeLibrary[Const.Validator.TYPE.IP_6] = (input,taskErrorBag,prepareErrorData) =>
{
    if(!EasyValidator.isIP6(input)) {
        taskErrorBag.addTaskError(new TaskError(ValidatorErrors.inputIsNotTypeIp6,prepareErrorData));
    }
};

typeLibrary[Const.Validator.TYPE.ISBN_10] = (input,taskErrorBag,prepareErrorData) =>
{
    if(!EasyValidator.isISB10(input)) {
        taskErrorBag.addTaskError(new TaskError(ValidatorErrors.inputIsNotTypeIsbn10,prepareErrorData));
    }
};

typeLibrary[Const.Validator.TYPE.ISBN_13] = (input,taskErrorBag,prepareErrorData) =>
{
    if(!EasyValidator.isISB13(input)) {
        taskErrorBag.addTaskError(new TaskError(ValidatorErrors.inputIsNotTypeIsbn13,prepareErrorData));
    }
};

typeLibrary[Const.Validator.TYPE.JSON] = (input,taskErrorBag,prepareErrorData) =>
{
    if(!EasyValidator.isJSON(input)) {
        taskErrorBag.addTaskError(new TaskError(ValidatorErrors.inputIsNotTypeJson,prepareErrorData));
    }
};

typeLibrary[Const.Validator.TYPE.URL] = (input,taskErrorBag,prepareErrorData) =>
{
    if(!EasyValidator.isUrl(input)) {
        taskErrorBag.addTaskError(new TaskError(ValidatorErrors.inputIsNotTypeUrl,prepareErrorData));
    }
};

typeLibrary[Const.Validator.TYPE.MIME_TYPE] = (input,taskErrorBag,prepareErrorData) =>
{
    if(!EasyValidator.isMimeType(input)) {
        taskErrorBag.addTaskError(new TaskError(ValidatorErrors.inputIsNotTypeMimeType,prepareErrorData));
    }
};

typeLibrary[Const.Validator.TYPE.MAC_ADDRESS] = (input,taskErrorBag,prepareErrorData) =>
{
    if(!EasyValidator.isMACAddress(input)) {
        taskErrorBag.addTaskError(new TaskError(ValidatorErrors.inputIsNotTypeMacAddress,prepareErrorData));
    }
};

typeLibrary[Const.Validator.TYPE.MOBILE_NUMBER] = (input,taskErrorBag,prepareErrorData) =>
{
    if(!EasyValidator.isMobilePhone(input)) {
        taskErrorBag.addTaskError(new TaskError(ValidatorErrors.inputIsNotTypeMobileNumber,prepareErrorData));
    }
};

typeLibrary[Const.Validator.TYPE.UUID_3] = (input,taskErrorBag,prepareErrorData) =>
{
    if(!EasyValidator.isUUID3(input)) {
        taskErrorBag.addTaskError(new TaskError(ValidatorErrors.inputIsNotTypeUuid3,prepareErrorData));
    }
};

typeLibrary[Const.Validator.TYPE.UUID_4] = (input,taskErrorBag,prepareErrorData) =>
{
    if(!EasyValidator.isUUID4(input)) {
        taskErrorBag.addTaskError(new TaskError(ValidatorErrors.inputIsNotTypeUuid4,prepareErrorData));
    }
};

typeLibrary[Const.Validator.TYPE.UUID_5] = (input,taskErrorBag,prepareErrorData) =>
{
    if(!EasyValidator.isUUID5(input)) {
        taskErrorBag.addTaskError(new TaskError(ValidatorErrors.inputIsNotTypeUuid5,prepareErrorData));
    }
};

typeLibrary[Const.Validator.TYPE.BASE64] = (input,taskErrorBag,prepareErrorData) =>
{
    if(!EasyValidator.isBase64(input)) {
        taskErrorBag.addTaskError(new TaskError(ValidatorErrors.inputIsNotTypeBase64,prepareErrorData));
    }
};

typeLibrary[Const.Validator.TYPE.ASCII] = (input,taskErrorBag,prepareErrorData) =>
{
    if(!EasyValidator.isAscii(input)) {
        taskErrorBag.addTaskError(new TaskError(ValidatorErrors.inputIsNotTypeAscii,prepareErrorData));
    }
};

typeLibrary[Const.Validator.TYPE.USER_ID] = (input,taskErrorBag,prepareErrorData) =>
{
    if(!(EasyValidator.isString(input) || EasyValidator.isNumber(input))) {
        taskErrorBag.addTaskError(new TaskError(ValidatorErrors.inputIsNotTypeUserId,prepareErrorData));
    }
};


functionLibrary[Const.Validator.KEYS.FUNCTION_REGEX] = (input, settings, taskErrorBag, prepareErrorData) =>
{
    if(typeof input === 'string') {
        if(typeof settings === 'object' && !(settings instanceof RegExp)) {
            for(let name in settings) {
                if(settings.hasOwnProperty(name)){
                    const regex  = new RegExp(settings[name]);
                    if(!regex.test(input)) {
                        taskErrorBag.addNewTaskError(ValidatorErrors.inputIsNotMatchWithRegex,
                            {
                                inputValue : prepareErrorData.inputValue,
                                inputPath : prepareErrorData.inputPath,
                                regexName : name,
                                regex : settings
                            });
                    }
                }
            }
        }
        else {
            const regex  = new RegExp(settings);
            if(!regex.test(input)) {
                taskErrorBag.addNewTaskError(ValidatorErrors.inputIsNotMatchWithRegex,
                    {
                        inputValue : prepareErrorData.inputValue,
                        inputPath : prepareErrorData.inputPath,
                        regex : settings
                    });
            }
        }
    }
};

functionLibrary[Const.Validator.KEYS.FUNCTION_ENUM] = (input, settings, taskErrorBag, prepareErrorData) =>
{
    if(!EasyValidator.validEnum(settings,input)) {
        taskErrorBag.addNewTaskError(ValidatorErrors.inputIsNotMatchWithEnum,
            {
                inputValue : prepareErrorData.inputValue,
                inputPath : prepareErrorData.inputPath,
                enum : settings
            });
    }
};

functionLibrary[Const.Validator.KEYS.FUNCTION_PRIVATE_ENUM] = (input, settings, taskErrorBag, prepareErrorData) =>
{
    if(!EasyValidator.validEnum(settings,input)) {
        taskErrorBag.addNewTaskError(ValidatorErrors.inputIsNotMatchWithPrivateEnum,prepareErrorData);
    }
};

functionLibrary[Const.Validator.KEYS.FUNCTION_MIN_LENGTH] = (input, settings, taskErrorBag, prepareErrorData) =>
{
    if(typeof input === 'string' && input.length < settings) {
        taskErrorBag.addNewTaskError(ValidatorErrors.inputNotMatchWithMinLength,
        {
            inputValue : prepareErrorData.inputValue,
            inputPath : prepareErrorData.inputPath,
            minLength : settings
        });
    }
};

functionLibrary[Const.Validator.KEYS.FUNCTION_MAX_LENGTH] = (input, settings, taskErrorBag, prepareErrorData) =>
{
    if(typeof input === 'string' && input.length > settings) {
        taskErrorBag.addNewTaskError(ValidatorErrors.inputNotMatchWithMaxLength,
            {
                inputValue : prepareErrorData.inputValue,
                inputPath : prepareErrorData.inputPath,
                maxLength : settings

            });
    }
};

functionLibrary[Const.Validator.KEYS.FUNCTION_LENGTH] = (input, settings, taskErrorBag, prepareErrorData) =>
{
    if(typeof input === 'string' && input.length !== settings) {
        taskErrorBag.addNewTaskError(ValidatorErrors.inputNotMatchWithLength,
            {
                inputValue : prepareErrorData.inputValue,
                inputPath : prepareErrorData.inputPath,
                length : settings

            });
    }
};

functionLibrary[Const.Validator.KEYS.FUNCTION_CONTAINS] = (input, settings, taskErrorBag, prepareErrorData) =>
{
    if(typeof input === 'string') {
        const missingContains = EasyValidator.missingContains(input,settings);
        if(missingContains.length > 0) {
            taskErrorBag.addNewTaskError(ValidatorErrors.inputIsNotContains,
                {
                    inputValue : prepareErrorData.inputValue,
                    inputPath : prepareErrorData.inputPath,
                    shouldContain : settings,
                    missing : missingContains
                });
        }
    }
};

functionLibrary[Const.Validator.KEYS.FUNCTION_EQUALS] = (input, settings, taskErrorBag, prepareErrorData) =>
{
    if(!EasyValidator.equals(input,settings)) {
        taskErrorBag.addNewTaskError(ValidatorErrors.inputIsNotEquals,
            {
                inputValue : prepareErrorData.inputValue,
                inputPath : prepareErrorData.inputPath,
                shouldEquals : settings

            });
    }
};

functionLibrary[Const.Validator.KEYS.FUNCTION_BIGGER_THAN] = (input, settings, taskErrorBag, prepareErrorData) =>
{
    if(typeof input === 'number' && input < settings) {
        taskErrorBag.addNewTaskError(ValidatorErrors.inputIsNotBiggerThan,
            {
                inputValue : prepareErrorData.inputValue,
                inputPath : prepareErrorData.inputPath,
                shouldBiggerThan : settings

            });
    }
};

functionLibrary[Const.Validator.KEYS.FUNCTION_LESSER_THAN] = (input, settings, taskErrorBag, prepareErrorData) =>
{
    if(typeof input === 'number' && input > settings) {
        taskErrorBag.addNewTaskError(ValidatorErrors.inputIsNotLesserThan,
            {
                inputValue : prepareErrorData.inputValue,
                inputPath : prepareErrorData.inputPath,
                shouldLesserThan : settings
            });
    }
};

functionLibrary[Const.Validator.KEYS.FUNCTION_STARTS_WITH] = (input, settings, taskErrorBag, prepareErrorData) =>
{
    if(typeof input === 'string' && !input.startsWith(settings)) {
        taskErrorBag.addNewTaskError(ValidatorErrors.inputIsNotStartsWith,
            {
                inputValue : prepareErrorData.inputValue,
                inputPath : prepareErrorData.inputPath,
                shouldStartsWith : settings

            });
    }
};

functionLibrary[Const.Validator.KEYS.FUNCTION_ENDS_WITH] = (input, settings, taskErrorBag, prepareErrorData) =>
{
    if(typeof input === 'string' && !input.endsWith(settings)) {
        taskErrorBag.addNewTaskError(ValidatorErrors.inputIsNotEndsWith,
            {
                inputValue : prepareErrorData.inputValue,
                inputPath : prepareErrorData.inputPath,
                shouldEndsWith : settings

            });
    }
};

functionLibrary[Const.Validator.KEYS.FORMAT_IS_LETTERS] = (input, settings, taskErrorBag, prepareErrorData) =>
{
    if(typeof input === 'string') {
        if((settings === Const.Validator.FORMAT_LETTERS.UPPER_CASE) && (!EasyValidator.isUpperCase(input))) {
            taskErrorBag.addNewTaskError(ValidatorErrors.inputIsNotUppercase,prepareErrorData);
        }
        else if((settings === Const.Validator.FORMAT_LETTERS.LOWER_CASE) && (!EasyValidator.isLowerCase(input))) {
            taskErrorBag.addNewTaskError(ValidatorErrors.inputIsNotLowercase,prepareErrorData);
        }
    }
};

export = {
    function : functionLibrary,
    type : typeLibrary
};

