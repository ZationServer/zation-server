/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import ControllerTools       = require('../controller/controllerTools');
import Result                = require('../../api/Result');
import MainErrors            = require('../zationTaskErrors/mainTaskErrors');
import TaskError             = require('../../api/TaskError');
import TaskErrorBag          = require('../../api/TaskErrorBag');
import ZationReqTools        = require('../tools/zationReqTools');
import SystemVersionChecker  = require('../version/systemVersionChecker');
// noinspection TypeScriptPreferShortImport
import {Bag}                   from '../../api/Bag';
import TokenEngine           = require('../token/tokenEngine');
import ZationConfig          = require("../../main/zationConfig");
import ZationWorker          = require("../../main/zationWorker");
// noinspection TypeScriptPreferShortImport
import {Controller}            from'../../api/Controller';
import ProtocolAccessChecker = require("../protocolAccess/protocolAccessChecker");
import {ResponseResult, ZationTask} from "../constants/internal";
import {SHBridge}              from "../bridges/shBridge";
import {InputDataProcessor}    from "../input/inputDataProcessor";
import ValidCheckProcessor     from "./validCheckProcessor";
import ControllerPrepare     = require("../controller/controllerPrepare");
import AuthEngine from "../auth/authEngine";

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
                    throw new TaskError(MainErrors.authControllerNotSet);
                }
                reqData = ZationReqTools.dissolveZationAuthReq(this.zc,reqData);
            }
            // check auth start active ?
            else if(this.worker.getIsAuthStartActive()) {
                throw new TaskError(MainErrors.authStartActive);
            }

            //is checked by isValidReqStructure!
            // @ts-ignore
            const task : ZationTask = reqData.t;

            const isSystemController = ZationReqTools.isSystemControllerReq(task);
            const controllerName = ZationReqTools.getControllerName(task,isSystemController);

            //Trows if not exists
            this.controllerPrepare.checkControllerExist(controllerName,isSystemController);

            const prepareDataController = this.controllerPrepare.getController(controllerName,isSystemController);
            const controllerConfig = prepareDataController.config;

            //Trows if not exists
            SystemVersionChecker.checkSystemAndVersion(shBridge,controllerConfig);

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
                    if(!this.useAuth || authEngine.hasAccessToController(controllerConfig)) {

                        const controllerInstance = prepareDataController.instance;

                        let input : object;
                        //check input
                        try {
                            input = await this.inputDataProcessor.processInput(task,controllerConfig);
                        }
                        catch (e) {
                            //invoke controller wrong input function
                            if(e instanceof TaskError || e instanceof TaskErrorBag)
                            {
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

                                await controllerInstance.wrongInput(bag,input);
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
                        throw new TaskError(MainErrors.noAccessToController,
                            {
                                authUserGroup: authEngine.getAuthUserGroup(),
                                authIn: authEngine.isAuth()
                            });
                    }
                }
                else {
                    throw new TaskError(MainErrors.noAccessWithHttpMethod,
                        {
                            controller: controllerName,
                            method: shBridge.getRequest().method
                        });
                }
            }
            else {
                throw new TaskError(MainErrors.noAccessWithProtocol,
                    {
                        controllerName: controllerName,
                        protocol: ProtocolAccessChecker.getProtocol(shBridge)
                    });
            }
        }
        else {
            throw new TaskError(MainErrors.wrongInputDataStructure, {type : shBridge.isWebSocket() ? 'ws' : 'http',input : reqData});
        }
    }

    // noinspection JSMethodCanBeStatic
    private async processController(controllerInstance : Controller,controllerConfig : object,bag : Bag) : Promise<ResponseResult>
    {
        //process the controller and before event
        try {
            await ControllerTools.processBeforeHandleEvents(controllerConfig, bag);

            let result : Result | any = await controllerInstance.handle(bag,bag.getInput());

            if (!(result instanceof Result)) {
                return {r : result};
            }

            return result._getJsonObj();
        }
        catch(e) {
            throw e;
        }
    }

}

