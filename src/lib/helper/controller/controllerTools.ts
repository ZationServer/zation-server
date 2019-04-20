/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

// noinspection TypeScriptPreferShortImport
import Bag              from '../../api/Bag';
import {
    ControllerConfig, ObjectModelConfig
} from "../configs/appConfig";

export default class ControllerTools
{

    //Part is SystemController
    static isSystemController(cConfig : ControllerConfig) : boolean {
        return !!cConfig.systemController;
    }

    //Part Before Handle
    static async processPrepareHandleEvents(controllerConfig : ControllerConfig,bag : Bag) : Promise<void>
    {
        const prepareHandle = controllerConfig.prepareHandle;
        if(prepareHandle !== undefined)
        {
            if(Array.isArray(prepareHandle)) {
                let promises : Promise<void>[] = [];
                for(let i = 0; i < prepareHandle.length; i++) {
                    promises.push(ControllerTools.firePrepareHandleEvent(prepareHandle[i],bag));
                }
                await Promise.all(promises);
            }
            else {
                await ControllerTools.firePrepareHandleEvent(prepareHandle,bag);
            }
        }
    }

    private static async firePrepareHandleEvent(func : Function,bag : Bag) : Promise<void>
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
                if(tempConfig[k].hasOwnProperty(nameof<ObjectModelConfig>(s => s.properties))
                && i < lastIrritate) {
                    //if not end of inputPath return the properties of the object
                    tempConfig = tempConfig[k][nameof<ObjectModelConfig>(s => s.properties)];
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