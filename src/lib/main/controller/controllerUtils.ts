/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

// noinspection TypeScriptPreferShortImport
import RequestBag                    from '../../api/RequestBag';
// noinspection TypeScriptPreferShortImport,ES6PreferShortImport
import {ControllerConfig}            from "../config/definitions/parts/controllerConfig";
import Controller                    from "../../api/Controller";

export type MiddlewareInvokeFunction = (controllerInstance: Controller, reqBag: RequestBag) => Promise<void >;

export default class ControllerUtils
{
    /**
     * Returns a Closures for invoking the controller middleware event.
     * @param controllerConfig
     */
    static createMiddlewareInvoker(controllerConfig: ControllerConfig): MiddlewareInvokeFunction {
        const middleware = controllerConfig.middleware;
        if(middleware !== undefined)
        {
            if(Array.isArray(middleware)) {
                return async (cInstance,bag) => {
                    const promises: (Promise<void> | void)[] = [];
                    for(let i = 0; i < middleware.length; i++) {
                        promises.push(middleware[i].apply(cInstance,[bag]));
                    }
                    await Promise.all(promises);
                };
            }
            else {
                return async (cInstance,bag) => {
                    await middleware.apply(cInstance,[bag]);
                };
            }
        }
        else {
            return async () => {};
        }
    }
}