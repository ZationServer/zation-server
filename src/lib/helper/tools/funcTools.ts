/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import SmallBag = require("../../api/SmallBag");

class FuncTools
{
    static async emitEvent(func : Function | Function[],...params : any[]) : Promise<void>
    {
        if(func !== undefined && typeof func === 'function') {
            await func(...params);
        }
        else if(Array.isArray(func)) {
            let promises : Promise<void>[] = [];
            for(let i = 0; i < func.length; i++) {
                promises.push(FuncTools.emitEvent(func[i],...params));
            }
            await Promise.all(promises);
        }
    }

    static async checkMiddlewareFunc(func : Function,req : object,next : Function,smallBag : SmallBag) : Promise<boolean>
    {
        if(func !== undefined && typeof func === 'function') {
            let res  = await func(smallBag,req);
            if(res !== undefined && typeof res === "boolean" && res) {
                return true;
            }
            else {
                if(typeof res === 'object') {
                    next(res);
                    return false;
                }
                else {
                    let err : any = new Error('Access is in middleware from zation event blocked!');
                    err.code = 4650;
                    next(err);
                    return false;
                }
            }
        }
        else {
            return true;
        }
    }
}

export = FuncTools;