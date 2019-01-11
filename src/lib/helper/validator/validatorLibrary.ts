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
import TaskError       = require('../../api/TaskError');
// noinspection TypeScriptPreferShortImport
import {ValidationTypes} from "../constants/validationTypes";
import {ValuePropertyConfig} from "../configs/appConfig";
import {FormatLetters}   from "../constants/validation";
import ByteTools       = require("../tools/byteTools");
import Base64Tools     = require("../tools/base64Tools");

const functionLibrary = {};
const typeLibrary = {};


typeLibrary[ValidationTypes.OBJECT] = (input,taskErrorBag,prepareErrorData) =>
{
    if(!EasyValidator.isObject(input)) {
        taskErrorBag.addTaskError(new TaskError(ValidatorErrors.inputIsNotTypeObject,prepareErrorData));
    }
};

typeLibrary[ValidationTypes.ARRAY] = (input,taskErrorBag,prepareErrorData) =>
{
    if(!EasyValidator.isArray(input)) {
        taskErrorBag.addTaskError(new TaskError(ValidatorErrors.inputIsNotTypeArray,prepareErrorData));
    }
};

typeLibrary[ValidationTypes.STRING] = (input,taskErrorBag,prepareErrorData) =>
{
    if(!EasyValidator.isString(input)) {
        taskErrorBag.addTaskError(new TaskError(ValidatorErrors.inputIsNotTypeString,prepareErrorData));
    }
};

typeLibrary[ValidationTypes.CHAR] = (input,taskErrorBag,prepareErrorData) =>
{
    if(!EasyValidator.isChar(input)) {
        taskErrorBag.addTaskError(new TaskError(ValidatorErrors.inputIsNotTypeChar,prepareErrorData));
    }
};

typeLibrary[ValidationTypes.NULL] = (input,taskErrorBag,prepareErrorData) =>
{
    if(!EasyValidator.isNull(input)) {
        taskErrorBag.addTaskError(new TaskError(ValidatorErrors.inputIsNotTypeNull,prepareErrorData));
    }
};

typeLibrary[ValidationTypes.INT] = (input,taskErrorBag,prepareErrorData,strictType) =>
{
    if(!Number.isInteger(input)){
        if(!(!strictType && EasyValidator.isStringInt(input))) {
            taskErrorBag.addTaskError(new TaskError(ValidatorErrors.inputIsNotTypeInt,prepareErrorData));
        }
    }
};

typeLibrary[ValidationTypes.FLOAT] = (input,taskErrorBag,prepareErrorData,strictType) =>
{
    if(!EasyValidator.isFloat(input)) {
        if(!(!strictType && EasyValidator.isStringFloat(input))) {
            taskErrorBag.addTaskError(new TaskError(ValidatorErrors.inputIsNotTypeFloat,prepareErrorData));
        }
    }
};

typeLibrary[ValidationTypes.NUMBER] = (input,taskErrorBag,prepareErrorData,strictType) =>
{
    if(!EasyValidator.isNumber(input)) {
        if(!(!strictType && EasyValidator.isStringNumber(input))) {
            taskErrorBag.addTaskError(new TaskError(ValidatorErrors.inputIsNotTypeNumber,prepareErrorData));
        }
    }
};

typeLibrary[ValidationTypes.DATE] = (input,taskErrorBag,prepareErrorData) =>
{
    if(!EasyValidator.isDate(input)) {
        taskErrorBag.addTaskError(new TaskError(ValidatorErrors.inputIsNotTypeDate,prepareErrorData));
    }
};

typeLibrary[ValidationTypes.EMAIL] = (input,taskErrorBag,prepareErrorData) =>
{
    if(!EasyValidator.isEmail(input)) {
        taskErrorBag.addTaskError(new TaskError(ValidatorErrors.inputIsNotTypeEmail,prepareErrorData));
    }
};

typeLibrary[ValidationTypes.BOOLEAN] = (input,taskErrorBag,prepareErrorData,strictType) =>
{
    if(!EasyValidator.isBoolean(input)) {
        if(!(!strictType && (EasyValidator.isStringBoolean(input) || EasyValidator.isNumberBoolean(input)))) {
            taskErrorBag.addTaskError(new TaskError(ValidatorErrors.inputIsNotTypeBoolean,prepareErrorData));
        }
    }
};

typeLibrary[ValidationTypes.SHA512] = (input,taskErrorBag,prepareErrorData) =>
{
    if(!EasyValidator.isSha512(input)) {
        taskErrorBag.addTaskError(new TaskError(ValidatorErrors.inputIsNotTypeSha512,prepareErrorData));
    }
};

typeLibrary[ValidationTypes.SHA256] = (input,taskErrorBag,prepareErrorData) =>
{
    if(!EasyValidator.isSha256(input)) {
        taskErrorBag.addTaskError(new TaskError(ValidatorErrors.inputIsNotTypeSha256,prepareErrorData));
    }
};

typeLibrary[ValidationTypes.SHA384] = (input,taskErrorBag,prepareErrorData) =>
{
    if(!EasyValidator.isSha384(input)) {
        taskErrorBag.addTaskError(new TaskError(ValidatorErrors.inputIsNotTypeSha384,prepareErrorData));
    }
};

typeLibrary[ValidationTypes.SHA1] = (input,taskErrorBag,prepareErrorData) =>
{
    if(!EasyValidator.isSha1(input)) {
        taskErrorBag.addTaskError(new TaskError(ValidatorErrors.inputIsNotTypeSha1,prepareErrorData));
    }
};

typeLibrary[ValidationTypes.MD5] = (input,taskErrorBag,prepareErrorData) =>
{
    if(!EasyValidator.isMd5(input)) {
        taskErrorBag.addTaskError(new TaskError(ValidatorErrors.inputIsNotTypeMd5,prepareErrorData));
    }
};

typeLibrary[ValidationTypes.HEX_COLOR] = (input,taskErrorBag,prepareErrorData) =>
{
    if(!EasyValidator.isHexColor(input)) {
        taskErrorBag.addTaskError(new TaskError(ValidatorErrors.inputIsNotTypeHexColor,prepareErrorData));
    }
};

typeLibrary[ValidationTypes.HEXADECIMAL] = (input,taskErrorBag,prepareErrorData) =>
{
    if(!EasyValidator.isHexadecimal(input)) {
        taskErrorBag.addTaskError(new TaskError(ValidatorErrors.inputIsNotTypeHexadecimal,prepareErrorData));
    }
};

typeLibrary[ValidationTypes.IP_4] = (input, taskErrorBag, prepareErrorData) =>
{
    if(!EasyValidator.isIP4(input)) {
        taskErrorBag.addTaskError(new TaskError(ValidatorErrors.inputIsNotTypeIp4,prepareErrorData));
    }
};

typeLibrary[ValidationTypes.IP_6] = (input,taskErrorBag,prepareErrorData) =>
{
    if(!EasyValidator.isIP6(input)) {
        taskErrorBag.addTaskError(new TaskError(ValidatorErrors.inputIsNotTypeIp6,prepareErrorData));
    }
};

typeLibrary[ValidationTypes.ISBN_10] = (input,taskErrorBag,prepareErrorData) =>
{
    if(!EasyValidator.isISB10(input)) {
        taskErrorBag.addTaskError(new TaskError(ValidatorErrors.inputIsNotTypeIsbn10,prepareErrorData));
    }
};

typeLibrary[ValidationTypes.ISBN_13] = (input,taskErrorBag,prepareErrorData) =>
{
    if(!EasyValidator.isISB13(input)) {
        taskErrorBag.addTaskError(new TaskError(ValidatorErrors.inputIsNotTypeIsbn13,prepareErrorData));
    }
};

typeLibrary[ValidationTypes.JSON] = (input,taskErrorBag,prepareErrorData) =>
{
    if(!EasyValidator.isJSON(input)) {
        taskErrorBag.addTaskError(new TaskError(ValidatorErrors.inputIsNotTypeJson,prepareErrorData));
    }
};

typeLibrary[ValidationTypes.URL] = (input,taskErrorBag,prepareErrorData) =>
{
    if(!EasyValidator.isUrl(input)) {
        taskErrorBag.addTaskError(new TaskError(ValidatorErrors.inputIsNotTypeUrl,prepareErrorData));
    }
};

typeLibrary[ValidationTypes.MIME_TYPE] = (input,taskErrorBag,prepareErrorData) =>
{
    if(!EasyValidator.isMimeType(input)) {
        taskErrorBag.addTaskError(new TaskError(ValidatorErrors.inputIsNotTypeMimeType,prepareErrorData));
    }
};

typeLibrary[ValidationTypes.MAC_ADDRESS] = (input,taskErrorBag,prepareErrorData) =>
{
    if(!EasyValidator.isMACAddress(input)) {
        taskErrorBag.addTaskError(new TaskError(ValidatorErrors.inputIsNotTypeMacAddress,prepareErrorData));
    }
};

typeLibrary[ValidationTypes.MOBILE_NUMBER] = (input,taskErrorBag,prepareErrorData) =>
{
    if(!EasyValidator.isMobilePhone(input)) {
        taskErrorBag.addTaskError(new TaskError(ValidatorErrors.inputIsNotTypeMobileNumber,prepareErrorData));
    }
};

typeLibrary[ValidationTypes.UUID_3] = (input,taskErrorBag,prepareErrorData) =>
{
    if(!EasyValidator.isUUID3(input)) {
        taskErrorBag.addTaskError(new TaskError(ValidatorErrors.inputIsNotTypeUuid3,prepareErrorData));
    }
};

typeLibrary[ValidationTypes.UUID_4] = (input,taskErrorBag,prepareErrorData) =>
{
    if(!EasyValidator.isUUID4(input)) {
        taskErrorBag.addTaskError(new TaskError(ValidatorErrors.inputIsNotTypeUuid4,prepareErrorData));
    }
};

typeLibrary[ValidationTypes.UUID_5] = (input,taskErrorBag,prepareErrorData) =>
{
    if(!EasyValidator.isUUID5(input)) {
        taskErrorBag.addTaskError(new TaskError(ValidatorErrors.inputIsNotTypeUuid5,prepareErrorData));
    }
};

typeLibrary[ValidationTypes.BASE64] = (input,taskErrorBag,prepareErrorData) =>
{
    if(!EasyValidator.isBase64(input)) {
        taskErrorBag.addTaskError(new TaskError(ValidatorErrors.inputIsNotTypeBase64,prepareErrorData));
    }
};

typeLibrary[ValidationTypes.ASCII] = (input,taskErrorBag,prepareErrorData) =>
{
    if(!EasyValidator.isAscii(input)) {
        taskErrorBag.addTaskError(new TaskError(ValidatorErrors.inputIsNotTypeAscii,prepareErrorData));
    }
};

typeLibrary[ValidationTypes.USER_ID] = (input,taskErrorBag,prepareErrorData) =>
{
    if(!(EasyValidator.isString(input) || EasyValidator.isNumber(input))) {
        taskErrorBag.addTaskError(new TaskError(ValidatorErrors.inputIsNotTypeUserId,prepareErrorData));
    }
};


functionLibrary[nameof<ValuePropertyConfig>(s => s.regex)] = (input, settings, taskErrorBag, prepareErrorData) =>
{
    if(typeof input === 'string') {
        if(typeof settings === 'object' && !(settings instanceof RegExp)) {
            for(let name in settings) {
                if(settings.hasOwnProperty(name)){
                    if(!input.match(settings[name])) {
                        taskErrorBag.addNewTaskError(ValidatorErrors.inputIsNotMatchWithRegex,
                            {
                                inputValue : prepareErrorData.inputValue,
                                inputPath : prepareErrorData.inputPath,
                                regexName : name,
                                regex : settings[name].toString()
                            });
                    }
                }
            }
        }
        else {
            if(!input.match(settings)) {
                taskErrorBag.addNewTaskError(ValidatorErrors.inputIsNotMatchWithRegex,
                    {
                        inputValue : prepareErrorData.inputValue,
                        inputPath : prepareErrorData.inputPath,
                        regex : settings.toString()
                    });
            }
        }
    }
};

functionLibrary[nameof<ValuePropertyConfig>(s => s.enum)] = (input, settings, taskErrorBag, prepareErrorData) =>
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

functionLibrary[nameof<ValuePropertyConfig>(s => s.privateEnum)] = (input, settings, taskErrorBag, prepareErrorData) =>
{
    if(!EasyValidator.validEnum(settings,input)) {
        taskErrorBag.addNewTaskError(ValidatorErrors.inputIsNotMatchWithPrivateEnum,prepareErrorData);
    }
};

functionLibrary[nameof<ValuePropertyConfig>(s => s.minLength)] = (input, settings, taskErrorBag, prepareErrorData) =>
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

functionLibrary[nameof<ValuePropertyConfig>(s => s.maxLength)] = (input, settings, taskErrorBag, prepareErrorData) =>
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

functionLibrary[nameof<ValuePropertyConfig>(s => s.length)] = (input, settings, taskErrorBag, prepareErrorData) =>
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

functionLibrary[nameof<ValuePropertyConfig>(s => s.contains)] = (input, settings, taskErrorBag, prepareErrorData) =>
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

functionLibrary[nameof<ValuePropertyConfig>(s => s.equals)] = (input, settings, taskErrorBag, prepareErrorData) =>
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

functionLibrary[nameof<ValuePropertyConfig>(s => s.minValue)] = (input, settings, taskErrorBag, prepareErrorData) =>
{
    if(typeof input === 'number' && input < settings) {
        taskErrorBag.addNewTaskError(ValidatorErrors.inputNotMatchWithMinValue,
            {
                inputValue : prepareErrorData.inputValue,
                inputPath : prepareErrorData.inputPath,
                minValue : settings

            });
    }
};

functionLibrary[nameof<ValuePropertyConfig>(s => s.maxValue)] = (input, settings, taskErrorBag, prepareErrorData) =>
{
    if(typeof input === 'number' && input > settings) {
        taskErrorBag.addNewTaskError(ValidatorErrors.inputNotMatchWithMaxValue,
            {
                inputValue : prepareErrorData.inputValue,
                inputPath : prepareErrorData.inputPath,
                maxValue : settings
            });
    }
};

functionLibrary[nameof<ValuePropertyConfig>(s => s.startsWith)] = (input, settings, taskErrorBag, prepareErrorData) =>
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

functionLibrary[nameof<ValuePropertyConfig>(s => s.endsWith)] = (input, settings, taskErrorBag, prepareErrorData) =>
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

functionLibrary[nameof<ValuePropertyConfig>(s => s.letters)] = (input, settings, taskErrorBag, prepareErrorData) =>
{
    if(typeof input === 'string') {
        if((settings === FormatLetters.UPPER_CASE) && (!EasyValidator.isUpperCase(input))) {
            taskErrorBag.addNewTaskError(ValidatorErrors.inputIsNotUppercase,prepareErrorData);
        }
        else if((settings === FormatLetters.LOWER_CASE) && (!EasyValidator.isLowerCase(input))) {
            taskErrorBag.addNewTaskError(ValidatorErrors.inputIsNotLowercase,prepareErrorData);
        }
    }
};

functionLibrary[nameof<ValuePropertyConfig>(s => s.charClass)] = (input, settings, taskErrorBag, prepareErrorData) =>
{
    if(typeof input === 'string') {
        if(!input.match(settings)) {
            taskErrorBag.addNewTaskError(ValidatorErrors.inputIsNotMatchWithCharClass,
                {
                    inputValue : prepareErrorData.inputValue,
                    inputPath : prepareErrorData.inputPath,
                    regex : settings.toString()
                });
        }
    }
};

functionLibrary[nameof<ValuePropertyConfig>(s => s.before)] = async (input, settings, taskErrorBag, prepareErrorData, preparedSmallBag) =>
{
    if((typeof input === "string" && EasyValidator.isDate(input)) || input instanceof Date)
    {
        const inputDate : Date = typeof input === 'string' ? new Date(input) : input;
        const checkDate : Date = typeof settings === 'function' ? await settings(preparedSmallBag) : settings;
        if(inputDate > checkDate) {
            taskErrorBag.addNewTaskError(ValidatorErrors.inputDateIsNotBefore,
                {
                    inputValue : prepareErrorData.inputValue,
                    inputPath : prepareErrorData.inputPath,
                    shouldBefore : checkDate
                });
        }
    }
};

functionLibrary[nameof<ValuePropertyConfig>(s => s.after)] = async (input, settings, taskErrorBag, prepareErrorData, preparedSmallBag) =>
{
    if((typeof input === "string" && EasyValidator.isDate(input)) || input instanceof Date)
    {
        const inputDate : Date = typeof input === 'string' ? new Date(input) : input;
        const checkDate : Date = typeof settings === 'function' ? await settings(preparedSmallBag) : settings;
        if(inputDate < checkDate) {
            taskErrorBag.addNewTaskError(ValidatorErrors.inputDateIsNotAfter,
                {
                    inputValue : prepareErrorData.inputValue,
                    inputPath : prepareErrorData.inputPath,
                    shouldAfter : checkDate
                });
        }
    }
};

functionLibrary[nameof<ValuePropertyConfig>(s => s.minByteSize)] = async (input, settings, taskErrorBag, prepareErrorData, preparedSmallBag,type) =>
{
    if(typeof input === "string" && ByteTools.getByteSize(input,type) < settings)
    {
        taskErrorBag.addNewTaskError(ValidatorErrors.inputNotMatchWithMinByteSize,
            {
                inputValue : prepareErrorData.inputValue,
                inputPath : prepareErrorData.inputPath,
                minByteSize : settings
            });
    }
};

functionLibrary[nameof<ValuePropertyConfig>(s => s.maxByteSize)] = async (input, settings, taskErrorBag, prepareErrorData, preparedSmallBag,type) =>
{
    if(typeof input === "string" && ByteTools.getByteSize(input,type) > settings)
    {
        taskErrorBag.addNewTaskError(ValidatorErrors.inputNotMatchWithMaxByteSize,
            {
                inputValue : prepareErrorData.inputValue,
                inputPath : prepareErrorData.inputPath,
                maxByteSize : settings
            });
    }
};

functionLibrary[nameof<ValuePropertyConfig>(s => s.mimeType)] = async (input, settings, taskErrorBag, prepareErrorData) =>
{
    if(typeof input === "string")
    {
        if(!Array.isArray(settings)){
            settings = [settings];
        }

        const mime = Base64Tools.getMimeType(input);
        const fails : string[] = [];

        for(let i = 0; i < settings.length; i++)
        {
            if(settings[i] === mime){
               return;
            }
            else {
                fails.push(settings[i]);
            }
        }

        //if found a mime than it already exists with return.
        taskErrorBag.addNewTaskError(ValidatorErrors.inputNotMatchWithMimeType,
            {
                inputValue : prepareErrorData.inputValue,
                inputPath : prepareErrorData.inputPath,
                mimeType : fails
            });
    }
};

functionLibrary[nameof<ValuePropertyConfig>(s => s.subType)] = async (input, settings, taskErrorBag, prepareErrorData) =>
{
    if(typeof input === "string")
    {
        if(!Array.isArray(settings)){
            settings = [settings];
        }

        const sub = Base64Tools.getSubType(input);
        const fails : string[] = [];

        for(let i = 0; i < settings.length; i++)
        {
            if(settings[i] === sub){
                return;
            }
            else {
                fails.push(settings[i]);
            }
        }

        //if found a sub than it already exists with return.
        taskErrorBag.addNewTaskError(ValidatorErrors.inputNotMatchWithSubType,
            {
                inputValue : prepareErrorData.inputValue,
                inputPath : prepareErrorData.inputPath,
                subType : fails
            });
    }
};

export = {
    function : functionLibrary,
    type : typeLibrary
};

