/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

export default class MiddlewareUtils
{
    /**
     * Check a middleware function.
     * It returns true if the access is allowed and
     * false or an object if the access is denied.
     * @param func
     * @param defaultValue
     * @param params
     */
    static async checkMiddleware<M extends (...args : any[]) => any>(func : M | undefined, defaultValue : boolean, ...params : Parameters<M>) : Promise<boolean | object> {
        if(typeof func === 'function') {
            const res  = await func(...params);
            if(typeof res === "boolean") {
                if(res){
                    return true;
                }
                else {
                    const err : any = new Error('Access is in middleware from zation event blocked!');
                    err.code = 4650;
                    return err;
                }
            }
            else if(typeof res === 'object') {
                return res;
            }
            else {
                return defaultValue;
            }
        }
        else {
            return defaultValue;
        }
    }

    /**
     * Process the result in case of middleware block.
     * @param res
     */
    static processBlockedResult(res : false | object) : true | object {
        return !res ? true : res;
    }
}

