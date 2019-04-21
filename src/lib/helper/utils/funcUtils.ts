/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

export default class FuncUtils
{
    static async emitEvent(func : Function | Function[] | undefined,...params : any[]) : Promise<void>
    {
        if(typeof func === 'function') {
            await func(...params);
        }
        else if(Array.isArray(func)) {
            let promises : Promise<void>[] = [];
            for(let i = 0; i < func.length; i++) {
                promises.push(FuncUtils.emitEvent(func[i],...params));
            }
            await Promise.all(promises);
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
}

