/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import {Model, ParamInput}       from "../configDefinitions/appConfig";
import OptionalProcessor         from "./optionalProcessor";
import ModelInputDataProcessor   from "./modelInputDataProcessor";
import ZationWorker            = require("../../main/zationWorker");
import BackErrorBag              from "../../api/BackErrorBag";
import BackError                 from "../../api/BackError";
import {ProcessTask}             from "./processTaskEngine";
import {MainBackErrors}          from "../zationBackErrors/mainBackErrors";

/**
 * Class for processing input data. Can be a param based input or single model input.
 */
export default class InputDataProcessor
{
    private inputMainProcessor : ModelInputDataProcessor;

    constructor(worker : ZationWorker) {
        this.inputMainProcessor = new ModelInputDataProcessor(worker.getPreparedSmallBag());
    }

    /**
     * Process parameter based input with an input object.
     * @param input
     * @param paramInput
     * @param useInputValidation
     * @param processList
     * @param taskErrorBag
     * @param createProcessList
     */
    async processInputObject(input : Record<string,any>, paramInput : ParamInput, useInputValidation : boolean,
        processList : ProcessTask[],
        taskErrorBag : BackErrorBag,
        createProcessList : boolean = true
    ) : Promise<object>
    {
        const promises : Promise<void>[] = [];

        const processInfo = {
            processTaskList : processList,
            errorBag : taskErrorBag,
            inputValidation : useInputValidation,
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
                        taskErrorBag.addBackError(new BackError(MainBackErrors.inputPropertyIsMissing,
                            {
                                propertyName : paramName,
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
                taskErrorBag.addBackError(new BackError(MainBackErrors.unknownInputProperty,
                    {
                        propertyName : inputName
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
     * @param useInputValidation
     * @param processList
     * @param taskErrorBag
     * @param createProcessList
     */
    async processInputArray(input : any[], paramInput : ParamInput, paramInputKeys : string[], useInputValidation : boolean,
        processList : ProcessTask[],
        taskErrorBag : BackErrorBag,
        createProcessList : boolean = true
    ) : Promise<object>
    {
        const promises : Promise<void>[] = [];

        const processInfo = {
            processTaskList : processList,
            errorBag : taskErrorBag,
            inputValidation : useInputValidation,
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
                    taskErrorBag.addBackError(new BackError(MainBackErrors.inputPropertyIsMissing,
                        {
                            propertyName : paramInputKeys[i],
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
            taskErrorBag.addBackError(new BackError(MainBackErrors.inputNotAssignable,
                {
                    index : i,
                    value : input[i]
                }));
        }
        await Promise.all(promises);
        return result;
    }

    /**
     *
     * @param input
     * @param config
     * @param useInputValidation
     * @param processList
     * @param taskErrorBag
     * @param createProcessList
     * @param currentInputPath
     */
    async processSingleModelInput(input : any, config : Model, useInputValidation : boolean, processList : ProcessTask[],
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
            inputValidation : useInputValidation,
            processTaskList : processList
        });
        return inputWrapper.i;
    }

    async validationCheck
    (
        input : any,
        inputConfig : ParamInput | Model,
        singleInput : boolean,
        basePath : boolean,
        inputPath : string,
        errorBag : BackErrorBag,
        useInputValidation : boolean = true
    ) : Promise<void>
    {
        if((!basePath && !singleInput) || singleInput) {
            //single prop check
            await this.processSingleModelInput(
                input,
                inputConfig,
                useInputValidation,
                [],
                errorBag,
                false,
                inputPath
            );
        }
        else {
            if(Array.isArray(input)) {
                await this.processInputArray(
                    input,
                    //can't be a singleInput config.
                    // @ts-ignore
                    inputConfig,
                    useInputValidation,
                    [],
                    errorBag,
                    false
                    );
            }
            else {
                await this.processInputObject(
                    input,
                    //can't be a singleInput config.
                    // @ts-ignore
                    inputConfig,
                    useInputValidation,
                    [],
                    errorBag,
                    false
                );
            }
        }
    }
}