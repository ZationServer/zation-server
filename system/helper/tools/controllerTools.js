/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

const Const            = require('../constante/constWrapper');
const TaskError        = require('../../api/TaskError');
const MainErrors         = require('../zationTaskErrors/mainTaskErrors');

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
            throw new TaskError(MainErrors.controllerNotFound, {controllerName: controllerName});
        }
    }

    static _getControllerFullPath(controllerConfig)
    {
        let controllerPath = controllerConfig[Const.App.CONTROLLER_PATH];
        let controllerName = controllerConfig[Const.App.CONTROLLER_NAME];

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

        if(controllerConfig[Const.App.CONTROLLER_SYSTEM_CONTROLLER] !== undefined
            && controllerConfig[Const.App.CONTROLLER_SYSTEM_CONTROLLER])
        {
            return require(systemControllerPath + '/' + path);
        }
        else
        {
            return require(zc.getMain(Const.Main.CONTROLLER) + '/' + path);
        }
    }

    static async processBeforeHandleEvents(controllerConfig,bag)
    {
        let beforeHandle = controllerConfig[Const.App.CONTROLLER_BEFORE_HANDLE];
        if(beforeHandle !== undefined)
        {
            if(Array.isArray(beforeHandle))
            {
                for(let i = 0; i < beforeHandle.length; i++)
                {
                    await ControllerTools._fireBeforeHandleEvent(beforeHandle[i],bag);
                }
            }
            else
            {
                await ControllerTools._fireBeforeHandleEvent(beforeHandle,bag);
            }
        }
    }

    static async _fireBeforeHandleEvent(func,bag)
    {
        if(typeof func === "function")
        {
            await func(bag);
        }
    }
}

module.exports = ControllerTools;