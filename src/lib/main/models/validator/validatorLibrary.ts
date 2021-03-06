/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

// noinspection TypeScriptPreferShortImport,ES6PreferShortImport
import {ValidationType}   from "./validationType";
import {FormatLetters}    from "./validationFunctions";
import {ValidationBackErrors} from "../../systemBackErrors/validationBackErrors";
import Base64Utils           from "../../utils/base64Utils";
import ByteUtils             from "../../utils/byteUtils";
import BackErrorBag          from "../../../api/BackErrorBag";
import {PreparedErrorData}   from "./validatorCreator";
import {ValidationFunctions} from '../../config/definitions/parts/validationFunctions';
import {ValidatorUtils}      from './validatorUtils';
import BackError             from '../../../api/BackError';

export type TypeValidator = (input: any) => boolean;

const typeLibrary: Record<Exclude<ValidationType,'all'>,(strictType: boolean) => TypeValidator> = {
    object: () => ValidatorUtils.isObject,
    array: () => ValidatorUtils.isArray,
    string: () => ValidatorUtils.isString,
    char: () => ValidatorUtils.isChar,
    null: () => ValidatorUtils.isNull,
    int: (strictType) => {
        const {isInteger,isStringInteger} = ValidatorUtils;
        if(strictType) return (input) => isInteger(input);
        return (input) => isInteger(input) || isStringInteger(input);
    },
    float: (strictType) => {
        const {isFloat, isStringFloat} = ValidatorUtils;
        if(strictType) return (input) => isFloat(input);
        return (input) => isFloat(input) || isStringFloat(input);
    },
    number: (strictType) => {
        const {isNumber,isStringNumber} = ValidatorUtils;
        if(strictType) return (input) => isNumber(input);
        return (input) => isNumber(input) || isStringNumber(input);
    },
    date: () => ValidatorUtils.isDate,
    email: () => ValidatorUtils.isEmail,
    boolean: (strictType) => {
        const {isBoolean,isStringBoolean,isNumberBoolean} = ValidatorUtils;
        if(strictType) return (input) => isBoolean(input);
        return (input) => isBoolean(input) || isStringBoolean(input) || isNumberBoolean(input);
    },
    sha512: () => ValidatorUtils.isSha512,
    sha256: () => ValidatorUtils.isSha256,
    sha384: () => ValidatorUtils.isSha384,
    sha1: () => ValidatorUtils.isSha1,
    md5: () => ValidatorUtils.isMd5,
    hexColor: () => ValidatorUtils.isHexColor,
    hexadecimal: () => ValidatorUtils.isHexadecimal,
    ip4: () => ValidatorUtils.isIP4,
    ip6: () => ValidatorUtils.isIP6,
    isbn10: () => ValidatorUtils.isISBN10,
    isbn13: () => ValidatorUtils.isISBN13,
    json: () => ValidatorUtils.isJSON,
    url: () => ValidatorUtils.isURL,
    mimeType: () => ValidatorUtils.isMimeType,
    macAddress: () => ValidatorUtils.isMACAddress,
    mobileNumber: () => ValidatorUtils.isMobileNumber,
    uuid3: () => ValidatorUtils.isUUID3,
    uuid4: () => ValidatorUtils.isUUID4,
    uuid5: () => ValidatorUtils.isUUID5,
    base64: () => ValidatorUtils.isBase64,
    ascii: () => ValidatorUtils.isAscii,
    userId: () => ValidatorUtils.isUserId,
    mongoId: () => ValidatorUtils.isMongoId,
    latLong: () => ValidatorUtils.isLatLong
};

export type FunctionValidator =
    (input: any, backErrorBag : BackErrorBag, prepareErrorData: PreparedErrorData, type: string | undefined) => void | Promise<void>

const functionLibrary: Record<keyof ValidationFunctions,(settings: any) => FunctionValidator> = {

    regex: (settings) => {
        if(typeof settings === 'object' && !(settings instanceof RegExp)) {
            const regexes: RegExp[] = [];
            const names: string[] = [];

            let tmpRegex;
            for(let k in settings){
                if(settings.hasOwnProperty(k)){
                    tmpRegex = settings[k];
                    regexes.push(typeof tmpRegex === 'string' ? new RegExp(tmpRegex) : tmpRegex);
                    names.push(k);
                }
            }
            const regexesLength = regexes.length;

            return (input, backErrorBag, prepareErrorData) => {
                for(let i = 0; i < regexesLength; i++){
                    if(!regexes[i].test(input)) {
                        backErrorBag.add(new BackError(ValidationBackErrors.valueNotMatchesWithRegex,
                            {
                                ...prepareErrorData,
                                regexName: names[i],
                                regex: regexes[i].toString()
                            }));
                    }
                }
            }
        }
        else {
            const regex = typeof settings === 'string' ? new RegExp(settings) : settings;
            return (input, backErrorBag, prepareErrorData) => {
                if(!regex.test(input)) {
                    backErrorBag.add(new BackError(ValidationBackErrors.valueNotMatchesWithRegex,
                        {
                            ...prepareErrorData,
                            regex: regex.toString()
                        }));
                }
            }
        }
    },

    in: (settings) => {
        const inChecker = ValidatorUtils.createInChecker(settings);
        return (input, backErrorBag, prepareErrorData) => {
            if(!inChecker(input)){
                backErrorBag.add(new BackError(ValidationBackErrors.valueNotMatchesWithIn,
                    {
                        ...prepareErrorData,
                        values: settings
                    }));
            }
        }
    },

    privateIn: (settings) => {
        const inChecker = ValidatorUtils.createInChecker(settings);
        return (input, backErrorBag, prepareErrorData) => {
            if(!inChecker(input)){
                backErrorBag.add(new BackError(ValidationBackErrors.valueNotMatchesWithPrivateIn,prepareErrorData));
            }
        }
    },

    minLength: (settings) => {
        return (input, backErrorBag, prepareErrorData) => {
            if(typeof input === 'string' && input.length < settings) {
                backErrorBag.add(new BackError(ValidationBackErrors.valueNotMatchesWithMinLength,
                    {
                        ...prepareErrorData,
                        minLength: settings
                    }));
            }
        }
    },

    maxLength: (settings) => {
        return (input, backErrorBag, prepareErrorData) => {
            if(typeof input === 'string' && input.length > settings) {
                backErrorBag.add(new BackError(ValidationBackErrors.valueNotMatchesWithMaxLength,
                    {
                        ...prepareErrorData,
                        maxLength: settings

                    }));
            }
        }
    },

    length: (settings) => {
        return (input, backErrorBag, prepareErrorData) => {
            if(typeof input === 'string' && input.length !== settings) {
                backErrorBag.add(new BackError(ValidationBackErrors.valueNotMatchesWithLength,
                    {
                        ...prepareErrorData,
                        length: settings

                    }));
            }
        }
    },

    contains: (settings) => {
        const containsChecker = ValidatorUtils.createContainsChecker(settings);
        return (input, backErrorBag, prepareErrorData) => {
            if(typeof input === 'string') {
                if(!containsChecker(input)){
                    backErrorBag.add(new BackError(ValidationBackErrors.valueNotMatchesWithContains,
                        {
                            ...prepareErrorData,
                            shouldContain: settings
                        }));
                }
            }
        }
    },

    equals: (settings) => {
        return (input, backErrorBag, prepareErrorData) => {
            if(input !== settings){
                backErrorBag.add(new BackError(ValidationBackErrors.valueNotMatchesWithEquals,
                    {
                        ...prepareErrorData,
                        shouldEquals: settings
                    }));
            }
        }
    },

    minValue: (settings) => {
        return (input, backErrorBag, prepareErrorData) => {
            if(typeof input === 'number' && input < settings) {
                backErrorBag.add(new BackError(ValidationBackErrors.valueNotMatchesWithMinValue,
                    {
                        ...prepareErrorData,
                        minValue: settings
                    }));
            }
        };
    },

    maxValue: (settings) => {
        return (input, backErrorBag, prepareErrorData) => {
            if(typeof input === 'number' && input > settings) {
                backErrorBag.add(new BackError(ValidationBackErrors.valueNotMatchesWithMaxValue,
                    {
                        ...prepareErrorData,
                        maxValue: settings
                    }));
            }
        };
    },

    startsWith: (settings) => {
        return (input, backErrorBag, prepareErrorData) => {
            if(typeof input === 'string' && !input.startsWith(settings)) {
                backErrorBag.add(new BackError(ValidationBackErrors.valueNotMatchesWithStartsWith,
                    {
                        ...prepareErrorData,
                        shouldStartWith: settings
                    }));
            }
        };
    },

    endsWith: (settings) => {
        return (input, backErrorBag, prepareErrorData) => {
            if(typeof input === 'string' && !input.endsWith(settings)) {
                backErrorBag.add(new BackError(ValidationBackErrors.valueNotMatchesWithEndsWith,
                    {
                        ...prepareErrorData,
                        shouldEndWith: settings
                    }));
            }
        };
    },

    letters: (settings) => {
        const testFormat: (str: string) => string = settings === FormatLetters.UpperCase ?
            str => str.toUpperCase() : str => str.toLowerCase()
        return (input, backErrorBag, prepareErrorData) => {
            if(typeof input === 'string'){
                if(input !== testFormat(input)) {
                    backErrorBag.add(new BackError(ValidationBackErrors.valueNotMatchesWithLettersFormat,{
                        ...prepareErrorData,
                        format: settings
                    }));
                }
            }
        };
    },

    charClass: (settings) => {
        const regex = new RegExp("^["+settings+"]*$");
        return (input, backErrorBag, prepareErrorData) => {
            if(typeof input === 'string') {
                if(!regex.test(input)) {
                    backErrorBag.add(new BackError(ValidationBackErrors.valueNotMatchesWithCharClass,
                        {
                            ...prepareErrorData,
                            regex: regex.toString()
                        }));
                }
            }
        };
    },

    before: (settings) => {
        const getCheckDate: () => Date | Promise<Date> =
            typeof settings === 'function' ? settings : () => settings;
        const {isDate} = ValidatorUtils;
        return async (input, backErrorBag, prepareErrorData) => {
            if((typeof input === "string" && isDate(input)) || input instanceof Date) {
                const checkDate = await getCheckDate();
                if((typeof input === 'string' ? new Date(input) : input) >= checkDate) {
                    backErrorBag.add(new BackError(ValidationBackErrors.dateIsNotBefore,
                        {
                            ...prepareErrorData,
                            shouldBefore: checkDate
                        }));
                }
            }
        };
    },

    after: (settings) => {
        const getCheckDate: () => Date | Promise<Date> =
            typeof settings === 'function' ? settings : () => settings;
        const {isDate} = ValidatorUtils;
        return async (input, backErrorBag, prepareErrorData) => {
            if((typeof input === "string" && isDate(input)) || input instanceof Date) {
                const checkDate = await getCheckDate();
                if((typeof input === 'string' ? new Date(input) : input) <= checkDate) {
                    backErrorBag.add(new BackError(ValidationBackErrors.dateIsNotAfter,
                        {
                            ...prepareErrorData,
                            shouldAfter: checkDate
                        }));
                }
            }
        };
    },

    minByteSize: (settings) => {
        return (input, backErrorBag, prepareErrorData, type) => {
            if(typeof input === "string" && ByteUtils.getByteSize(input,type) < settings) {
                backErrorBag.add(new BackError(ValidationBackErrors.valueNotMatchesWithMinByteSize,
                    {
                        ...prepareErrorData,
                        minByteSize: settings
                    }));
            }
        }
    },

    maxByteSize: (settings) => {
        return (input, backErrorBag, prepareErrorData, type) => {
            if(typeof input === "string" && ByteUtils.getByteSize(input,type) > settings) {
                backErrorBag.add(new BackError(ValidationBackErrors.valueNotMatchesWithMaxByteSize,
                    {
                        ...prepareErrorData,
                        maxByteSize: settings
                    }));
            }
        };
    },

    mimeType: (settings) => {
        if(Array.isArray(settings)){
            const length = settings.length;
            return (input, backErrorBag, prepareErrorData) => {
                if(typeof input === 'string'){
                    const inMimeType = Base64Utils.getMimeType(input);
                    for(let i = 0; i < length; i++) if(inMimeType === settings[i]) return;
                    backErrorBag.add(new BackError(ValidationBackErrors.valueNotMatchesWithMimeType,
                        {
                            ...prepareErrorData,
                            mimeType: settings
                        }));
                }
            };
        }
        else {
            return (input, backErrorBag, prepareErrorData) => {
                if(typeof input === 'string' && Base64Utils.getMimeType(input) !== settings){
                    backErrorBag.add(new BackError(ValidationBackErrors.valueNotMatchesWithMimeType,
                        {
                            ...prepareErrorData,
                            mimeType: settings
                        }));
                }
            };
        }
    },

    mimeSubType: (settings) => {
        if(Array.isArray(settings)){
            const length = settings.length;
            return (input, backErrorBag, prepareErrorData) => {
                if(typeof input === 'string'){
                    const inMimeSubType = Base64Utils.getMimeSubType(input);
                    for(let i = 0; i < length; i++) if(inMimeSubType === settings[i]) return;
                    backErrorBag.add(new BackError(ValidationBackErrors.valueNotMatchesWithMimeSubType,
                        {
                            ...prepareErrorData,
                            mimeSubType: settings
                        }));
                }
            };
        }
        else {
            return (input, backErrorBag, prepareErrorData) => {
                if(typeof input === 'string' && Base64Utils.getMimeSubType(input) !== settings){
                    backErrorBag.add(new BackError(ValidationBackErrors.valueNotMatchesWithMimeSubType,
                        {
                            ...prepareErrorData,
                            mimeSubType: settings
                        }));
                }
            };
        }
    }
};

export namespace ValidatorLibrary {
    export const Functions = functionLibrary;
    export const Types = typeLibrary;
}