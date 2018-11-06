/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import ObjectTools         = require('../tools/objectTools');
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
            if(controllerInput.hasOwnProperty(inputName) && input[inputName] !== undefined)
            {
                promises.push(new Promise<void>(async (resolve) => {
                    await inputValueProcessor.
                    processInput(input,inputName,controllerInput[inputName],inputName,taskErrorBag);
                    resolve();
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
        for(let i = 0; i < input.length; i++)
        {
            promises.push(new Promise<void>(async (resolve) => {
                const config = controllerInput[controllerInputKeys[i]];
                result[controllerInputKeys[i]] = input[i];
                await inputValueProcessor.processInput
                (result,controllerInputKeys[i],config,controllerInputKeys[i],taskErrorBag);
                resolve();
            }))
        }
        await Promise.all(promises);
        taskErrorBag.throwIfHasError();
        return result;
    }

    private static getMissingInputFromArray(input : any,controllerInputKeys : any[],controllerInput : object,optionalToo : boolean = false) : any[]
    {
        let missing : any[] = [];
        let inputLength = input.length;

        for(let i = inputLength; i < controllerInputKeys.length; i++)
        {
            if(controllerInput[controllerInputKeys[i]][nameof<PropertyOptional>(s => s.isOptional)]) {
                if(optionalToo) {
                    missing.push(controllerInputKeys[i]);
                }
            }
            else {
                missing.push(controllerInputKeys[i]);
            }
        }
        return missing;
    }

    private static getMissingInputFromObject(input : any, controllerInput : object, optionalToo : boolean = false) : any[]
    {
        let missing : any[] = [];

        for(let inputName in controllerInput) {
            if(controllerInput.hasOwnProperty(inputName)) {
                if(input[inputName] === undefined) {
                    if(controllerInput[inputName][nameof<PropertyOptional>(s => s.isOptional)])
                    {
                        if(optionalToo) {
                            missing.push(inputName);
                        }
                    }
                    else {
                        missing.push(inputName);
                    }
                }
            }
        }
        return missing;
    }

    //fast Checks of the input
    //than create the checked Data
    static async processInput(task : ZationTask, controller : ControllerConfig, preparedSmallBag : SmallBag) : Promise<object>
    {
        let input = task.i;

        if(typeof controller.inputAllAllow === 'boolean'&& controller.inputAllAllow) {
            return input;
        }

        let useInputValidation = true;
        if(typeof controller.inputValidation === 'boolean') {
            useInputValidation = controller.inputValidation;
        }

        let controllerInput = typeof controller.input === 'object' ? controller.input : {};
        let controllerInputCount = ObjectTools.objectSize(controllerInput);

        let isArray = Array.isArray(input);
        // noinspection TypeScriptUnresolvedVariable
        // @ts-ignore
        let inputCount = isArray ? input.length : ObjectTools.objectSize(input);

        //to much input
        if(controllerInputCount < inputCount)
        {
            throw new TaskError(MainErrors.tooMuchInput,
                {
                    sendCount : inputCount,
                    expectedMaxCount : controllerInputCount
                });
        }
        else
        {
            let controllerInputKeys = Object.keys(controllerInput);

            let inputValueMissing = isArray ?
                InputReqProcessor.getMissingInputFromArray(input,controllerInputKeys,controllerInput,false)
                :
                InputReqProcessor.getMissingInputFromObject(input,controllerInput,false);


            if(inputValueMissing.length !== 0)
            {
                throw new TaskError(MainErrors.inputMissing,
                    {
                        inputMissing : inputValueMissing
                    });
            }
            else
            {
                const inputValueProcessor = new InputMainProcessor(useInputValidation,preparedSmallBag,true);
                let result = input;
                if(isArray) {
                    //throws if the validation has an error
                    // noinspection TypeScriptValidateTypes
                    // @ts-ignore
                    result = await InputReqProcessor.processInputArray(input,controllerInputKeys,controllerInput,inputValueProcessor);
                }
                else {
                    //throws if the validation has an error
                    result = await InputReqProcessor.processInputObject(input,controllerInput,inputValueProcessor);
                }
                await ProcessTaskEngine.processTasks(inputValueProcessor.getProcessTaskList());
                return result;
            }
        }
    }
}

export = InputReqProcessor;