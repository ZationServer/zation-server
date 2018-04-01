const CA                    = require('../constante/settings');
const TaskError             = require('../../api/TaskError');
const SyErrors              = require('../cationTaskErrors/systemTaskErrors');
const CationReqTools        = require('../tools/cationReqTools');
const SystemVersionChecker  = require('../checker/systemVersionChecker');
const ControllerTools       = require('../tools/controllerTools');
const Bag                   = require('../../api/Bag');
const Auth                  = require('../authSystem/auth');
const ParamChecker          = require('../checker/paramChecker');
const ChannelController     = require('../channelSystem/channelController');
const MainProcessor         = require('./mainProcessor');


class SocketProcessor
{
    static async runSocketProcess({scServer, services, socket, input, respond, userConfig, debug})
    {
        let cationReq = input;

        if(CationReqTools.checkValidStructure(cationReq))
        {
            //Throws Task Exception by Fail!
            SystemVersionChecker.checkSystemAndVersion(cationReq);

            //CreateAuthTask
            cationReq = CationReqTools.createCationAuth(cationReq);

            //process
            let cationTask = cationReq[CA.INPUT_TASK];

            let useAuth = userConfig[CA.START_CONFIG_USE_AUTH];

            let useProtocolCheck = userConfig[CA.START_CONFIG_USE_PROTOCOL_CHECK];

            let channelController = new ChannelController(scServer,true,socket);

            let authController = new Auth(
                {
                    isSocket : true,
                    socket   : socket,
                    scServer : scServer,
                    useAuth  : useAuth,
                    debug    : debug,
                    channelController : channelController
                });


            //Throws Controller Not found Exception!
            let controller     = ControllerTools.getControllerConfig(cationTask);

            if((useProtocolCheck && authController.hasServerProtocolAccess(controller)) || !useProtocolCheck)
            {
                if (authController.hasAccessToController(controller)) {
                    //Access
                    let paramData = ParamChecker.createParamsAndCheck(cationTask,controller);

                    let controllerClass = ControllerTools.getControllerClass(controller,userConfig);

                    controllerClass = new controllerClass();

                    let bag = new Bag({
                        isSocket : true,
                        paramData  : paramData,
                        socket   : socket,
                        scServer       : scServer,
                        services       : services,
                        authController : authController,
                        channelController : channelController
                    });

                    return MainProcessor.processController(controllerClass,controller,bag);

                }
                else {
                    throw new TaskError(SyErrors.noAccessToController, {
                        authIn: authController.isAuth(),
                        authTyp: authController.getAuthGroup()
                    });
                }
            }
            else
            {
                throw new TaskError(SyErrors.noAccessToServerProtocol,
                    {controller : cationTask[CA.INPUT_CONTROLLER] , protocol : authController.getProtocol()});
            }
        }
        else
        {
            throw new TaskError(SyErrors.wrongInputData);
        }
    }


}

module.exports = SocketProcessor;