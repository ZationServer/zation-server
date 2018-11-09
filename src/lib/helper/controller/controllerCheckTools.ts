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

    static requireController(cConfig : ControllerConfig,cFullPath : string,zc : ZationConfig) : boolean
    {
        if(cConfig.systemController) {
            return require(systemControllerPath + '/' + cFullPath);
        }
        else {
            return require(zc.starterConfig.controller + '/' + cFullPath);
        }
    }

    static isControllerExtendsController(controller) : boolean
    {
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