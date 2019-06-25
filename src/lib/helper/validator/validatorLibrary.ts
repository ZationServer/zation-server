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

// noinspection TypeScriptPreferShortImport
import {ValidationTypes}  from "../constants/validationTypes";
import {FormatLetters}    from "../constants/validation";
import {ValueModelConfig} from "../configDefinitions/inputConfig";
import BackError          from "../../api/BackError";
import EasyValidator      from "./easyValidator";
import {ValidatorBackErrors} from "../zationBackErrors/validatorBackErrors";
import Base64Utils           from "../utils/base64Utils";
import ByteUtils             from "../utils/byteUtils";
import BackErrorBag          from "../../api/BackErrorBag";
import {PreparedErrorData}   from "./validatorEngine";
import SmallBag              from "../../api/SmallBag";

const functionLibrary : Record<string,FunctionValidator> = {};
const typeLibrary : Record<string,TypeValidator> = {};


export type FunctionValidator =
    (input : any, settings : any, backErrorBag  : BackErrorBag, prepareErrorData : PreparedErrorData, preparedSmallBag : SmallBag,type : string | undefined) => void | Promise<void>

export type TypeValidator =
    (input : any,backErrorBag : BackErrorBag,prepareErrorData : PreparedErrorData,strictType : boolean) => Promise<void> | void;


typeLibrary[ValidationTypes.OBJECT] = (input,backErrorBag,prepareErrorData) =>
{
    if(!EasyValidator.isObject(input)) {
        backErrorBag.addBackError(new BackError(ValidatorBackErrors.inputIsNotTypeObject,prepareErrorData));
    }
};

typeLibrary[ValidationTypes.ARRAY] = (input,backErrorBag,prepareErrorData) =>
{
    if(!EasyValidator.isArray(input)) {
        backErrorBag.addBackError(new BackError(ValidatorBackErrors.inputIsNotTypeArray,prepareErrorData));
    }
};

typeLibrary[ValidationTypes.STRING] = (input,backErrorBag,prepareErrorData) =>
{
    if(!EasyValidator.isString(input)) {
        backErrorBag.addBackError(new BackError(ValidatorBackErrors.inputIsNotTypeString,prepareErrorData));
    }
};

typeLibrary[ValidationTypes.CHAR] = (input,backErrorBag,prepareErrorData) =>
{
    if(!EasyValidator.isChar(input)) {
        backErrorBag.addBackError(new BackError(ValidatorBackErrors.inputIsNotTypeChar,prepareErrorData));
    }
};

typeLibrary[ValidationTypes.NULL] = (input,backErrorBag,prepareErrorData) =>
{
    if(!EasyValidator.isNull(input)) {
        backErrorBag.addBackError(new BackError(ValidatorBackErrors.inputIsNotTypeNull,prepareErrorData));
    }
};

typeLibrary[ValidationTypes.INT] = (input,backErrorBag,prepareErrorData,strictType) =>
{
    if(!Number.isInteger(input)){
        if(!(!strictType && EasyValidator.isStringInt(input))) {
            backErrorBag.addBackError(new BackError(ValidatorBackErrors.inputIsNotTypeInt,prepareErrorData));
        }
    }
};

typeLibrary[ValidationTypes.FLOAT] = (input,backErrorBag,prepareErrorData,strictType) =>
{
    if(!EasyValidator.isFloat(input)) {
        if(!(!strictType && EasyValidator.isStringFloat(input))) {
            backErrorBag.addBackError(new BackError(ValidatorBackErrors.inputIsNotTypeFloat,prepareErrorData));
        }
    }
};

typeLibrary[ValidationTypes.NUMBER] = (input,backErrorBag,prepareErrorData,strictType) =>
{
    if(!EasyValidator.isNumber(input)) {
        if(!(!strictType && EasyValidator.isStringNumber(input))) {
            backErrorBag.addBackError(new BackError(ValidatorBackErrors.inputIsNotTypeNumber,prepareErrorData));
        }
    }
};

typeLibrary[ValidationTypes.DATE] = (input,backErrorBag,prepareErrorData) =>
{
    if(!EasyValidator.isDate(input)) {
        backErrorBag.addBackError(new BackError(ValidatorBackErrors.inputIsNotTypeDate,prepareErrorData));
    }
};

typeLibrary[ValidationTypes.EMAIL] = (input,backErrorBag,prepareErrorData) =>
{
    if(!EasyValidator.isEmail(input)) {
        backErrorBag.addBackError(new BackError(ValidatorBackErrors.inputIsNotTypeEmail,prepareErrorData));
    }
};

typeLibrary[ValidationTypes.BOOLEAN] = (input,backErrorBag,prepareErrorData,strictType) =>
{
    if(!EasyValidator.isBoolean(input)) {
        if(!(!strictType && (EasyValidator.isStringBoolean(input) || EasyValidator.isNumberBoolean(input)))) {
            backErrorBag.addBackError(new BackError(ValidatorBackErrors.inputIsNotTypeBoolean,prepareErrorData));
        }
    }
};

typeLibrary[ValidationTypes.SHA512] = (input,backErrorBag,prepareErrorData) =>
{
    if(!EasyValidator.isSha512(input)) {
        backErrorBag.addBackError(new BackError(ValidatorBackErrors.inputIsNotTypeSha512,prepareErrorData));
    }
};

typeLibrary[ValidationTypes.SHA256] = (input,backErrorBag,prepareErrorData) =>
{
    if(!EasyValidator.isSha256(input)) {
        backErrorBag.addBackError(new BackError(ValidatorBackErrors.inputIsNotTypeSha256,prepareErrorData));
    }
};

typeLibrary[ValidationTypes.SHA384] = (input,backErrorBag,prepareErrorData) =>
{
    if(!EasyValidator.isSha384(input)) {
        backErrorBag.addBackError(new BackError(ValidatorBackErrors.inputIsNotTypeSha384,prepareErrorData));
    }
};

typeLibrary[ValidationTypes.SHA1] = (input,backErrorBag,prepareErrorData) =>
{
    if(!EasyValidator.isSha1(input)) {
        backErrorBag.addBackError(new BackError(ValidatorBackErrors.inputIsNotTypeSha1,prepareErrorData));
    }
};

typeLibrary[ValidationTypes.MD5] = (input,backErrorBag,prepareErrorData) =>
{
    if(!EasyValidator.isMd5(input)) {
        backErrorBag.addBackError(new BackError(ValidatorBackErrors.inputIsNotTypeMd5,prepareErrorData));
    }
};

typeLibrary[ValidationTypes.HEX_COLOR] = (input,backErrorBag,prepareErrorData) =>
{
    if(!EasyValidator.isHexColor(input)) {
        backErrorBag.addBackError(new BackError(ValidatorBackErrors.inputIsNotTypeHexColor,prepareErrorData));
    }
};

typeLibrary[ValidationTypes.HEXADECIMAL] = (input,backErrorBag,prepareErrorData) =>
{
    if(!EasyValidator.isHexadecimal(input)) {
        backErrorBag.addBackError(new BackError(ValidatorBackErrors.inputIsNotTypeHexadecimal,prepareErrorData));
    }
};

typeLibrary[ValidationTypes.IP_4] = (input, backErrorBag, prepareErrorData) =>
{
    if(!EasyValidator.isIP4(input)) {
        backErrorBag.addBackError(new BackError(ValidatorBackErrors.inputIsNotTypeIp4,prepareErrorData));
    }
};

typeLibrary[ValidationTypes.IP_6] = (input,backErrorBag,prepareErrorData) =>
{
    if(!EasyValidator.isIP6(input)) {
        backErrorBag.addBackError(new BackError(ValidatorBackErrors.inputIsNotTypeIp6,prepareErrorData));
    }
};

typeLibrary[ValidationTypes.ISBN_10] = (input,backErrorBag,prepareErrorData) =>
{
    if(!EasyValidator.isISB10(input)) {
        backErrorBag.addBackError(new BackError(ValidatorBackErrors.inputIsNotTypeIsbn10,prepareErrorData));
    }
};

typeLibrary[ValidationTypes.ISBN_13] = (input,backErrorBag,prepareErrorData) =>
{
    if(!EasyValidator.isISB13(input)) {
        backErrorBag.addBackError(new BackError(ValidatorBackErrors.inputIsNotTypeIsbn13,prepareErrorData));
    }
};

typeLibrary[ValidationTypes.JSON] = (input,backErrorBag,prepareErrorData) =>
{
    if(!EasyValidator.isJSON(input)) {
        backErrorBag.addBackError(new BackError(ValidatorBackErrors.inputIsNotTypeJson,prepareErrorData));
    }
};

typeLibrary[ValidationTypes.URL] = (input,backErrorBag,prepareErrorData) =>
{
    if(!EasyValidator.isUrl(input)) {
        backErrorBag.addBackError(new BackError(ValidatorBackErrors.inputIsNotTypeUrl,prepareErrorData));
    }
};

typeLibrary[ValidationTypes.MIME_TYPE] = (input,backErrorBag,prepareErrorData) =>
{
    if(!EasyValidator.isMimeType(input)) {
        backErrorBag.addBackError(new BackError(ValidatorBackErrors.inputIsNotTypeMimeType,prepareErrorData));
    }
};

typeLibrary[ValidationTypes.MAC_ADDRESS] = (input,backErrorBag,prepareErrorData) =>
{
    if(!EasyValidator.isMACAddress(input)) {
        backErrorBag.addBackError(new BackError(ValidatorBackErrors.inputIsNotTypeMacAddress,prepareErrorData));
    }
};

typeLibrary[ValidationTypes.MOBILE_NUMBER] = (input,backErrorBag,prepareErrorData) =>
{
    if(!EasyValidator.isMobilePhone(input)) {
        backErrorBag.addBackError(new BackError(ValidatorBackErrors.inputIsNotTypeMobileNumber,prepareErrorData));
    }
};

typeLibrary[ValidationTypes.UUID_3] = (input,backErrorBag,prepareErrorData) =>
{
    if(!EasyValidator.isUUID3(input)) {
        backErrorBag.addBackError(new BackError(ValidatorBackErrors.inputIsNotTypeUuid3,prepareErrorData));
    }
};

typeLibrary[ValidationTypes.UUID_4] = (input,backErrorBag,prepareErrorData) =>
{
    if(!EasyValidator.isUUID4(input)) {
        backErrorBag.addBackError(new BackError(ValidatorBackErrors.inputIsNotTypeUuid4,prepareErrorData));
    }
};

typeLibrary[ValidationTypes.UUID_5] = (input,backErrorBag,prepareErrorData) =>
{
    if(!EasyValidator.isUUID5(input)) {
        backErrorBag.addBackError(new BackError(ValidatorBackErrors.inputIsNotTypeUuid5,prepareErrorData));
    }
};

typeLibrary[ValidationTypes.BASE64] = (input,backErrorBag,prepareErrorData) =>
{
    if(!EasyValidator.isBase64(input)) {
        backErrorBag.addBackError(new BackError(ValidatorBackErrors.inputIsNotTypeBase64,prepareErrorData));
    }
};

typeLibrary[ValidationTypes.ASCII] = (input,backErrorBag,prepareErrorData) =>
{
    if(!EasyValidator.isAscii(input)) {
        backErrorBag.addBackError(new BackError(ValidatorBackErrors.inputIsNotTypeAscii,prepareErrorData));
    }
};

typeLibrary[ValidationTypes.USER_ID] = (input,backErrorBag,prepareErrorData) =>
{
    if(!(EasyValidator.isString(input) || EasyValidator.isNumber(input))) {
        backErrorBag.addBackError(new BackError(ValidatorBackErrors.inputIsNotTypeUserId,prepareErrorData));
    }
};

typeLibrary[ValidationTypes.MONGO_ID] = (input,backErrorBag,prepareErrorData) =>
{
    if(!EasyValidator.isMongoId(input)) {
        backErrorBag.addBackError(new BackError(ValidatorBackErrors.inputIsNotTypeMongoId,prepareErrorData));
    }
};

typeLibrary[ValidationTypes.LAT_LONG] = (input,backErrorBag,prepareErrorData) =>
{
    if(!EasyValidator.isLatLong(input)) {
        backErrorBag.addBackError(new BackError(ValidatorBackErrors.inputIsNotTypeLatLong,prepareErrorData));
    }
};

functionLibrary[nameof<ValueModelConfig>(s => s.regex)] = (input, settings, backErrorBag, prepareErrorData) =>
{
    if(typeof input === 'string') {
        if(typeof settings === 'object' && !(settings instanceof RegExp)) {
            for(let name in settings) {
                if(settings.hasOwnProperty(name)){
                    if(!input.match(settings[name])) {
                        backErrorBag.addNewBackError(ValidatorBackErrors.inputIsNotMatchWithRegex,
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
                backErrorBag.addNewBackError(ValidatorBackErrors.inputIsNotMatchWithRegex,
                    {
                        inputValue : prepareErrorData.inputValue,
                        inputPath : prepareErrorData.inputPath,
                        regex : settings.toString()
                    });
            }
        }
    }
};

functionLibrary[nameof<ValueModelConfig>(s => s.enum)] = (input, settings, backErrorBag, prepareErrorData) =>
{
    if(!EasyValidator.validEnum(settings,input)) {
        backErrorBag.addNewBackError(ValidatorBackErrors.inputIsNotMatchWithEnum,
            {
                inputValue : prepareErrorData.inputValue,
                inputPath : prepareErrorData.inputPath,
                enum : settings
            });
    }
};

functionLibrary[nameof<ValueModelConfig>(s => s.privateEnum)] = (input, settings, backErrorBag, prepareErrorData) =>
{
    if(!EasyValidator.validEnum(settings,input)) {
        backErrorBag.addNewBackError(ValidatorBackErrors.inputIsNotMatchWithPrivateEnum,prepareErrorData);
    }
};

functionLibrary[nameof<ValueModelConfig>(s => s.minLength)] = (input, settings, backErrorBag, prepareErrorData) =>
{
    if(typeof input === 'string' && input.length < settings) {
        backErrorBag.addNewBackError(ValidatorBackErrors.inputNotMatchWithMinLength,
        {
            inputValue : prepareErrorData.inputValue,
            inputPath : prepareErrorData.inputPath,
            minLength : settings
        });
    }
};

functionLibrary[nameof<ValueModelConfig>(s => s.maxLength)] = (input, settings, backErrorBag, prepareErrorData) =>
{
    if(typeof input === 'string' && input.length > settings) {
        backErrorBag.addNewBackError(ValidatorBackErrors.inputNotMatchWithMaxLength,
            {
                inputValue : prepareErrorData.inputValue,
                inputPath : prepareErrorData.inputPath,
                maxLength : settings

            });
    }
};

functionLibrary[nameof<ValueModelConfig>(s => s.length)] = (input, settings, backErrorBag, prepareErrorData) =>
{
    if(typeof input === 'string' && input.length !== settings) {
        backErrorBag.addNewBackError(ValidatorBackErrors.inputNotMatchWithLength,
            {
                inputValue : prepareErrorData.inputValue,
                inputPath : prepareErrorData.inputPath,
                length : settings

            });
    }
};

functionLibrary[nameof<ValueModelConfig>(s => s.contains)] = (input, settings, backErrorBag, prepareErrorData) =>
{
    if(typeof input === 'string') {
        const missingContains = EasyValidator.missingContains(input,settings);
        if(missingContains.length > 0) {
            backErrorBag.addNewBackError(ValidatorBackErrors.inputIsNotContains,
                {
                    inputValue : prepareErrorData.inputValue,
                    inputPath : prepareErrorData.inputPath,
                    shouldContain : settings,
                    missing : missingContains
                });
        }
    }
};

functionLibrary[nameof<ValueModelConfig>(s => s.equals)] = (input, settings, backErrorBag, prepareErrorData) =>
{
    if(!EasyValidator.equals(input,settings)) {
        backErrorBag.addNewBackError(ValidatorBackErrors.inputIsNotEquals,
            {
                inputValue : prepareErrorData.inputValue,
                inputPath : prepareErrorData.inputPath,
                shouldEquals : settings

            });
    }
};

functionLibrary[nameof<ValueModelConfig>(s => s.minValue)] = (input, settings, backErrorBag, prepareErrorData) =>
{
    if(typeof input === 'number' && input < settings) {
        backErrorBag.addNewBackError(ValidatorBackErrors.inputNotMatchWithMinValue,
            {
                inputValue : prepareErrorData.inputValue,
                inputPath : prepareErrorData.inputPath,
                minValue : settings

            });
    }
};

functionLibrary[nameof<ValueModelConfig>(s => s.maxValue)] = (input, settings, backErrorBag, prepareErrorData) =>
{
    if(typeof input === 'number' && input > settings) {
        backErrorBag.addNewBackError(ValidatorBackErrors.inputNotMatchWithMaxValue,
            {
                inputValue : prepareErrorData.inputValue,
                inputPath : prepareErrorData.inputPath,
                maxValue : settings
            });
    }
};

functionLibrary[nameof<ValueModelConfig>(s => s.startsWith)] = (input, settings, backErrorBag, prepareErrorData) =>
{
    if(typeof input === 'string' && !input.startsWith(settings)) {
        backErrorBag.addNewBackError(ValidatorBackErrors.inputIsNotStartsWith,
            {
                inputValue : prepareErrorData.inputValue,
                inputPath : prepareErrorData.inputPath,
                shouldStartsWith : settings

            });
    }
};

functionLibrary[nameof<ValueModelConfig>(s => s.endsWith)] = (input, settings, backErrorBag, prepareErrorData) =>
{
    if(typeof input === 'string' && !input.endsWith(settings)) {
        backErrorBag.addNewBackError(ValidatorBackErrors.inputIsNotEndsWith,
            {
                inputValue : prepareErrorData.inputValue,
                inputPath : prepareErrorData.inputPath,
                shouldEndsWith : settings

            });
    }
};

functionLibrary[nameof<ValueModelConfig>(s => s.letters)] = (input, settings, backErrorBag, prepareErrorData) =>
{
    if(typeof input === 'string') {
        if((settings === FormatLetters.UPPER_CASE) && (!EasyValidator.isUpperCase(input))) {
            backErrorBag.addNewBackError(ValidatorBackErrors.inputIsNotUppercase,prepareErrorData);
        }
        else if((settings === FormatLetters.LOWER_CASE) && (!EasyValidator.isLowerCase(input))) {
            backErrorBag.addNewBackError(ValidatorBackErrors.inputIsNotLowercase,prepareErrorData);
        }
    }
};

functionLibrary[nameof<ValueModelConfig>(s => s.charClass)] = (input, settings, backErrorBag, prepareErrorData) =>
{
    if(typeof input === 'string') {
        if(!input.match(settings)) {
            backErrorBag.addNewBackError(ValidatorBackErrors.inputIsNotMatchWithCharClass,
                {
                    inputValue : prepareErrorData.inputValue,
                    inputPath : prepareErrorData.inputPath,
                    regex : settings.toString()
                });
        }
    }
};

functionLibrary[nameof<ValueModelConfig>(s => s.before)] = async (input, settings, backErrorBag, prepareErrorData, preparedSmallBag) =>
{
    if((typeof input === "string" && EasyValidator.isDate(input)) || input instanceof Date)
    {
        const inputDate : Date = typeof input === 'string' ? new Date(input) : input;
        const checkDate : Date = typeof settings === 'function' ? await settings(preparedSmallBag) : settings;
        if(inputDate > checkDate) {
            backErrorBag.addNewBackError(ValidatorBackErrors.inputDateIsNotBefore,
                {
                    inputValue : prepareErrorData.inputValue,
                    inputPath : prepareErrorData.inputPath,
                    shouldBefore : checkDate
                });
        }
    }
};

functionLibrary[nameof<ValueModelConfig>(s => s.after)] = async (input, settings, backErrorBag, prepareErrorData, preparedSmallBag) =>
{
    if((typeof input === "string" && EasyValidator.isDate(input)) || input instanceof Date)
    {
        const inputDate : Date = typeof input === 'string' ? new Date(input) : input;
        const checkDate : Date = typeof settings === 'function' ? await settings(preparedSmallBag) : settings;
        if(inputDate < checkDate) {
            backErrorBag.addNewBackError(ValidatorBackErrors.inputDateIsNotAfter,
                {
                    inputValue : prepareErrorData.inputValue,
                    inputPath : prepareErrorData.inputPath,
                    shouldAfter : checkDate
                });
        }
    }
};

functionLibrary[nameof<ValueModelConfig>(s => s.minByteSize)] = async (input, settings, backErrorBag, prepareErrorData, preparedSmallBag,type) =>
{
    if(typeof input === "string" && ByteUtils.getByteSize(input,type) < settings)
    {
        backErrorBag.addNewBackError(ValidatorBackErrors.inputNotMatchWithMinByteSize,
            {
                inputValue : prepareErrorData.inputValue,
                inputPath : prepareErrorData.inputPath,
                minByteSize : settings
            });
    }
};

functionLibrary[nameof<ValueModelConfig>(s => s.maxByteSize)] = async (input, settings, backErrorBag, prepareErrorData, preparedSmallBag,type) =>
{
    if(typeof input === "string" && ByteUtils.getByteSize(input,type) > settings)
    {
        backErrorBag.addNewBackError(ValidatorBackErrors.inputNotMatchWithMaxByteSize,
            {
                inputValue : prepareErrorData.inputValue,
                inputPath : prepareErrorData.inputPath,
                maxByteSize : settings
            });
    }
};

functionLibrary[nameof<ValueModelConfig>(s => s.mimeType)] = async (input, settings, backErrorBag, prepareErrorData) =>
{
    if(typeof input === "string")
    {
        if(!Array.isArray(settings)){
            settings = [settings];
        }

        const mime = Base64Utils.getMimeType(input);
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
        backErrorBag.addNewBackError(ValidatorBackErrors.inputNotMatchWithMimeType,
            {
                inputValue : prepareErrorData.inputValue,
                inputPath : prepareErrorData.inputPath,
                mimeType : fails
            });
    }
};

functionLibrary[nameof<ValueModelConfig>(s => s.mimeSubType)] = async (input, settings, backErrorBag, prepareErrorData) =>
{
    if(typeof input === "string")
    {
        if(!Array.isArray(settings)){
            settings = [settings];
        }

        const sub = Base64Utils.getMimeSubType(input);
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
        backErrorBag.addNewBackError(ValidatorBackErrors.inputNotMatchWithMimeSubType,
            {
                inputValue : prepareErrorData.inputValue,
                inputPath : prepareErrorData.inputPath,
                mimeSubType : fails
            });
    }
};

export namespace ValidatorLibrary {
    export const Functions = functionLibrary;
    export const Types = typeLibrary;
}