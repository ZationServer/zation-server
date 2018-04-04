/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

const CA              = require('../constante/settings');
const CationValidator = require('../validator/zationValidator');
const TaskError       = require('../../api/TaskError');
const TaskErrorBag    = require('../../api/TaskErrorBag');
const SyErrors        = require('../zationTaskErrors/systemTaskErrors');

class ParamChecker
{

    static checkParamsWithObjectInput(paramData,
                                      {
                                          controllerParams,
                                          controllerParamsCount,
                                          inputParams,
                                      })
    {
        let taskErrorBag = new TaskErrorBag();
        let foundCount = 0;
        let params = {};

        for(let i = 0; i < controllerParamsCount; i++)
        {
            let inputParamTemp = inputParams[controllerParams[i][CA.PARAMS_NAME]];
            if(inputParamTemp !== undefined)
            {
                    foundCount++;
                    params[controllerParams[i][CA.PARAMS_NAME]] =
                        CationValidator.validateThis(controllerParams[i], inputParamTemp, taskErrorBag);
            }
        }
        taskErrorBag.throwMeIfHaveError();

        paramData[CA.PARAM_DATA_PARAMS] = params;
    }

    static checkParamsWithArrayInput(paramData,
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
            params[controllerParams[i][CA.PARAMS_NAME]] =
                CationValidator.validateThis(controllerParams[i],inputParams[i],taskErrorBag);
        }
        taskErrorBag.throwMeIfHaveError();
        paramData[CA.PARAM_DATA_PARAMS] = params;
    }

    static getParamsMissingFromArray(params,controllerParams,optionalToo = false)
    {
        let arrayNotFound = [];
        let paramsLength = params.length;

        for(let i = paramsLength; i < controllerParams.length; i++)
        {
            if(controllerParams[i][CA.PARAMS_IS_OPTIONAL])
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

    static getParamsMissingFromObject(params,controllerParams,optionalToo = false)
    {
        let arrayNotFound = [];
        for(let i = 0; i < controllerParams.length; i++)
        {
            if(params[controllerParams[i][CA.PARAMS_NAME]] === undefined)
            {
                if(optionalToo)
                {
                    arrayNotFound.push(controllerParams[i]);
                }
                else
                {
                    if(!controllerParams[i][CA.PARAMS_IS_OPTIONAL])
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

        let controllerParams = controller.hasOwnProperty(CA.CONTROLLER_PARAMS) ?
            controller[CA.CONTROLLER_PARAMS] : [];

        let controllerParamsCount = controller.hasOwnProperty(CA.CONTROLLER_PARAMS) ?
            controller[CA.CONTROLLER_PARAMS].length : 0;

        let inputParams = task[CA.INPUT_PARAMS];
        let isArray     = Array.isArray(inputParams);
        let inputParamsCount = isArray ? inputParams.length : ParamChecker.objectSize(inputParams);


        if(controllerParamsCount < inputParamsCount)
        {
            throw new TaskError(SyErrors.toManyParams,
                {
                    sendParams : inputParams,
                    expectedParams : controllerParams
                });
        }
        else
        {
            let paramsCanMissing = controller.hasOwnProperty(CA.CONTROLLER_PARAMS_CAN_MISSING)
                ? controller[CA.CONTROLLER_PARAMS_CAN_MISSING] : false;

            let paramsMissing = isArray ? ParamChecker.getParamsMissingFromArray(inputParams,controllerParams,false) :
                ParamChecker.getParamsMissingFromObject(inputParams,controllerParams,false);

            if(paramsMissing.length !== 0 && !paramsCanMissing)
            {
                throw new TaskError(SyErrors.paramsMissing,
                    {
                        paramsMissing : paramsMissing
                    });
            }
            else
            {

                paramData[CA.PARAM_DATA_PARAMS_Missing] = paramsMissing.length !== 0;

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
                    ParamChecker.checkParamsWithArrayInput(paramData,processData);
                }
                else
                {
                    ParamChecker.checkParamsWithObjectInput(paramData,processData);
                }
            }
        }
        return paramData;
    }

    static objectSize(obj)
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