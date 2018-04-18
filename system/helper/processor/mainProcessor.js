/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

const Const                 = require('../constante/constWrapper');
const ControllerTools       = require('../tools/controllerTools');
const Controller            = require('../../api/Controller');
const Result                = require('../../api/Result');
const F            = require('../zationTaskErrors/mainTaskErrors');
const TaskError             = require('../../api/TaskError');
const ZationReqTools        = require('../tools/zationReqTools');
const SystemVersionChecker  = require('../checker/systemVersionChecker');
const ChannelEngine         = require('../channel/channelEngine');
const ParamChecker          = require('../checker/paramChecker');
const AuthEngine            = require('../auth/authEngine');
const Bag                   = require('../../api/Bag');

class MainProcessor
{
    static async process(shBridge,zc,worker)
    {
        //EXTRA SECURE AUTH LAYER
        if(zc.isExtraSecureAuth())
        {
            let tokenInfoStorage = worker.getTokenInfoStorage();
            let token = shBridge.getTokenBridge().getToken();

            let valid = await tokenInfoStorage.isTokenValid(token);

            if(!valid)
            {
                throw new TaskError(MainErrors.tokenIsBlocked,{token : token});
            }

            await tokenInfoStorage.setLastActivity(token);
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

            let channelEngine = new ChannelEngine(worker.scServer,shBridge);

            let authEngine = new AuthEngine(
                {
                    shBridge : shBridge,
                    zc : zc,
                });

            let useProtocolCheck = zc.getMain(Const.Main.USE_PROTOCOL_CHECK);
            let controllerConfig = ControllerTools.getControllerConfigByTask(zc,task);

            if(!useProtocolCheck || authEngine.hasServerProtocolAccess(controllerConfig))
            {
                let useAuth = zc.getMain(Const.Main.USE_AUTH);

                if(!useAuth || authEngine.hasAccessToController(controllerConfig))
                {
                    let paramData = ParamChecker.createParamsAndCheck(task,controllerConfig);
                    let controllerClass = ControllerTools.getControllerClass(zc,controllerConfig);

                    let bag = new Bag(
                        {
                        paramData: paramData,
                        worker : worker,
                        authEngine: authEngine,
                        channelEngine: channelEngine,
                        shBridge : shBridge,
                        zc : zc
                    });

                    return await MainProcessor.processController(controllerClass,controllerConfig,bag);
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
    static async processController(controllerClass,controllerConfig,bag)
    {
        if (controllerClass instanceof Controller)
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

                return {result : result, authData : bag.getAuthController()._getNewAuthData()};
            }
            catch(e)
            {
                throw {e : e,authData : bag.getAuthController()._getNewAuthData()};
            }
        }
        else
        {
            throw new TaskError(MainErrors.controllerIsNotAController,
                {controllerName : controllerConfig[Const.Settings.CONTROLLER_NAME]});
        }
    }

}

module.exports = MainProcessor;