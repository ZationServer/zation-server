/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

/*
Validation Library from Zation

Contains validator functions
The validator functions only invoke if precondition is true.
It not contains the type check.
 */

// noinspection TypeScriptPreferShortImport
import {ValidationType}   from "../constants/validationType";
import {FormatLetters}    from "../constants/validation";
import BackError          from "../../api/BackError";
import EasyValidator      from "./easyValidator";
import {ValidatorBackErrors} from "../zationBackErrors/validatorBackErrors";
import Base64Utils           from "../utils/base64Utils";
import ByteUtils             from "../utils/byteUtils";
import BackErrorBag          from "../../api/BackErrorBag";
import {PreparedErrorData}   from "./validatorEngine";
import Bag                   from "../../api/Bag";
import {ValidationFunctions} from '../config/definitions/parts/validationFunctions';

export type TypeValidator =
    (input: any,backErrorBag: BackErrorBag,prepareErrorData: PreparedErrorData,strictType: boolean) => Promise<void> | void;

const typeLibrary: Record<Exclude<ValidationType,'all'>,TypeValidator> = {

    object: (input, backErrorBag, prepareErrorData) =>
    {
        if(!EasyValidator.isObject(input)) {
            backErrorBag.addBackError(new BackError(ValidatorBackErrors.valueIsNotTypeObject,prepareErrorData));
        }
    },

    array: (input, backErrorBag, prepareErrorData) =>
    {
        if(!EasyValidator.isArray(input)) {
            backErrorBag.addBackError(new BackError(ValidatorBackErrors.valueIsNotTypeArray,prepareErrorData));
        }
    },

    string: (input, backErrorBag, prepareErrorData) =>
    {
        if(!EasyValidator.isString(input)) {
            backErrorBag.addBackError(new BackError(ValidatorBackErrors.valueIsNotTypeString,prepareErrorData));
        }
    },

    char: (input, backErrorBag, prepareErrorData) =>
    {
        if(!EasyValidator.isChar(input)) {
            backErrorBag.addBackError(new BackError(ValidatorBackErrors.valueIsNotTypeChar,prepareErrorData));
        }
    },

    null: (input, backErrorBag, prepareErrorData) =>
    {
        if(!EasyValidator.isNull(input)) {
            backErrorBag.addBackError(new BackError(ValidatorBackErrors.valueIsNotTypeNull,prepareErrorData));
        }
    },

    int: (input, backErrorBag, prepareErrorData, strictType) =>
    {
        if(!Number.isInteger(input)){
            if(!(!strictType && EasyValidator.isStringInt(input))) {
                backErrorBag.addBackError(new BackError(ValidatorBackErrors.valueIsNotTypeInt,prepareErrorData));
            }
        }
    },

    float: (input, backErrorBag, prepareErrorData, strictType) =>
    {
        if(!EasyValidator.isFloat(input)) {
            if(!(!strictType && EasyValidator.isStringFloat(input))) {
                backErrorBag.addBackError(new BackError(ValidatorBackErrors.valueIsNotTypeFloat,prepareErrorData));
            }
        }
    },

    number: (input, backErrorBag, prepareErrorData, strictType) =>
    {
        if(!EasyValidator.isNumber(input)) {
            if(!(!strictType && EasyValidator.isStringNumber(input))) {
                backErrorBag.addBackError(new BackError(ValidatorBackErrors.valueIsNotTypeNumber,prepareErrorData));
            }
        }
    },

    date: (input, backErrorBag, prepareErrorData) =>
    {
        if(!EasyValidator.isDate(input)) {
            backErrorBag.addBackError(new BackError(ValidatorBackErrors.valueIsNotTypeDate,prepareErrorData));
        }
    },

    email: (input, backErrorBag, prepareErrorData) =>
    {
        if(!EasyValidator.isEmail(input)) {
            backErrorBag.addBackError(new BackError(ValidatorBackErrors.valueIsNotTypeEmail,prepareErrorData));
        }
    },

    boolean: (input, backErrorBag, prepareErrorData, strictType) =>
    {
        if(!EasyValidator.isBoolean(input)) {
            if(!(!strictType && (EasyValidator.isStringBoolean(input) || EasyValidator.isNumberBoolean(input)))) {
                backErrorBag.addBackError(new BackError(ValidatorBackErrors.valueIsNotTypeBoolean,prepareErrorData));
            }
        }
    },

    sha512: (input, backErrorBag, prepareErrorData) =>
    {
        if(!EasyValidator.isSha512(input)) {
            backErrorBag.addBackError(new BackError(ValidatorBackErrors.valueIsNotTypeSha512,prepareErrorData));
        }
    },

    sha256: (input, backErrorBag, prepareErrorData) =>
    {
        if(!EasyValidator.isSha256(input)) {
            backErrorBag.addBackError(new BackError(ValidatorBackErrors.valueIsNotTypeSha256,prepareErrorData));
        }
    },

    sha384: (input, backErrorBag, prepareErrorData) =>
    {
        if(!EasyValidator.isSha384(input)) {
            backErrorBag.addBackError(new BackError(ValidatorBackErrors.valueIsNotTypeSha384,prepareErrorData));
        }
    },

    sha1: (input, backErrorBag, prepareErrorData) =>
    {
        if(!EasyValidator.isSha1(input)) {
            backErrorBag.addBackError(new BackError(ValidatorBackErrors.valueIsNotTypeSha1,prepareErrorData));
        }
    },

    md5: (input, backErrorBag, prepareErrorData) =>
    {
        if(!EasyValidator.isMd5(input)) {
            backErrorBag.addBackError(new BackError(ValidatorBackErrors.valueIsNotTypeMd5,prepareErrorData));
        }
    },

    hexColor: (input, backErrorBag, prepareErrorData) =>
    {
        if(!EasyValidator.isHexColor(input)) {
            backErrorBag.addBackError(new BackError(ValidatorBackErrors.valueIsNotTypeHexColor,prepareErrorData));
        }
    },

    hexadecimal: (input, backErrorBag, prepareErrorData) =>
    {
        if(!EasyValidator.isHexadecimal(input)) {
            backErrorBag.addBackError(new BackError(ValidatorBackErrors.valueIsNotTypeHexadecimal,prepareErrorData));
        }
    },

    ip4: (input, backErrorBag, prepareErrorData) =>
    {
        if(!EasyValidator.isIP4(input)) {
            backErrorBag.addBackError(new BackError(ValidatorBackErrors.valueIsNotTypeIp4,prepareErrorData));
        }
    },

    ip6: (input, backErrorBag, prepareErrorData) =>
    {
        if(!EasyValidator.isIP6(input)) {
            backErrorBag.addBackError(new BackError(ValidatorBackErrors.valueIsNotTypeIp6,prepareErrorData));
        }
    },

    isbn10: (input, backErrorBag, prepareErrorData) =>
    {
        if(!EasyValidator.isISB10(input)) {
            backErrorBag.addBackError(new BackError(ValidatorBackErrors.valueIsNotTypeIsbn10,prepareErrorData));
        }
    },

    isbn13: (input, backErrorBag, prepareErrorData) =>
    {
        if(!EasyValidator.isISB13(input)) {
            backErrorBag.addBackError(new BackError(ValidatorBackErrors.valueIsNotTypeIsbn13,prepareErrorData));
        }
    },

    json: (input, backErrorBag, prepareErrorData) =>
    {
        if(!EasyValidator.isJSON(input)) {
            backErrorBag.addBackError(new BackError(ValidatorBackErrors.valueIsNotTypeJson,prepareErrorData));
        }
    },

    url: (input, backErrorBag, prepareErrorData) =>
    {
        if(!EasyValidator.isUrl(input)) {
            backErrorBag.addBackError(new BackError(ValidatorBackErrors.valueIsNotTypeUrl,prepareErrorData));
        }
    },

    mimeType: (input, backErrorBag, prepareErrorData) =>
    {
        if(!EasyValidator.isMimeType(input)) {
            backErrorBag.addBackError(new BackError(ValidatorBackErrors.valueIsNotTypeMimeType,prepareErrorData));
        }
    },

    macAddress: (input, backErrorBag, prepareErrorData) =>
    {
        if(!EasyValidator.isMACAddress(input)) {
            backErrorBag.addBackError(new BackError(ValidatorBackErrors.valueIsNotTypeMacAddress,prepareErrorData));
        }
    },

    mobileNumber: (input, backErrorBag, prepareErrorData) =>
    {
        if(!EasyValidator.isMobilePhone(input)) {
            backErrorBag.addBackError(new BackError(ValidatorBackErrors.valueIsNotTypeMobileNumber,prepareErrorData));
        }
    },

    uuid3: (input, backErrorBag, prepareErrorData) =>
    {
        if(!EasyValidator.isUUID3(input)) {
            backErrorBag.addBackError(new BackError(ValidatorBackErrors.valueIsNotTypeUuid3,prepareErrorData));
        }
    },

    uuid4: (input, backErrorBag, prepareErrorData) =>
    {
        if(!EasyValidator.isUUID4(input)) {
            backErrorBag.addBackError(new BackError(ValidatorBackErrors.valueIsNotTypeUuid4,prepareErrorData));
        }
    },

    uuid5: (input, backErrorBag, prepareErrorData) =>
    {
        if(!EasyValidator.isUUID5(input)) {
            backErrorBag.addBackError(new BackError(ValidatorBackErrors.valueIsNotTypeUuid5,prepareErrorData));
        }
    },

    base64: (input, backErrorBag, prepareErrorData) =>
    {
        if(!EasyValidator.isBase64(input)) {
            backErrorBag.addBackError(new BackError(ValidatorBackErrors.valueIsNotTypeBase64,prepareErrorData));
        }
    },

    ascii: (input, backErrorBag, prepareErrorData) =>
    {
        if(!EasyValidator.isAscii(input)) {
            backErrorBag.addBackError(new BackError(ValidatorBackErrors.valueIsNotTypeAscii,prepareErrorData));
        }
    },

    userId: (input, backErrorBag, prepareErrorData) =>
    {
        if(!(EasyValidator.isString(input) || EasyValidator.isNumber(input))) {
            backErrorBag.addBackError(new BackError(ValidatorBackErrors.valueIsNotTypeUserId,prepareErrorData));
        }
    },

    mongoId: (input, backErrorBag, prepareErrorData) =>
    {
        if(!EasyValidator.isMongoId(input)) {
            backErrorBag.addBackError(new BackError(ValidatorBackErrors.valueIsNotTypeMongoId,prepareErrorData));
        }
    },

    latLong: (input, backErrorBag, prepareErrorData) =>
    {
        if(!EasyValidator.isLatLong(input)) {
            backErrorBag.addBackError(new BackError(ValidatorBackErrors.valueIsNotTypeLatLong,prepareErrorData));
        }
    }

};

export type FunctionValidator =
    (input: any, settings: any, backErrorBag : BackErrorBag, prepareErrorData: PreparedErrorData, preparedBag: Bag, type: string | undefined) => void | Promise<void>

const functionLibrary: Record<keyof ValidationFunctions,FunctionValidator> = {

    regex: (input, settings, backErrorBag, prepareErrorData) =>
    {
        if(typeof input === 'string') {
            if(typeof settings === 'object' && !(settings instanceof RegExp)) {
                for(let name in settings) {
                    if(settings.hasOwnProperty(name)){
                        if(!input.match(settings[name])) {
                            backErrorBag.addNewBackError(ValidatorBackErrors.valueNotMatchesWithRegex,
                                {
                                    value: prepareErrorData.value,
                                    path: prepareErrorData.path,
                                    regexName: name,
                                    regex: settings[name].toString()
                                });
                        }
                    }
                }
            }
            else {
                if(!input.match(settings)) {
                    backErrorBag.addNewBackError(ValidatorBackErrors.valueNotMatchesWithRegex,
                        {
                            value: prepareErrorData.value,
                            path: prepareErrorData.path,
                            regex: settings.toString()
                        });
                }
            }
        }
    },

    in: (input, settings, backErrorBag, prepareErrorData) =>
    {
        if(!EasyValidator.validIn(settings,input)) {
            backErrorBag.addNewBackError(ValidatorBackErrors.valueNotMatchesWithIn,
                {
                    value: prepareErrorData.value,
                    path: prepareErrorData.path,
                    values: settings
                });
        }
    },

    privateIn: (input, settings, backErrorBag, prepareErrorData) =>
    {
        if(!EasyValidator.validIn(settings,input)) {
            backErrorBag.addNewBackError(ValidatorBackErrors.valueNotMatchesWithPrivateIn,prepareErrorData);
        }
    },

    minLength: (input, settings, backErrorBag, prepareErrorData) =>
    {
        if(typeof input === 'string' && input.length < settings) {
            backErrorBag.addNewBackError(ValidatorBackErrors.valueNotMatchesWithMinLength,
                {
                    value: prepareErrorData.value,
                    path: prepareErrorData.path,
                    minLength: settings
                });
        }
    },

    maxLength: (input, settings, backErrorBag, prepareErrorData) =>
    {
        if(typeof input === 'string' && input.length > settings) {
            backErrorBag.addNewBackError(ValidatorBackErrors.valueNotMatchesWithMaxLength,
                {
                    value: prepareErrorData.value,
                    path: prepareErrorData.path,
                    maxLength: settings

                });
        }
    },

    length: (input, settings, backErrorBag, prepareErrorData) =>
    {
        if(typeof input === 'string' && input.length !== settings) {
            backErrorBag.addNewBackError(ValidatorBackErrors.valueNotMatchesWithLength,
                {
                    value: prepareErrorData.value,
                    path: prepareErrorData.path,
                    length: settings

                });
        }
    },

    contains: (input, settings, backErrorBag, prepareErrorData) =>
    {
        if(typeof input === 'string') {
            const missingContains = EasyValidator.missingContains(input,settings);
            if(missingContains.length > 0) {
                backErrorBag.addNewBackError(ValidatorBackErrors.valueNotMatchesWithContains,
                    {
                        value: prepareErrorData.value,
                        path: prepareErrorData.path,
                        shouldContain: settings,
                        missing: missingContains
                    });
            }
        }
    },

    equals: (input, settings, backErrorBag, prepareErrorData) =>
    {
        if(!EasyValidator.equals(input,settings)) {
            backErrorBag.addNewBackError(ValidatorBackErrors.valueNotMatchesWithEquals,
                {
                    value: prepareErrorData.value,
                    path: prepareErrorData.path,
                    shouldEquals: settings

                });
        }
    },

    minValue: (input, settings, backErrorBag, prepareErrorData) =>
    {
        if(typeof input === 'number' && input < settings) {
            backErrorBag.addNewBackError(ValidatorBackErrors.valueNotMatchesWithMinValue,
                {
                    value: prepareErrorData.value,
                    path: prepareErrorData.path,
                    minValue: settings

                });
        }
    },

    maxValue: (input, settings, backErrorBag, prepareErrorData) =>
    {
        if(typeof input === 'number' && input > settings) {
            backErrorBag.addNewBackError(ValidatorBackErrors.valueNotMatchesWithMaxValue,
                {
                    value: prepareErrorData.value,
                    path: prepareErrorData.path,
                    maxValue: settings
                });
        }
    },

    startsWith: (input, settings, backErrorBag, prepareErrorData) =>
    {
        if(typeof input === 'string' && !input.startsWith(settings)) {
            backErrorBag.addNewBackError(ValidatorBackErrors.valueNotMatchesWithStartsWith,
                {
                    value: prepareErrorData.value,
                    path: prepareErrorData.path,
                    shouldStartsWith: settings

                });
        }
    },

    endsWith: (input, settings, backErrorBag, prepareErrorData) =>
    {
        if(typeof input === 'string' && !input.endsWith(settings)) {
            backErrorBag.addNewBackError(ValidatorBackErrors.valueIsNotEndsWith,
                {
                    value: prepareErrorData.value,
                    path: prepareErrorData.path,
                    shouldEndsWith: settings

                });
        }
    },

    letters: (input, settings, backErrorBag, prepareErrorData) =>
    {
        if(typeof input === 'string') {
            if((settings === FormatLetters.UpperCase) && (!EasyValidator.isUpperCase(input))) {
                backErrorBag.addNewBackError(ValidatorBackErrors.valueIsNotUppercase,prepareErrorData);
            }
            else if((settings === FormatLetters.LowerCase) && (!EasyValidator.isLowerCase(input))) {
                backErrorBag.addNewBackError(ValidatorBackErrors.valueIsNotLowercase,prepareErrorData);
            }
        }
    },

    charClass: (input, settings, backErrorBag, prepareErrorData) =>
    {
        if(typeof input === 'string') {
            if(!input.match(settings)) {
                backErrorBag.addNewBackError(ValidatorBackErrors.valueNotMatchesWithCharClass,
                    {
                        value: prepareErrorData.value,
                        path: prepareErrorData.path,
                        regex: settings.toString()
                    });
            }
        }
    },

    before: async (input, settings, backErrorBag, prepareErrorData, preparedBag) =>
    {
        if((typeof input === "string" && EasyValidator.isDate(input)) || input instanceof Date)
        {
            const inputDate: Date = typeof input === 'string' ? new Date(input): input;
            const checkDate: Date = typeof settings === 'function' ? await settings(preparedBag): settings;
            if(inputDate > checkDate) {
                backErrorBag.addNewBackError(ValidatorBackErrors.dateIsNotBefore,
                    {
                        value: prepareErrorData.value,
                        path: prepareErrorData.path,
                        shouldBefore: checkDate
                    });
            }
        }
    },

    after: async (input, settings, backErrorBag, prepareErrorData, preparedBag) =>
    {
        if((typeof input === "string" && EasyValidator.isDate(input)) || input instanceof Date)
        {
            const inputDate: Date = typeof input === 'string' ? new Date(input): input;
            const checkDate: Date = typeof settings === 'function' ? await settings(preparedBag): settings;
            if(inputDate < checkDate) {
                backErrorBag.addNewBackError(ValidatorBackErrors.dateIsNotAfter,
                    {
                        value: prepareErrorData.value,
                        path: prepareErrorData.path,
                        shouldAfter: checkDate
                    });
            }
        }
    },

    minByteSize: (input, settings, backErrorBag, prepareErrorData, preparedBag,type) =>
    {
        if(typeof input === "string" && ByteUtils.getByteSize(input,type) < settings)
        {
            backErrorBag.addNewBackError(ValidatorBackErrors.valueNotMatchesWithMinByteSize,
                {
                    value: prepareErrorData.value,
                    path: prepareErrorData.path,
                    minByteSize: settings
                });
        }
    },

    maxByteSize: (input, settings, backErrorBag, prepareErrorData, preparedBag,type) =>
    {
        if(typeof input === "string" && ByteUtils.getByteSize(input,type) > settings)
        {
            backErrorBag.addNewBackError(ValidatorBackErrors.valueNotMatchesWithMaxByteSize,
                {
                    value: prepareErrorData.value,
                    path: prepareErrorData.path,
                    maxByteSize: settings
                });
        }
    },

    mimeType: (input, settings, backErrorBag, prepareErrorData) =>
    {
        if(typeof input === "string")
        {
            if(!Array.isArray(settings)){
                settings = [settings];
            }

            const mime = Base64Utils.getMimeType(input);
            const fails: string[] = [];

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
            backErrorBag.addNewBackError(ValidatorBackErrors.valueNotMatchesWithMimeType,
                {
                    value: prepareErrorData.value,
                    path: prepareErrorData.path,
                    mimeType: fails
                });
        }
    },

    mimeSubType: (input, settings, backErrorBag, prepareErrorData) =>
    {
        if(typeof input === "string")
        {
            if(!Array.isArray(settings)){
                settings = [settings];
            }

            const sub = Base64Utils.getMimeSubType(input);
            const fails: string[] = [];

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
            backErrorBag.addNewBackError(ValidatorBackErrors.valueNotMatchesWithMimeSubType,
                {
                    value: prepareErrorData.value,
                    path: prepareErrorData.path,
                    mimeSubType: fails
                });
        }
    }

};

export namespace ValidatorLibrary {
    export const Functions = functionLibrary;
    export const Types = typeLibrary;
}