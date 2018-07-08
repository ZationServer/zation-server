/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

const Const                 = require('../constants/constWrapper');
const ControllerTools       = require('../controller/controllerTools');
const Result                = require('../../api/Result');
const MainErrors            = require('../zationTaskErrors/mainTaskErrors');
const TaskError             = require('../../api/TaskError');
const TaskErrorBag          = require('../../api/TaskErrorBag');
const ZationReqTools        = require('../tools/zationReqTools');
const SystemVersionChecker  = require('../checker/systemVersionChecker');
const InputProcessor        = require('../input/inputProcessor');
const AuthEngine            = require('../auth/authEngine');
const Bag                   = require('../../api/Bag');
const TokenEngine           = require('./../token/tokenEngine');

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
                reqData = ZationReqTools.dissolveZationAuthReq(zc,reqData);
            }
            else if(worker._authStartActive)
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
                    let inputWrapper = {};

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

module.exports = MainProcessor;