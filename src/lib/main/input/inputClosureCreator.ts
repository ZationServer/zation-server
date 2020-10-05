/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {Input}                          from '../config/definitions/parts/inputConfig';
import BackErrorBag                     from "../../api/BackErrorBag";
import ProcessTaskEngine, {ProcessTask} from "./../models/processTaskEngine";
import {Processable}                    from '../models/modelProcessCreator';
import BackError                        from "../../api/BackError";
import {MainBackErrors}                 from "../systemBackErrors/mainBackErrors";
import InputUtils                       from "./inputUtils";
import {ValidationCheckPair}            from "../controller/controllerDefinitions";
import {ValidationBackErrors}           from '../systemBackErrors/validationBackErrors';
import CloneUtils                       from '../utils/cloneUtils';
import {ModelCompiler, CompiledModel}   from '../models/modelCompiler';

export type InputConsumeFunction = (input: any) => Promise<any>;
export type InputValidationCheckFunction = (checkData: ValidationCheckPair[]) => Promise<void>;

/**
 * A class that provides methods for creating closures to consume the input.
 */
export default class InputClosureCreator
{
    /**
     * Creates a closure to consume the input (validate and format).
     * @param inputDefinition
     */
    static createInputConsumer(inputDefinition?: Input): InputConsumeFunction {
        if(inputDefinition === 'any') return (input) => input;
        else if(inputDefinition == null || inputDefinition === 'nothing') {
            return async (input) => {
                if(input !== undefined) throw new BackError(ValidationBackErrors.inputNotAllowed);
            }
        }
        else {
            inputDefinition = ModelCompiler.compileModelDeep(inputDefinition);
            return async (input) => {
                if(input !== undefined) {
                    const taskList: ProcessTask[] = [];
                    const backErrorBag: BackErrorBag = new BackErrorBag();
                    const wrapper = {i: input};

                    await (inputDefinition as CompiledModel)._process(wrapper,'i','',{
                        processTaskList: taskList,
                        errorBag: backErrorBag,
                        createProcessTaskList: true
                    });

                    //throw errors if any there
                    backErrorBag.throwIfHasError();

                    //wait for process tasks
                    await ProcessTaskEngine.processTasks(taskList);

                    return wrapper.i;
                }
                else {
                    const {defaultValue,optional} = (inputDefinition as CompiledModel)._optionalInfo;
                    if(!optional) throw new BackError(ValidationBackErrors.inputRequired);
                    else return CloneUtils.deepClone(defaultValue);
                }
            }
        }
    }

    /**
     * Creates a closure to only validate the input from a validation request to a component.
     * @param inputDefinition
     */
    static createValidationChecker(inputDefinition?: Input): InputValidationCheckFunction
    {
        if(inputDefinition === 'any') return async () => {};
        else if(inputDefinition == null || inputDefinition === 'nothing') {
            return async (input) => {
                if(input !== undefined) throw new BackError(ValidationBackErrors.inputNotAllowed);
            }
        }
        else {
            inputDefinition = ModelCompiler.compileModelDeep(inputDefinition);
            return async (checkData) => {
                const promises: Promise<void>[] = [];
                const errorBag = new BackErrorBag();
                const len = checkData.length;
                for(let i = 0; i < len; i++)
                {
                    promises.push((async () => {
                        const iCheckData = checkData[i];
                        // noinspection SuspiciousTypeOfGuard
                        if (typeof iCheckData === 'object' && (Array.isArray(iCheckData['0']) || typeof iCheckData['0'] === 'string')) {
                            const {path,keyPath} = InputUtils.processPathInfo(iCheckData['0']);

                            let specificConfig: any = inputDefinition;
                            if(keyPath.length > 0){
                                specificConfig = InputUtils.getModelAtPath(keyPath,inputDefinition as any);
                                if(specificConfig === undefined){
                                    errorBag.add(new BackError(MainBackErrors.pathNotResolvable,
                                        {
                                            path: keyPath,
                                            checkIndex: i
                                        }));
                                    return;
                                }
                            }

                            const {optional} = (specificConfig as CompiledModel)._optionalInfo;
                            if(iCheckData['1'] !== undefined) {
                                await (specificConfig as Processable)._process(iCheckData,'1',path,{
                                    errorBag: errorBag,
                                    createProcessTaskList: false,
                                    processTaskList: [],
                                });
                            }
                            else if(!optional) errorBag.add(new BackError(
                                keyPath.length > 0 ? ValidationBackErrors.valueRequired :
                                    ValidationBackErrors.inputRequired))
                        }
                        else {
                            errorBag.add(new BackError(MainBackErrors.invalidValidationCheckStructure,
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
}

