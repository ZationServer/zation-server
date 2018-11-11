/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import ControllerTools       = require('../controller/controllerTools');
import MainErrors            = require('../zationTaskErrors/mainTaskErrors');
import TaskError             = require('../../api/TaskError');
import TaskErrorBag          = require('../../api/TaskErrorBag');
import ZationReqTools        = require('../tools/zationReqTools');
import InputValueProcessor   = require('../input/inputMainProcessor');
import {ControllerConfig}      from "../configs/appConfig";
import {ZationRequest, ZationValidationCheck} from "../constants/internal";

class ValidChProcessor
{
    static async process(reqData : ZationRequest,zc,worker)
    {
        if(ZationReqTools.isValidValidationStructure(reqData))
        {
            //is checked in isValidValidationStructure
            // @ts-ignore
            const validReq : ZationValidationCheck = reqData.v;

            const isSystemController = ZationReqTools.isSystemControllerReq(validReq);
            const cName = ZationReqTools.getControllerName(validReq,isSystemController);

            //Trows if not exists
            worker.getControllerPrepare().checkControllerExist(cName,isSystemController);

            let controller = worker.getControllerPrepare().getControllerConfig(cName,isSystemController);

            //end here if all is allow
            if(typeof controller.inputAllAllow === 'boolean' && controller.inputAllAllow) {
                return {};
            }

            let controllerInput = controller.hasOwnProperty(nameof<ControllerConfig>(s => s.input)) ?
                controller.input : {};

            let useInputValidation = true;
            if(controller.hasOwnProperty(nameof<ControllerConfig>(s => s.inputValidation))) {
                useInputValidation = controller.inputValidation;
            }

            let inputToCheck = validReq.i;

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
                            Array.isArray(inputToCheck[i].ip) ||
                            typeof inputToCheck[i].ip === 'string'
                        )
                        &&
                        inputToCheck[i].v !== undefined
                    )
                    {
                        let keyPath : string[];
                        let value   = inputToCheck[i].v;
                        let path    = inputToCheck[i].ip;

                        if(typeof path === 'string') {
                            keyPath = path.split('.');
                        }
                        else{
                            keyPath = path;
                        }

                        if(keyPath.length === 0) {
                            reject(new TaskError(MainErrors.inputPathNotHasAtLeastOneEntry,
                                {
                                    inputPath : keyPath
                                }));
                        }

                        let specificConfig =
                            ControllerTools.getControllerConfigFromInputPath(keyPath,controllerInput);

                        if(specificConfig !== undefined) {
                            await InputValueProcessor.checkIsValid
                            (value,specificConfig,path,errorBag,worker.getPreparedSmallBag(),useInputValidation);
                            resolve();
                        }
                        else {
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