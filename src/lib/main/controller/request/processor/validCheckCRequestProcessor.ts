/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import ZationWorker          = require("../../../../core/zationWorker");
import BackError                from "../../../../api/BackError";
import ControllerPrepare        from "../../controllerPrepare";
import ZationConfig             from "../../../config/manager/zationConfig";
import {MainBackErrors}         from "../../../zationBackErrors/mainBackErrors";
import SHBridge                 from "../bridges/shBridge";
import {ControllerRequest}      from "../controllerDefinitions";
import ControllerReqUtils       from "../controllerReqUtils";

export default class ValidCheckCRequestProcessor
{
    private readonly zc: ZationConfig;
    private readonly worker: ZationWorker;

    private readonly controllerPrepare: ControllerPrepare;

    private readonly validationCheckLimit: number;

    constructor(zc: ZationConfig,worker: ZationWorker) {
        this.zc = zc;
        this.worker = worker;
        this.controllerPrepare = this.worker.getControllerPrepare();

        this.validationCheckLimit = this.zc.mainConfig.validationCheckLimit;
    }

    async process(request: ControllerRequest, shBridge: SHBridge)
    {
        if(ControllerReqUtils.isValidValidationStructure(request))
        {
            const isSystemController = ControllerReqUtils.isSystemControllerReq(request);
            const cIdentifier = ControllerReqUtils.getControllerId(request,isSystemController);

            //Throws if not exists
            this.controllerPrepare.checkControllerExist(cIdentifier,isSystemController);

            //check is over validation check limit
            if(request.i.length > this.validationCheckLimit){
                throw new BackError(MainBackErrors.validationCheckLimitReached,{
                   limit: this.validationCheckLimit,
                   checksCount: request.i.length
                });
            }

            //Throws if apiLevel not found
            const {inputValidationCheck} =
                this.controllerPrepare.getControllerPreparedData(cIdentifier,shBridge.getApiLevel(),isSystemController);

            await inputValidationCheck(request.i);
            return {};
        }
        else {
            throw new BackError(MainBackErrors.wrongInputDataStructure);
        }
    }
}
