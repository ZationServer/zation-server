/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import Const               = require('../constants/constWrapper');
import InputWrapper        = require('../tools/inputWrapper');
import ObjectTools         = require('../tools/objectTools');
import TaskError           = require('../../api/TaskError');
import TaskErrorBag        = require('../../api/TaskErrorBag');
import MainErrors          = require('../zationTaskErrors/mainTaskErrors');
import InputValueProcessor = require('./inputValueProcessor');
import SmallBag             = require("../../api/SmallBag");

class InputProcessor
{
    private static async processInputObject
    (
        controllerInput : object,
        input : any,
        useInputValidation : boolean,
        preparedSmallBag : SmallBag
    ) : Promise<object>
    {
        let inputValueProcessor = new InputValueProcessor(useInputValidation,true,preparedSmallBag);

        let promises : Promise<void>[] = [];
        let taskErrorBag = new TaskErrorBag();
        let result = {};
        for(let inputName in controllerInput)
        {
            if(controllerInput.hasOwnProperty(inputName) && input[inputName] !== undefined)
            {
                promises.push(new Promise<void>(async (resolve) => {
                    result[inputName] = await
                        inputValueProcessor.
                        processValue(input[inputName],controllerInput[inputName],inputName,taskErrorBag);
                    resolve();
                }));
            }
        }
        await Promise.all(promises);

        taskErrorBag.throwMeIfHaveError();
        return result;
    }

    private static async processInputArray
    (
        input : any,
        controllerInputKeys : string[],
        controllerInput : object,
        useInputValidation : boolean,
        preparedSmallBag : SmallBag
    ) : Promise<object>
    {
        let inputValueProcessor = new InputValueProcessor(useInputValidation,true,preparedSmallBag);

        let promises : Promise<void>[] = [];
        let taskErrorBag = new TaskErrorBag();
        let result = {};
        for(let i = 0; i < input.length; i++)
        {
            promises.push(new Promise<void>(async (resolve) => {
                let config = controllerInput[controllerInputKeys[i]];
                result[controllerInputKeys[i]] = await
                inputValueProcessor.processValue(input[i],config,controllerInputKeys[i],taskErrorBag);
                resolve();
            }))
        }
        await Promise.all(promises);

        taskErrorBag.throwMeIfHaveError();
        return result;
    }

    private static getMissingInputFromArray(input : any,controllerInputKeys : any[],controllerInput : object,optionalToo : boolean = false) : any[]
    {
        let missing : any[] = [];
        let inputLength = input.length;

        for(let i = inputLength; i < controllerInputKeys.length; i++)
        {
            if(controllerInput[controllerInputKeys[i]][Const.App.INPUT.IS_OPTIONAL])
            {
                if(optionalToo)
                {
                    missing.push(controllerInputKeys[i]);
                }
            }
            else
            {
                missing.push(controllerInputKeys[i]);
            }
        }
        return missing;
    }

    private static getMissingInputFromObject(input : any, controllerInput : object, optionalToo : boolean = false) : any[]
    {
        let missing : any[] = [];

        for(let inputName in controllerInput)
        {
            if(controllerInput.hasOwnProperty(inputName))
            {
                if(input[inputName] === undefined)
                {
                    if(controllerInput[inputName][Const.App.INPUT.IS_OPTIONAL])
                    {
                        if(optionalToo)
                        {
                            missing.push(inputName);
                        }
                    }
                    else
                    {
                        missing.push(inputName);
                    }
                }
            }
        }
        return missing;
    }

    //fast Checks of the input
    //than create the checked Data
    static async processInput(task : object, controller : object, preparedSmallBag : SmallBag) : Promise<InputWrapper>
    {
        let input = task[Const.Settings.REQUEST_INPUT.INPUT];

        if(typeof controller[Const.App.CONTROLLER.INPUT_ALL_ALLOW] === 'boolean'&&
            controller[Const.App.CONTROLLER.INPUT_ALL_ALLOW])
        {
            return new InputWrapper(input);
        }

        let useInputValidation = true;
        if(controller.hasOwnProperty(Const.App.CONTROLLER.INPUT_VALIDATION))
        {
            useInputValidation = controller[Const.App.CONTROLLER.INPUT_VALIDATION];
        }

        let controllerInput = controller.hasOwnProperty(Const.App.CONTROLLER.INPUT) ?
            controller[Const.App.CONTROLLER.INPUT] : {};
        let controllerInputCount = ObjectTools.objectSize(controllerInput);

        let isArray     = Array.isArray(input);
        let inputCount = isArray ? input.length : ObjectTools.objectSize(input);

        //to much input
        if(controllerInputCount < inputCount)
        {
            throw new TaskError(MainErrors.toMuchInput,
                {
                    sendCount : inputCount,
                    expectedMaxCount : controllerInputCount
                });
        }
        else
        {
            let controllerInputKeys = Object.keys(controllerInput);

            let inputValueMissing = isArray ?
                InputProcessor.getMissingInputFromArray(input,controllerInputKeys,controllerInput,false)
                :
                InputProcessor.getMissingInputFromObject(input,controllerInput,false);


            if(inputValueMissing.length !== 0)
            {
                throw new TaskError(MainErrors.inputMissing,
                    {
                        inputMissing : inputValueMissing
                    });
            }
            else
            {
                let result = input;
                if(isArray)
                {
                    result = await
                        InputProcessor.processInputArray(input,controllerInputKeys,controllerInput,useInputValidation,preparedSmallBag);
                }
                else
                {
                    result = await
                        InputProcessor.processInputObject(controllerInput,input,useInputValidation,preparedSmallBag);
                }
                return new InputWrapper(result);
            }
        }
    }
}

export = InputProcessor;