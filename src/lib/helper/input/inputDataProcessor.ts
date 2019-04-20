/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import {ControllerConfig, Model, MultiInput} from "../configs/appConfig";
import {ZationTask}              from "../constants/internal";
import OptionalProcessor         from "./optionalProcessor";
import SingleInputDataProcessor  from "./singleInputDataProcessor";
import ZationWorker            = require("../../main/zationWorker");
import BackErrorBag              from "../../api/BackErrorBag";
import BackError                 from "../../api/BackError";
import ProcessTaskEngine, {ProcessTask} from "./processTaskEngine";
import {MainBackErrors}          from "../zationBackErrors/mainBackErrors";

export default class InputDataProcessor
{
    private inputMainProcessor : SingleInputDataProcessor;

    constructor(worker : ZationWorker) {
        this.inputMainProcessor = new SingleInputDataProcessor(worker.getPreparedSmallBag());
    }

    private async processInputObject
    (
        input : object,
        controllerInput : MultiInput,
        useInputValidation : boolean,
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

        for(let inputName in controllerInput)
        {
            if(controllerInput.hasOwnProperty(inputName) && input[inputName] !== undefined) {
                promises.push(
                    this.inputMainProcessor.processProperty
                    (input,inputName,controllerInput[inputName],inputName,processInfo));
            }
            else
            {
                const {defaultValue,isOptional} = await OptionalProcessor.process(controllerInput[inputName]);
                if(!isOptional){
                    //ups something is missing
                    taskErrorBag.addBackError(new BackError(MainBackErrors.inputPropertyIsMissing,
                        {
                            propertyName : inputName,
                            input : input
                        }));
                }
                else {
                    //set default value
                    input[inputName] = defaultValue;
                }
            }
        }
        //check for unknown input properties
        for(let inputName in input) {
            if(input.hasOwnProperty(inputName) && !controllerInput.hasOwnProperty(inputName)){
                taskErrorBag.addBackError(new BackError(MainBackErrors.unknownInputProperty,
                    {
                        propertyName : inputName
                    }));
            }
        }
        await Promise.all(promises);
        return input;
    }

    private async processInputArray
    (
        input : any[],
        controllerInput : MultiInput,
        useInputValidation : boolean,
        processList : ProcessTask[],
        taskErrorBag : BackErrorBag,
        createProcessList : boolean = true
    ) : Promise<object>
    {
        const controllerInputKeys = Object.keys(controllerInput);
        const promises : Promise<void>[] = [];

        const processInfo = {
            processTaskList : processList,
            errorBag : taskErrorBag,
            inputValidation : useInputValidation,
            createProcessTaskList : createProcessList
        };

        const result = {};
        for(let i = 0; i < controllerInputKeys.length; i++)
        {
            if(typeof input[i] !== 'undefined')
            {
                promises.push(new Promise<void>(async (resolve) => {
                    const config = controllerInput[controllerInputKeys[i]];
                    result[controllerInputKeys[i]] = input[i];

                    await this.inputMainProcessor.processProperty
                    (result,controllerInputKeys[i],config,controllerInputKeys[i],processInfo);
                    resolve();
                }))
            }
            else {
                const {defaultValue,isOptional} = await OptionalProcessor.process(controllerInput[controllerInputKeys[i]]);
                if(!isOptional){
                    //ups something is missing
                    taskErrorBag.addBackError(new BackError(MainBackErrors.inputPropertyIsMissing,
                        {
                            propertyName : controllerInputKeys[i],
                            input : input
                        }));
                }
                else {
                    //set default value
                    result[controllerInputKeys[i]] = defaultValue;
                }
            }
        }
        //check to much input
        for(let i = controllerInputKeys.length; i < input.length; i++) {
            taskErrorBag.addBackError(new BackError(MainBackErrors.inputNotAssignable,
                {
                    index : i,
                    value : input[i]
                }));
        }
        await Promise.all(promises);
        return result;
    }

    private async processSingleInput
    (
        input : any,
        config : Model,
        useInputValidation : boolean,
        processList : ProcessTask[],
        taskErrorBag : BackErrorBag,
        createProcessList : boolean = true,
        currentInputPath : string = ''
    ) : Promise<object>
    {
        //we have a single input config
        let inputTmp = {i : input};
        await this.inputMainProcessor.processProperty
        (inputTmp,'i',config,currentInputPath,{
            errorBag : taskErrorBag,
            createProcessTaskList : createProcessList,
            inputValidation : useInputValidation,
            processTaskList : processList
        });
        return input;
    }

    async validationCheck
    (
        input : any,
        inputConfig : MultiInput | Model,
        singleInput : boolean,
        basePath : boolean,
        inputPath : string,
        errorBag : BackErrorBag,
        useInputValidation : boolean = true
    ) : Promise<void>
    {
        if((!basePath && !singleInput) || singleInput) {
            //single prop check
            await this.processSingleInput(
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

    //fast Checks of the input
    //than create the checked Data
    async processInput(task : ZationTask, controller : ControllerConfig) : Promise<any>
    {
        if(controller.inputAllAllow) {
            return task.i;
        }

        let input = task.i;

        if(input === undefined){
            input = {};
        }
        else if(typeof input !== "object") {
            //throw input type needs to be an object or array
            throw new BackError(MainBackErrors.wrongControllerInputType,{inputType : typeof input});
        }

        const useInputValidation : boolean =
            typeof controller.inputValidation === 'boolean' ? controller.inputValidation : true;

        const taskList : ProcessTask[] = [];
        let result = input;

        const taskErrorBag : BackErrorBag = new BackErrorBag();
        if(controller.singleInput === undefined)
        {
            //we have multi input config
            const controllerInput = typeof controller.multiInput === 'object' ? controller.multiInput : {};

            if(Array.isArray(input)) {
                //throws if the validation or structure has an error
                // noinspection TypeScriptValidateTypes
                // @ts-ignore
                result = await this.processInputArray
                (input,controllerInput,useInputValidation,taskList,taskErrorBag);
            }
            else {
                //throws if the validation or structure has an error or structure
                result = await this.processInputObject
                (input,controllerInput,useInputValidation,taskList,taskErrorBag);
            }
        }
        else {
            result = await this.processSingleInput
            //can not be an string (pre compile will resolve links)
            // @ts-ignore
            (input,controller.singleInput,useInputValidation,taskList,taskErrorBag);
        }

        //throw validation/structure errors if any there
        taskErrorBag.throwIfHasError();

        //check process tasks
        await ProcessTaskEngine.processTasks(taskList);

        return result;
    }
}

