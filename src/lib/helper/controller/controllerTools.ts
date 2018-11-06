/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import ZationConfig     = require("../../main/zationConfig");
import Bag              = require("../../api/Bag");
import {
    ArrayPropertyConfig,
    ControllerConfig,
    InternControllerConfig,
    ObjectPropertyConfig
} from "../configs/appConfig";

const systemControllerPath   = __dirname + './../systemController/controller';

class ControllerTools
{

    //Part Controller Paths
    static getControllerFullPath(controllerConfig : InternControllerConfig) : string
    {
        let controllerPath = controllerConfig.filePath;
        let controllerName = controllerConfig.fileName;

        if(controllerPath === undefined) {
            return controllerName;
        }
        else {
            return controllerPath + '/' + controllerName;
        }
    }

    //Part Load Controller
    static getControllerClass(cConfig : InternControllerConfig,zc : ZationConfig) : any
    {
        const path = ControllerTools.getControllerFullPath(cConfig);
        if(ControllerTools.isSystemController(cConfig)) {
            return require(systemControllerPath + '/' + path);
        }
        else {
            return require(zc.starterConfig.controller + '/' + path);
        }
    }

    //Part is SystemController
    static isSystemController(cConfig : ControllerConfig) : boolean {
        return !!cConfig.systemController;
    }

    //Part Before Handle
    static async processBeforeHandleEvents(controllerConfig : ControllerConfig,bag : Bag) : Promise<void>
    {
        const beforeHandle = controllerConfig.beforeHandle;
        if(beforeHandle !== undefined)
        {
            if(Array.isArray(beforeHandle))
            {
                let promises : Promise<void>[] = [];
                for(let i = 0; i < beforeHandle.length; i++)
                {
                    promises.push(ControllerTools.fireBeforeHandleEvent(beforeHandle[i],bag));
                }
                await Promise.all(promises);
            }
            else
            {
                await ControllerTools.fireBeforeHandleEvent(beforeHandle,bag);
            }
        }
    }

    private static async fireBeforeHandleEvent(func : Function,bag : Bag) : Promise<void>
    {
        if(typeof func === "function")
        {
            await func(bag);
        }
    }

    //Part Validation Check Request
    static getControllerConfigFromInputPath(path : string[],controllerInput : object) : object | undefined
    {
        let tempConfig = controllerInput;
        for(let i = 0; i < path.length; i++)
        {
            const k = path[i];
            if(tempConfig.hasOwnProperty(k) && typeof tempConfig[k] === 'object')
            {
                if(tempConfig[k].hasOwnProperty(nameof<ObjectPropertyConfig>(s => s.properties))) {
                    tempConfig = tempConfig[k][nameof<ObjectPropertyConfig>(s => s.properties)];
                }
                else {
                    tempConfig = tempConfig[k];
                }
            }
            else {
                return undefined;
            }
        }
        return tempConfig;
    }
}

export = ControllerTools;