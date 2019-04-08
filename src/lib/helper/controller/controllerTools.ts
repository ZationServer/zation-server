/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

// noinspection TypeScriptPreferShortImport
import {Bag}              from '../../api/Bag';
import {
    ControllerConfig,
    ObjectPropertyConfig
} from "../configs/appConfig";


class ControllerTools
{

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
            if(Array.isArray(beforeHandle)) {
                let promises : Promise<void>[] = [];
                for(let i = 0; i < beforeHandle.length; i++)
                {
                    promises.push(ControllerTools.fireBeforeHandleEvent(beforeHandle[i],bag));
                }
                await Promise.all(promises);
            }
            else {
                await ControllerTools.fireBeforeHandleEvent(beforeHandle,bag);
            }
        }
    }

    private static async fireBeforeHandleEvent(func : Function,bag : Bag) : Promise<void>
    {
        if(typeof func === "function") {
            await func(bag);
        }
    }

    //Part Validation Check Request
    static getInputConfigAtPath(path : string[],input : object) : object | undefined
    {
        let tempConfig = input;
        let lastIrritate = path.length -1;
        for(let i = 0; i < path.length; i++)
        {
            const k = path[i];
            if(tempConfig.hasOwnProperty(k) && typeof tempConfig[k] === 'object')
            {
                if(tempConfig[k].hasOwnProperty(nameof<ObjectPropertyConfig>(s => s.properties))
                && i < lastIrritate) {
                    //if not end of inputPath return the properties of the object
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