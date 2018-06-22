/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

const Const           = require('../constants/constWrapper');
const CationValidator = require('../validator/validatorEngine');
const TaskError       = require('../../api/TaskError');
const TaskErrorBag    = require('../../api/TaskErrorBag');
const MainErrors        = require('../zationTaskErrors/mainTaskErrors');

class ParamChecker
{

    static _checkParamsWithObjectInput(paramData,
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

    static _checkParamsWithArrayInput(paramData,
                                     {
                                         controllerParams,
                                         controllerParamsCount,
                                         inputParams,
                                         inputParamsCount,
                                     })
    {
        let params = {};
        let taskErrorBag = new TaskErrorBag();
        for(let i = 0; i < inputParamsCount; i++)
        {
            params[controllerParams[i][Const.App.PARAMS_NAME]] =
                CationValidator.validateThis(controllerParams[i],inputParams[i],taskErrorBag);
        }
        taskErrorBag.throwMeIfHaveError();
        paramData[Const.Settings.PARAM_DATA_PARAMS] = params;
    }

    static _getParamsMissingFromArray(params,controllerParams,optionalToo = false)
    {
        let arrayNotFound = [];
        let paramsLength = params.length;

        for(let i = paramsLength; i < controllerParams.length; i++)
        {
            if(controllerParams[i][Const.App.PARAMS_IS_OPTIONAL])
            {
                if(optionalToo)
                {
                    arrayNotFound.push(controllerParams[i]);
                }
            }
            else
            {
                arrayNotFound.push(controllerParams[i]);
            }
        }
        return arrayNotFound;
    }

    static _getParamsMissingFromObject(params,controllerParams,optionalToo = false)
    {
        let arrayNotFound = [];
        for(let i = 0; i < controllerParams.length; i++)
        {
            if(params[controllerParams[i][Const.App.PARAMS_NAME]] === undefined)
            {
                if(optionalToo)
                {
                    arrayNotFound.push(controllerParams[i]);
                }
                else
                {
                    if(!controllerParams[i][Const.App.PARAMS_IS_OPTIONAL])
                    {
                        arrayNotFound.push(controllerParams[i]);
                    }
                }
            }
        }
        return arrayNotFound;
    }

    static createParamsAndCheck(task,controller)
    {
        let paramData = {};

        let controllerInput = controller.hasOwnProperty(Const.App.CONTROLLER_INPUT) ?
            controller[Const.App.CONTROLLER_INPUT] : {};

        let controllerParamsCount = controller.hasOwnProperty(Const.App.CONTROLLER_PARAMS) ?
            controller[Const.App.CONTROLLER_PARAMS].length : 0;

        let inputParams = task[Const.Settings.INPUT_PARAMS];
        let isArray     = Array.isArray(inputParams);
        let inputParamsCount = isArray ? inputParams.length : ParamChecker._objectSize(inputParams);


        if(controllerParamsCount < inputParamsCount)
        {
            throw new TaskError(MainErrors.toManyParams,
                {
                    sendParams : inputParams,
                    expectedParams : controllerParams
                });
        }
        else
        {
            let paramsCanMissing = controller.hasOwnProperty(Const.App.CONTROLLER_PARAMS_CAN_MISSING)
                ? controller[Const.App.CONTROLLER_PARAMS_CAN_MISSING] : false;

            let paramsMissing = isArray ? ParamChecker._getParamsMissingFromArray(inputParams,controllerParams,false) :
                ParamChecker._getParamsMissingFromObject(inputParams,controllerParams,false);

            if(paramsMissing.length !== 0 && !paramsCanMissing)
            {
                throw new TaskError(MainErrors.paramsMissing,
                    {
                        paramsMissing : paramsMissing
                    });
            }
            else
            {

                paramData[Const.Settings.PARAM_DATA_PARAMS_MISSING] = paramsMissing.length !== 0;

                let processData =
                    {
                        controllerParams,
                        controllerParamsCount,
                        inputParams,
                        inputParamsCount,
                        paramsCanMissing,
                    };

                if(isArray)
                {
                    ParamChecker._checkParamsWithArrayInput(paramData,processData);
                }
                else
                {
                    ParamChecker._checkParamsWithObjectInput(paramData,processData);
                }
            }
        }
        return paramData;
    }

    static _objectSize(obj)
    {
        let size = 0;
        for(let k in obj)
        {
            if(obj.hasOwnProperty(k))
            {
                size++;
            }
        }
        return size;
    }
}

module.exports = ParamChecker;