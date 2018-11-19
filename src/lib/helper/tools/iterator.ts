/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

class Iterator
{
    static async breakIterate(func : (key : string,value : any,src : object | any []) => Promise<boolean | void>,...objects : (object | any[])[])
    {
        for(let i = 0; i < objects.length; i++) {
            const item = objects[i];
            if(Array.isArray(item)){
                for(let k = 0; k < item.length; k++) {
                    if(await func(k.toString(),item[k],item)){
                        break;
                    }
                }
            }
            else {
                for(let k in item) {
                    if(item.hasOwnProperty(k)){
                        if(await func(k,item[k],item)) {
                            break;
                        }
                    }
                }
            }
        }
    }

    static iterateSync(func : (key : string,value : any,src : object | any []) => void,...objects : (object | any[])[])
    {
        for(let i = 0; i < objects.length; i++) {
            const item = objects[i];
            if(Array.isArray(item)){
                for(let k = 0; k < item.length; k++) {
                    func(k.toString(),item[k],item);
                }
            }
            else {
                for(let k in item) {
                    if(item.hasOwnProperty(k)){
                        func(k,item[k],item);
                    }
                }
            }
        }
    }
}

export = Iterator;