/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import {ControllerConfig, InputConfig, Model, ParamInput} from "../configDefinitions/appConfig";
import BackErrorBag                     from "../../api/BackErrorBag";
import ProcessTaskEngine, {ProcessTask} from "./processTaskEngine";
import InputProcessor                   from "./inputProcessor";
import BackError                        from "../../api/BackError";
import {MainBackErrors}                 from "../zationBackErrors/mainBackErrors";
import InputUtils                       from "./inputUtils";

export type InputConsumeFunction = (input : any) => Promise<any>;
export type InputValidationCheckFunction = (checkData : {ip : string | string[], v : any}[]) => Promise<void>;

/**
 * A class that provides methods for creating closures to consume the input.
 */
export default class InputClosureCreator
{
    /**
     * Creates a closure to consume the input (validate and format) from a request to a controller.
     * @param controllerConfig
     * @param inputDataProcessor
     */
    static createControllerInputConsumer(controllerConfig : ControllerConfig,inputDataProcessor : InputProcessor) : InputConsumeFunction
    {
        if(controllerConfig.inputAllAllow) {
            return (input) => input;
        }
        return InputClosureCreator.createInputConsumer(controllerConfig,inputDataProcessor);
    }

    /**
     * Creates a closure to only validate the input from a validation request to a controller.
     * @param controllerConfig
     * @param inputDataProcessor
     */
    static createControllerValidationChecker(controllerConfig : ControllerConfig,inputDataProcessor : InputProcessor) : InputValidationCheckFunction
    {
        if(typeof controllerConfig.inputAllAllow === 'boolean' && controllerConfig.inputAllAllow) {
            return async () => {}
        }
        return InputClosureCreator.createInputValidationChecker(controllerConfig,inputDataProcessor);
    }

    /**
     * Creates a closure to only validate the input from a validation request.
     * @param inputConfig
     * @param inputDataProcessor
     */
    private static createInputValidationChecker(inputConfig : InputConfig, inputDataProcessor : InputProcessor) : InputValidationCheckFunction
    {
        let inputDefinition;
        let singleInputModel = false;
        if(Array.isArray(inputConfig.input)){
            singleInputModel = true;
            inputDefinition = inputConfig.input[0];
        }
        else {
            inputDefinition = typeof inputConfig.input === 'object' ? inputConfig.input : {};
        }

        return async (checkData) => {

            const promises : Promise<void>[] = [];
            const errorBag = new BackErrorBag();
            for(let i = 0; i < checkData.length; i++)
            {
                promises.push((async () => {
                    const iCheckData = checkData[i];
                    // noinspection SuspiciousTypeOfGuard
                    if (typeof iCheckData === 'object' && (Array.isArray(iCheckData.ip) || typeof iCheckData.ip === 'string')) {

                        const {path,keyPath} = InputUtils.processPathInfo(iCheckData.ip);

                        let specificConfig = inputDefinition;
                        if(keyPath.length > 0){
                            specificConfig = InputUtils.getModelAtPath(keyPath,inputDefinition);
                            if(specificConfig === undefined){
                                errorBag.addBackError(new BackError(MainBackErrors.inputPathNotResolvable,
                                    {
                                        inputPath : keyPath,
                                        checkIndex : i
                                    }));
                                return;
                            }
                        }

                        await inputDataProcessor.processInputCheck(
                            iCheckData.v,
                            specificConfig,
                            singleInputModel,
                            keyPath.length === 0,
                            path,
                            errorBag,
                        );
                    }
                    else
                    {
                        errorBag.addBackError(new BackError(MainBackErrors.wrongValidationCheckStructure,
                            {
                                checkIndex : i
                            }));
                    }
                })());
            }

            await Promise.all(promises);
            //ends when we have errors
            errorBag.throwIfHasError();
        }
    }

    /**
     * Creates a closure to consume the input (validate and format) from a request.
     * @param inputConfig
     * @param inputDataProcessor
     */
    private static createInputConsumer(inputConfig : InputConfig, inputDataProcessor : InputProcessor) : InputConsumeFunction {
        const inputDefinition = inputConfig.input;
        if(Array.isArray(inputDefinition))
        {
            const singleInputModel : Model = inputDefinition[0];
            return async (input) => {

                const taskList : ProcessTask[] = [];
                const taskErrorBag : BackErrorBag = new BackErrorBag();

                const result = await inputDataProcessor.processSingleModelInput
                (input,singleInputModel,taskList,taskErrorBag);

                //throw validation/structure errors if any there
                taskErrorBag.throwIfHasError();

                //wait for process tasks
                await ProcessTaskEngine.processTasks(taskList);

                return result;
            }
        }
        else {
            //param input definition
            //If it is not a array than it is a object with param based input.
            // @ts-ignore
            const inputParamsDefinition : ParamInput = typeof inputDefinition === 'object' ? inputDefinition : {};
            const inputParamsDefinitionKeys = Object.keys(inputParamsDefinition);

            return async (input) => {

                if(input === undefined){
                    input = {};
                }
                else if(typeof input !== "object") {
                    throw new BackError(MainBackErrors.wrongInputTypeInParamBasedInput,{inputType : typeof input});
                }

                const taskList : ProcessTask[] = [];
                const taskErrorBag : BackErrorBag = new BackErrorBag();

                let result = input;

                if(Array.isArray(input)) {
                    //throws if the validation or structure has an error
                    // noinspection TypeScriptValidateTypes
                    result = await inputDataProcessor.processParamInputArray
                    (input,inputParamsDefinition,inputParamsDefinitionKeys,taskList,taskErrorBag);
                }
                else {
                    //throws if the validation or structure has an error or structure
                    result = await inputDataProcessor.processParamInputObject
                    (input,inputParamsDefinition,taskList,taskErrorBag);
                }

                //throw validation/structure errors if any there
                taskErrorBag.throwIfHasError();

                //check process tasks
                await ProcessTaskEngine.processTasks(taskList);

                return result;
            }
        }
    }
}

