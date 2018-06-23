/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

const Const                 = require('../constants/constWrapper');
const ControllerTools       = require('../tools/controllerTools');
const Controller            = require('../../api/Controller');
const Result                = require('../../api/Result');
const MainErrors            = require('../zationTaskErrors/mainTaskErrors');
const TaskError             = require('../../api/TaskError');
const ZationReqTools        = require('../tools/zationReqTools');
const SystemVersionChecker  = require('../checker/systemVersionChecker');
const ParamChecker          = require('../checker/inputChecker');
const AuthEngine            = require('../auth/authEngine');
const Bag                   = require('../../api/Bag');
const TokenEngine           = require('./../token/tokenEngine');
const InputWrapper          = require('../tools/inputWrapper');

class MainProcessor
{
    static async process(shBridge,zc,worker)
    {
        let reqData = shBridge.getZationData();

        if(ZationReqTools.isValidStructure(reqData))
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

            let controllerConfig = ControllerTools.getControllerConfigByTask(zc,task);

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
                    let paramData  = ParamChecker.createParamsAndCheck(task,controllerConfig);
                    let controllerClass = ControllerTools.getControllerClass(zc,controllerConfig);

                    let inputWrapper = new InputWrapper(paramData);

                    let bag = new Bag(shBridge,worker,authEngine,tokenEngine,inputWrapper);

                    return await MainProcessor.processController(controllerClass,controllerConfig,bag,shBridge.getTokenBridge());
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
    static async processController(controllerClass,controllerConfig,bag,tb)
    {
        if (controllerClass.prototype instanceof Controller)
        {
            try
            {
                let controllerInstance = new controllerClass();

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
        else
        {
            throw new TaskError(MainErrors.controllerIsNotAController,
                {controllerName : controllerConfig[Const.App.CONTROLLER.NAME]});
        }
    }

}

module.exports = MainProcessor;