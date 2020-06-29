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
import {FunctionValidator, ValidatorLibrary} from './validatorLibrary';
import FuncUtils             from "../utils/funcUtils";
import {ValidatorBackErrors} from "../systemBackErrors/validatorBackErrors";

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

export default class ValidatorCreator
{
    /**
     * Creates a closure to validate the value validation functions.
     * @param config
     */
    static createValueFunctionValidator(config: ValueModel): ValueValidateFunction
    {
        const functionValidator: FunctionValidator[] = [];
        let validateFunction: ValidateFunction = () => {};

        for(const k in config) {
            if(config.hasOwnProperty(k)) {
                const settings = config[k];
                if(ValidatorFunctions.hasOwnProperty(k)) {
                    functionValidator.push(ValidatorFunctions[k](settings));
                }
                else if(k === nameof<ValueModel>(s => s.validate)) {
                    validateFunction = FuncUtils.createFuncAsyncInvoker(settings);
                }
            }
        }
        const functionValidatorLength = functionValidator.length;

        return async (input, errorBag, preparedErrorData, type) => {
            const promises: (Promise<void> | void)[] = [];
            for(let i = 0; i < functionValidatorLength; i++) promises.push(functionValidator[i](input,errorBag,preparedErrorData,type));
            promises.push(validateFunction(input,errorBag,preparedErrorData.path,type));
            await Promise.all(promises);
        };
    }

    /**
     * Creates a closure to validate the value model type.
     * @param type
     * @param strictType
     */
    static createValueTypeValidator(type: string | string[] | undefined,strictType: boolean): ValueTypeValidateFunction {
        if(type !== undefined && type !== nameof<ValidationTypeRecord>(s => s.all)) {
            if(Array.isArray(type)){
                const typeLength = type.length;
                const preparedTypeValidator: ((data: any) => boolean)[] = [];
                for(let i = 0; i < typeLength; i++){
                    preparedTypeValidator.push(ValidatorTypes[type[i]](strictType));
                }
                return (input, errorBag, preparedErrorData) => {
                    for(let i = 0; i < typeLength; i++) {
                        if(preparedTypeValidator[i](input)) return type[i];
                    }
                    errorBag.add(new BackError(ValidatorBackErrors.valueNotMatchesWithType,
                        {
                            path: preparedErrorData.path,
                            value: preparedErrorData.value,
                            type: [...type]
                        }));
                }
            }
            else {
                const typeValidate = ValidatorTypes[type](strictType);
                return (input, errorBag, preparedErrorData) => {
                    if(typeValidate(input)) return type;
                    errorBag.add(new BackError(ValidatorBackErrors.valueNotMatchesWithType,
                        {
                            path: preparedErrorData.path,
                            value: preparedErrorData.value,
                            type: type
                        }));
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