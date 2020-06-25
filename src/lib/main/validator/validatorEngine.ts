/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

// noinspection TypeScriptPreferShortImport
import {ValidationTypeRecord}                              from '../definitions/validationType';
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
export type ArrayValidateFunction =
    (input: any[],errorBag: BackErrorBag,currentPath: string) => boolean;

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
                        const tempErrorCount = errorBagTemp.count;
                        ValidatorTypes[type[i]](input,errorBagTemp,preparedErrorData,strictType);
                        if(tempErrorCount === errorBagTemp.count) {
                            foundAValidTyp = true;
                            typeTmp = type[i];
                            break;
                        }
                    }
                    if(!foundAValidTyp) {
                        errorBag.add(new BackError(ValidatorBackErrors.noValidTypeWasFound,
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
     * Creates a closure to validate an array.
     * @param arrayConfig
     */
    static createArrayValidator(arrayConfig: ArraySettings): ArrayValidateFunction
    {
        const checks: ((input: any[],errorBag: BackErrorBag,currentPath: string) => void)[] = [];

        if(arrayConfig.length !== undefined)
        {
            const length = arrayConfig.length;
            checks.push((input,errorBag,currentPath) =>  {
                if(input.length !== length) {
                    errorBag.add(new BackError(ValidatorBackErrors.arrayNotMatchesWithLength,
                        {
                            value: input,
                            path: currentPath,
                            length: length
                        }));
                }
            })
        }
        if(arrayConfig.minLength !== undefined)
        {
            const minLength = arrayConfig.minLength;
            checks.push((input,errorBag,currentPath) => {
                if(input.length < minLength) {
                    errorBag.add(new BackError(ValidatorBackErrors.arrayNotMatchesWithMinLength,
                        {
                            value: input,
                            path: currentPath,
                            minLength: minLength
                        }));
                }
            });
        }
        if(arrayConfig.maxLength !== undefined)
        {
            const maxLength = arrayConfig.maxLength;
            checks.push((input,errorBag,currentPath) => {
                if(input.length > maxLength) {
                    errorBag.add(new BackError(ValidatorBackErrors.arrayNotMatchesWithMaxLength,
                        {
                            value: input,
                            path: currentPath,
                            maxLength: maxLength
                        }));
                }
            });
        }

        const checksLength = checks.length;
        return (input, errorBag, currentPath) => {
            const tmpErrCount = errorBag.count;
            for(let i = 0; i < checksLength; i++) checks[i](input, errorBag, currentPath);
            return tmpErrCount === errorBag.count;
        }
    }
}