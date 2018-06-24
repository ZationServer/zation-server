/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

const Const               = require('../constants/constWrapper');
const ValidationEngine    = require('../validator/validatorEngine');
const InputWrapper        = require('../tools/inputWrapper');
const ObjectTools         = require('../tools/objectTools');
const TaskError           = require('../../api/TaskError');
const TaskErrorBag        = require('../../api/TaskErrorBag');
const MainErrors          = require('../zationTaskErrors/mainTaskErrors');
const InputValueProcessor = require('./inputValueProcessor');

class InputProcessor
{

    static _processInputObject(controllerInput,input)
    {
        let taskErrorBag = new TaskErrorBag();
        let result = {};
        for(let inputName in controllerInput)
        {
            if(controllerInput.hasOwnProperty(inputName) && input[inputName] !== undefined)
            {
                result[inputName] =
                    InputValueProcessor.
                    _processValue(input[inputName],controllerInput[inputName],inputName,taskErrorBag);
            }
        }
        taskErrorBag.throwMeIfHaveError();
        return result;
    }

    static _processInputArray(input,controllerInputKeys,controllerInput)
    {
        let taskErrorBag = new TaskErrorBag();
        let result = {};
        for(let i = 0; i < input.length; i++)
        {
            let config = controllerInput[controllerInputKeys[i]];

            result[controllerInputKeys[i]] =
                InputValueProcessor._processValue(input[i],config,controllerInputKeys[i],taskErrorBag);
        }
        taskErrorBag.throwMeIfHaveError();
        return result;
    }

    static _getMissingInputFromArray(input,controllerInputKeys,controllerInput,optionalToo = false)
    {
        let missing = [];
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

    static _getMissingInputFromObject(input, controllerInput, optionalToo = false)
    {
        let missing = [];

        for(let inputName in controllerInput)
        {
            if(controllerInput.hasOwnProperty(inputName))
            {
                if(input[controllerInput] === undefined)
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
    static processInput(task, controller)
    {
        let controllerInput = controller.hasOwnProperty(Const.App.CONTROLLER.INPUT) ?
            controller[Const.App.CONTROLLER.INPUT] : {};
        let controllerInputCount = ObjectTools.objectSize(controllerInput);

        let input = task[Const.Settings.REQUEST_INPUT.INPUT];
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
                InputProcessor._getMissingInputFromArray(input,controllerInputKeys,controllerInput,false)
                :
                InputProcessor._getMissingInputFromObject(input,controllerInput,false);

            if(inputValueMissing.length !== 0)
            {
                throw new TaskError(MainErrors.inputMissing,
                    {
                        inputMissing : inputValueMissing
                    });
            }
            else
            {

                if(isArray)
                {
                    InputProcessor._processInputArray(input,controllerInputKeys,controllerInput);
                }
                else
                {
                    InputProcessor._processInputObject(controllerInput,input);
                }

                return new InputWrapper(input);
            }
        }
    }
}

module.exports = InputProcessor;