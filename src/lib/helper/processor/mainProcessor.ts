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
import AuthEngine            = require('../auth/authEngine');
// noinspection TypeScriptPreferShortImport
import {Bag}                   from '../../api/Bag';
import TokenEngine           = require('../token/tokenEngine');
import ZationConfig          = require("../../main/zationConfig");
import ZationWorker          = require("../../main/zationWorker");
// noinspection TypeScriptPreferShortImport
import {Controller}            from'../../api/Controller';
import ProtocolAccessChecker = require("../protocolAccess/protocolAccessChecker");
import {ZationTask}            from "../constants/internal";
import {SHBridge}              from "../bridges/shBridge";

class MainProcessor
{
    private readonly zc : ZationConfig;
    private readonly worker : ZationWorker;

    constructor(zc : ZationConfig,worker : ZationWorker) {
        this.zc = zc;
        this.worker = worker;
    }

    async process(shBridge : SHBridge)
    {
        let reqData = shBridge.getZationData();

        if(ZationReqTools.isValidReqStructure(reqData,shBridge.isWebSocket()))
        //THROWS TASK ERROR
        {
            //Check for a auth req
            if(ZationReqTools.isZationAuthReq(reqData)) {
                if(!(this.zc.appConfig.authController !== undefined)) {
                    throw new TaskError(MainErrors.authControllerNotSet);
                }
                reqData = ZationReqTools.dissolveZationAuthReq(this.zc,reqData);
            }
            else if(this.worker.getIsAuthStartActive()) {
                throw new TaskError(MainErrors.authStartActive);
            }

            //is checked by isValidReqStructure!
            // @ts-ignore
            const task : ZationTask = reqData.t;

            const isSystemController = ZationReqTools.isSystemControllerReq(task);
            const controllerName = ZationReqTools.getControllerName(task,isSystemController);

            //Trows if not exists
            this.worker.getControllerPrepare().checkControllerExist(controllerName,isSystemController);

            const controllerConfig =
                this.worker.getControllerPrepare().getControllerConfig(controllerName,isSystemController);

            SystemVersionChecker.checkSystemAndVersion(shBridge,controllerConfig);

            let tokenEngine;
            if(shBridge.isWebSocket()){
                tokenEngine = shBridge.getSocket().tokenEngine;
            }
            else {
                tokenEngine = new TokenEngine(shBridge,this.worker,this.zc);
            }

            const authEngine =
                new AuthEngine(shBridge,tokenEngine,this.worker);

            await authEngine.init();

            const useProtocolCheck = this.zc.mainConfig.useProtocolCheck;
            if(!useProtocolCheck || ProtocolAccessChecker.hasProtocolAccess(shBridge,controllerConfig)) {

                const useHttpMethodCheck = this.zc.mainConfig.useHttpMethodCheck;
                if
                (
                    (!shBridge.isWebSocket() && (!useHttpMethodCheck || ProtocolAccessChecker.hasHttpMethodAccess(shBridge,controllerConfig)))
                    || shBridge.isWebSocket()
                )
                {
                    let useAuth = this.zc.mainConfig.useAuth;
                    if(!useAuth || authEngine.hasAccessToController(controllerConfig)) {
                        let controllerInstance =
                            this.worker.getControllerPrepare().getControllerInstance(controllerName,isSystemController);

                        let input : object;

                        //check input
                        try
                        {
                            input = await this.worker.getInputReqProcessor().
                            processInput(task,controllerConfig);
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
                                    shBridge.isWebSocket() ? shBridge.getSocket().channelEngine : undefined
                                );

                                await controllerInstance.wrongInput(bag,input);
                            }
                            //than throw the input for return it to client
                            throw e;
                        }

                        const bag = new Bag(
                            shBridge,
                            this.worker,
                            authEngine,
                            tokenEngine,
                            input,
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

    //LAYER 10
    // noinspection JSMethodCanBeStatic
    private async processController(controllerInstance : Controller,controllerConfig : object,bag : Bag)
    {
        try
        {
            await ControllerTools.processBeforeHandleEvents(controllerConfig, bag);

            let result = await controllerInstance.handle(bag,bag.getInput());

            if (!(result instanceof Result)) {
                result = new Result(result);
            }

            return {result : result};
        }
        catch(e) {
            throw e;
        }
    }

}

export = MainProcessor;