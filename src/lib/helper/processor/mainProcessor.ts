/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import Const                 = require('../constants/constWrapper');
import ControllerTools       = require('../controller/controllerTools');
import Result                = require('../../api/Result');
import MainErrors            = require('../zationTaskErrors/mainTaskErrors');
import TaskError             = require('../../api/TaskError');
import TaskErrorBag          = require('../../api/TaskErrorBag');
import ZationReqTools        = require('../tools/zationReqTools');
import SystemVersionChecker  = require('../checker/systemVersionChecker');
import InputProcessor        = require('../input/inputProcessor');
import AuthEngine            = require('../auth/authEngine');
import Bag                   = require('../../api/Bag');
import TokenEngine           = require('../token/tokenEngine');
import SHBridge              = require("../bridges/shBridge");
import ZationConfig          = require("../../main/zationConfig");
import ZationWorker          = require("../../main/zationWorker");
import Controller            = require("../../api/Controller");
import TokenBridge           = require("../bridges/tokenBridge");

class MainProcessor
{
    static async process(shBridge : SHBridge,zc : ZationConfig,worker : ZationWorker)
    {
        let reqData = shBridge.getZationData();

        if(ZationReqTools.isValidReqStructure(reqData))
        //THROWS TASK ERROR
        {
            SystemVersionChecker.checkSystemAndVersion(zc,reqData);

            //Check for a auth req
            if(ZationReqTools.isZationAuthReq(reqData))
            {
                if(!zc.isApp(Const.App.KEYS.AUTH_CONTROLLER))
                {
                    throw new TaskError(MainErrors.authControllerNotSet);
                }
                reqData = ZationReqTools.dissolveZationAuthReq(zc,reqData);
            }
            else if(worker.getIsAuthStartActive())
            {
                throw new TaskError(MainErrors.authStartActive);
            }

            const task = reqData[Const.Settings.REQUEST_INPUT.TASK];

            const isSystemController = ZationReqTools.isSystemControllerReq(task);
            const controllerName = ZationReqTools.getControllerName(task,isSystemController);

            //Trows if not exists
            worker.getControllerPrepare().checkControllerExist(controllerName,isSystemController);

            let controllerConfig =
                worker.getControllerPrepare().getControllerConfig(controllerName,isSystemController);

            //EXTRA SECURE AUTH LAYER
            if(shBridge.getTokenBridge().hasToken() && shBridge.isWebSocket() &&
                ControllerTools.needToCheckExtraSecure(controllerConfig) &&
                zc.isExtraSecureAuth())
            {
                const tsw = worker.getTSWClient();
                const token = shBridge.getTokenBridge().getToken();

                const valid = await tsw.isTokenUnblocked(token[Const.Settings.CLIENT.TOKEN_ID]);

                if(!valid) {
                    throw new TaskError(MainErrors.tokenIsBlocked,{token : token});
                }
            }
            //END EXTRA SECURE AUTH LAYER

            let tokenEngine = new TokenEngine(shBridge,worker,zc);

            let authEngine = new AuthEngine(shBridge,tokenEngine,worker.getAEPreparedPart());

            await authEngine.init();

            let useProtocolCheck = zc.getMain(Const.Main.KEYS.USE_PROTOCOL_CHECK);

            if(!useProtocolCheck || authEngine.hasServerProtocolAccess(controllerConfig))
            {
                let useAuth = zc.getMain(Const.Main.KEYS.USE_AUTH);

                if(!useAuth || authEngine.hasAccessToController(controllerConfig))
                {
                    let controllerInstance =
                        worker.getControllerPrepare().getControllerInstance(controllerName,isSystemController);

                    let input : object;

                    //check input
                    try
                    {
                        input  = await InputProcessor.
                        processInput(task,controllerConfig,worker.getPreparedSmallBag());
                    }
                    catch (e)
                    {
                        //invoke controller wrong input function
                        if(e instanceof TaskError || e instanceof TaskErrorBag)
                        {
                            let input = task[Const.Settings.REQUEST_INPUT.INPUT];
                            let bag = new Bag(shBridge,worker,authEngine,tokenEngine,input);
                            await controllerInstance.wrongInput(bag,input);
                        }
                        //than throw the input for return it to client
                        throw e;
                    }

                    let bag = new Bag(shBridge,worker,authEngine,tokenEngine,input);
                    return await MainProcessor.processController(controllerInstance,controllerConfig,bag,shBridge.getTokenBridge());
                }
                else
                {
                    throw new TaskError(MainErrors.noAccessToController,
                        {
                            authUserGroup: authEngine.getAuthUserGroup(),
                            authIn: authEngine.isAuth()
                        });
                }
            }
            else
            {
                throw new TaskError(MainErrors.noAccessToServerProtocol,
                    {
                        controller: controllerName,
                        protocol: authEngine.getProtocol()
                    });
            }
        }
        else
        {
            throw new TaskError(MainErrors.wrongInputData);
        }
    }

    //LAYER 10
    static async processController(controllerInstance : Controller,controllerConfig : object,bag : Bag,tb : TokenBridge)
    {
        try
        {
            await ControllerTools.processBeforeHandleEvents(controllerConfig, bag);

            let result = await controllerInstance.handle(bag,bag.getInput());


            if (!(result instanceof Result))
            {
                result = new Result(result);
            }

            return {result : result,tb : tb};
        }
        catch(e)
        {
            throw {e : e,tb : tb};
        }
    }

}

export = MainProcessor;