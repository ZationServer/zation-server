/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import ValidatorLibrary  = require('./validatorLibrary');
import TaskError         = require('../../api/TaskError');
import TaskErrorBag      = require('../../api/TaskErrorBag');
import ValidatorErrors   = require('../zationTaskErrors/validatorTaskErrors');
import Const             = require('../constants/constWrapper');
import Logger            = require('../logger/logger');
import FuncTools         = require("../tools/funcTools");
import SmallBag          = require("../../api/SmallBag");

class ValidatorEngine
{
    static async validateValue(input,config : object,preparedErrorData : {inputPath : string,inputValue : any},errorBag : TaskErrorBag,preparedSmallBag : SmallBag) : Promise<any>
    {
        for(let cKey in config)
        {
            if(config.hasOwnProperty(cKey))
            {
                const cValue = config[cKey];
                if(cKey === Const.Validator.KEYS.VALIDATE) {
                    //own validate
                    await FuncTools.emitEvent(cValue,input,errorBag,preparedErrorData.inputPath,preparedSmallBag);
                }
                else if(ValidatorLibrary.function.hasOwnProperty(cKey)) {
                    ValidatorLibrary.function[cKey](input,cValue,errorBag,preparedErrorData);
                }
            }
        }
    }

    static validateValueType(input,type,strictType,preparedErrorData : {inputPath : string,inputValue : any},errorBag : TaskErrorBag)
    {
        if(type !== undefined && type !== Const.Validator.TYPE.ALL) {
            if(Array.isArray(type))
            {
                let foundAValidTyp = false;
                let errorBagTemp = new TaskErrorBag();
                for(let i = 0; i < type.length; i++) {
                    let tempErrorCount = errorBag.getTaskErrorCount();
                    ValidatorEngine.validateType(input,type[i],strictType,errorBagTemp,preparedErrorData);
                    if(tempErrorCount === errorBagTemp.getTaskErrorCount()) {
                        foundAValidTyp = true;
                        break;
                    }
                }
                if(!foundAValidTyp) {
                    errorBag.addTaskError(new TaskError(ValidatorErrors.noValidTypeWasFound,
                        {
                            inputPath : preparedErrorData.inputPath,
                            inputValue : preparedErrorData.inputValue,
                            types : type
                        }));
                }
            }
            else {
                ValidatorEngine.validateType(input,type,strictType,errorBag,preparedErrorData);
            }
        }
    }

    private static validateType(input,type,strictType,errorBag,preparedErrorData)
    {
        if(ValidatorLibrary.type.hasOwnProperty(type)) {
            ValidatorLibrary.type[type](input,errorBag,preparedErrorData,strictType);
        }
        else if(type === '') {
           Logger.printConfigWarning
           (Const.Settings.CN.APP,`No validator type in inputPath: '${preparedErrorData.inputPath}' found.`)
        }
        else if(type.length > 0) {
            Logger.printConfigWarning
            (Const.Settings.CN.APP,`No valid validator type in inputPath: '${preparedErrorData.inputPath}'.`)
        }
    }

    static validateArray(array,arrayConfig,currentPath,errorBag)
    {
        let isOk = true;
        if(arrayConfig.hasOwnProperty(Const.App.ARRAY.LENGTH))
        {
            const length = arrayConfig[Const.App.ARRAY.LENGTH];
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
            const minLength = arrayConfig[Const.App.ARRAY.MIN_LENGTH];
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
            const maxLength = arrayConfig[Const.App.ARRAY.MAX_LENGTH];
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



export = ValidatorEngine;