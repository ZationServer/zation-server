/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import RequestBag              from '../../../../api/RequestBag';
import ZationWorker          = require("../../../../main/zationWorker");
import Controller              from '../../../../api/Controller';
import SHBridge                from "../../../bridges/shBridge";
import ValidCheckCRequestProcessor     from "./validCheckCRequestProcessor";
import AuthEngine              from "../../../auth/authEngine";
import BackError               from "../../../../api/BackError";
import BackErrorBag            from "../../../../api/BackErrorBag";
import ControllerPrepare       from "../../controllerPrepare";
import ProtocolAccessChecker   from "../../../protocolAccess/protocolAccessChecker";
import {MainBackErrors}        from "../../../zationBackErrors/mainBackErrors";
import ControllerReqUtils      from "../controllerReqUtils";
import Result                            from "../../../../api/Result";
import {MiddlewareInvokeFunction}        from "../../controllerUtils";
import ZationConfigFull                  from "../../../config/manager/zationConfigFull";
import {ResponseResult, ZationTask}      from "../controllerDefinitions";

export default class MainCRequestProcessor
{
    private readonly zc : ZationConfigFull;
    private readonly worker : ZationWorker;
    private readonly validCheckProcessor : ValidCheckCRequestProcessor;

    //tmp variables for faster access
    private readonly authController : string | undefined;
    private readonly useProtocolCheck : boolean;
    private readonly useHttpMethodCheck : boolean;
    private readonly useTokenStateCheck : boolean;
    private readonly controllerPrepare : ControllerPrepare;

    constructor(zc : ZationConfigFull,worker : ZationWorker,validCheckProcessor : ValidCheckCRequestProcessor) {
        this.zc = zc;
        this.worker = worker;
        this.validCheckProcessor = validCheckProcessor;

        this.authController = this.zc.appConfig.authController;
        this.useProtocolCheck = this.zc.mainConfig.useProtocolCheck;
        this.useHttpMethodCheck = this.zc.mainConfig.useHttpMethodCheck;
        this.useTokenStateCheck = this.zc.mainConfig.useTokenStateCheck;
        this.controllerPrepare = this.worker.getControllerPrepare();
    }

    async process(shBridge : SHBridge)
    {
        //is validation check request?
        if(shBridge.isValidationCheckReq()) {
            return this.validCheckProcessor.process(shBridge.getZationData(),shBridge);
        }

        let reqData = shBridge.getZationData();

        if(ControllerReqUtils.isValidReqStructure(reqData,shBridge.isWebSocket()))
        {
            //Check for a auth req
            if(ControllerReqUtils.isZationAuthReq(reqData)) {
                if(!this.authController) {
                    throw new BackError(MainBackErrors.authControllerNotSet);
                }
                reqData = ControllerReqUtils.dissolveZationAuthReq(this.zc,reqData);
            }
            // check auth start active ?
            else if(this.worker.getIsAuthStartActive()) {
                throw new BackError(MainBackErrors.authStartActive);
            }

            //is checked by isValidReqStructure!
            const task : ZationTask = (reqData.t as ZationTask);

            const isSystemController = ControllerReqUtils.isSystemControllerReq(task);
            const controllerId = ControllerReqUtils.getControllerId(task,isSystemController);

            //Trows if not exists
            this.controllerPrepare.checkControllerExist(controllerId,isSystemController);

            //Throws if apiLevel not found
            const {
                controllerConfig,
                controllerInstance,
                systemAccessCheck,
                versionAccessCheck,
                tokenStateCheck,
                middlewareInvoke,
                inputConsume
            } = this.controllerPrepare.getControllerPrepareData(controllerId,shBridge.getApiLevel(),isSystemController);


            if(!systemAccessCheck(shBridge)){
                throw new BackError(MainBackErrors.noAccessWithSystem,{system : shBridge.getSystem()});
            }

            if(!versionAccessCheck(shBridge)){
                throw new BackError(MainBackErrors.noAccessWithVersion,{version : shBridge.getVersion()});
            }

            const authEngine : AuthEngine = shBridge.getAuthEngine();

            //check protocol
            if(!this.useProtocolCheck || ProtocolAccessChecker.hasProtocolAccess(shBridge,controllerConfig)) {

                //check http method
                if (
                    (!shBridge.isWebSocket() && (!this.useHttpMethodCheck || ProtocolAccessChecker.hasHttpMethodAccess(shBridge,controllerConfig)))
                    || shBridge.isWebSocket()
                )
                {
                    //check access to controller
                    if(!this.useTokenStateCheck || (await tokenStateCheck(authEngine))) {

                        let input : object;
                        //check input
                        try {
                            input = await inputConsume(task.i);
                        }
                        catch (e) {
                            //invoke controller wrong input function
                            if(e instanceof BackError || e instanceof BackErrorBag) {

                                //create backErrorBag
                                const errorBag = new BackErrorBag();
                                if(e instanceof BackError){
                                    errorBag.addBackError(e);
                                }
                                else{
                                    errorBag.addFromBackErrorBag(e);
                                }
                                e = errorBag;

                                const input = task.i;
                                const reqBag = new RequestBag(
                                    shBridge,
                                    this.worker,
                                    authEngine,
                                    input
                                );
                                try {
                                    await controllerInstance.wrongInput(reqBag,input,e);
                                }
                                catch (innerErr) {
                                    if(innerErr instanceof BackError) {
                                        e.addBackError(innerErr);
                                    }
                                    else if(innerErr instanceof BackErrorBag) {
                                        e.addFromBackErrorBag(innerErr);
                                    }
                                    else {
                                        //unknown error
                                        throw innerErr;
                                    }
                                }
                            }
                            //than throw the input for return it to the client
                            throw e;
                        }

                        const reqBag = new RequestBag(
                            shBridge,
                            this.worker,
                            authEngine,
                            input
                        );
                        return this.processController(controllerInstance,reqBag,input,middlewareInvoke);
                    }
                    else {
                        throw new BackError(MainBackErrors.noAccessWithTokenState,
                            {
                                authUserGroup: authEngine.getAuthUserGroup(),
                                authIn: authEngine.isAuth(),
                                userId : authEngine.getUserId()
                            });
                    }
                }
                else {
                    throw new BackError(MainBackErrors.noAccessWithHttpMethod,
                        {
                            controller: controllerId,
                            method: shBridge.getRequest().method
                        });
                }
            }
            else {
                throw new BackError(MainBackErrors.noAccessWithProtocol,
                    {
                        controller: controllerId,
                        protocol: ProtocolAccessChecker.getProtocol(shBridge)
                    });
            }
        }
        else {
            throw new BackError(MainBackErrors.wrongInputDataStructure, {type : shBridge.isWebSocket() ? 'ws' : 'http',input : reqData});
        }
    }

    // noinspection JSMethodCanBeStatic
    private async processController(controllerInstance : Controller, reqBag : RequestBag, input : any, middlewareInvoke : MiddlewareInvokeFunction) : Promise<ResponseResult>
    {
        //process the controller handle, before handle events and finally handle.
        try {
            await middlewareInvoke(controllerInstance,reqBag);

            const result : Result | any = await controllerInstance.handle(reqBag,input);

            if (!(result instanceof Result)) {
                return {r : result};
            }

            await controllerInstance.finallyHandle(reqBag,input);

            return result._getJsonObj();
        }
        catch(e) {
            try {await controllerInstance.finallyHandle(reqBag,input);}
            catch (e) {}
            throw e;
        }
    }

}

