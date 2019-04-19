/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import ControllerTools       = require('../controller/controllerTools');
import MainErrors            = require('../zationTaskErrors/mainTaskErrors');
import ZationReqTools        = require('../tools/zationReqTools');
// noinspection TypeScriptPreferShortImport
import {ZationRequest, ZationValidationCheck} from "../constants/internal";
import ZationWorker          = require("../../main/zationWorker");
import ZationConfig          = require("../../main/zationConfig");
import ControllerPrepare     = require("../controller/controllerPrepare");
import {InputDataProcessor}     from "../input/inputDataProcessor";
import {BackError}              from "../../api/BackError";
import BackErrorBag             from "../../api/BackErrorBag";

export default class ValidCheckProcessor
{
    private readonly zc : ZationConfig;
    private readonly worker : ZationWorker;

    private readonly controllerPrepare : ControllerPrepare;
    private readonly inputDataProcessor : InputDataProcessor;

    private readonly validationCheckLimit : number;

    constructor(zc : ZationConfig,worker : ZationWorker) {
        this.zc = zc;
        this.worker = worker;
        this.controllerPrepare = this.worker.getControllerPrepare();
        this.inputDataProcessor = this.worker.getInputDataProcessor();

        this.validationCheckLimit = this.zc.mainConfig.validationCheckLimit;
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
            this.controllerPrepare.checkControllerExist(cName,isSystemController);

            //check is over validation check limit
            if(validReq.i.length > this.validationCheckLimit){
                throw new BackError(MainErrors.validationCheckLimitReached,{
                   limit : this.validationCheckLimit,
                   checksCount : validReq.i.length
                });
            }

            const controller = this.controllerPrepare.getControllerConfig(cName,isSystemController);

            //end here if all is allow
            if(typeof controller.inputAllAllow === 'boolean' && controller.inputAllAllow) {
                return {};
            }

            let controllerInput;
            let singleInput = false;
            if(controller.singleInput === undefined){
                //multiInput
                controllerInput = typeof controller.multiInput === 'object' ? controller.multiInput : {};
            }
            else{
                //singleInput
                singleInput = true;
                controllerInput = controller.singleInput;
            }

            const useInputValidation : boolean =
                typeof controller.inputValidation === 'boolean' ? controller.inputValidation : true;

            let inputToCheck = validReq.i;

            let promises : Promise<void>[] = [];
            let errorBag = new BackErrorBag();
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
                        const value   = inputToCheck[i].v;
                        const {path,keyPath} = ValidCheckProcessor.processPathInfo(inputToCheck[i].ip);

                        let specificConfig = controllerInput;

                        if(keyPath.length > 0){
                            specificConfig = ControllerTools.getInputConfigAtPath(keyPath,controllerInput);
                            if(specificConfig === undefined){
                                errorBag.addBackError(new BackError(MainErrors.inputPathInControllerNotFound,
                                    {
                                        controllerName : cName,
                                        inputPath : keyPath,
                                        checkIndex : i
                                    }));
                                resolve();
                                return;
                            }
                        }

                        await this.inputDataProcessor.validationCheck(
                            value,
                            specificConfig,
                            singleInput,
                            keyPath.length === 0,
                            path,
                            errorBag,
                            useInputValidation
                        );
                        resolve();
                    }
                    else
                    {
                        errorBag.addBackError(new BackError(MainErrors.wrongValidationCheckStructure,
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
            throw new BackError(MainErrors.wrongInputDataStructure);
        }
    }

    private static processPathInfo(path : string | string[]) : {path : string,keyPath : string[]}
    {
        let keyPath : string[];
        //convert path to an array
        // noinspection SuspiciousTypeOfGuard
        if(typeof path === 'string') {
            if(path === '') {
                keyPath = [];
            }
            else{
                keyPath = path.split('.');
            }
        }
        else{
            keyPath = path;
            path = keyPath.join('.');
        }
        return {keyPath,path};
    }
}
