/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

export default class MiddlewareUtils
{
    static async checkMiddleware(func : Function | undefined, next : Function, ...params : any[]) : Promise<boolean> {
        if(typeof func === 'function') {
            const res  = await func(...params);
            if(typeof res === "boolean" && res) {
                return true;
            }
            else if(typeof res === 'object') {
                next(res,true);
                return false;
            }
            else {
                const err : any = new Error('Access is in middleware from zation event blocked!');
                err.code = 4650;
                next(err,true);
                return false;
            }
        }
        else {
            return true;
        }
    }
}

