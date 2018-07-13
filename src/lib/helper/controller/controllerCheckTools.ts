/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import Const            = require('../constants/constWrapper');
import Controller       = require('../../api/Controller');
import ZationConfig     = require("../../main/zationConfig");
import fs               = require('fs');


const systemControllerPath   = __dirname + './../systemController/controller';

class ControllerTools
{
    static controllerFileExist(cConfig : object,cFullPath : string,zc : ZationConfig) : boolean
    {
        if(cConfig[Const.App.CONTROLLER.SYSTEM_CONTROLLER])
        {
            return fs.existsSync(systemControllerPath + '/' + cFullPath + '.js');
        }
        else
        {
            return fs.existsSync(zc.getStarter(Const.Starter.KEYS.CONTROLLER) + '/' + cFullPath + '.js');
        }
    }

    static canControllerRequire(cConfig : object,cFullPath : string,zc : ZationConfig) : boolean
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
                require(zc.getStarter(Const.Starter.KEYS.CONTROLLER) + '/' + cFullPath);
                return true;
            }
        }
        catch(e)
        {
            return false;
        }
    }

    static isControllerExtendsController(cConfig : object,cFullPath : string,zc : ZationConfig) : boolean
    {
        let controller : any = {};

        if (cConfig[Const.App.CONTROLLER.SYSTEM_CONTROLLER]) {
            controller = require(systemControllerPath + '/' + cFullPath);
        }
        else {
            controller = require(zc.getStarter(Const.Starter.KEYS.CONTROLLER) + '/' + cFullPath);
        }

        return controller.prototype instanceof Controller;
    }

    //this method can be use to get the path without the pre compile
    static getControllerFPathForCheck(controllerConfig : object,cName : string) : string
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

export = ControllerTools;