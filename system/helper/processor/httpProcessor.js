/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

const Const                 = require('../constante/constWrapper');
const HtmlTools             = require('../tools/htmlTools');
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

const system   = __dirname + '/../';
const views    = system + 'views/';

class HttpProcessor
{
    static async runHttpProcess({worker, res, req, zc,})
    {
        // CHECK TOKEN VALID

        let zationReq = req.body[zc.getMain(Const.Main.POST_KEY_WORD)];

        if (req.method === 'POST' &&
            zationReq !== undefined) {
            //SetHeader
            res.setHeader('Content-Type', 'applization/json');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
            res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,contenttype');
            res.setHeader('Access-Control-Allow-Credentials', true);

            return await HttpProcessor.beginHttpProcess
            (
                await JSON.parse(req.body[zc.getMain(Const.Main.POST_KEY_WORD)]),
                {worker, res, req, zc}
            );
        }
        else {
            HtmlTools.writeHtml(res, views + 'zationServer.html');
        }
    }

    static async beginHttpProcess(zationReq, {worker, res, req, zc})
    {
        if (ZationReqTools.checkValidStructure(zationReq))
        {
            //THROWS TASK ERROR
            SystemVersionChecker.checkSystemAndVersion(zationReq);

            zationReq = ZationReqTools.createZationAuth(data.zationReq);

            return await this.processHttpTask({zationReq, worker, res, req, zc});
        }
        else {
            throw new TaskError(SyErrors.wrongInputData);
        }
    }

    static async processHttpTask({zationReq, scServer, services, res, req, userConfig, debug})
    {

        let task = zationReq[CA.INPUT_TASK];

        let useAuth = userConfig[CA.START_CONFIG_USE_AUTH];
        let useProtocolCheck = userConfig[CA.START_CONFIG_USE_PROTOCOL_CHECK];

        let channelController = new ChannelController(scServer, false);

        let authController = new Auth(
            {
                isSocket: false,
                req: req,
                res: res,
                zationReq : zationReq,
                useAuth: useAuth,
                debug: debug,
                channelController: channelController
            });

        let controller = ControllerTools.getControllerConfig(task);

        if ((useProtocolCheck && authController.hasServerProtocolAccess(controller)) || !useProtocolCheck) {
            if (authController.hasAccessToController(controller)) {

                let controllerClass = ControllerTools.getControllerClass(controller, userConfig);

                controllerClass = new controllerClass();

                let paramData = ParamChecker.createParamsAndCheck(task, controller);

                let bag = new Bag({
                    isSocket: false,
                    paramData: paramData,
                    req: req,
                    res: res,
                    scServer: scServer,
                    services : services,
                    authController: authController,
                    channelController: channelController
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
        else {
            throw new TaskError(SyErrors.noAccessToServerProtocol,
                {controller: task[CA.INPUT_CONTROLLER], protocol: authController.getProtocol()});
        }
    }

}

module.exports = HttpProcessor;