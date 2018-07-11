/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import Const            = require('../constants/constWrapper');
import Controller       = require("../../api/Controller");
import ZationConfig     = require("../../main/zationConfig");
import Bag = require("../../api/Bag");

const systemControllerPath   = __dirname + './../systemController/controller';

class ControllerTools
{

    //Part Controller Paths
    static getControllerFullPath(controllerConfig : object) : string
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

    //Part Load Controller
    static getControllerClass(cConfig : object,zc : ZationConfig) : any
    {
        let path = ControllerTools.getControllerFullPath(cConfig);

        if(ControllerTools.isSystemController(cConfig))
        {
            return require(systemControllerPath + '/' + path);
        }
        else
        {
            return require(zc.getMain(Const.Main.KEYS.CONTROLLER) + '/' + path);
        }
    }

    //Part is SystemController
    static isSystemController(cConfig : object) : boolean
    {
        return cConfig[Const.App.CONTROLLER.SYSTEM_CONTROLLER];
    }

    //Part Extra Secure
    static needToCheckExtraSecure(controllerConfig : object) : boolean
    {
        if(controllerConfig[Const.App.CONTROLLER.EXTRA_SECURE] !== undefined)
        {
            return controllerConfig[Const.App.CONTROLLER.EXTRA_SECURE];
        }
        return true;
    }

    //Part Before Handle
    static async processBeforeHandleEvents(controllerConfig : object,bag : Bag) : Promise<void>
    {
        let beforeHandle = controllerConfig[Const.App.CONTROLLER.BEFORE_HANDLE];
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
            let k = path[i];

            if(tempConfig.hasOwnProperty(k) && typeof tempConfig[k] === 'object')
            {
                if(tempConfig[k].hasOwnProperty(Const.App.OBJECTS.PROPERTIES))
                {
                    tempConfig = tempConfig[k][Const.App.OBJECTS.PROPERTIES];
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

export = ControllerTools;