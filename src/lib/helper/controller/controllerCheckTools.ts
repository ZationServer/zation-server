/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import {Controller}       from '../../api/Controller';
import ZationConfig     = require("../../main/zationConfig");
import fs               = require('fs');
import {ControllerConfig} from "../configs/appConfig";


const systemControllerPath   = __dirname + './../systemController/controller';

class ControllerTools
{
    static controllerFileExist(cConfig : ControllerConfig,cFullPath : string,zc : ZationConfig) : boolean
    {
        if(cConfig.systemController) {
            return fs.existsSync(systemControllerPath + '/' + cFullPath + '.js');
        }
        else {
            return fs.existsSync(zc.starterConfig.controller + '/' + cFullPath + '.js');
        }
    }

    static canControllerRequire(cConfig : ControllerConfig,cFullPath : string,zc : ZationConfig) : boolean
    {
        try
        {
            if(cConfig.systemController) {
                require(systemControllerPath + '/' + cFullPath);
                return true;
            }
            else {
                require(zc.starterConfig.controller + '/' + cFullPath);
                return true;
            }
        }
        catch(e) {
            return false;
        }
    }

    static isControllerExtendsController(cConfig : ControllerConfig,cFullPath : string,zc : ZationConfig) : boolean
    {
        let controller : any = {};
        if (cConfig.systemController) {
            controller = require(systemControllerPath + '/' + cFullPath);
        }
        else {
            controller = require(zc.starterConfig.controller + '/' + cFullPath);
        }
        return controller.prototype instanceof Controller;
    }

    //this method can be use to get the path without the pre compile
    static getControllerFPathForCheck(controllerConfig : ControllerConfig,cName : string) : string
    {
        let controllerPath = controllerConfig.filePath;
        let controllerName = controllerConfig.fileName;

        if(!controllerName) {
            controllerName = cName;
        }

        if(controllerPath === undefined) {
            return controllerName;
        }
        else {
            return controllerPath + '/' + controllerName;
        }
    }
}

export = ControllerTools;