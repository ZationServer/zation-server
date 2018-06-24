/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

const Const                 = require('../constants/constWrapper');
const ControllerTools       = require('../tools/controllerTools');
const MainErrors            = require('../zationTaskErrors/mainTaskErrors');
const TaskError             = require('../../api/TaskError');
const TaskErrorBag          = require('../../api/TaskErrorBag');
const ZationReqTools        = require('../tools/zationReqTools');
const InputValueProcessor   = require('../input/inputValueProcessor');

class ValidChProcessor
{
    static async process(reqData,zc)
    {
        if(ZationReqTools.isValidValidationStructure(reqData))
        {
            let validReq = reqData[Const.Settings.VALIDATION_REQUEST_INPUT.MAIN];
            let cName = validReq[Const.Settings.VALIDATION_REQUEST_INPUT.CONTROLLER];

            //throws if not found!
            let controller = ControllerTools.getControllerConfig(zc,cName);

            //end here if all is allow
            if(typeof controller[Const.App.CONTROLLER.INPUT_ALL_ALLOW] === 'boolean' &&
                controller[Const.App.CONTROLLER.INPUT_ALL_ALLOW])
            {
                return {};
            }

            let controllerInput = controller.hasOwnProperty(Const.App.CONTROLLER.INPUT) ?
                controller[Const.App.CONTROLLER.INPUT] : {};

            let useInputValidation = true;
            if(controller.hasOwnProperty(Const.App.CONTROLLER.INPUT_VALIDATION))
            {
                useInputValidation = controller[Const.App.CONTROLLER.INPUT_VALIDATION];
            }

            let inputToCheck = validReq[Const.Settings.VALIDATION_REQUEST_INPUT.INPUT];

            let errorBag = new TaskErrorBag();
            for(let i = 0; i < inputToCheck.length; i++)
            {
                if
                (
                    typeof inputToCheck[i] === 'object' &&
                    Array.isArray(inputToCheck[i][Const.Settings.VALIDATION_REQUEST_INPUT.KEY_PATH]) &&
                    inputToCheck[i][Const.Settings.VALIDATION_REQUEST_INPUT.VALUE] !== undefined
                )
                {
                    let keyPath = inputToCheck[i][Const.Settings.VALIDATION_REQUEST_INPUT.KEY_PATH];
                    let value   = inputToCheck[i][Const.Settings.VALIDATION_REQUEST_INPUT.VALUE];

                    let specificConfig =
                        ControllerTools.getControllerConfigFromInputPath(keyPath,controllerInput);

                    if(specificConfig !== undefined)
                    {
                        InputValueProcessor.checkIsValid(value,specificConfig,keyPath,errorBag,useInputValidation);
                    }
                    else
                    {
                        throw new TaskError(MainErrors.inputPathInControllerNotFound,
                            {
                                controllerName : cName,
                                inputPath : keyPath
                            });
                    }
                }
                else
                {
                    throw new TaskError(MainErrors.wrongInputData);
                }
            }
            //ends when we have errors
            errorBag.throwMeIfHaveError();

            return {};
        }
        else
        {
            throw new TaskError(MainErrors.wrongInputData);
        }
    }
}

module.exports = ValidChProcessor;