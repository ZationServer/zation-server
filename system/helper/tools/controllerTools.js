/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

const Const            = require('../constante/constWrapper');
const TaskError        = require('../../api/TaskError');
const SyErrors         = require('../zationTaskErrors/systemTaskErrors');

const systemController = require('../systemController/systemControler.config');
const systemControllerPath   = __dirname + './../systemController/controller';

class ControllerTools
{
    static getControllerConfigByTask(zc,task)
    {
        return ControllerTools._getControllerConfig(zc,task[Const.Settings.INPUT_CONTROLLER]);
    }

    static _getControllerConfig(zc,controllerName)
    {
        if (zc.isApp(Const.App.CONTROLLER) && zc.getApp(Const.App.CONTROLLER).hasOwnProperty(controllerName)) {
            return zc.getApp(Const.App.CONTROLLER)[controllerName];
        }
        else if (systemController.hasOwnProperty(controllerName)) {
            return systemController[controllerName];
        }
        else {
            throw new TaskError(SyErrors.controllerNotFound, {controllerName: controllerName});
        }
    }

    static _getControllerFullPath(controllerConfig)
    {
        let controllerPath = controllerConfig[Const.Settings.CONTROLLER_PATH];
        let controllerName = controllerConfig[Const.Settings.CONTROLLER_NAME];

        if(controllerPath === undefined)
        {
            return controllerName;
        }
        else
        {
            return controllerPath + '/' + controllerName;
        }
    }

    static getControllerClass(zc,controllerConfig)
    {
        let path = ControllerTools._getControllerFullPath(controllerConfig);

        if(controllerConfig[Const.Settings.CONTROLLER_SYSTEM_CONTROLLER] !== undefined
            && controllerConfig[Const.Settings.CONTROLLER_SYSTEM_CONTROLLER])
        {
            return require(systemControllerPath + '/' + path);
        }
        else
        {
            return require(zc.getMain(Const.StartOp.CONTROLLER) + '/' + path);
        }
    }

    static processBeforeHandleEvents(controllerConfig,bag)
    {
        let beforeHandle = controllerConfig[Const.Settings.CONTROLLER_BEFORE_HANDLE];
        if(beforeHandle !== undefined)
        {
            if(Array.isArray(beforeHandle))
            {
                for(let i = 0; i < beforeHandle.length; i++)
                {
                    ControllerTools._fireBeforeHandleEvent(beforeHandle[i],bag);
                }
            }
            else
            {
                ControllerTools._fireBeforeHandleEvent(beforeHandle,bag);
            }
        }
    }

    static _fireBeforeHandleEvent(func,bag)
    {
        if(typeof func === "function")
        {
            func(bag);
        }
    }
}

module.exports = ControllerTools;