/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

// noinspection TypeScriptPreferShortImport
import Component                     from '../../api/component/Component';
import {CompHandleMiddlewareConfig}  from '../config/definitions/parts/compHandleMiddlewareConfig';
import Packet                        from '../../api/Packet';
import Socket                        from '../../api/Socket';

export type CompHandleMiddlewareInvoker = (component: Component, socket: Socket, packet: Packet) => Promise<void>;

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
                return async (cInstance, socket, packet) => {
                    const promises: (Promise<void> | void)[] = [];
                    for(let i = 0; i < middleware.length; i++) {
                        promises.push(middleware[i].apply(cInstance,[socket, packet]));
                    }
                    await Promise.all(promises);
                };
            }
            else {
                return async (cInstance, socket, packet) => {
                    await middleware.apply(cInstance,[socket, packet]);
                };
            }
        }
        else {
            return async () => {};
        }
    }
}