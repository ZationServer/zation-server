/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

const EasyValidator   = require('./easyValidator');
const TaskError       = require('../../api/TaskError');
const TaskErrorBag    = require('../../api/TaskErrorBag');
const ValidatorErrors = require('../zationTaskErrors/validatorTaskErrors');
const MainErrors      = require('../zationTaskErrors/mainTaskErrors');
const Const           = require('../constante/constWrapper');

class ValidatorEngine
{

    static validateThis(param,input,taskErrorBag)
    {

        let inputName = param[Const.Settings.PARAMS_NAME];

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
            if(k === Const.Settings.PARAMS_NAME)
            {
                continue;
            }


            if(k === Const.Validator.TYPE && (v !== Const.Validator.TYPE_ALL))
            {
                if(Array.isArray(v))
                {
                    let taskErrorBagTemp = new TaskErrorBag();
                    let tempInput        = input;

                    for(let i = 0; i < v.length; i++)
                    {
                        let tempCount = taskErrorBagTemp.getTaskErrorCount();
                        let maybeInput = ValidatorEngine._validateType(taskErrorBagTemp,v[i],input,errorData);
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
                    input = ValidatorEngine._validateType(taskErrorBag,v,input,errorData);
                }
            }
            else if(k === Const.Validator.FUNCTION_REGEX && v !== undefined)
            {
                let regex  = new RegExp(v);
                if(!regex.test(input))
                {
                    taskErrorBag.addTaskErrorFast(ValidatorErrors.paramIsNotMatchWithRegex,
                        {
                            paramValue : input,
                            paramName : inputName,
                            regex : v

                        });
                }
            }
            else if(k === Const.Validator.FUNCTION_ENUM && v !== undefined && Array.isArray(v))
            {
                if(!EasyValidator.validEnum(v,input))
                {
                    taskErrorBag.addTaskErrorFast(ValidatorErrors.paramIsNotMatchWithEnum,
                        {
                            paramValue : input,
                            paramName : inputName,
                            enum : v
                        });
                }
            }
            else if(k === Const.Validator.FUNCTION_PRIVATE_ENUM && v !== undefined && Array.isArray(v))
            {
                if(!EasyValidator.validEnum(v,input))
                {
                    taskErrorBag.addTaskErrorFast(ValidatorErrors.paramIsNotMatchWithPrivateEnum,
                        {
                            paramValue : input,
                            paramName : inputName
                        });
                }
            }
            else if(k === Const.Validator.FUNCTION_MIN_LENGTH && v !== undefined)
            {
                if(input.length < v)
                {

                    taskErrorBag.addTaskErrorFast(ValidatorErrors.paramNotMatchWithMinLength,
                        {
                            paramValue : input,
                            paramName : inputName,
                            minLength : v

                        });
                }
            }
            else if(k === Const.Validator.FUNCTION_MAX_LENGTH && v !== undefined)
            {
                if(input.length > v)
                {

                    taskErrorBag.addTaskErrorFast(ValidatorErrors.paramNotMatchWithMaxLength,
                        {
                            paramValue : input,
                            paramName : inputName,
                            maxLength : v

                        });
                }
            }
            else if(k === Const.Validator.FUNCTION_LENGTH && v !== undefined)
            {
                if(input.length === v)
                {

                    taskErrorBag.addTaskErrorFast(ValidatorErrors.paramNotMatchWithLength,
                        {
                            paramValue : input,
                            paramName : inputName,
                            length : v

                        });
                }
            }
            else if(k === Const.Validator.FUNCTION_CONTAINS && v !== undefined)
            {
                if(input.indexOf(v) === -1)
                {

                    taskErrorBag.addTaskErrorFast(ValidatorErrors.paramNotMatchWithContains,
                        {
                            paramValue : input,
                            paramName : inputName,
                            shouldContain : v

                        });
                }
            }
            else if(k === Const.Validator.FUNCTION_EQUALS && v !== undefined)
            {
                if(input !== v)
                {

                    taskErrorBag.addTaskErrorFast(ValidatorErrors.paramIsNotEquals,
                        {
                            paramValue : input,
                            paramName : inputName,
                            shouldEquals : v

                        });
                }
            }
            else if(k === Const.Validator.FUNCTION_BIGGER_THAN && v !== undefined)
            {
                if(input < v)
                {

                    taskErrorBag.addTaskErrorFast(ValidatorErrors.paramIsNotBiggerThan,
                        {
                            paramValue : input,
                            paramName : inputName,
                            shouldBiggerThan : v

                        });
                }
            }
            else if(k === Const.Validator.FUNCTION_LESSER_THAN && v !== undefined)
            {
                if(input > v)
                {

                    taskErrorBag.addTaskErrorFast(ValidatorErrors.paramIsNotLesserThan,
                        {
                            paramValue : input,
                            paramName : inputName,
                            shouldLesserThan : v

                        });
                }
            }
            else if(k === Const.Validator.FUNCTION_STARTS_WITH && v !== undefined)
            {
                if(!input.startsWith(v))
                {

                    taskErrorBag.addTaskErrorFast(ValidatorErrors.paramIsNotStartsWith,
                        {
                            paramValue : input,
                            paramName : inputName,
                            shouldStartsWith : v

                        });
                }
            }
            else if(k === Const.Validator.FUNCTION_ENDS_WITH && v !== undefined)
            {
                if(!input.endsWith(v))
                {

                    taskErrorBag.addTaskErrorFast(ValidatorErrors.paramIsNotEndsWith,
                        {
                            paramValue : input,
                            paramName : inputName,
                            shouldEndsWith : v

                        });
                }
            }
            else if(k === Const.Validator.FORMAT_IS_LETTERS && v !== undefined)
            {
                if((v === Const.Validator.FORMAT_LETTERS_UPPER_CASE) && (!EasyValidator.isUpperCase(input)))
                {
                    taskErrorBag.addTaskErrorFast(ValidatorErrors.paramIsNotUppercase,errorData);
                }
                else if((v === Const.Validator.FORMAT_LETTERS_LOWER_CASE) && (!EasyValidator.isLowerCase(input)))
                {
                    taskErrorBag.addTaskErrorFast(ValidatorErrors.paramIsNotLowercase,errorData);
                }
            }

        }
        return input;
    }

    static _validateType(taskErrorBag,v,input,errorData)
    {
        if((v === Const.Validator.TYPE_STRING))
        {
            if(!EasyValidator.isString(input))
            {
                taskErrorBag.addTaskError(new TaskError(ValidatorErrors.paramIsNotAString,errorData));
            }
        }
        else if((v === Const.Validator.TYPE_INT))
        {
            if(EasyValidator.isInt(input))
            {
                input  = parseInt(input);
            }
            else
            {
                taskErrorBag.addTaskError(new TaskError(ValidatorErrors.paramIsNotAInt,errorData));
            }
        }
        else if((v === Const.Validator.TYPE_FLOAT))
        {
            if(EasyValidator.isFloat(input))
            {
                input  = parseFloat(input);
            }
            else
            {
                taskErrorBag.addTaskError(new TaskError(ValidatorErrors.paramIsNotAFloat,errorData));
            }
        }
        else if((v === Const.Validator.TYPE_DATE))
        {
            let date = EasyValidator.isDate(input);

            if(date.isDate)
            {
                input  = date.convertedDate;
            }
            else
            {
                taskErrorBag.addTaskError(new TaskError(ValidatorErrors.paramIsNotADate,errorData));
            }
        }
        else if(v === Const.Validator.TYPE_EMAIL)
        {
            if(!EasyValidator.isEmail(input))
            {
                taskErrorBag.addTaskError(new TaskError(ValidatorErrors.paramIsNotAEmail,errorData));
            }
        }
        else if((v === Const.Validator.TYPE_BOOLEAN))
        {
            if(EasyValidator.isBoolean(input))
            {
                input  = EasyValidator.stringToBool(input);
            }
            else
            {
                taskErrorBag.addTaskError(new TaskError(ValidatorErrors.paramIsNotABoolean,errorData));
            }
        }
        else if(v === Const.Validator.TYPE_SHA512)
        {
            if(!EasyValidator.isSha512(input))
            {
                taskErrorBag.addTaskError(new TaskError(ValidatorErrors.paramIsNotASha512,errorData));
            }
        }
        else if(v === Const.Validator.TYPE_SHA256)
        {
            if(!EasyValidator.isSha256(input))
            {
                taskErrorBag.addTaskError(new TaskError(ValidatorErrors.paramIsNotASha256,errorData));
            }
        }
        else if(v === Const.Validator.TYPE_SHA384)
        {
            if(!EasyValidator.isSha384(input))
            {
                taskErrorBag.addTaskError(new TaskError(ValidatorErrors.paramIsNotASha384,errorData));
            }
        }
        else if(v === Const.Validator.TYPE_SHA1)
        {
            if(!EasyValidator.isSha1(input))
            {
                taskErrorBag.addTaskError(new TaskError(ValidatorErrors.paramIsNotASha1,errorData));
            }
        }
        else if(v === Const.Validator.TYPE_MD5)
        {
            if(!EasyValidator.isMd5(input))
            {
                taskErrorBag.addTaskError(new TaskError(ValidatorErrors.paramIsNotAMd5,errorData));
            }
        }
        else if(v === Const.Validator.TYPE_HEX_COLOR)
        {
            if(!EasyValidator.isHexColor(input))
            {
                taskErrorBag.addTaskError(new TaskError(ValidatorErrors.paramIsNotAHexColor,errorData));
            }
        }
        else if(v === Const.Validator.TYPE_HEXADECIMAL)
        {
            if(!EasyValidator.isHexadecimal(input))
            {
                taskErrorBag.addTaskError(new TaskError(ValidatorErrors.paramIsNotAHexadecimal,errorData));
            }
        }
        else if(v === Const.Validator.TYPE_IP_5)
        {
            if(!EasyValidator.isIP5(input))
            {
                taskErrorBag.addTaskError(new TaskError(ValidatorErrors.paramIsNotAIp5,errorData));
            }
        }
        else if(v === Const.Validator.TYPE_IP_6)
        {
            if(!EasyValidator.isIP6(input))
            {
                taskErrorBag.addTaskError(new TaskError(ValidatorErrors.paramIsNotAIp6,errorData));
            }
        }
        else if(v === Const.Validator.TYPE_ISBN_10)
        {
            if(!EasyValidator.isISB10(input))
            {
                taskErrorBag.addTaskError(new TaskError(ValidatorErrors.paramIsNotAIsbn10,errorData));
            }
        }
        else if(v === Const.Validator.TYPE_ISBN_13)
        {
            if(!EasyValidator.isISB13(input))
            {
                taskErrorBag.addTaskError(new TaskError(ValidatorErrors.paramIsNotAIsbn13,errorData));
            }
        }
        else if(v === Const.Validator.TYPE_JSON)
        {
            if(!EasyValidator.isJSON(input))
            {
                taskErrorBag.addTaskError(new TaskError(ValidatorErrors.paramIsNotAJson,errorData));
            }
        }
        else if(v === Const.Validator.TYPE_URL)
        {
            if(!EasyValidator.isUrl(input))
            {
                taskErrorBag.addTaskError(new TaskError(ValidatorErrors.paramIsNotAUrl,errorData));
            }
        }
        else if(v === Const.Validator.TYPE_MIME_TYPE)
        {
            if(!EasyValidator.isMimeType(input))
            {
                taskErrorBag.addTaskError(new TaskError(ValidatorErrors.paramIsNotAMimeType,errorData));
            }
        }
        else if(v === Const.Validator.TYPE_MAC_ADDRESS)
        {
            if(!EasyValidator.isMACAddress(input))
            {
                taskErrorBag.addTaskError(new TaskError(ValidatorErrors.paramIsNotAMacAddress,errorData));
            }
        }
        else if(v === Const.Validator.TYPE_MOBILE_NUMBER)
        {
            if(!EasyValidator.isMobilePhone(input))
            {
                taskErrorBag.addTaskError(new TaskError(ValidatorErrors.paramIsNotAMobileNumber,errorData));
            }
        }
        else if(v === Const.Validator.TYPE_UUID_3)
        {
            if(!EasyValidator.isUUID3(input))
            {
                taskErrorBag.addTaskError(new TaskError(ValidatorErrors.paramIsNotAUuid3,errorData));
            }
        }
        else if(v === Const.Validator.TYPE_UUID_4)
        {
            if(!EasyValidator.isUUID4(input))
            {
                taskErrorBag.addTaskError(new TaskError(ValidatorErrors.paramIsNotAUuid4,errorData));
            }
        }
        else if(v === Const.Validator.TYPE_UUID_5)
        {
            if(!EasyValidator.isUUID5(input))
            {
                taskErrorBag.addTaskError(new TaskError(ValidatorErrors.paramIsNotAUuid5,errorData));
            }
        }
        else if(v === Const.Validator.TYPE_LAT_LONG)
        {
            if(!EasyValidator.isLatLong(input))
            {
                taskErrorBag.addTaskError(new TaskError(ValidatorErrors.paramIsNotALatLong,errorData));
            }
        }
        else if(v === Const.Validator.TYPE_BASE64)
        {
            if(!EasyValidator.isBase64(input))
            {
                taskErrorBag.addTaskError(new TaskError(ValidatorErrors.paramIsNotABase64,errorData));
            }
        }
        else if(v === Const.Validator.TYPE_ASCII)
        {
            if(!EasyValidator.isAscii(input))
            {
                taskErrorBag.addTaskError(new TaskError(ValidatorErrors.paramIsNotAAscii,errorData));
            }
        }
        else if(v === '')
        {
            taskErrorBag.addTaskError(new TaskError(MainErrors.noValidatorTypeValue));
        }
        else if(v.length > 0)
        {
            taskErrorBag.addTaskError(new TaskError(MainErrors.notValidValidatorTypeValue),{value : v});
        }
        return input;
    }
}



module.exports = ValidatorEngine;