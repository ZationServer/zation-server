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
import InputWrapper          = require("../tools/inputWrapper");

class MainProcessor
{
    static async process(shBridge,zc,worker)
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

            let task = reqData[Const.Settings.REQUEST_INPUT.TASK];

            let controllerName = task[Const.Settings.REQUEST_INPUT.CONTROLLER];

            //Trows if not exists
            worker.getControllerPrepare.checkControllerExist(controllerName);

            let controllerConfig = worker.getControllerPrepare().getControllerConfig(controllerName);

            //EXTRA SECURE AUTH LAYER
            if(zc.isExtraSecureAuth() && shBridge.getTokenBridge().hasToken() &&
               ControllerTools.needToCheckExtraSecure(controllerConfig))
            {
                let tokenInfoStorage = worker.getTempDbUp();
                let token = shBridge.getTokenBridge().getToken();

                let valid = await tokenInfoStorage.isTokenUnblocked(token[Const.Settings.CLIENT.TOKEN_ID]);

                if(!valid)
                {
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
                    let controllerInstance = worker.getControllerPrepare().getControllerInstance(controllerName);
                    let inputWrapper : InputWrapper;

                    //check input
                    try
                    {
                        inputWrapper  = InputProcessor.processInput(task,controllerConfig);
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

                    let bag = new Bag(shBridge,worker,authEngine,tokenEngine,inputWrapper);
                    return await MainProcessor.processController(controllerInstance,controllerConfig,bag,shBridge.getTokenBridge());
                }
            }
            else
            {
                throw new TaskError(MainErrors.noAccessToServerProtocol,
                    {
                        controller: task[Const.Settings.REQUEST_INPUT.CONTROLLER],
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
    static async processController(controllerInstance,controllerConfig,bag,tb)
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