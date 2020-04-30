/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import RequestBag              from '../../../../api/RequestBag';
import ZationWorker          = require("../../../../core/zationWorker");
import Controller              from '../../../../api/Controller';
import SHBridge                from "../bridges/shBridge";
import ValidCheckCRequestProcessor     from "./validCheckCRequestProcessor";
import AuthEngine              from "../../../auth/authEngine";
import BackError               from "../../../../api/BackError";
import BackErrorBag            from "../../../../api/BackErrorBag";
import ControllerPrepare       from '../../controllerPrepare';
import ProtocolAccessChecker   from "../../../protocolAccess/protocolAccessChecker";
import {MainBackErrors}        from "../../../zationBackErrors/mainBackErrors";
import ControllerReqUtils      from "../controllerReqUtils";
import {MiddlewareInvokeFunction}        from "../../controllerUtils";
import ZationConfigFull                  from "../../../config/manager/zationConfigFull";
import {ControllerResponse}              from '../controllerDefinitions';

export default class MainCRequestProcessor
{
    private readonly zc: ZationConfigFull;
    private readonly worker: ZationWorker;
    private readonly validCheckProcessor: ValidCheckCRequestProcessor;

    //tmp variables for faster access
    private readonly useProtocolCheck: boolean;
    private readonly useHttpMethodCheck: boolean;
    private readonly useTokenStateCheck: boolean;
    private readonly controllerPrepare: ControllerPrepare;
    private readonly authControllerIdentifier: string;

    constructor(zc: ZationConfigFull,worker: ZationWorker,validCheckProcessor: ValidCheckCRequestProcessor) {
        this.zc = zc;
        this.worker = worker;
        this.validCheckProcessor = validCheckProcessor;

        this.useProtocolCheck = this.zc.mainConfig.useProtocolCheck;
        this.useHttpMethodCheck = this.zc.mainConfig.useHttpMethodCheck;
        this.useTokenStateCheck = this.zc.mainConfig.useTokenStateCheck;
        this.controllerPrepare = this.worker.getControllerPrepare();
        this.authControllerIdentifier = this.controllerPrepare.authControllerIdentifier;
    }

    async process(shBridge: SHBridge)
    {
        //is validation check request?
        if(shBridge.isValidationCheckReq()) {
            return this.validCheckProcessor.process(shBridge.getControllerRequest(),shBridge);
        }

        const request = shBridge.getControllerRequest();
        if(ControllerReqUtils.isValidReqStructure(request,shBridge.isWebSocket()))
        {
            let controllerIdentifier;
            let isSystemController;

            //Check for a auth req
            if(ControllerReqUtils.isAuthReq(request)) {
                if(this.authControllerIdentifier === undefined) {
                    throw new BackError(MainBackErrors.authControllerNotSet);
                }
                isSystemController = false;
                controllerIdentifier = this.authControllerIdentifier;
            }
            // check auth start active ?
            else if(this.worker.getIsAuthStartActive()) {
                throw new BackError(MainBackErrors.authStartActive);
            }
            else {
                isSystemController = ControllerReqUtils.isSystemControllerReq(request);
                controllerIdentifier = ControllerReqUtils.getControllerId(request,isSystemController);
            }

            //Trows if not exists
            this.controllerPrepare.checkControllerExist(controllerIdentifier,isSystemController);

            //Throws if apiLevel not found
            const {
                controllerConfig,
                controllerInstance,
                systemAccessCheck,
                versionAccessCheck,
                tokenStateCheck,
                middlewareInvoke,
                inputConsume,
                finallyHandle
            } = this.controllerPrepare.getControllerPreparedData(controllerIdentifier,shBridge.getApiLevel(),isSystemController);;

            if(!systemAccessCheck(shBridge)){
                throw new BackError(MainBackErrors.noAccessWithSystem,{system: shBridge.getSystem()});
            }

            if(!versionAccessCheck(shBridge)){
                throw new BackError(MainBackErrors.noAccessWithVersion,{version: shBridge.getVersion()});
            }

            const authEngine: AuthEngine = shBridge.getAuthEngine();

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

                        let input: object;
                        //check input
                        try {
                            input = await inputConsume(request.i);
                        }
                        catch (e) {
                            //invoke controller invalid input function
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

                                const input = request.i;
                                const reqBag = new RequestBag(
                                    shBridge,
                                    this.worker,
                                    authEngine,
                                    input
                                );
                                try {
                                    await controllerInstance.invalidInput(reqBag,input,e);
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
                        return this.processController(controllerInstance,reqBag,input,middlewareInvoke,finallyHandle);
                    }
                    else {
                        throw new BackError(MainBackErrors.noAccessWithTokenState,
                            {
                                authUserGroup: authEngine.getAuthUserGroup(),
                                authIn: authEngine.isAuth(),
                                userId: authEngine.getUserId()
                            });
                    }
                }
                else {
                    throw new BackError(MainBackErrors.noAccessWithHttpMethod,
                        {
                            controller: controllerIdentifier,
                            method: shBridge.getRequest().method
                        });
                }
            }
            else {
                throw new BackError(MainBackErrors.noAccessWithProtocol,
                    {
                        controller: controllerIdentifier,
                        protocol: ProtocolAccessChecker.getProtocol(shBridge)
                    });
            }
        }
        else {
            throw new BackError(MainBackErrors.wrongInputDataStructure, {type: shBridge.isWebSocket() ? 'ws': 'http',input: request});
        }
    }

    // noinspection JSMethodCanBeStatic
    private async processController(controllerInstance: Controller, reqBag: RequestBag,
                                    input: any, middlewareInvoke: MiddlewareInvokeFunction,
                                    preparedFinallyHandle: Controller['finallyHandle']
    ): Promise<ControllerResponse>
    {
        //process the controller handle, before handle events and finally handle.
        let result;
        try {
            await middlewareInvoke(controllerInstance,reqBag);
            result = await controllerInstance.handle(reqBag,input);
        }
        catch(e) {
            await preparedFinallyHandle(reqBag,input);
            throw e;
        }

        await preparedFinallyHandle(reqBag,input);

        return result;
    }

}

