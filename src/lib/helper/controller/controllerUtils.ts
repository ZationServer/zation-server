/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

// noinspection TypeScriptPreferShortImport
import Bag                           from '../../api/Bag';
// noinspection TypeScriptPreferShortImport
import {ControllerConfig}            from "../configDefinitions/controllerConfig";
import Controller, {ControllerClass} from "../../api/Controller";
import {ApiLevelSwitch}              from "../apiLevel/apiLevelUtils";

export type PrepareHandleInvokeFunction = (controllerInstance : Controller,bag : Bag) => Promise<void >;

export default class ControllerUtils
{
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

    /**
     * A method that will help to iterate over all controllers
     * of a controller definition from the app config.
     * @param definition
     * @param iterator
     */
    static iterateControllerDefinition(definition : ControllerClass | ApiLevelSwitch<ControllerClass>,
                                       iterator : (controllerClass : ControllerClass,key : string | undefined) => void)
    {
        if(typeof definition === 'function'){
            iterator(definition,undefined);
        }
        else {
            for(let k in definition){
                if(definition.hasOwnProperty(k)){
                    iterator(definition[k],k);
                }
            }
        }
    }
}