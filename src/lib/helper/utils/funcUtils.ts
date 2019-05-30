/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

type AnyFunction = (...args : any[]) => any

export type EventInvokerAsync = (...args : any[]) => Promise<void>;
export type EventInvokerSync = (...args : any[]) => void;

export default class FuncUtils
{
    static async emitEvent(func ?: (...args : any[]) => any,...params : any[]) : Promise<void> {
        if(typeof func === 'function') {
            await func(...params);
        }
    }

    /**
     * Creates a async closure for invoke a functions.
     * @param functions
     */
    static createFuncArrayAsyncInvoker(functions : AnyFunction[]) : EventInvokerAsync {
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
    static createFuncAsyncInvoker(func : AnyFunction[] | AnyFunction) : EventInvokerAsync {
        if(typeof func === 'function') {
            return func;
        }
        else {
            return FuncUtils.createFuncArrayAsyncInvoker(func);
        }
    }

    /**
     * Creates a sync closure for invoke a function.
     * @param functions
     */
    static createFuncArraySyncInvoker(functions : AnyFunction[]) : EventInvokerSync {
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
    static createEventSyncInvoker(func : AnyFunction[] | AnyFunction) : EventInvokerSync {
        if(typeof func === 'function') {
            return func;
        }
        else {
            return FuncUtils.createFuncArraySyncInvoker(func);
        }
    }
}

