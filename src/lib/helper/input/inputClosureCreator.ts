/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import {ControllerConfig, InputConfig, Model, ParamInput} from "../configDefinitions/appConfig";
import BackErrorBag                     from "../../api/BackErrorBag";
import ProcessTaskEngine, {ProcessTask} from "./processTaskEngine";
import InputProcessor               from "./inputProcessor";
import BackError                        from "../../api/BackError";
import {MainBackErrors}                 from "../zationBackErrors/mainBackErrors";

export type InputConsumer = (input : any) => Promise<any>;
export type InputChecker = (input : any) => Promise<any>;

/**
 * A class that provides methods for creating closures to consume the input.
 */
export default class InputClosureCreator
{
    /**
     * Creates a closure to consume the input from a request to a controller.
     * @param controllerConfig
     * @param inputDataProcessor
     */
    static createControllerInputConsumer(controllerConfig : ControllerConfig,inputDataProcessor : InputProcessor)
    {
        if(controllerConfig.inputAllAllow) {
            return (input) => input;
        }
        return InputClosureCreator.createInputConsumer(controllerConfig,inputDataProcessor);
    }

    static createInputConsumer(inputConfig : InputConfig, inputDataProcessor : InputProcessor) : InputConsumer {
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

