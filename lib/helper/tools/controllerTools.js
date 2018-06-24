/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

const Const            = require('../constants/constWrapper');
const TaskError        = require('../../api/TaskError');
const MainErrors         = require('../zationTaskErrors/mainTaskErrors');

const systemController = require('../systemController/systemControler.config');
const systemControllerPath   = __dirname + './../systemController/controller';

class ControllerTools
{
    static getControllerConfigByTask(zc,task)
    {
        return ControllerTools.getControllerConfig(zc,task[Const.Settings.REQUEST_INPUT.CONTROLLER]);
    }

    static getControllerConfig(zc,controllerName)
    {
        if (zc.isApp(Const.App.KEYS.CONTROLLER) && zc.getApp(Const.App.KEYS.CONTROLLER).hasOwnProperty(controllerName)) {
            return zc.getApp(Const.App.KEYS.CONTROLLER)[controllerName];
        }
        else if (systemController.hasOwnProperty(controllerName)) {
            return systemController[controllerName];
        }
        else {
            throw new TaskError(MainErrors.controllerNotFound, {controllerName: controllerName});
        }
    }

    static needToCheckExtraSecure(controllerConfig)
    {
        if(controllerConfig[Const.App.CONTROLLER.EXTRA_SECURE] !== undefined)
        {
            return controllerConfig[Const.App.CONTROLLER.EXTRA_SECURE];
        }
        return true;
    }

    static _getControllerFullPath(controllerConfig)
    {
        let controllerPath = controllerConfig[Const.App.CONTROLLER.PATH];
        let controllerName = controllerConfig[Const.App.CONTROLLER.NAME];

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

        if(controllerConfig[Const.App.CONTROLLER.SYSTEM_CONTROLLER] !== undefined
            && controllerConfig[Const.App.CONTROLLER.SYSTEM_CONTROLLER])
        {
            return require(systemControllerPath + '/' + path);
        }
        else
        {
            return require(zc.getMain(Const.Main.KEYS.CONTROLLER) + '/' + path);
        }
    }

    static async processBeforeHandleEvents(controllerConfig,bag)
    {
        let beforeHandle = controllerConfig[Const.App.CONTROLLER.BEFORE_HANDLE];
        if(beforeHandle !== undefined)
        {
            if(Array.isArray(beforeHandle))
            {
                let promises = [];
                for(let i = 0; i < beforeHandle.length; i++)
                {
                    promises.push(ControllerTools._fireBeforeHandleEvent(beforeHandle[i],bag));
                }
                await Promise.all(promises);
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

    static getControllerConfigFromInputPath(path,controllerInput)
    {
        let tempConfig = controllerInput;
        for(let i = 0; i < path.length; i++)
        {
            let k = path[i];

            if(tempConfig.hasOwnProperty(k) && typeof tempConfig[k] === 'object')
            {
                if(tempConfig[k].hasOwnProperty(Const.App.OBJECTS.PROPERTIES))
                {
                    tempConfig = tempConfig[k][ControllerTools.App.OBJECTS.PROPERTIES];
                }
                else
                {
                    tempConfig = tempConfig[k];
                }
            }
            else
            {
                return undefined;
            }
        }
        return tempConfig;
    }
}

module.exports = ControllerTools;