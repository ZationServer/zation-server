/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {InputConfig}                    from "../config/definitions/parts/inputConfig";
import BackErrorBag                     from "../../api/BackErrorBag";
import ProcessTaskEngine, {ProcessTask} from "./processTaskEngine";
import InputProcessor, {Processable}    from "./inputProcessorCreator";
import BackError                        from "../../api/BackError";
import {MainBackErrors}                 from "../zationBackErrors/mainBackErrors";
import InputUtils                       from "./inputUtils";
import Bag                              from "../../api/Bag";
import {ValidationCheckPair}            from "../controller/controllerDefinitions";

export type InputConsumeFunction = (input: any) => Promise<any>;
export type InputValidationCheckFunction = (checkData: ValidationCheckPair[]) => Promise<void>;

const DefaultParamProcessable: Processable = {
    _process: InputProcessor.createParamInputProcessor({})
};

/**
 * A class that provides methods for creating closures to consume the input.
 */
export default class InputClosureCreator
{
    /**
     * Creates a closure to consume the input (validate and format) from a request to a component.
     * @param inputConfig
     * @param bag
     */
    static createInputConsumer(inputConfig: InputConfig, bag: Bag): InputConsumeFunction {
        if(inputConfig.allowAnyInput) {
            return (input) => input;
        }

        const processable: Processable = typeof inputConfig.input === 'object' ?
            (inputConfig.input as unknown as Processable): DefaultParamProcessable;

        return async (input) => {
            const taskList: ProcessTask[] = [];
            const backErrorBag: BackErrorBag = new BackErrorBag();
            const wrapper = {i: input};

            await processable._process(bag,wrapper,'i','',{
                processTaskList: taskList,
                errorBag: backErrorBag,
                createProcessTaskList:  true
            });

            //throw validation/structure errors if any there
            backErrorBag.throwIfHasError();

            //wait for process tasks
            await ProcessTaskEngine.processTasks(taskList);

            return wrapper.i;
        }
    }

    /**
     * Creates a closure to only validate the input from a validation request to a component.
     * @param inputConfig
     * @param bag
     */
    static createValidationChecker(inputConfig: InputConfig,bag: Bag): InputValidationCheckFunction
    {
        if(inputConfig.allowAnyInput) {
            return async () => {}
        }

        const inputDefinition: Processable = typeof inputConfig.input === 'object' ?
            (inputConfig.input as unknown as Processable): DefaultParamProcessable;
        const singleInputModel = Array.isArray(inputDefinition);

        return async (checkData) => {

            const promises: Promise<void>[] = [];
            const errorBag = new BackErrorBag();
            for(let i = 0; i < checkData.length; i++)
            {
                promises.push((async () => {
                    const iCheckData = checkData[i];
                    // noinspection SuspiciousTypeOfGuard
                    if (typeof iCheckData === 'object' && (Array.isArray(iCheckData.p) || typeof iCheckData.p === 'string')) {

                        const {path,keyPath} = InputUtils.processPathInfo(iCheckData.p);

                        let specificConfig: any = inputDefinition;
                        if(keyPath.length > 0){
                            specificConfig = InputUtils.getModelAtPath(keyPath,inputDefinition as any,(!singleInputModel));
                            if(specificConfig === undefined){
                                errorBag.addBackError(new BackError(MainBackErrors.pathNotResolvable,
                                    {
                                        path: keyPath,
                                        checkIndex: i
                                    }));
                                return;
                            }
                        }

                        await (specificConfig as Processable)._process(bag,iCheckData,nameof<ValidationCheckPair>(s => s.v),path,{
                            errorBag: errorBag,
                            createProcessTaskList: false,
                            processTaskList: [],
                        });
                    }
                    else {
                        errorBag.addBackError(new BackError(MainBackErrors.wrongValidationCheckStructure,
                            {
                                checkIndex: i
                            }));
                    }
                })());
            }

            await Promise.all(promises);
            //ends when we have errors
            errorBag.throwIfHasError();
        }
    }
}

