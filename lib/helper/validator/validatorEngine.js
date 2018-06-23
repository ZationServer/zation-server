/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

const EasyValidator   = require('./easyValidator');
const TaskError       = require('../../api/TaskError');
const TaskErrorBag    = require('../../api/TaskErrorBag');
const ValidatorErrors = require('../zationTaskErrors/validatorTaskErrors');
const MainErrors      = require('../zationTaskErrors/mainTaskErrors');
const Const           = require('../constants/constWrapper');

class ValidatorEngine
{

    static validateThis(param,input,taskErrorBag)
    {

        let inputName = param[Const.Settings.PARAMS_NAME];

        let errorData = {
            paramValue : input,
            paramName : inputName
        };

        for(let k in param)
        {
            let v = '';
            if(param.hasOwnProperty(k))
            {
                v = param[k];
            }

            //Performance Boost
            if(k === Const.Settings.PARAMS_NAME)
            {
                continue;
            }


            if(k === Const.Validator.TYPE && (v !== Const.Validator.TYPE_ALL))
            {
                if(Array.isArray(v))
                {
                    let taskErrorBagTemp = new TaskErrorBag();
                    let tempInput        = input;

                    for(let i = 0; i < v.length; i++)
                    {
                        let tempCount = taskErrorBagTemp.getTaskErrorCount();
                        let maybeInput = ValidatorEngine._validateType(taskErrorBagTemp,v[i],input,errorData);
                        if(tempCount === taskErrorBagTemp.getTaskErrorCount())
                        {
                            tempInput = maybeInput;
                        }
                    }

                    if(taskErrorBagTemp.getTaskErrorCount() < v.length)
                    {
                        input = tempInput;
                    }
                    else
                    {
                        taskErrorBag.addErrorsFromTaskErrorBag(taskErrorBagTemp);
                    }
                }
                else
                {
                    input = ValidatorEngine._validateType(taskErrorBag,v,input,errorData);
                }
            }

        }
        return input;
    }

    static _validateType(taskErrorBag,v,input,errorData)
    {
        if(v === '')
        {
            taskErrorBag.addTaskError(new TaskError(MainErrors.noValidatorTypeValue));
        }
        else if(v.length > 0)
        {
            taskErrorBag.addTaskError(new TaskError(MainErrors.notValidValidatorTypeValue),{value : v});
        }
        return input;
    }
}



module.exports = ValidatorEngine;