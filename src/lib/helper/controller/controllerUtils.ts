/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

// noinspection TypeScriptPreferShortImport
import Bag              from '../../api/Bag';
// noinspection TypeScriptPreferShortImport
import {ControllerConfig} from "../configDefinitions/appConfig";
import Controller from "../../api/Controller";

export type PrepareHandleInvokeFunction = (controllerInstance : Controller,bag : Bag) => Promise<void >;

export default class ControllerUtils
{

    /**
     * Returns if the controller is a system controller.
     * @param cConfig
     */
    static isSystemController(cConfig : ControllerConfig) : boolean {
        return !!cConfig.systemController;
    }

    /**
     * Returns a Closures for invoking the controller before handle event.
     * @param controllerConfig
     */
    static createPrepareHandleInvoker(controllerConfig : ControllerConfig) : PrepareHandleInvokeFunction {
        const prepareHandle = controllerConfig.prepareHandle;
        if(prepareHandle !== undefined)
        {
            if(Array.isArray(prepareHandle)) {
                return async (cInstance,bag) => {
                    const promises : (Promise<void> | void)[] = [];
                    for(let i = 0; i < prepareHandle.length; i++) {
                        promises.push(prepareHandle[i].apply(cInstance,[bag]));
                    }
                    await Promise.all(promises);
                };
            }
            else {
                return async (cInstance,bag) => {
                    await prepareHandle.apply(cInstance,[bag]);
                };
            }
        }
        else {
            return async () => {};
        }
    }
}