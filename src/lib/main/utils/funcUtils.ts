/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import Logger from '../log/logger';
import {PreparedEvents} from '../config/definitions/parts/events';

type AnyFunction = (...args: any[]) => any

export type EventInvokerAsync<P extends AnyFunction = any> = (...args: Parameters<P>) => Promise<any>;
export type EventInvokerSync<P extends AnyFunction = any> = (...args: Parameters<P>) => any;

export default class FuncUtils
{
    /**
     * Creates an async closure for invoking a middleware.
     * Will stop the middleware chain when a function returns some value.
     * @param functions
     */
    static createFuncMiddlewareAsyncInvoker<T extends AnyFunction>(functions: T[]): EventInvokerAsync<T> {
        const length = functions.length;
        return async (...args) => {
            let res;
            for(let i = 0; i < length; i++) {
                try {
                    res = await functions[i](...args);
                    if(res !== undefined) return res;
                }
                catch (err) {
                    return typeof err === 'object' ? err
                        : new Error(err.toString());
                }
            }
        }
    }

    /**
     * Creates an async closure for invoke a function or functions.
     * @param func
     */
    static createFuncAsyncInvoker<T extends AnyFunction>(func: T[] | T): EventInvokerAsync<T> {
        if(typeof func === 'function') {
            return func;
        }
        else {
            return FuncUtils.createFuncArrayAsyncInvoker(func);
        }
    }

    /**
     * Creates an async closure for invoking functions.
     * @param functions
     */
    static createFuncArrayAsyncInvoker<T extends AnyFunction>(functions: T[]): EventInvokerAsync<T> {
        const length = functions.length;
        return async (...args) => {
            const promises: Promise<any>[] = [];
            for(let i = 0; i < length; i++) {
                promises.push(functions[i](...args));
            }
            await Promise.all(promises);
        }
    }

    /**
     * Creates an sync closure for invoke a function or functions.
     * @param func
     */
    static createFuncSyncInvoker<T extends AnyFunction>(func: T[] | T): EventInvokerSync<T> {
        if(typeof func === 'function') {
            return func;
        }
        else {
            return FuncUtils.createFuncArraySyncInvoker(func);
        }
    }

    /**
     * Creates an sync closure for invoke a function.
     * @param functions
     */
    static createFuncArraySyncInvoker<T extends AnyFunction>(functions: T[]): EventInvokerSync<T> {
        const length = functions.length;
        return async (...args) => {
            for(let i = 0; i < length; i++) {
                functions[i](...args);
            }
        }
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Creates a function safe caller which catch thrown errors,
     * log them and triggers the error event.
     * @param func
     * @param errorEvent
     * @param beforeErrorMsg
     */
    static createSafeCaller<T extends AnyFunction>(func: T,beforeErrorMsg: string = '',errorEvent?: PreparedEvents['error']): EventInvokerAsync<T> {
        if(errorEvent){
            return async (...args) => {
                try {
                    return await func(...args);
                }
                catch (e) {
                    Logger.log.error(beforeErrorMsg,e);
                    await errorEvent(e);
                }
            }
        }
        else {
            return async (...args) => {
                try {
                    return await func(...args);
                }
                catch (e) {
                    Logger.log.error(beforeErrorMsg,e);
                }
            }
        }
    }

    /**
     * Calls a function safe.
     * It means that all thrown errors will be caught.
     * In this case, the failureReturnValue will be returned.
     * @param func
     * @param args
     * @param failureReturnValue
     */
    static callSafe<T extends (...args: any[]) => any,FR>(func: T,args: Parameters<T>,failureReturnValue: FR): ReturnType<T> | FR {
        try {
            return func(...args);
        }
        catch (e) {
            return failureReturnValue;
        }
    }
}

