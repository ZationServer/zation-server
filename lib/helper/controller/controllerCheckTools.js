/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

const Const            = require('../constants/constWrapper');
const Controller       = require('./../../api/Controller');

const systemControllerPath   = __dirname + './../systemController/controller';

class ControllerTools
{

    static canControllerRequire(cConfig,cFullPath,zc)
    {
        try
        {
            if(cConfig[Const.App.CONTROLLER.SYSTEM_CONTROLLER])
            {
                require(systemControllerPath + '/' + cFullPath);
                return true;
            }
            else
            {
                require(zc.getMain(Const.Main.KEYS.CONTROLLER) + '/' + cFullPath);
                return true;
            }
        }
        catch(e)
        {
            return false;
        }
    }

    static isControllerExtendsController(cConfig,cFullPath,zc)
    {
        let controller = {};

        if (cConfig[Const.App.CONTROLLER.SYSTEM_CONTROLLER]) {
            controller = require(systemControllerPath + '/' + cFullPath);
        }
        else {
            controller = require(zc.getMain(Const.Main.KEYS.CONTROLLER) + '/' + cFullPath);
        }

        return controller.prototype instanceof Controller;
    }

    //this method can be use to get the path without the pre compile
    static getControllerFPathForCheck(controllerConfig,cName)
    {
        let controllerPath = controllerConfig[Const.App.CONTROLLER.PATH];
        let controllerName = controllerConfig[Const.App.CONTROLLER.NAME];

        if(!controllerName)
        {
            controllerName = cName;
        }

        if(controllerPath === undefined)
        {
            return controllerName;
        }
        else
        {
            return controllerPath + '/' + controllerName;
        }
    }

}

module.exports = ControllerTools;