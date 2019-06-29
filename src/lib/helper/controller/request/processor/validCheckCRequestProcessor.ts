/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import {ZationRequest, ZationValidationCheck} from "../../../constants/internal";
import ZationWorker          = require("../../../../main/zationWorker");
import BackError                from "../../../../api/BackError";
import ControllerPrepare        from "../../controllerPrepare";
import ZationConfig             from "../../../config/manager/zationConfig";
import ZationReqUtils           from "../../../utils/zationReqUtils";
import {MainBackErrors}         from "../../../zationBackErrors/mainBackErrors";
import SHBridge                 from "../../../bridges/shBridge";

export default class ValidCheckCRequestProcessor
{
    private readonly zc : ZationConfig;
    private readonly worker : ZationWorker;

    private readonly controllerPrepare : ControllerPrepare;

    private readonly validationCheckLimit : number;

    constructor(zc : ZationConfig,worker : ZationWorker) {
        this.zc = zc;
        this.worker = worker;
        this.controllerPrepare = this.worker.getControllerPrepare();

        this.validationCheckLimit = this.zc.mainConfig.validationCheckLimit;
    }

    async process(reqData : ZationRequest,shBridge : SHBridge)
    {
        if(ZationReqUtils.isValidValidationStructure(reqData))
        {
            //is checked in isValidValidationStructure
            const validReq : ZationValidationCheck = (reqData.v as ZationValidationCheck);

            const isSystemController = ZationReqUtils.isSystemControllerReq(validReq);
            const cId = ZationReqUtils.getControllerId(validReq,isSystemController);

            //Throws if not exists
            this.controllerPrepare.checkControllerExist(cId,isSystemController);

            //check is over validation check limit
            if(validReq.i.length > this.validationCheckLimit){
                throw new BackError(MainBackErrors.validationCheckLimitReached,{
                   limit : this.validationCheckLimit,
                   checksCount : validReq.i.length
                });
            }

            //Throws if apiLevel not found
            const {inputValidationCheck} =
                this.controllerPrepare.getControllerPrepareData(cId,shBridge.getApiLevel(),isSystemController);

            await inputValidationCheck(validReq.i);
            return {};
        }
        else {
            throw new BackError(MainBackErrors.wrongInputDataStructure);
        }
    }
}
