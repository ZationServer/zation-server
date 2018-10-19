/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import Const                 = require('../constants/constWrapper');
import ControllerTools       = require('../controller/controllerTools');
import MainErrors            = require('../zationTaskErrors/mainTaskErrors');
import TaskError             = require('../../api/TaskError');
import TaskErrorBag          = require('../../api/TaskErrorBag');
import ZationReqTools        = require('../tools/zationReqTools');
import InputValueProcessor   = require('../input/inputValueProcessor');

class ValidChProcessor
{
    static async process(reqData,zc,worker)
    {
        if(ZationReqTools.isValidValidationStructure(reqData))
        {
            const validReq = reqData[Const.Settings.VALIDATION_REQUEST_INPUT.MAIN];

            const isSystemController = ZationReqTools.isSystemControllerReq(validReq);
            const cName = ZationReqTools.getControllerName(validReq,isSystemController);

            //Trows if not exists
            worker.getControllerPrepare.checkControllerExist(cName,isSystemController);

            let controller = worker.getControllerPrepare().getControllerConfig(cName,isSystemController);

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

            let promises : Promise<void>[] = [];
            let errorBag = new TaskErrorBag();
            for(let i = 0; i < inputToCheck.length; i++)
            {
                promises.push(new Promise<void>(async (resolve,reject) =>
                {
                    if
                    (
                        typeof inputToCheck[i] === 'object' &&
                        (
                            Array.isArray(inputToCheck[i][Const.Settings.VALIDATION_REQUEST_INPUT.INPUT_PATH]) ||
                            typeof inputToCheck[i][Const.Settings.VALIDATION_REQUEST_INPUT.INPUT_PATH] === 'string'
                        )
                        &&
                        inputToCheck[i][Const.Settings.VALIDATION_REQUEST_INPUT.INPUT_VALUE] !== undefined
                    )
                    {
                        let keyPath = inputToCheck[i][Const.Settings.VALIDATION_REQUEST_INPUT.INPUT_PATH];
                        let value   = inputToCheck[i][Const.Settings.VALIDATION_REQUEST_INPUT.INPUT_VALUE];

                        if(typeof keyPath === 'string') {
                            keyPath = keyPath.split('.');
                        }

                        let specificConfig =
                            ControllerTools.getControllerConfigFromInputPath(keyPath,controllerInput);

                        if(specificConfig !== undefined)
                        {
                            await InputValueProcessor.checkIsValid(value,specificConfig,keyPath,errorBag,useInputValidation);
                            resolve();
                        }
                        else
                        {
                            reject(new TaskError(MainErrors.inputPathInControllerNotFound,
                                {
                                    controllerName : cName,
                                    inputPath : keyPath
                                }));
                        }
                    }
                    else
                    {
                        reject(new TaskError(MainErrors.wrongInputDataStructure));
                    }
                }));
            }

            await Promise.all(promises);
            //ends when we have errors
            errorBag.throwIfHasError();

            return {};
        }
        else
        {
            throw new TaskError(MainErrors.wrongInputDataStructure);
        }
    }
}

export = ValidChProcessor;