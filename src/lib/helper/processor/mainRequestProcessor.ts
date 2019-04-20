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
import InputDataProcessor      from "../input/inputDataProcessor";
import ValidCheckProcessor     from "./validCheckProcessor";
import AuthEngine              from "../auth/authEngine";
import BackError               from "../../api/BackError";
import BackErrorBag            from "../../api/BackErrorBag";
import ControllerPrepare       from "../controller/controllerPrepare";
import ProtocolAccessChecker   from "../protocolAccess/protocolAccessChecker";
import ZationConfig            from "../../main/zationConfig";
import {MainBackErrors}        from "../zationBackErrors/mainBackErrors";
import ZationReqTools          from "../tools/zationReqTools";
import TokenEngine             from "../token/tokenEngine";
import Result                  from "../../api/Result";
import ControllerTools         from "../controller/controllerTools";

export default class MainRequestProcessor
{
    private readonly zc : ZationConfig;
    private readonly worker : ZationWorker;
    private readonly inputDataProcessor : InputDataProcessor;
    private readonly validCheckProcessor : ValidCheckProcessor;

    //tmp variables for faster access
    private readonly authController : string | undefined;
    private readonly useProtocolCheck : boolean;
    private readonly useHttpMethodCheck : boolean;
    private readonly useAuth : boolean;
    private readonly controllerPrepare : ControllerPrepare;

    constructor(zc : ZationConfig,worker : ZationWorker,validCheckProcessor : ValidCheckProcessor) {
        this.zc = zc;
        this.worker = worker;
        this.validCheckProcessor = validCheckProcessor;
        this.inputDataProcessor = worker.getInputDataProcessor();

        this.authController = this.zc.appConfig.authController;
        this.useProtocolCheck = this.zc.mainConfig.useProtocolCheck;
        this.useHttpMethodCheck = this.zc.mainConfig.useHttpMethodCheck;
        this.useAuth = this.zc.mainConfig.useAuth;
        this.controllerPrepare = this.worker.getControllerPrepare();
    }

    async process(shBridge : SHBridge)
    {
        //is validation check request?
        if(shBridge.isValidationCheckReq()) {
            return this.validCheckProcessor.process(shBridge.getZationData());
        }

        let reqData = shBridge.getZationData();

        if(ZationReqTools.isValidReqStructure(reqData,shBridge.isWebSocket()))
        {
            //Check for a auth req
            if(ZationReqTools.isZationAuthReq(reqData)) {
                if(!this.authController) {
                    throw new BackError(MainBackErrors.authControllerNotSet);
                }
                reqData = ZationReqTools.dissolveZationAuthReq(this.zc,reqData);
            }
            // check auth start active ?
            else if(this.worker.getIsAuthStartActive()) {
                throw new BackError(MainBackErrors.authStartActive);
            }

            //is checked by isValidReqStructure!
            // @ts-ignore
            const task : ZationTask = reqData.t;

            const isSystemController = ZationReqTools.isSystemControllerReq(task);
            const controllerName = ZationReqTools.getControllerName(task,isSystemController);

            //Trows if not exists
            this.controllerPrepare.checkControllerExist(controllerName,isSystemController);

            const {
                controllerConfig,
                controllerInstance,
                systemAccessCheck,
                versionAccessCheck,
                authAccessCheck
            } = this.controllerPrepare.getControllerPrepareData(controllerName,isSystemController);

            //Throws if access denied
            systemAccessCheck(shBridge);

            //Throws if access denied
            versionAccessCheck(shBridge);

            let tokenEngine;
            let authEngine : AuthEngine;
            if(shBridge.isWebSocket()){
                const socket = shBridge.getSocket();
                //use socket prepared token engine
                tokenEngine = socket.tokenEngine;
                authEngine = socket.authEngine;
            }
            else {
                tokenEngine = new TokenEngine(shBridge,this.worker,this.zc);
                authEngine = new AuthEngine(shBridge,tokenEngine,this.worker);
            }

            authEngine.refresh();

            //check protocol
            if(!this.useProtocolCheck || ProtocolAccessChecker.hasProtocolAccess(shBridge,controllerConfig)) {

                //check http method
                if (
                    (!shBridge.isWebSocket() && (!this.useHttpMethodCheck || ProtocolAccessChecker.hasHttpMethodAccess(shBridge,controllerConfig)))
                    || shBridge.isWebSocket()
                )
                {
                    //check access to controller
                    if(!this.useAuth || authAccessCheck(authEngine)) {

                        let input : object;
                        //check input
                        try {
                            input = await this.inputDataProcessor.processInput(task,controllerConfig);
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
                                    tokenEngine,
                                    input,
                                    //socket prepared channel engine
                                    shBridge.isWebSocket() ? shBridge.getSocket().channelEngine : undefined
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
                            tokenEngine,
                            input,
                            //socket prepared channel engine
                            shBridge.isWebSocket() ? shBridge.getSocket().channelEngine : undefined
                        );
                        return await this.processController(controllerInstance,controllerConfig,bag);
                    }
                    else {
                        throw new BackError(MainBackErrors.noAccessToController,
                            {
                                authUserGroup: authEngine.getAuthUserGroup(),
                                authIn: authEngine.isAuth()
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
    private async processController(controllerInstance : Controller,controllerConfig : object,bag : Bag) : Promise<ResponseResult>
    {
        //process the controller handle, before handle events and finally handle.
        try {
            await ControllerTools.processPrepareHandleEvents(controllerConfig,bag);

            let result : Result | any = await controllerInstance.handle(bag,bag.getInput());

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

