/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import {InputConfig, ParamInput, SingleModelInput} from "../configDefinitions/inputConfig";
import BackErrorBag                     from "../../api/BackErrorBag";
import ProcessTaskEngine, {ProcessTask} from "./processTaskEngine";
import InputProcessor, {Processable}    from "./inputProcessorCreator";
import BackError                        from "../../api/BackError";
import {MainBackErrors}                 from "../zationBackErrors/mainBackErrors";
import InputUtils                       from "./inputUtils";
import SmallBag                         from "../../api/SmallBag";
import {ValidationCheckPair}            from "../constants/internal";
// noinspection TypeScriptPreferShortImport
import {ControllerConfig}               from "../../helper/configDefinitions/controllerConfig";

export type InputConsumeFunction = (input : any) => Promise<any>;
export type InputValidationCheckFunction = (checkData : ValidationCheckPair[]) => Promise<void>;

const DefaultParamProcessable : Processable = {
    _process : InputProcessor.createParamInputProcessor({})
};

/**
 * A class that provides methods for creating closures to consume the input.
 */
export default class InputClosureCreator
{
    /**
     * Creates a closure to consume the input (validate and format) from a request to a controller.
     * @param controllerConfig
     * @param smallBag
     */
    static createControllerInputConsumer(controllerConfig : ControllerConfig,smallBag : SmallBag) : InputConsumeFunction
    {
        if(controllerConfig.inputAllAllow) {
            return (input) => input;
        }
        return InputClosureCreator.createInputConsumer(controllerConfig,smallBag);
    }

    /**
     * Creates a closure to only validate the input from a validation request to a controller.
     * @param controllerConfig
     * @param smallBag
     */
    static createControllerValidationChecker(controllerConfig : ControllerConfig,smallBag : SmallBag) : InputValidationCheckFunction
    {
        if(controllerConfig.inputAllAllow) {
            return async () => {}
        }
        return InputClosureCreator.createInputValidationChecker(controllerConfig,smallBag);
    }

    /**
     * Creates a closure to only validate the input from a validation request.
     * @param inputConfig
     * @param smallBag
     */
    private static createInputValidationChecker(inputConfig : InputConfig,smallBag : SmallBag) : InputValidationCheckFunction
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
                            specificConfig = InputUtils.getModelAtPath(keyPath,inputDefinition,(!singleInputModel));
                            if(specificConfig === undefined){
                                errorBag.addBackError(new BackError(MainBackErrors.inputPathNotResolvable,
                                    {
                                        inputPath : keyPath,
                                        checkIndex : i
                                    }));
                                return;
                            }
                        }

                        await (specificConfig as Processable)._process(smallBag,iCheckData,nameof<ValidationCheckPair>(s => s.v),path,{
                            errorBag : errorBag,
                            createProcessTaskList : false,
                            processTaskList : [],
                        });
                    }
                    else {
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
     * @param smallBag
     */
    private static createInputConsumer(inputConfig : InputConfig, smallBag : SmallBag) : InputConsumeFunction {
        // @ts-ignore
        const inputDefinition : (ParamInput | SingleModelInput) & Processable = inputConfig.input;

        let processable : Processable;
        if(Array.isArray(inputDefinition)) {
            processable = inputDefinition[0];
        }
        else {
            processable = typeof inputDefinition === 'object' ? (inputDefinition as Processable) : DefaultParamProcessable;
        }

        return async (input) => {
            const taskList : ProcessTask[] = [];
            const taskErrorBag : BackErrorBag = new BackErrorBag();
            const wrapper = {i : input};

            await processable._process(smallBag,wrapper,'i','',{
                processTaskList : taskList,
                errorBag : taskErrorBag,
                createProcessTaskList :  true
            });

            //throw validation/structure errors if any there
            taskErrorBag.throwIfHasError();

            //wait for process tasks
            await ProcessTaskEngine.processTasks(taskList);

            return wrapper.i;
        }
    }
}

