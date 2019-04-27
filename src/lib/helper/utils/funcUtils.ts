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

    static async checkMiddlewareFunc(func : Function | undefined,next : Function,...params : any[]) : Promise<boolean>
    {
        if(typeof func === 'function') {
            let res  = await func(...params);
            if(typeof res === "boolean" && res) {
                return true;
            }
            else {
                if(typeof res === 'object') {
                    next(res,true);
                    return false;
                }
                else {
                    let err : any = new Error('Access is in middleware from zation event blocked!');
                    err.code = 4650;
                    next(err,true);
                    return false;
                }
            }
        }
        else {
            return true;
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

