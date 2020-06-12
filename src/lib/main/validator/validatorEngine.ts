/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

// noinspection TypeScriptPreferShortImport
import {ValidationTypeRecord}                              from '../constants/validationType';
import {ArraySettings, ValidateFunction, ValueModel}       from "../config/definitions/parts/inputConfig";
// noinspection TypeScriptPreferShortImport
import BackErrorBag          from "../../api/BackErrorBag";
import BackError             from "../../api/BackError";
import {ValidatorLibrary}    from "./validatorLibrary";
import FuncUtils             from "../utils/funcUtils";
import {ValidatorBackErrors} from "../zationBackErrors/validatorBackErrors";

const ValidatorFunctions   = ValidatorLibrary.Functions;
const ValidatorTypes       = ValidatorLibrary.Types;

export type ValueTypeValidateFunction =
    (input: any,errorBag: BackErrorBag,preparedErrorData: PreparedErrorData) => string | undefined;
export type ValueValidateFunction =
    (input: any, errorBag: BackErrorBag, preparedErrorData: PreparedErrorData, type: string | undefined) => Promise<any>;

export interface PreparedErrorData {
    path: string,
    value: any
}

type PreparedFunctionValidator =
    (input: any, backErrorBag : BackErrorBag, prepareErrorData: PreparedErrorData, type: string | undefined) => Promise<void> | void

export default class ValidatorEngine
{
    /**
     * Creates a closure to validate the type of the input data.
     * @param config
     */
    static createValueValidator(config: ValueModel): ValueValidateFunction
    {
        const validatorFunctions: PreparedFunctionValidator[] = [];
        let validateFunction: ValidateFunction = () => {};

        for(const cKey in config) {
            if(config.hasOwnProperty(cKey)) {
                const cValue = config[cKey];
                if(ValidatorFunctions.hasOwnProperty(cKey)) {
                    validatorFunctions.push((input, backErrorBag, prepareErrorData, type) =>
                        ValidatorFunctions[cKey](input,cValue,backErrorBag,prepareErrorData,type));
                }
                else if(cKey === nameof<ValueModel>(s => s.validate)) {
                    validateFunction = FuncUtils.createFuncAsyncInvoker(cValue);
                }
            }
        }

        return async (input, errorBag, preparedErrorData, type) => {
            const promises: (Promise<void> | void)[] = [];
            for(let i = 0; i < validatorFunctions.length; i++){
                promises.push(validatorFunctions[i](input,errorBag,preparedErrorData,type));
            }
            promises.push(validateFunction(input,errorBag,preparedErrorData.path,type));
            await Promise.all(promises);
        };
    }

    /**
     * Creates a closure to validate the input type.
     * @param type
     * @param strictType
     */
    static createValueTypeValidator(type: string | string[] | undefined,strictType: boolean): ValueTypeValidateFunction {
        if(type !== undefined && type !== nameof<ValidationTypeRecord>(s => s.all)) {
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
                                path: preparedErrorData.path,
                                value: preparedErrorData.value,
                                types: type
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
            return () => undefined;
        }
    }

    /**
     * Validate array model.
     * @param array
     * @param arrayConfig
     * @param currentPath
     * @param errorBag
     */
    static validateArray(array,arrayConfig: ArraySettings,currentPath,errorBag)
    {
        let isOk = true;
        if(arrayConfig.length !== undefined)
        {
            const length = arrayConfig.length;
            if(array.length !== length)
            {
                isOk = false;
                errorBag.addBackError(new BackError(ValidatorBackErrors.arrayNotMatchesWithLength,
                    {
                        value: array,
                        path: currentPath,
                        length: length
                    }));
            }
        }
        if(arrayConfig.minLength !== undefined)
        {
            const minLength = arrayConfig.minLength;
            if(array.length < minLength)
            {
                isOk = false;
                errorBag.addBackError(new BackError(ValidatorBackErrors.arrayNotMatchesWithMinLength,
                    {
                        value: array,
                        path: currentPath,
                        minLength: minLength
                    }));
            }
        }
        if(arrayConfig.maxLength !== undefined)
        {
            const maxLength = arrayConfig.maxLength;
            if(array.length > maxLength)
            {
                isOk = false;
                errorBag.addBackError(new BackError(ValidatorBackErrors.arrayNotMatchesWithMaxLength,
                    {
                        value: array,
                        path: currentPath,
                        maxLength: maxLength
                    }));
            }
        }
        return isOk;
    }
}