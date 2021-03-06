/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {Middleware, PreparedMiddleware} from '../config/definitions/parts/middleware';
import FuncUtils                        from '../utils/funcUtils';
import {AnyFunction}                    from '../utils/typeUtils';
import {block}                          from './block';
import {PreparedEvents}                 from '../config/definitions/parts/events';
import Logger                           from '../log/logger';

export type MiddlewareInvoker<T extends AnyFunction> = (...args: Parameters<T>) => Promise<Error | void> | Error | void;

const MIDDLEWARE_DEFAULTS: Record<keyof Middleware,boolean> = {
    authenticate: true,
    socket: true,
    panelAuth: false
}

export default class MiddlewaresPreparer {

    static prepare(middlewares: Middleware = {}, errorEvent: PreparedEvents['error']): PreparedMiddleware {
        const res = {};
        for(const k in MIDDLEWARE_DEFAULTS) {
            if(MIDDLEWARE_DEFAULTS.hasOwnProperty(k)){
                res[k] = MiddlewaresPreparer.createMiddlewareAsyncSafeInvoker
                    (middlewares[k], MIDDLEWARE_DEFAULTS[k],`An error was thrown in the middleware: '${k}' :`, errorEvent);
            }
        }
        return res as PreparedMiddleware;
    }

    /**
     * Creates an async closure for invoking a middleware.
     * Will stop the middleware chain when a function returns some value.
     * Returns an error when the action was denied.
     * @param value
     * @param defaultAllow
     * @param beforeErrorMsg
     * @param errorEvent
     */
    static createMiddlewareAsyncSafeInvoker<T extends AnyFunction>(value: T[] | T | undefined, defaultAllow: boolean,
                                                                   beforeErrorMsg: string, errorEvent: PreparedEvents['error']): MiddlewareInvoker<T>
    {
        if(!value) return defaultAllow ? (..._) => {} : (..._) => {
            const err: any = new Error('Unexpected error in middleware.');
            err.code = 4650;
            return err;
        }
        const middleware = Array.isArray(value) ? FuncUtils.createAsyncChainInvoker(value) : value;
        return async (...params) => {
            try {
                const res = await middleware(...params);
                if(res === true) return;
                else if(res === false || res === block) {
                    const err: any = new Error('Middleware silent block.');
                    err.code = 4650;
                    return err;
                }
                else if(res instanceof Error) return res;
                else {
                    if(defaultAllow) return;
                    else {
                        const err: any = new Error('Middleware silent block.');
                        err.code = 4650;
                        return err;
                    }
                }
            }
            catch (e) {
                if(e === block) {
                    const err: any = new Error('Middleware silent block.');
                    err.code = 4650;
                    return err;
                }
                else {
                    Logger.log.error(beforeErrorMsg,e);
                    errorEvent(e);

                    const err: any = new Error('Unexpected error in middleware.');
                    err.code = 4650;
                    return err;
                }
            }
        }
    }
}