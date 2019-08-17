/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {ArraySettings, ValidateFunction, ValueModelConfig} from "../config/definitions/inputConfig";
// noinspection TypeScriptPreferShortImport
import {ValidationTypes}     from "./../constants/validationTypes";
import BackErrorBag          from "../../api/BackErrorBag";
import BackError             from "../../api/BackError";
import {ValidatorLibrary}    from "./validatorLibrary";
import FuncUtils             from "../utils/funcUtils";
import {ValidatorBackErrors} from "../zationBackErrors/validatorBackErrors";
import Bag                   from "../../api/Bag";

const ValidatorFunctions   = ValidatorLibrary.Functions;
const ValidatorTypes       = ValidatorLibrary.Types;

export type ValueTypeValidateFunction =
    (input : any,errorBag : BackErrorBag,preparedErrorData : PreparedErrorData) => string | undefined;
export type ValueValidateFunction =
    (input : any, errorBag : BackErrorBag, preparedErrorData : PreparedErrorData, bag : Bag, type : string | undefined) => Promise<any>;

export interface PreparedErrorData {
    inputPath : string,
    inputValue : any
}

type PreparedFunctionValidator =
    (input : any, backErrorBag  : BackErrorBag, prepareErrorData : PreparedErrorData, preparedBag : Bag, type : string | undefined) => Promise<void> | void

export default class ValidatorEngine
{
    /**
     * Creates a closure to validate the type of the input data.
     * @param config
     */
    static createValueValidator(config : ValueModelConfig) : ValueValidateFunction
    {
        const validatorFunctions : PreparedFunctionValidator[] = [];
        let validateFunction : ValidateFunction = () => {};

        for(let cKey in config) {
            if(config.hasOwnProperty(cKey)) {
                const cValue = config[cKey];
                if(ValidatorFunctions.hasOwnProperty(cKey)) {
                    validatorFunctions.push((input, backErrorBag, prepareErrorData, preparedBag, type) => {
                        return ValidatorFunctions[cKey](input,cValue,backErrorBag,prepareErrorData,preparedBag,type);
                    });
                }
                else if(cKey === nameof<ValueModelConfig>(s => s.validate)) {
                    validateFunction = FuncUtils.createFuncAsyncInvoker(cValue);
                }
            }
        }

        return async (input, errorBag, preparedErrorData, bag, type) => {
            const promises : (Promise<void> | void)[] = [];
            for(let i = 0; i < validatorFunctions.length; i++){
                promises.push(validatorFunctions[i](input,errorBag,preparedErrorData,bag,type));
            }
            promises.push(validateFunction(input,errorBag,preparedErrorData.inputPath,bag,type));
            await Promise.all(promises);
        };
    }

    /**
     * Creates a closure to validate the input type.
     * @param type
     * @param strictType
     */
    static createValueTypeValidator(type : string | string[] | undefined,strictType : boolean) : ValueTypeValidateFunction {
        if(type !== undefined && type !== ValidationTypes.ALL) {
            if(Array.isArray(type)){
                return (input, errorBag, preparedErrorData) => {
                    let foundAValidTyp = false;
                    let typeTmp;
                    const errorBagTemp = new BackErrorBag();
                    for(let i = 0; i < type.length; i++) {
                        const tempErrorCount = errorBagTemp.getBackErrorCount();
                        ValidatorTypes[type[i]](input,errorBagTemp,preparedErrorData,strictType);
                        if(tempErrorCount === errorBagTemp.getBackErrorCount()) {
                            foundAValidTyp = true;
                            typeTmp = type[i];
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
                    return typeTmp;
                }
            }
            else {
                return (input, errorBag, preparedErrorData) => {
                    ValidatorTypes[type](input,errorBag,preparedErrorData,strictType);
                    return type;
                }
            }
        }
        else {
            return () => {return undefined;}
        }
    }

    /**
     * Validate array model.
     * @param array
     * @param arrayConfig
     * @param currentPath
     * @param errorBag
     */
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