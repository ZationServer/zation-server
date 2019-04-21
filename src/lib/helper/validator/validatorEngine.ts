/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import {ArraySettings, ValueModelConfig} from "../configs/appConfig";
import {ConfigNames}       from "../constants/internal";
// noinspection TypeScriptPreferShortImport
import {ValidationTypes}   from "./../constants/validationTypes";
import BackErrorBag        from "../../api/BackErrorBag";
import BackError           from "../../api/BackError";
import {ValidatorLibrary}  from "./validatorLibrary";
import FuncUtils             from "../utils/funcUtils";
import {ValidatorBackErrors} from "../zationBackErrors/validatorBackErrors";
import Logger                from "../logger/logger";
import SmallBag              from "../../api/SmallBag";

const ValidatorFunctions   = ValidatorLibrary.Functions;
const ValidatorTypes       = ValidatorLibrary.Types;

export default class ValidatorEngine
{
    static async validateValue(input, config : any, preparedErrorData : {inputPath : string,inputValue : any}, errorBag : BackErrorBag, preparedSmallBag : SmallBag, type) : Promise<any>
    {
        let promises : Promise<void>[] = [];
        for(let cKey in config)
        {
            if(config.hasOwnProperty(cKey))
            {
                const cValue = config[cKey];
                if(cKey === nameof<ValueModelConfig>(s => s.validate)) {
                    //own validate
                    promises.push(FuncUtils.emitEvent(cValue,input,errorBag,preparedErrorData.inputPath,preparedSmallBag,type));
                }
                else if(ValidatorFunctions.hasOwnProperty(cKey)) {
                    promises.push(ValidatorFunctions[cKey](input,cValue,errorBag,preparedErrorData,preparedSmallBag,type));
                }
            }
        }
        await Promise.all(promises);
    }

    static validateValueType(input,type,strictType,preparedErrorData : {inputPath : string,inputValue : any},errorBag : BackErrorBag)
    {
        let usedType = type;
        if(type !== undefined && type !== ValidationTypes.ALL) {
            if(Array.isArray(type))
            {
                let foundAValidTyp = false;
                let errorBagTemp = new BackErrorBag();
                for(let i = 0; i < type.length; i++) {
                    let tempErrorCount = errorBagTemp.getBackErrorCount();
                    ValidatorEngine.validateType(input,type[i],strictType,errorBagTemp,preparedErrorData);
                    if(tempErrorCount === errorBagTemp.getBackErrorCount()) {
                        foundAValidTyp = true;
                        usedType = type[i];
                        break;
                    }
                }
                if(!foundAValidTyp) {
                    errorBag.addBackError(new BackError(ValidatorBackErrors.noValidTypeWasFound,
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
        if(ValidatorTypes.hasOwnProperty(type)) {
            ValidatorTypes[type](input,errorBag,preparedErrorData,strictType);
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
                errorBag.addBackError(new BackError(ValidatorBackErrors.inputArrayNotMatchWithLength,
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
                errorBag.addBackError(new BackError(ValidatorBackErrors.inputArrayNotMatchWithMinLength,
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
                errorBag.addBackError(new BackError(ValidatorBackErrors.inputArrayNotMatchWithMaxLength,
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