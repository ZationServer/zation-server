/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import {Model, ParamInput}       from "../configDefinitions/appConfig";
import OptionalProcessor         from "./optionalProcessor";
import ModelInputProcessor       from "./modelInputProcessor";
import ZationWorker            = require("../../main/zationWorker");
import BackErrorBag              from "../../api/BackErrorBag";
import BackError                 from "../../api/BackError";
import {ProcessTask}             from "./processTaskEngine";
import {MainBackErrors}          from "../zationBackErrors/mainBackErrors";

/**
 * Class for processing input data. Can be a param based input or single model input.
 */
export default class InputProcessor
{
    private inputMainProcessor : ModelInputProcessor;

    constructor(worker : ZationWorker) {
        this.inputMainProcessor = new ModelInputProcessor(worker.getPreparedSmallBag());
    }

    /**
     * Process parameter based input with an input object.
     * @param input
     * @param paramInput
     * @param processList
     * @param taskErrorBag
     * @param createProcessList
     */
    async processParamInputObject(input : Record<string,any>, paramInput : ParamInput, processList : ProcessTask[],
                                  taskErrorBag : BackErrorBag,
                                  createProcessList : boolean = true
    ) : Promise<object>
    {
        const promises : Promise<void>[] = [];

        const processInfo = {
            processTaskList : processList,
            errorBag : taskErrorBag,
            createProcessTaskList : createProcessList
        };

        for(let paramName in paramInput)
        {
            if(paramInput.hasOwnProperty(paramName)) {
                if(input[paramName] !== undefined){
                    promises.push(
                        this.inputMainProcessor.processModel
                        (input,paramName,paramInput[paramName],paramName,processInfo));
                }
                else {
                    const {defaultValue,isOptional} = await OptionalProcessor.process(paramInput[paramName]);
                    if(!isOptional){
                        //ups something is missing
                        taskErrorBag.addBackError(new BackError(MainBackErrors.inputParamIsMissing,
                            {
                                paramName : paramName,
                                input : input
                            }));
                    }
                    else {
                        //set default value
                        input[paramName] = defaultValue;
                    }
                }
            }
        }
        //check for unknown input properties
        for(let inputName in input) {
            if(input.hasOwnProperty(inputName) && !paramInput.hasOwnProperty(inputName)){
                taskErrorBag.addBackError(new BackError(MainBackErrors.unknownInputParam,
                    {
                        paramName : inputName
                    }));
            }
        }
        await Promise.all(promises);
        return input;
    }

    /**
     * Process parameter based input with an input array.
     * @param input
     * @param paramInput
     * @param paramInputKeys
     * @param processList
     * @param taskErrorBag
     * @param createProcessList
     */
    async processParamInputArray(input : any[], paramInput : ParamInput, paramInputKeys : string[], processList : ProcessTask[],
                                 taskErrorBag : BackErrorBag,
                                 createProcessList : boolean = true
    ) : Promise<object>
    {
        const promises : Promise<void>[] = [];

        const processInfo = {
            processTaskList : processList,
            errorBag : taskErrorBag,
            createProcessTaskList : createProcessList
        };

        const result = {};
        for(let i = 0; i < paramInputKeys.length; i++)
        {
            if(typeof input[i] !== 'undefined') {
                promises.push(new Promise<void>(async (resolve) => {
                    result[paramInputKeys[i]] = input[i];

                    await this.inputMainProcessor.processModel
                    (result,paramInputKeys[i],paramInput[paramInputKeys[i]],paramInputKeys[i],processInfo);
                    resolve();
                }))
            }
            else {
                const {defaultValue,isOptional} = await OptionalProcessor.process(paramInput[paramInputKeys[i]]);
                if(!isOptional){
                    //ups something is missing
                    taskErrorBag.addBackError(new BackError(MainBackErrors.inputParamIsMissing,
                        {
                            paramName : paramInputKeys[i],
                            input : input
                        }));
                }
                else {
                    //set default value
                    result[paramInputKeys[i]] = defaultValue;
                }
            }
        }
        //check to much input
        for(let i = paramInputKeys.length; i < input.length; i++) {
            taskErrorBag.addBackError(new BackError(MainBackErrors.inputParamNotAssignable,
                {
                    index : i,
                    value : input[i]
                }));
        }
        await Promise.all(promises);
        return result;
    }

    /**
     * Process single model input.
     * @param input
     * @param config
     * @param processList
     * @param taskErrorBag
     * @param createProcessList
     * @param currentInputPath
     */
    async processSingleModelInput(input : any, config : Model, processList : ProcessTask[],
        taskErrorBag : BackErrorBag,
        createProcessList : boolean = true,
        currentInputPath : string = ''
    ) : Promise<object>
    {
        //we have a single input config
        const inputWrapper = {i : input};
        await this.inputMainProcessor.processModel
        (inputWrapper,'i',config,currentInputPath,{
            errorBag : taskErrorBag,
            createProcessTaskList : createProcessList,
            processTaskList : processList
        });
        return inputWrapper.i;
    }

    /**
     * Process validation input check.
     * (For single model or param based input)
     * @param input
     * @param inputConfig
     * @param singleInput
     * @param basePath
     * @param inputPath
     * @param errorBag
     */
    async processInputCheck
    (
        input : any,
        inputConfig : ParamInput | Model,
        singleInput : boolean,
        basePath : boolean,
        inputPath : string,
        errorBag : BackErrorBag,
    ) : Promise<void>
    {
        if((!basePath && !singleInput) || singleInput) {
            //single prop check
            await this.processSingleModelInput(
                input,
                inputConfig,
                [],
                errorBag,
                false,
                inputPath
            );
        }
        else {
            if(Array.isArray(input)) {
                await this.processParamInputArray(
                    input,
                    //can't be a singleInput config.
                    // @ts-ignore
                    inputConfig,
                    [],
                    errorBag,
                    false
                    );
            }
            else {
                await this.processParamInputObject(
                    input,
                    //can't be a singleInput config.
                    // @ts-ignore
                    inputConfig,
                    [],
                    errorBag,
                    false
                );
            }
        }
    }
}