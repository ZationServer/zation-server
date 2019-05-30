/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

export type BreakIterator =
    (func : (key : string,value : any,src : object | any []) => Promise<boolean | void>) => Promise<void>;

export default class Iterator
{
    /**
     * Create an iterator (closure) that can be used later to iterator over an object or array.
     * The iterator is also breakable by returning a true.
     * Notice that the array or object should not change after creating the closure.
     * @param value
     */
    static createBreakIterator(value : object | any[]) : BreakIterator
    {
        if(Array.isArray(value)){
            return async (func) => {
                for(let k = 0; k < value.length; k++) {
                    if(await func(k.toString(),value[k],value)){
                        break;
                    }
                }
            };
        }
        else {
            const keys = Object.keys(value);
            return async (func) => {
                for(let i = 0; i < keys.length; i++){
                    if(await func(keys[i],value[keys[i]],value)) {
                        break;
                    }
                }
            }
        }
    }

    /**
     * Iterate sync over an array or object.
     * @param func
     * @param value
     */
    static iterateSync(func : (key : string,value : any,src : object | any []) => void,value : object | any[])
    {
        if(Array.isArray(value)){
            for(let k = 0; k < value.length; k++) {
                func(k.toString(),value[k],value);
            }
        }
        else {
            for(let k in value) {
                if(value.hasOwnProperty(k)){
                    func(k,value[k],value);
                }
            }
        }
    }
}