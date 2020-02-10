/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

type AnyFunction = (...args : any[]) => any

export type EventInvokerAsync<P extends AnyFunction = any> = (...args : Parameters<P>) => Promise<void>;
export type EventInvokerSync<P extends AnyFunction = any> = (...args : Parameters<P>) => void;

export default class FuncUtils
{
    /**
     * Creates an async closure for invoking functions.
     * @param functions
     */
    static createFuncArrayAsyncInvoker<T extends AnyFunction>(functions : T[]) : EventInvokerAsync<T> {
        const length = functions.length;
        return async (...args) => {
            const promises : Promise<any>[] = [];
            for(let i = 0; i < length; i++) {
                promises.push(functions[i](...args));
            }
            await Promise.all(promises);
        }
    }

    /**
     * Creates an async closure for invoking a middleware.
     * Will stop the middleware chain when a function returns some value.
     * @param functions
     */
    static createFuncMiddlewareAsyncInvoker<T extends AnyFunction>(functions : T[]) : EventInvokerAsync<T> {
        const length = functions.length;
        return async (...args) => {
            let res;
            for(let i = 0; i < length; i++) {
                res = await functions[i](...args);
                if(res !== undefined) return res;
            }
        }
    }

    /**
     * Creates an async closure for invoke a function or functions.
     * @param func
     */
    static createFuncAsyncInvoker<T extends AnyFunction>(func : T[] | T) : EventInvokerAsync<T> {
        if(typeof func === 'function') {
            return func;
        }
        else {
            return FuncUtils.createFuncArrayAsyncInvoker(func);
        }
    }

    /**
     * Creates an async closure for invoke a function or functions.
     * Will return a default function if the event is not a function or a function array.
     * @param func
     */
    static createFuncAsyncInvokeSafe<T extends AnyFunction>(func : T[] | T | undefined) : EventInvokerAsync<T> {
        if(func === undefined){
            return async () => {};
        }
        else {
            return FuncUtils.createFuncAsyncInvoker(func);
        }
    }

    /**
     * Creates an sync closure for invoke a function.
     * @param functions
     */
    static createFuncArraySyncInvoker<T extends AnyFunction>(functions : T[]) : EventInvokerSync<T> {
        const length = functions.length;
        return async (...args) => {
            for(let i = 0; i < length; i++) {
                functions[i](...args);
            }
        }
    }

    /**
     * Creates an sync closure for invoke a event.
     * @param func
     */
    static createEventSyncInvoker<T extends AnyFunction>(func : T[] | T) : EventInvokerSync<T> {
        if(typeof func === 'function') {
            return func;
        }
        else {
            return FuncUtils.createFuncArraySyncInvoker(func);
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
    static callSafe<T extends (...args: any[]) => any>(func: T,args: Parameters<T>,failureReturnValue: any): any {
        try {
            return func(...args);
        }
        catch (e) {
            return failureReturnValue;
        }
    }
}

