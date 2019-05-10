/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import {ZationRequest, ZationValidationCheck} from "../constants/internal";
import ZationWorker          = require("../../main/zationWorker");
import BackError                from "../../api/BackError";
import ControllerPrepare        from "../controller/controllerPrepare";
import ZationConfig             from "../configManager/zationConfig";
import ZationReqUtils           from "../utils/zationReqUtils";
import {MainBackErrors}         from "../zationBackErrors/mainBackErrors";

export default class ValidCheckProcessor
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

    async process(reqData : ZationRequest)
    {
        if(ZationReqUtils.isValidValidationStructure(reqData))
        {
            //is checked in isValidValidationStructure
            // @ts-ignore
            const validReq : ZationValidationCheck = reqData.v;

            const isSystemController = ZationReqUtils.isSystemControllerReq(validReq);
            const cName = ZationReqUtils.getControllerName(validReq,isSystemController);

            //Trows if not exists
            this.controllerPrepare.checkControllerExist(cName,isSystemController);

            //check is over validation check limit
            if(validReq.i.length > this.validationCheckLimit){
                throw new BackError(MainBackErrors.validationCheckLimitReached,{
                   limit : this.validationCheckLimit,
                   checksCount : validReq.i.length
                });
            }

            const {inputValidationCheck} =
                this.controllerPrepare.getControllerPrepareData(cName,isSystemController);

            await inputValidationCheck(validReq.i);
            return {};
        }
        else {
            throw new BackError(MainBackErrors.wrongInputDataStructure);
        }
    }
}
