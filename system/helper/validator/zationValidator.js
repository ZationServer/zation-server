/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

const Validator       = require('validator');
const TaskError       = require('../../api/TaskError');
const TaskErrorBag    = require('../../api/TaskErrorBag');
const validatorError  = require('../zationTaskErrors/validatorTaskErrors');
const cationError     = require('../zationTaskErrors/systemTaskErrors');
const CA              = require('../constante/settings');
const ValidatorConst  = require('../constante/validator');

class ZationValidator
{
    static isString(data)
    {
        return (typeof data === 'string' || data instanceof String);
    }

    static isInt(data)
    {
        // noinspection JSUnresolvedFunction
        return Validator.isInt(data);
    }

    static equals(p1,p2)
    {
        return p1 === p2;
    }

    static isFloat(data)
    {
        // noinspection JSUnresolvedFunction
        return Validator.isFloat(data);
    }

    static isSha512(data)
    {
        // noinspection JSUnresolvedFunction
        return Validator.isHash(data,'Sha512');
    }

    static isSha384(data)
    {
        // noinspection JSUnresolvedFunction
        return Validator.isHash(data,'Sha384');
    }

    static isSha256(data)
    {
        // noinspection JSUnresolvedFunction
        return Validator.isHash(data,'Sha256');
    }

    static isSha1(data)
    {
        // noinspection JSUnresolvedFunction
        return Validator.isHash(data,'Sha1');
    }

    static isHexColor(data)
    {
        // noinspection JSUnresolvedFunction
        return Validator.isHexColor(data);
    }

    static isMd5(data)
    {
        // noinspection JSUnresolvedFunction
        return Validator.isHash(data,'md5');
    }

    static isJSON(data)
    {
        // noinspection JSUnresolvedFunction
        return Validator.isJSON(data);
    }

    static isHexadecimal(data)
    {
        // noinspection JSUnresolvedFunction
        return Validator.isHexadecimal(data);
    }

    static isIP5(data)
    {
        // noinspection JSUnresolvedFunction
        return Validator.isIP(data,'4');
    }

    static isIP6(data)
    {
        // noinspection JSUnresolvedFunction
        return Validator.isIP(data,'6');
    }

    static isISB10(data)
    {
        // noinspection JSUnresolvedFunction
        return Validator.isISBN(data,'10');
    }

    static isISB13(data)
    {
        // noinspection JSUnresolvedFunction
        return Validator.isISBN(data,'13');
    }

    static isUrl(data)
    {
        // noinspection JSUnresolvedFunction
        return Validator.isURL(data);
    }

    static isMimeType(data)
    {
        // noinspection JSUnresolvedFunction
        return Validator.isMimeType(data);
    }

    static isMACAddress(data)
    {
        // noinspection JSUnresolvedFunction
        return Validator.isMACAddress(data);
    }

    static isMobilePhone(data)
    {
        // noinspection JSUnresolvedFunction
        return Validator.isMobilePhone(data);
    }

    static isUUID3(data)
    {
        // noinspection JSUnresolvedFunction
        return Validator.isUUID(data,'3');
    }

    static isUUID4(data)
    {
        // noinspection JSUnresolvedFunction
        return Validator.isUUID(data,'4');
    }

    static isUUID5(data)
    {
        // noinspection JSUnresolvedFunction
        return Validator.isUUID(data,'5');
    }

    static isBase64(data)
    {
        // noinspection JSUnresolvedFunction
        return Validator.isBase64(data);
    }

    static isLatLong(data)
    {
        // noinspection JSUnresolvedFunction
        return Validator.isLatLong(data);
    }

    static isAscii(data)
    {
        // noinspection JSUnresolvedFunction
        return Validator.isAscii(data);
    }

    static isBoolean(data)
    {
        // noinspection JSUnresolvedFunction
        return Validator.isBoolean(data);
    }

    static isUpperCase(data)
    {
        if (typeof data === 'string' || data instanceof String)
        {
            return data.toUpperCase() === data;
        }
        else
        {
            return false;
        }
    }

    static isLowerCase(data)
    {
        if (typeof data === 'string' || data instanceof String)
        {
            return data.toLowerCase() === data;
        }
        else
        {
            return false;
        }
    }

    static isDate(data)
    {
        // noinspection JSUnresolvedFunction
        let date = Validator.toDate(data);
        if(date !== null)
        {
            return {
                convertedDate : date,
                isDate        : true
            }
        }
        else
        {
            return {
                isDate : false
            }

        }
    }

    static stringToBool(data)
    {
        let result = false;
        if(data !== '1' || data !== '0' )
        {
            result = data.toUpperCase() === 'true'
        }
        else
        {
            result = data === '1';
        }
        return result;
    }

    static isEmail(data)
    {
        // noinspection JSUnresolvedFunction
        return Validator.isEmail(data);
    }

    static validateThis(param,input,taskErrorBag)
    {

        let inputName = param[CA.PARAMS_NAME];

        let errorData = {
            paramValue : input,
            paramName : inputName
        };

        for(let k in param)
        {
            let v = '';
            if(param.hasOwnProperty(k))
            {
                v = param[k];
            }

            //Performance Boost
            if(k === CA.PARAMS_NAME)
            {
                continue;
            }


            if(k === ValidatorConst.TYPE && (v !== ValidatorConst.TYPE_ALL))
            {
                if(Array.isArray(v))
                {
                    let taskErrorBagTemp = new TaskErrorBag();
                    let tempInput        = input;

                    for(let i = 0; i < v.length; i++)
                    {
                        let tempCount = taskErrorBagTemp.getTaskErrorCount();
                        let maybeInput = ZationValidator.validateType(taskErrorBagTemp,v[i],input,errorData);
                        if(tempCount === taskErrorBagTemp.getTaskErrorCount())
                        {
                            tempInput = maybeInput;
                        }
                    }

                    if(taskErrorBagTemp.getTaskErrorCount() < v.length)
                    {
                        input = tempInput;
                    }
                    else
                    {
                        taskErrorBag.addErrorsFromTaskErrorBag(taskErrorBagTemp);
                    }
                }
                else
                {
                    input = ZationValidator.validateType(taskErrorBag,v,input,errorData);
                }
            }
            else if(k === ValidatorConst.FUNCTION_REGEX && v !== undefined)
            {
                let regex  = new RegExp(v);
                if(!regex.test(input))
                {
                    taskErrorBag.addTaskErrorFast(validatorError.paramIsNotMatchWithRegex,
                        {
                            paramValue : input,
                            paramName : inputName,
                            regex : v

                        });
                }
            }
            else if(k === ValidatorConst.FUNCTION_MIN_LENGTH && v !== undefined)
            {
                if(input.length < v)
                {

                    taskErrorBag.addTaskErrorFast(validatorError.paramNotMatchWithMinLength,
                        {
                            paramValue : input,
                            paramName : inputName,
                            minLength : v

                        });
                }
            }
            else if(k === ValidatorConst.FUNCTION_MAX_LENGTH && v !== undefined)
            {
                if(input.length > v)
                {

                    taskErrorBag.addTaskErrorFast(validatorError.paramNotMatchWithMaxLength,
                        {
                            paramValue : input,
                            paramName : inputName,
                            maxLength : v

                        });
                }
            }
            else if(k === ValidatorConst.FUNCTION_LENGTH && v !== undefined)
            {
                if(input.length === v)
                {

                    taskErrorBag.addTaskErrorFast(validatorError.paramNotMatchWithLength,
                        {
                            paramValue : input,
                            paramName : inputName,
                            length : v

                        });
                }
            }
            else if(k === ValidatorConst.FUNCTION_CONTAINS && v !== undefined)
            {
                if(input.indexOf(v) === -1)
                {

                    taskErrorBag.addTaskErrorFast(validatorError.paramNotMatchWithContains,
                        {
                            paramValue : input,
                            paramName : inputName,
                            shouldContain : v

                        });
                }
            }
            else if(k === ValidatorConst.FUNCTION_EQUALS && v !== undefined)
            {
                if(input !== v)
                {

                    taskErrorBag.addTaskErrorFast(validatorError.paramIsNotEquals,
                        {
                            paramValue : input,
                            paramName : inputName,
                            shouldEquals : v

                        });
                }
            }
            else if(k === ValidatorConst.FUNCTION_BIGGER_THAN && v !== undefined)
            {
                if(input < v)
                {

                    taskErrorBag.addTaskErrorFast(validatorError.paramIsNotBiggerThan,
                        {
                            paramValue : input,
                            paramName : inputName,
                            shouldBiggerThan : v

                        });
                }
            }
            else if(k === ValidatorConst.FUNCTION_LESSER_THAN && v !== undefined)
            {
                if(input > v)
                {

                    taskErrorBag.addTaskErrorFast(validatorError.paramIsNotLesserThan,
                        {
                            paramValue : input,
                            paramName : inputName,
                            shouldLesserThan : v

                        });
                }
            }
            else if(k === ValidatorConst.FUNCTION_STARTS_WITH && v !== undefined)
            {
                if(!input.startsWith(v))
                {

                    taskErrorBag.addTaskErrorFast(validatorError.paramIsNotStartsWith,
                        {
                            paramValue : input,
                            paramName : inputName,
                            shouldStartsWith : v

                        });
                }
            }
            else if(k === ValidatorConst.FUNCTION_ENDS_WITH && v !== undefined)
            {
                if(!input.endsWith(v))
                {

                    taskErrorBag.addTaskErrorFast(validatorError.paramIsNotEndsWith,
                        {
                            paramValue : input,
                            paramName : inputName,
                            shouldEndsWith : v

                        });
                }
            }
            else if(k === ValidatorConst.FORMAT_IS_LETTERS && v !== undefined)
            {
                if((v === ValidatorConst.FORMAT_LETTERS_UPPER_CASE) && (!this.isUpperCase(input)))
                {
                    taskErrorBag.addTaskErrorFast(validatorError.paramIsNotUppercase,errorData);
                }
                else if((v === ValidatorConst.FORMAT_LETTERS_LOWER_CASE) && (!this.isLowerCase(input)))
                {
                    taskErrorBag.addTaskErrorFast(validatorError.paramIsNotLowercase,errorData);
                }
            }

        }
        return input;
    }

    static validateType(taskErrorBag,v,input,errorData)
    {
        if((v === ValidatorConst.TYPE_STRING))
        {
            if(!ZationValidator.isString(input))
            {
                taskErrorBag.addTaskError(new TaskError(validatorError.paramIsNotAString,errorData));
            }
        }
        else if((v === ValidatorConst.TYPE_INT))
        {
            if(ZationValidator.isInt(input))
            {
                input  = parseInt(input);
            }
            else
            {
                taskErrorBag.addTaskError(new TaskError(validatorError.paramIsNotAInt,errorData));
            }
        }
        else if((v === ValidatorConst.TYPE_FLOAT))
        {
            if(ZationValidator.isFloat(input))
            {
                input  = parseFloat(input);
            }
            else
            {
                taskErrorBag.addTaskError(new TaskError(validatorError.paramIsNotAFloat,errorData));
            }
        }
        else if((v === ValidatorConst.TYPE_DATE))
        {
            let date = ZationValidator.isDate(input);

            if(date.isDate)
            {
                input  = date.convertedDate;
            }
            else
            {
                taskErrorBag.addTaskError(new TaskError(validatorError.paramIsNotADate,errorData));
            }
        }
        else if(v === ValidatorConst.TYPE_EMAIL)
        {
            if(!this.isEmail(input))
            {
                taskErrorBag.addTaskError(new TaskError(validatorError.paramIsNotAEmail,errorData));
            }
        }
        else if((v === ValidatorConst.TYPE_BOOLEAN))
        {
            if(ZationValidator.isBoolean(input))
            {
                input  = ZationValidator.stringToBool(input);
            }
            else
            {
                taskErrorBag.addTaskError(new TaskError(validatorError.paramIsNotABoolean,errorData));
            }
        }
        else if(v === ValidatorConst.TYPE_SHA512)
        {
            if(!ZationValidator.isSha512(input))
            {
                taskErrorBag.addTaskError(new TaskError(validatorError.paramIsNotASha512,errorData));
            }
        }
        else if(v === ValidatorConst.TYPE_SHA256)
        {
            if(!ZationValidator.isSha256(input))
            {
                taskErrorBag.addTaskError(new TaskError(validatorError.paramIsNotASha256,errorData));
            }
        }
        else if(v === ValidatorConst.TYPE_SHA384)
        {
            if(!ZationValidator.isSha384(input))
            {
                taskErrorBag.addTaskError(new TaskError(validatorError.paramIsNotASha384,errorData));
            }
        }
        else if(v === ValidatorConst.TYPE_SHA1)
        {
            if(!ZationValidator.isSha1(input))
            {
                taskErrorBag.addTaskError(new TaskError(validatorError.paramIsNotASha1,errorData));
            }
        }
        else if(v === ValidatorConst.TYPE_MD5)
        {
            if(!ZationValidator.isMd5(input))
            {
                taskErrorBag.addTaskError(new TaskError(validatorError.paramIsNotAMd5,errorData));
            }
        }
        else if(v === ValidatorConst.TYPE_HEX_COLOR)
        {
            if(!ZationValidator.isHexColor(input))
            {
                taskErrorBag.addTaskError(new TaskError(validatorError.paramIsNotAHexColor,errorData));
            }
        }
        else if(v === ValidatorConst.TYPE_HEXADECIMAL)
        {
            if(!ZationValidator.isHexadecimal(input))
            {
                taskErrorBag.addTaskError(new TaskError(validatorError.paramIsNotAHexadecimal,errorData));
            }
        }
        else if(v === ValidatorConst.TYPE_IP_5)
        {
            if(!ZationValidator.isIP5(input))
            {
                taskErrorBag.addTaskError(new TaskError(validatorError.paramIsNotAIp5,errorData));
            }
        }
        else if(v === ValidatorConst.TYPE_IP_6)
        {
            if(!ZationValidator.isIP6(input))
            {
                taskErrorBag.addTaskError(new TaskError(validatorError.paramIsNotAIp6,errorData));
            }
        }
        else if(v === ValidatorConst.TYPE_ISBN_10)
        {
            if(!ZationValidator.isISB10(input))
            {
                taskErrorBag.addTaskError(new TaskError(validatorError.paramIsNotAIsbn10,errorData));
            }
        }
        else if(v === ValidatorConst.TYPE_ISBN_13)
        {
            if(!ZationValidator.isISB13(input))
            {
                taskErrorBag.addTaskError(new TaskError(validatorError.paramIsNotAIsbn13,errorData));
            }
        }
        else if(v === ValidatorConst.TYPE_JSON)
        {
            if(!ZationValidator.isJSON(input))
            {
                taskErrorBag.addTaskError(new TaskError(validatorError.paramIsNotAJson,errorData));
            }
        }
        else if(v === ValidatorConst.TYPE_URL)
        {
            if(!ZationValidator.isUrl(input))
            {
                taskErrorBag.addTaskError(new TaskError(validatorError.paramIsNotAUrl,errorData));
            }
        }
        else if(v === ValidatorConst.TYPE_MIME_TYPE)
        {
            if(!ZationValidator.isMimeType(input))
            {
                taskErrorBag.addTaskError(new TaskError(validatorError.paramIsNotAMimeType,errorData));
            }
        }
        else if(v === ValidatorConst.TYPE_MAC_ADDRESS)
        {
            if(!ZationValidator.isMACAddress(input))
            {
                taskErrorBag.addTaskError(new TaskError(validatorError.paramIsNotAMacAddress,errorData));
            }
        }
        else if(v === ValidatorConst.TYPE_MOBILE_NUMBER)
        {
            if(!ZationValidator.isMobilePhone(input))
            {
                taskErrorBag.addTaskError(new TaskError(validatorError.paramIsNotAMobileNumber,errorData));
            }
        }
        else if(v === ValidatorConst.TYPE_UUID_3)
        {
            if(!ZationValidator.isUUID3(input))
            {
                taskErrorBag.addTaskError(new TaskError(validatorError.paramIsNotAUuid3,errorData));
            }
        }
        else if(v === ValidatorConst.TYPE_UUID_4)
        {
            if(!ZationValidator.isUUID4(input))
            {
                taskErrorBag.addTaskError(new TaskError(validatorError.paramIsNotAUuid4,errorData));
            }
        }
        else if(v === ValidatorConst.TYPE_UUID_5)
        {
            if(!ZationValidator.isUUID5(input))
            {
                taskErrorBag.addTaskError(new TaskError(validatorError.paramIsNotAUuid5,errorData));
            }
        }
        else if(v === ValidatorConst.TYPE_LAT_LONG)
        {
            if(!ZationValidator.isLatLong(input))
            {
                taskErrorBag.addTaskError(new TaskError(validatorError.paramIsNotALatLong,errorData));
            }
        }
        else if(v === ValidatorConst.TYPE_BASE64)
        {
            if(!ZationValidator.isBase64(input))
            {
                taskErrorBag.addTaskError(new TaskError(validatorError.paramIsNotABase64,errorData));
            }
        }
        else if(v === ValidatorConst.TYPE_ASCII)
        {
            if(!ZationValidator.isAscii(input))
            {
                taskErrorBag.addTaskError(new TaskError(validatorError.paramIsNotAAscii,errorData));
            }
        }
        else if(v === '')
        {
            taskErrorBag.addTaskError(new TaskError(cationError.noValidatorTypeValue));
        }
        else if(v.length > 0)
        {
            taskErrorBag.addTaskError(new TaskError(cationError.notValidValidatorTypeValue),{value : v});
        }
        return input;
    }
}



module.exports = ZationValidator;