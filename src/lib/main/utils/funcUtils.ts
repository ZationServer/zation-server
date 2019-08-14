/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

type AnyFunction = (...args : any[]) => any

export type EventInvokerAsync<P extends AnyFunction = any> = (...args : Parameters<P>) => Promise<void>;
export type EventInvokerSync<P extends AnyFunction = any> = (...args : Parameters<P>) => void;

export default class FuncUtils
{
    /**
     * Creates a async closure for invoke a functions.
     * @param functions
     */
    static createFuncArrayAsyncInvoker<T extends AnyFunction>(functions : T[]) : EventInvokerAsync<T> {
        return async (...args) => {
            const promises : Promise<any>[] = [];
            for(let i = 0; i < functions.length; i++) {
                promises.push(functions[i](...args));
            }
            await Promise.all(promises);
        }
    }

    /**
     * Creates a async closure for invoke a function or functions.
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
     * Creates a async closure for invoke a function or functions.
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
     * Creates a sync closure for invoke a function.
     * @param functions
     */
    static createFuncArraySyncInvoker<T extends AnyFunction>(functions : T[]) : EventInvokerSync<T> {
        return async (...args) => {
            for(let i = 0; i < functions.length; i++) {
                functions[i](...args);
            }
        }
    }

    /**
     * Creates a sync closure for invoke a event.
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
}
