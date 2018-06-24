/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

const ValidatorLibrary  = require('./validatorLibrary');
const TaskError         = require('../../api/TaskError');
const TaskErrorBag      = require('../../api/TaskErrorBag');
const ValidatorErrors   = require('../zationTaskErrors/validatorTaskErrors');
const Const             = require('../constants/constWrapper');
const Logger            = require('./../logger/logger');

class ValidatorEngine
{
    static validateValue(input,config,currentPath,errorBag)
    {
        let preparedErrorData = {
            inputValue : input,
            inputPath : currentPath
        };

        for(let cKey in config)
        {
            if(config.hasOwnProperty(cKey))
            {
                let cValue = config[cKey];

                //Performance Boost
                if(cKey === Const.App.INPUT.IS_OPTIONAL)
                {
                    continue;
                }

                if(cKey === Const.Validator.TYPE && (cValue !== Const.Validator.TYPE.ALL))
                {
                    if(Array.isArray(cValue))
                    {
                        let foundAValidTyp = false;
                        let errorBagTemp = new TaskErrorBag();
                        for(let i = 0; i < cValue.length; i++)
                        {
                            let tempErrorCount = errorBag.getTaskErrorCount();

                            let maybeInput =
                                ValidatorEngine._validateType(input,cValue[i],errorBagTemp,preparedErrorData);

                            if(tempErrorCount === errorBagTemp.getTaskErrorCount())
                            {
                                input = maybeInput;
                                foundAValidTyp = true;
                                break;
                            }
                        }
                        if(!foundAValidTyp)
                        {
                            errorBag.addTaskError(new TaskError(ValidatorErrors.noValidTypeWasFound,
                                {
                                    inputPath : preparedErrorData.inputPath,
                                    inputValue : input,
                                    types : cValue
                                }));
                        }
                    }
                    else
                    {
                        input = ValidatorEngine._validateType(input,cValue,errorBag,preparedErrorData);
                    }
                }
                else if(ValidatorLibrary.function.hasOwnProperty(cKey))
                {
                    let funcValidator = ValidatorLibrary.function[cKey];
                    input = funcValidator(input,cValue,errorBag,preparedErrorData);
                }
            }
        }
        return input;
    }

    static _validateType(input,type,errorBag,preparedErrorData)
    {
        if(ValidatorLibrary.type.hasOwnProperty(type))
        {
            let typeValidator = ValidatorLibrary.type[type];
            input = typeValidator(input,errorBag,preparedErrorData);
        }
        else if(type === '')
        {
           Logger.printConfigWarning
           (Const.Settings.CN.APP,`No validator type in inputPath: '${preparedErrorData.inputPath}' found.`)
        }
        else if(type.length > 0)
        {
            Logger.printConfigWarning
            (Const.Settings.CN.APP,`No valid validator type in inputPath: '${preparedErrorData.inputPath}'.`)
        }
        return input;
    }

    static validateArray(array,arrayConfig,currentPath,errorBag)
    {
        let isOk = true;
        if(arrayConfig.hasOwnProperty(Const.App.ARRAY.LENGTH))
        {
            let length = arrayConfig[Const.App.ARRAY.LENGTH];
            if(array.length !== length)
            {
                isOk = false;
                errorBag.addTaskError(new TaskError(ValidatorErrors.inputArrayNotMatchWithLength,
                    {
                        inputValue : array,
                        inputPath : currentPath,
                        length : length
                    }));
            }
        }
        if(arrayConfig.hasOwnProperty(Const.App.ARRAY.MIN_LENGTH))
        {
            let minLength = arrayConfig[Const.App.ARRAY.MIN_LENGTH];
            if(array.length < minLength)
            {
                isOk = false;
                errorBag.addTaskError(new TaskError(ValidatorErrors.inputArrayNotMatchWithMinLength,
                    {
                        inputValue : array,
                        inputPath : currentPath,
                        minLength : minLength
                    }));
            }
        }
        if(arrayConfig.hasOwnProperty(Const.App.ARRAY.MAX_LENGTH))
        {
            let maxLength = arrayConfig[Const.App.ARRAY.MAX_LENGTH];
            if(array.length > maxLength)
            {
                isOk = false;
                errorBag.addTaskError(new TaskError(ValidatorErrors.inputArrayNotMatchWithMaxLength,
                    {
                        inputValue : array,
                        inputPath : currentPath,
                        maxLength : maxLength
                    }));
            }
        }
        return isOk;
    }
}



module.exports = ValidatorEngine;