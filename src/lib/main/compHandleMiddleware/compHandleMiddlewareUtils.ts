/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

// noinspection TypeScriptPreferShortImport
import RequestBag                    from '../../api/RequestBag';
import Component                     from '../../api/Component';
import {CompHandleMiddlewareConfig}  from '../config/definitions/parts/compHandleMiddlewareConfig';

export type CompHandleMiddlewareInvoker = (component: Component, reqBag: RequestBag) => Promise<void>;

export default class CompHandleMiddlewareUtils
{
    /**
     * Returns a Closures for invoking the component handle middleware.
     * @param config
     */
    static createInvoker(config: CompHandleMiddlewareConfig): CompHandleMiddlewareInvoker {
        const middleware = config.middleware;
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