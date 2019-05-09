/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import Bag                     from '../../api/Bag';
import ZationWorker          = require("../../main/zationWorker");
import Controller              from'../../api/Controller';
import {ResponseResult, ZationTask} from "../constants/internal";
import SHBridge                from "../bridges/shBridge";
import ValidCheckProcessor     from "./validCheckProcessor";
import AuthEngine              from "../auth/authEngine";
import BackError               from "../../api/BackError";
import BackErrorBag            from "../../api/BackErrorBag";
import ControllerPrepare       from "../controller/controllerPrepare";
import ProtocolAccessChecker   from "../protocolAccess/protocolAccessChecker";
import {MainBackErrors}        from "../zationBackErrors/mainBackErrors";
import ZationReqUtils          from "../utils/zationReqUtils";
import Result                  from "../../api/Result";
import {PrepareHandleInvokeFunction} from "../controller/controllerUtils";
import ZationConfigFull        from "../configManager/zationConfigFull";

export default class MainRequestProcessor
{
    private readonly zc : ZationConfigFull;
    private readonly worker : ZationWorker;
    private readonly validCheckProcessor : ValidCheckProcessor;

    //tmp variables for faster access
    private readonly authController : string | undefined;
    private readonly useProtocolCheck : boolean;
    private readonly useHttpMethodCheck : boolean;
    private readonly useTokenStateCheck : boolean;
    private readonly controllerPrepare : ControllerPrepare;

    constructor(zc : ZationConfigFull,worker : ZationWorker,validCheckProcessor : ValidCheckProcessor) {
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
            return this.validCheckProcessor.process(shBridge.getZationData());
        }

        let reqData = shBridge.getZationData();

        if(ZationReqUtils.isValidReqStructure(reqData,shBridge.isWebSocket()))
        {
            //Check for a auth req
            if(ZationReqUtils.isZationAuthReq(reqData)) {
                if(!this.authController) {
                    throw new BackError(MainBackErrors.authControllerNotSet);
                }
                reqData = ZationReqUtils.dissolveZationAuthReq(this.zc,reqData);
            }
            // check auth start active ?
            else if(this.worker.getIsAuthStartActive()) {
                throw new BackError(MainBackErrors.authStartActive);
            }

            //is checked by isValidReqStructure!
            // @ts-ignore
            const task : ZationTask = reqData.t;

            const isSystemController = ZationReqUtils.isSystemControllerReq(task);
            const controllerName = ZationReqUtils.getControllerName(task,isSystemController);

            //Trows if not exists
            this.controllerPrepare.checkControllerExist(controllerName,isSystemController);

            const {
                controllerConfig,
                controllerInstance,
                systemAccessCheck,
                versionAccessCheck,
                tokenStateCheck,
                prepareHandleInvoke,
                inputConsumer
            } = this.controllerPrepare.getControllerPrepareData(controllerName,isSystemController);

            //Throws if access denied
            systemAccessCheck(shBridge);

            //Throws if access denied
            versionAccessCheck(shBridge);

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
                            input = await inputConsumer(task.i);
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
                                const bag = new Bag(
                                    shBridge,
                                    this.worker,
                                    authEngine,
                                    input
                                );
                                try {
                                    await controllerInstance.wrongInput(bag,input);
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

                        const bag = new Bag(
                            shBridge,
                            this.worker,
                            authEngine,
                            input
                        );
                        return await this.processController(controllerInstance,bag,prepareHandleInvoke);
                    }
                    else {
                        throw new BackError(MainBackErrors.noAccessWithAuth,
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
                            controller: controllerName,
                            method: shBridge.getRequest().method
                        });
                }
            }
            else {
                throw new BackError(MainBackErrors.noAccessWithProtocol,
                    {
                        controllerName: controllerName,
                        protocol: ProtocolAccessChecker.getProtocol(shBridge)
                    });
            }
        }
        else {
            throw new BackError(MainBackErrors.wrongInputDataStructure, {type : shBridge.isWebSocket() ? 'ws' : 'http',input : reqData});
        }
    }

    // noinspection JSMethodCanBeStatic
    private async processController(controllerInstance : Controller,bag : Bag,prepareHandleInvoke : PrepareHandleInvokeFunction) : Promise<ResponseResult>
    {
        //process the controller handle, before handle events and finally handle.
        try {
            await prepareHandleInvoke(controllerInstance,bag);

            const result : Result | any = await controllerInstance.handle(bag,bag.getInput());

            if (!(result instanceof Result)) {
                return {r : result};
            }

            await controllerInstance.finallyHandle(bag,bag.getInput());

            return result._getJsonObj();
        }
        catch(e) {
            try {await controllerInstance.finallyHandle(bag,bag.getInput());}
            catch (e) {}
            throw e;
        }
    }

}

