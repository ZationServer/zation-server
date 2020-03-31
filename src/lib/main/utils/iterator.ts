/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {ApiLevelSwitch} from "../apiLevel/apiLevelUtils";

export type BreakIterator =
    (func: (key: string,value: any,src: object | any []) => Promise<boolean | void>) => Promise<void>;

export default class Iterator
{
    /**
     * Create an iterator (closure) that can be used later to iterator over an object or array.
     * The iterator is also breakable by returning a true.
     * Notice that the array or object should not be changed after creating the closure.
     * @param value
     */
    static createBreakIterator(value: object | any[]): BreakIterator
    {
        if(Array.isArray(value)){
            const length = value.length;
            return async (func) => {
                for(let k = 0; k < length; k++) {
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
    static iterateSync(func: (key: string,value: any,src: object | any []) => void,value: object | any[])
    {
        if(Array.isArray(value)){
            for(let k = 0; k < value.length; k++) {
                func(k.toString(),value[k],value);
            }
        }
        else {
            for(const k in value) {
                if(value.hasOwnProperty(k)){
                    func(k,value[k],value);
                }
            }
        }
    }

    /**
     * A method that will help to iterate over components
     * which can have an API level e.g., controllers or databoxes.
     * @param definition
     * @param iterator
     */
    static iterateCompDefinition<T extends object>(definition: T | ApiLevelSwitch<T>,
                                                   iterator: (tClass: T,key: string | undefined) => void)
    {
        if(typeof definition === 'function'){
            iterator(definition,undefined);
        }
        else {
            for(const k in definition){
                if(definition.hasOwnProperty(k)){
                    iterator(definition[k],k);
                }
            }
        }
    }
}