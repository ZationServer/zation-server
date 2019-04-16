/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import ValidatorLibrary  = require('./validatorLibrary');
import TaskError         = require('../../api/TaskError');
import TaskErrorBag      = require('../../api/TaskErrorBag');
import ValidatorErrors   = require('../zationTaskErrors/validatorTaskErrors');
import Logger            = require('../logger/logger');
import FuncTools         = require("../tools/funcTools");
import SmallBag          = require("../../api/SmallBag");
import {ArraySettings, ValueModelConfig} from "../configs/appConfig";
import {ConfigNames}       from "../constants/internal";
import {ValidationTypes}   from "../../..";

class ValidatorEngine
{
    static async validateValue(input,config : any,preparedErrorData : {inputPath : string,inputValue : any},errorBag : TaskErrorBag,preparedSmallBag : SmallBag,type) : Promise<any>
    {
        let promises : Promise<void>[] = [];
        for(let cKey in config)
        {
            if(config.hasOwnProperty(cKey))
            {
                const cValue = config[cKey];
                if(cKey === nameof<ValueModelConfig>(s => s.validate)) {
                    //own validate
                    promises.push(FuncTools.emitEvent(cValue,input,errorBag,preparedErrorData.inputPath,preparedSmallBag,type));
                }
                else if(ValidatorLibrary.function.hasOwnProperty(cKey)) {
                    promises.push(ValidatorLibrary.function[cKey](input,cValue,errorBag,preparedErrorData,preparedSmallBag,type));
                }
            }
        }
        await Promise.all(promises);
    }

    static validateValueType(input,type,strictType,preparedErrorData : {inputPath : string,inputValue : any},errorBag : TaskErrorBag)
    {
        let usedType = type;
        if(type !== undefined && type !== ValidationTypes.ALL) {
            if(Array.isArray(type))
            {
                let foundAValidTyp = false;
                let errorBagTemp = new TaskErrorBag();
                for(let i = 0; i < type.length; i++) {
                    let tempErrorCount = errorBagTemp.getTaskErrorCount();
                    ValidatorEngine.validateType(input,type[i],strictType,errorBagTemp,preparedErrorData);
                    if(tempErrorCount === errorBagTemp.getTaskErrorCount()) {
                        foundAValidTyp = true;
                        usedType = type[i];
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
        return usedType;
    }

    private static validateType(input,type,strictType,errorBag,preparedErrorData)
    {
        if(ValidatorLibrary.type.hasOwnProperty(type)) {
            ValidatorLibrary.type[type](input,errorBag,preparedErrorData,strictType);
        }
        else if(type === '') {
           Logger.printConfigWarning
           (ConfigNames.APP,`No validator type in inputPath: '${preparedErrorData.inputPath}' found.`)
        }
        else if(type.length > 0) {
            Logger.printConfigWarning
            (ConfigNames.APP,`No valid validator type in inputPath: '${preparedErrorData.inputPath}'.`)
        }
    }

    static validateArray(array,arrayConfig : ArraySettings,currentPath,errorBag)
    {
        let isOk = true;
        if(arrayConfig.length !== undefined)
        {
            const length = arrayConfig.length;
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
        if(arrayConfig.minLength !== undefined)
        {
            const minLength = arrayConfig.minLength;
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
        if(arrayConfig.maxLength !== undefined)
        {
            const maxLength = arrayConfig.maxLength;
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