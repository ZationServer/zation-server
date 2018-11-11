/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import TaskError           = require('../../api/TaskError');
import TaskErrorBag        = require('../../api/TaskErrorBag');
import MainErrors          = require('../zationTaskErrors/mainTaskErrors');
import InputMainProcessor  = require('./inputMainProcessor');
import SmallBag             = require("../../api/SmallBag");
import {ProcessTaskEngine}    from "./processTaskEngine";
import {ControllerConfig, PropertyOptional} from "../configs/appConfig";
import {ZationTask}                         from "../constants/internal";

class InputReqProcessor
{
    private static async processInputObject
    (
        input : object,
        controllerInput : object,
        inputValueProcessor : InputMainProcessor
    ) : Promise<object>
    {
        let promises : Promise<void>[] = [];
        let taskErrorBag = new TaskErrorBag();
        for(let inputName in controllerInput)
        {
            if(controllerInput.hasOwnProperty(inputName) && input[inputName] !== undefined) {
                promises.push(new Promise<void>(async (resolve) => {
                    await inputValueProcessor.
                    processInput(input,inputName,controllerInput[inputName],inputName,taskErrorBag);
                    resolve();
                }));
            }
            else if(!controllerInput[inputName][nameof<PropertyOptional>(s => s.isOptional)]){
                //ups something is missing
                taskErrorBag.addTaskError(new TaskError(MainErrors.inputPropertyIsMissing,
                    {
                        propertyName : inputName,
                        input : input
                    }));
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
        controllerInputKeys : string[],
        controllerInput : object,
        inputValueProcessor : InputMainProcessor
    ) : Promise<object>
    {
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
                    await inputValueProcessor.processInput
                    (result,controllerInputKeys[i],config,controllerInputKeys[i],taskErrorBag);
                    resolve();
                }))
            }
            else if(!controllerInput[controllerInputKeys[i]][nameof<PropertyOptional>(s => s.isOptional)]){
                //ups something is missing
                taskErrorBag.addTaskError(new TaskError(MainErrors.inputPropertyIsMissing,
                    {
                        propertyName : controllerInputKeys[i],
                        input : input
                    }));
            }
        }
        //check to much input
        if(input.length > controllerInputKeys.length){
            taskErrorBag.addTaskError(new TaskError(MainErrors.tooMuchInput,
                {
                    sendCount : input.length,
                    maxCount : controllerInputKeys.length
                }));
        }
        await Promise.all(promises);
        taskErrorBag.throwIfHasError();
        return result;
    }

    //fast Checks of the input
    //than create the checked Data
    static async processInput(task : ZationTask, controller : ControllerConfig, preparedSmallBag : SmallBag) : Promise<object>
    {
        const input = task.i;

        if(typeof controller.inputAllAllow === 'boolean'&& controller.inputAllAllow) {
            return input;
        }

        let useInputValidation = true;
        if(typeof controller.inputValidation === 'boolean') {
            useInputValidation = controller.inputValidation;
        }

        const controllerInput = typeof controller.input === 'object' ? controller.input : {};

        const inputValueProcessor = new InputMainProcessor(useInputValidation,preparedSmallBag,true);
        let result = input;
        if(Array.isArray(input)) {
            //throws if the validation or structure has an error
            // noinspection TypeScriptValidateTypes
            // @ts-ignore
            const controllerInputKeys = Object.keys(controllerInput);
            result = await InputReqProcessor.processInputArray(input,controllerInputKeys,controllerInput,inputValueProcessor);
        }
        else {
            //throws if the validation or structure has an error or structure
            result = await InputReqProcessor.processInputObject(input,controllerInput,inputValueProcessor);
        }
        //check process tasks
        await ProcessTaskEngine.processTasks(inputValueProcessor.getProcessTaskList());

        return result;
    }
}

export = InputReqProcessor;