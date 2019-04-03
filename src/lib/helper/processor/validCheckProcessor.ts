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
// noinspection TypeScriptPreferShortImport
import {ControllerConfig}      from "../configs/appConfig";
import {ZationRequest, ZationValidationCheck} from "../constants/internal";
import ZationWorker          = require("../../main/zationWorker");
import ZationConfig          = require("../../main/zationConfig");

export class ValidCheckProcessor
{
    private readonly zc : ZationConfig;
    private readonly worker : ZationWorker;

    constructor(zc : ZationConfig,worker : ZationWorker) {
        this.zc = zc;
        this.worker = worker;
    }

    async process(reqData : ZationRequest)
    {
        if(ZationReqTools.isValidValidationStructure(reqData))
        {
            //is checked in isValidValidationStructure
            // @ts-ignore
            const validReq : ZationValidationCheck = reqData.v;

            const isSystemController = ZationReqTools.isSystemControllerReq(validReq);
            const cName = ZationReqTools.getControllerName(validReq,isSystemController);

            //Trows if not exists
            this.worker.getControllerPrepare().checkControllerExist(cName,isSystemController);

            let controller = this.worker.getControllerPrepare().getControllerConfig(cName,isSystemController);

            //end here if all is allow
            if(typeof controller.inputAllAllow === 'boolean' && controller.inputAllAllow) {
                return {};
            }

            let controllerInput = controller.hasOwnProperty(nameof<ControllerConfig>(s => s.input)) ?
                controller.input : {};

            let useInputValidation = true;
            if(controller.hasOwnProperty(nameof<ControllerConfig>(s => s.inputValidation))) {
                useInputValidation = !!controller.inputValidation;
            }

            let inputToCheck = validReq.i;

            let promises : Promise<void>[] = [];
            let errorBag = new TaskErrorBag();
            for(let i = 0; i < inputToCheck.length; i++)
            {
                promises.push(new Promise<void>(async (resolve) =>
                {
                    // noinspection SuspiciousTypeOfGuard
                    if
                    (
                        typeof inputToCheck[i] === 'object' &&
                        (
                            Array.isArray(inputToCheck[i].ip) ||
                            typeof inputToCheck[i].ip === 'string'
                        )
                    )
                    {
                        let keyPath : string[];
                        const value   = inputToCheck[i].v;
                        let path    = inputToCheck[i].ip;

                        // noinspection SuspiciousTypeOfGuard
                        if(typeof path === 'string') {
                            keyPath = path.split('.');
                        }
                        else{
                            keyPath = path;
                        }

                        if(keyPath.length === 0) {
                            errorBag.addTaskError(new TaskError(MainErrors.inputPathNotHasAtLeastOneEntry,
                                {
                                    inputPath : keyPath,
                                    checkIndex : i
                                }));
                            resolve();
                            return;
                        }

                        let specificConfig =
                            // @ts-ignore
                            ControllerTools.getControllerConfigFromInputPath(keyPath,controllerInput);

                        if(specificConfig !== undefined) {
                            await this.worker.getInputReqProcessor().validationCheck
                            (value,specificConfig,path,errorBag,useInputValidation);
                            resolve();
                        }
                        else {
                            errorBag.addTaskError(new TaskError(MainErrors.inputPathInControllerNotFound,
                                {
                                    controllerName : cName,
                                    inputPath : keyPath,
                                    checkIndex : i
                                }));
                            resolve();
                        }
                    }
                    else
                    {
                        errorBag.addTaskError(new TaskError(MainErrors.wrongValidationCheckStructure,
                            {
                                checkIndex : i
                            }));
                        resolve();
                    }
                }));
            }

            await Promise.all(promises);
            //ends when we have errors
            errorBag.throwIfHasError();

            return {};
        }
        else {
            throw new TaskError(MainErrors.wrongInputDataStructure);
        }
    }
}
