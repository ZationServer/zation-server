const CA                    = require('../constante/settings');
const HtmlTools             = require('../tools/htmlTools');
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

const system   = __dirname + '/../';
const views    = system + 'views/';

class HttpProcessor
{

    static async runHttpProcess({scServer, res, req, services, userConfig, debug})
    {
        let cationReq = req.body[userConfig[CA.START_CONFIG_POST_KEY_WORD]];

        if (req.method === 'POST' &&
            cationReq !== undefined) {
            //SetHeader
            res.setHeader('Content-Type', 'application/json');

            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
            res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,contenttype');
            res.setHeader('Access-Control-Allow-Credentials', true);

            return HttpProcessor.beginHttpProcess
            (
                await JSON.parse(req.body[userConfig[CA.START_CONFIG_POST_KEY_WORD]]),
                {scServer, res, req, userConfig, services, debug}
            );
        }
        else {
            HtmlTools.writeHtml(res, views + 'cationServer.html');
        }
    }

    static beginHttpProcess(cationReq, {scServer, res, req, userConfig, services, debug})
    {
        if (CationReqTools.checkValidStructure(cationReq)) {
            //THROWS TASK ERROR
            SystemVersionChecker.checkSystemAndVersion(cationReq);

            cationReq = CationReqTools.createCationAuth(data.cationReq);
            return this.processHttpTask({cationReq, scServer, services, res, req, userConfig, debug});
        }
        else {
            throw new TaskError(SyErrors.wrongInputData);
        }
    }

    static processHttpTask({cationReq, scServer, services, res, req, userConfig, debug})
    {

        let task = cationReq[CA.INPUT_TASK];

        let useAuth = userConfig[CA.START_CONFIG_USE_AUTH];
        let useProtocolCheck = userConfig[CA.START_CONFIG_USE_PROTOCOL_CHECK];

        let channelController = new ChannelController(scServer, false);

        let authController = new Auth(
            {
                isSocket: false,
                req: req,
                res: res,
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