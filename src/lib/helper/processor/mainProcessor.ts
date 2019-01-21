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
import InputProcessor        = require('../input/inputReqProcessor');
import AuthEngine            = require('../auth/authEngine');
import {Bag}                   from '../../api/Bag';
import TokenEngine           = require('../token/tokenEngine');
import SHBridge              = require("../bridges/shBridge");
import ZationConfig          = require("../../main/zationConfig");
import ZationWorker          = require("../../main/zationWorker");
import {Controller}            from'../../api/Controller';
import TokenBridge           = require("../bridges/tokenBridge");
import ProtocolAccessChecker = require("../protocolAccess/protocolAccessChecker");
import {ZationTask} from "../constants/internal";

class MainProcessor
{
    static async process(shBridge : SHBridge,zc : ZationConfig,worker : ZationWorker)
    {
        let reqData = shBridge.getZationData();

        if(ZationReqTools.isValidReqStructure(reqData,shBridge.isWebSocket()))
        //THROWS TASK ERROR
        {
            //Check for a auth req
            if(ZationReqTools.isZationAuthReq(reqData)) {
                if(!(zc.appConfig.authController !== undefined)) {
                    throw new TaskError(MainErrors.authControllerNotSet);
                }
                reqData = ZationReqTools.dissolveZationAuthReq(zc,reqData);
            }
            else if(worker.getIsAuthStartActive()) {
                throw new TaskError(MainErrors.authStartActive);
            }

            //is checked by isValidReqStructure!
            // @ts-ignore
            const task : ZationTask = reqData.t;

            const isSystemController = ZationReqTools.isSystemControllerReq(task);
            const controllerName = ZationReqTools.getControllerName(task,isSystemController);

            //Trows if not exists
            worker.getControllerPrepare().checkControllerExist(controllerName,isSystemController);

            const controllerConfig =
                worker.getControllerPrepare().getControllerConfig(controllerName,isSystemController);

            SystemVersionChecker.checkSystemAndVersion(shBridge,controllerConfig);

            const tokenEngine = new TokenEngine(shBridge,worker,zc);

            const authEngine =
                new AuthEngine(shBridge,tokenEngine,worker);

            await authEngine.init();

            const useProtocolCheck = zc.mainConfig.useProtocolCheck;
            if(!useProtocolCheck || ProtocolAccessChecker.hasProtocolAccess(shBridge,controllerConfig)) {

                const useHttpMethodCheck = zc.mainConfig.useHttpMethodCheck;
                if
                (
                    (!shBridge.isWebSocket() && (!useHttpMethodCheck || ProtocolAccessChecker.hasHttpMethodAccess(shBridge,controllerConfig)))
                    || shBridge.isWebSocket()
                )
                {
                    let useAuth = zc.mainConfig.useAuth;
                    if(!useAuth || authEngine.hasAccessToController(controllerConfig)) {
                        let controllerInstance =
                            worker.getControllerPrepare().getControllerInstance(controllerName,isSystemController);

                        let input : object;

                        //check input
                        try
                        {
                            input  = await InputProcessor.
                            processInput(task,controllerConfig,worker.getPreparedSmallBag());
                        }
                        catch (e) {
                            //invoke controller wrong input function
                            if(e instanceof TaskError || e instanceof TaskErrorBag)
                            {
                                let input = task.i;
                                let bag = new Bag(shBridge,worker,authEngine,tokenEngine,input);
                                await controllerInstance.wrongInput(bag,input);
                            }
                            //than throw the input for return it to client
                            throw e;
                        }

                        let bag = new Bag(shBridge,worker,authEngine,tokenEngine,input);
                        return await MainProcessor.processController(controllerInstance,controllerConfig,bag,shBridge.getTokenBridge());
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
    static async processController(controllerInstance : Controller,controllerConfig : object,bag : Bag,tb : TokenBridge)
    {
        try
        {
            await ControllerTools.processBeforeHandleEvents(controllerConfig, bag);

            let result = await controllerInstance.handle(bag,bag.getInput());


            if (!(result instanceof Result)) {
                result = new Result(result);
            }

            return {result : result,tb : tb};
        }
        catch(e) {
            throw {e : e,tb : tb};
        }
    }

}

export = MainProcessor;