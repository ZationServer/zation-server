/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import TaskError           = require('../../api/TaskError');
import TaskErrorBag        = require('../../api/TaskErrorBag');
import MainErrors          = require('../zationTaskErrors/mainTaskErrors');
import {ProcessTask, ProcessTaskEngine} from "./processTaskEngine";
// noinspection TypeScriptPreferShortImport
import {ControllerConfig}    from "../configs/appConfig";
import {ZationTask}          from "../constants/internal";
import {OptionalProcessor}   from "./optionalProcessor";
import {SingleInputDataProcessor}  from "./singleInputDataProcessor";
import ZationWorker        = require("../../main/zationWorker");

export class InputDataProcessor
{
    private inputMainProcessor : SingleInputDataProcessor;

    constructor(worker : ZationWorker) {
        this.inputMainProcessor = new SingleInputDataProcessor(worker.getPreparedSmallBag());
    }

    private async processInputObject
    (
        input : object,
        controllerInput : object,
        useInputValidation : boolean,
        processList : ProcessTask[]
    ) : Promise<object>
    {
        const promises : Promise<void>[] = [];
        const taskErrorBag = new TaskErrorBag();

        const processInfo = {
            processTaskList : processList,
            errorBag : taskErrorBag,
            inputValidation : useInputValidation,
            createProcessTaskList : true
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
                    taskErrorBag.addTaskError(new TaskError(MainErrors.inputPropertyIsMissing,
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
                taskErrorBag.addTaskError(new TaskError(MainErrors.unknownInputProperty,
                    {
                        propertyName : inputName
                    }));
            }
        }
        await Promise.all(promises);
        taskErrorBag.throwIfHasError();
        return input;
    }

    private async processInputArray
    (
        input : any[],
        controllerInput : object,
        useInputValidation : boolean,
        processList : ProcessTask[]
    ) : Promise<object>
    {
        const controllerInputKeys = Object.keys(controllerInput);
        const promises : Promise<void>[] = [];
        const taskErrorBag = new TaskErrorBag();

        const processInfo = {
            processTaskList : processList,
            errorBag : taskErrorBag,
            inputValidation : useInputValidation,
            createProcessTaskList : true
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
                    taskErrorBag.addTaskError(new TaskError(MainErrors.inputPropertyIsMissing,
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
            taskErrorBag.addTaskError(new TaskError(MainErrors.inputNotAssignable,
                {
                    index : i,
                    value : input[i]
                }));
        }
        await Promise.all(promises);
        taskErrorBag.throwIfHasError();
        return result;
    }

    private async processSingleInput
    (
        input : any,
        config : object,
        useInputValidation : boolean,
        processList : ProcessTask[]
    ) : Promise<object>
    {
        const taskErrorBag = new TaskErrorBag();
        //we have a single input config
        let inputTmp = {i : input};
        await this.inputMainProcessor.processProperty
        (inputTmp,'i',config,'',{
            errorBag : taskErrorBag,
            createProcessTaskList : true,
            inputValidation : useInputValidation,
            processTaskList : processList
        });
        taskErrorBag.throwIfHasError();
        return input;
    }

    async validationCheck(input : any,config : object,inputPath : string,errorBag : TaskErrorBag,useInputValidation : boolean = true) : Promise<void> {
        await this.inputMainProcessor.checkIsValid(input,config,inputPath,errorBag,useInputValidation);
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
            throw new TaskError(MainErrors.wrongControllerInputType,{inputType : typeof input});
        }

        const useInputValidation : boolean =
            typeof controller.inputValidation === 'boolean' ? controller.inputValidation : true;

        const taskList : ProcessTask[] = [];
        let result = input;

        if(controller.singleInput === undefined)
        {
            //we have multi input config
            const controllerInput = typeof controller.multiInput === 'object' ? controller.multiInput : {};

            if(Array.isArray(input)) {
                //throws if the validation or structure has an error
                // noinspection TypeScriptValidateTypes
                // @ts-ignore
                result = await this.processInputArray
                (input,controllerInput,useInputValidation,taskList);
            }
            else {
                //throws if the validation or structure has an error or structure
                result = await this.processInputObject
                (input,controllerInput,useInputValidation,taskList);
            }
        }
        else {
            result = await this.processSingleInput
            //can not be an string (pre compile will resolve links)
            // @ts-ignore
            (input,controller.singleInput,useInputValidation,taskList);
        }

        //check process tasks
        await ProcessTaskEngine.processTasks(taskList);

        return result;
    }
}

