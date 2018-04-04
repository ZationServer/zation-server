/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

const Const                 = require('../constante/constWrapper');
const TaskError             = require('../../api/TaskError');
const SyErrors              = require('../zationTaskErrors/systemTaskErrors');
const ZationReqTools        = require('../tools/zationReqTools');
const SystemVersionChecker  = require('../checker/systemVersionChecker');
const ControllerTools       = require('../tools/controllerTools');
const Bag                   = require('../../api/Bag');
const Auth                  = require('../auth/authEngine');
const ParamChecker          = require('../checker/paramChecker');
const ChannelController     = require('../channel/channelEngine');
const MainProcessor         = require('./mainProcessor');


class SocketProcessor
{
    static async runSocketProcess({scServer, services, socket, input, respond, zc, debug})
    {
        let zationReq = input;

        if(ZationReqTools.checkValidStructure(zationReq))
        {
            //Throws Task Exception by Fail!
            SystemVersionChecker.checkSystemAndVersion(zc,zationReq);

            //CreateAuthTask
            zationReq = ZationReqTools.createZationAuth(zc,zationReq);

            //process
            let zationTask = zationReq[Const.Settings.INPUT_TASK];

            let useProtocolCheck = zc.getMain(Const.Main.USE_PROTOCOL_CHECK);

            let channelController = new ChannelController(scServer,zc,true,socket);

            let authController = new Auth(
                {
                    isSocket : true,
                    socket   : socket,
                    scServer : scServer,
                    zc       : zc,
                    channelController : channelController
                });


            //Throws Controller Not found Exception!
            let controller     = ControllerTools.getControllerConfigByTask(zc,zationTask);

            if((useProtocolCheck && authController.hasServerProtocolAccess(controller)) || !useProtocolCheck)
            {
                if (authController.hasAccessToController(controller)) {
                    //Access
                    //TODO
                    let paramData = ParamChecker.createParamsAndCheck(zationTask,controller);

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
                    {controller : zationTask[CA.INPUT_CONTROLLER] , protocol : authController.getProtocol()});
            }
        }
        else
        {
            throw new TaskError(SyErrors.wrongInputData);
        }
    }


}

module.exports = SocketProcessor;