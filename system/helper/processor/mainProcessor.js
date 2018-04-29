/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

const Const                 = require('../constante/constWrapper');
const ControllerTools       = require('../tools/controllerTools');
const Controller            = require('../../api/Controller');
const Result                = require('../../api/Result');
const MainErrors            = require('../zationTaskErrors/mainTaskErrors');
const TaskError             = require('../../api/TaskError');
const ZationReqTools        = require('../tools/zationReqTools');
const SystemVersionChecker  = require('../checker/systemVersionChecker');
const ParamChecker          = require('../checker/paramChecker');
const AuthEngine            = require('../auth/authEngine');
const Bag                   = require('../../api/Bag');
const TokenEngine           = require('./../token/tokenEngine');
const InputWrapper          = require('./../checker/inputWrapper');

class MainProcessor
{
    static async process(shBridge,zc,worker)
    {
        //EXTRA SECURE AUTH LAYER
        if(zc.isExtraSecureAuth() && shBridge.getTokenBridge().hasToken())
        {
            let tokenInfoStorage = worker.getTempDbUp();
            let token = shBridge.getTokenBridge().getToken();

            let valid = await tokenInfoStorage.isTokenIdValid(token[Const.Settings.CLIENT_TOKEN_ID]);

            if(!valid)
            {
                throw new TaskError(MainErrors.tokenIsBlocked,{token : token});
            }
        }
        //END EXTRA SECURE AUTH LAYER

        let reqData = shBridge.getZationData();

        if(ZationReqTools.isValidStructure(reqData))
        {
            //THROWS TASK ERROR
            SystemVersionChecker.checkSystemAndVersion(zc,reqData);

            //Check for a auth req
            reqData = ZationReqTools.checkZationAuth(zc,reqData);

            let task = reqData[Const.Settings.INPUT_TASK];

            let tokenEngine = new TokenEngine(shBridge,worker,zc);

            let authEngine = new AuthEngine(
                {
                    tokenEngine : tokenEngine,
                    shBridge : shBridge,
                    zc : zc,
                });

            await authEngine.init();

            let useProtocolCheck = zc.getMain(Const.Main.USE_PROTOCOL_CHECK);
            let controllerConfig = ControllerTools.getControllerConfigByTask(zc,task);

            if(!useProtocolCheck || authEngine.hasServerProtocolAccess(controllerConfig))
            {
                let useAuth = zc.getMain(Const.Main.USE_AUTH);

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
                        controller: task[Const.Settings.INPUT_CONTROLLER],
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

                let result = await controllerInstance.handle(bag);

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
            console.log(controllerClass);
            throw new TaskError(MainErrors.controllerIsNotAController,
                {controllerName : controllerConfig[Const.App.CONTROLLER_NAME]});
        }
    }

}

module.exports = MainProcessor;