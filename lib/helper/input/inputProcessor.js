/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

const Const            = require('../constants/constWrapper');
const ValidationEngine = require('../validator/validatorEngine');
const InputWrapper     = require('../tools/inputWrapper');
const ObjectTools      = require('../tools/objectTools');
const TaskError        = require('../../api/TaskError');
const TaskErrorBag     = require('../../api/TaskErrorBag');
const MainErrors       = require('../zationTaskErrors/mainTaskErrors');

class InputProcessor
{

    static _processInputObject(paramData,
                               {
                                          controllerParams,
                                          controllerParamsCount,
                                          inputParams,
                                      })
    {
        let taskErrorBag = new TaskErrorBag();
        let params = {};

        for(let i = 0; i < controllerParamsCount; i++)
        {
            let inputParamTemp = inputParams[controllerParams[i][Const.App.PARAMS_NAME]];
            if(inputParamTemp !== undefined)
            {
                    params[controllerParams[i][Const.App.PARAMS_NAME]] =
                        CationValidator.validateThis(controllerParams[i], inputParamTemp, taskErrorBag);
            }
        }
        taskErrorBag.throwMeIfHaveError();

        paramData[Const.Settings.PARAM_DATA_PARAMS] = params;
    }

    static _convertArrayToObjectInput(input)
    {


    }

    static _getMissingInputFromArray(input, controllerInput, optionalToo = false)
    {
        let missing = [];
        let inputLength = input.length;

        let keys = Object.keys(controllerInput);

        for(let i = inputLength; i < keys.length; i++)
        {
            if(controllerInput[keys[i]][Const.App.INPUT.IS_OPTIONAL])
            {
                if(optionalToo)
                {
                    missing.push(keys[i]);
                }
            }
            else
            {
                missing.push(keys[i]);
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
            let inputCanMissing = controller.hasOwnProperty(Const.App.CONTROLLER.INPUT_CAN_MISSING)
                ? controller[Const.App.CONTROLLER.INPUT_CAN_MISSING] : false;

            let inputValueMissing = isArray ? InputProcessor._getMissingInputFromArray(input,controllerInput,false) :
                InputProcessor._getMissingInputFromObject(input,controllerInput,false);

            if(inputValueMissing.length !== 0 && !inputCanMissing)
            {
                throw new TaskError(MainErrors.inputMissing,
                    {
                        inputMissing : inputValueMissing
                    });
            }
            else
            {

                let isInputMissing = inputValueMissing.length !== 0;

                let infoData =
                    {
                        controllerInput : controllerInput,
                        controllerInputCount: controllerInputCount,
                        input: input,
                        inputCount: inputCount,
                        inputCanMissing: inputCanMissing,
                    };

                let processedData = {};

                if(isArray)
                {
                    objInput = InputProcessor._convertArrayToObjectInput(input);
                    processedData = InputProcessor._processInputArray(infoData);
                }
                else
                {
                    processedData = InputProcessor._processInputObject(infoData);
                }

                return new InputWrapper(processedData,isInputMissing);
            }
        }
    }
}

module.exports = InputProcessor;