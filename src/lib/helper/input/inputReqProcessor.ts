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
import {InputMainProcessor}  from "./inputMainProcessor";

class InputReqProcessor
{
    private static async processInputObject
    (
        input : object,
        controllerInput : object,
        inputMainProcessor : InputMainProcessor,
        useInputValidation : boolean,
        processList : ProcessTask[]
    ) : Promise<object>
    {
        let promises : Promise<void>[] = [];
        let taskErrorBag = new TaskErrorBag();
        for(let inputName in controllerInput)
        {
            if(controllerInput.hasOwnProperty(inputName) && input[inputName] !== undefined) {
                promises.push(new Promise<void>(async (resolve) => {
                    await inputMainProcessor.processProperty(input,inputName,controllerInput[inputName],inputName,{
                        processTaskList : processList,
                        errorBag : taskErrorBag,
                        inputValidation : useInputValidation,
                        createProcessTaskList : true
                    });
                    resolve();
                }));
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

    private static async processInputArray
    (
        input : any[],
        controllerInput : object,
        inputMainProcessor : InputMainProcessor,
        useInputValidation : boolean,
        processList : ProcessTask[]
    ) : Promise<object>
    {
        const controllerInputKeys = Object.keys(controllerInput);
        let promises : Promise<void>[] = [];
        let taskErrorBag = new TaskErrorBag();
        let result = {};
        for(let i = 0; i < controllerInputKeys.length; i++)
        {
            if(typeof input[i] !== 'undefined')
            {
                promises.push(new Promise<void>(async (resolve) => {
                    const config = controllerInput[controllerInputKeys[i]];
                    result[controllerInputKeys[i]] = input[i];
                    await inputMainProcessor.processProperty(result,controllerInputKeys[i],config,controllerInputKeys[i],{
                        processTaskList : processList,
                        errorBag : taskErrorBag,
                        inputValidation : useInputValidation,
                        createProcessTaskList : true
                    });
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

    private static async processSingleInput
    (
        input : any,
        config : object,
        inputMainProcessor : InputMainProcessor,
        useInputValidation : boolean,
        processList : ProcessTask[]
    ) : Promise<object>
    {
        let taskErrorBag = new TaskErrorBag();
        //we have a single input config
        let inputTmp = {i : input};
        await inputMainProcessor.processProperty
        (inputTmp,'i',config,'',{
            errorBag : taskErrorBag,
            createProcessTaskList : true,
            inputValidation : useInputValidation,
            processTaskList : processList
        });
        taskErrorBag.throwIfHasError();
        return input;
    }

    //fast Checks of the input
    //than create the checked Data
    static async processInput(task : ZationTask, controller : ControllerConfig, inputMainProcessor : InputMainProcessor) : Promise<any>
    {
        if(typeof controller.inputAllAllow === 'boolean' && controller.inputAllAllow) {
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

        let useInputValidation = true;
        if(typeof controller.inputValidation === 'boolean') {
            useInputValidation = controller.inputValidation;
        }

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
                result = await InputReqProcessor.processInputArray
                (input,controllerInput,inputMainProcessor,useInputValidation,taskList);
            }
            else {
                //throws if the validation or structure has an error or structure
                result = await InputReqProcessor.processInputObject
                (input,controllerInput,inputMainProcessor,useInputValidation,taskList);
            }
        }
        else {
            result = await InputReqProcessor.processSingleInput
            //can not be an string (pre compile will resolve links)
            // @ts-ignore
            (input,controller.singleInput,inputMainProcessor,useInputValidation,taskList);
        }

        //check process tasks
        await ProcessTaskEngine.processTasks(taskList);

        return result;
    }
}

export = InputReqProcessor;