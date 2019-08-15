/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

export default class CloneUtils
{
    /**
     * Clone any value.
     * Except for instances of an object
     * (the prototype will not be set).
     * @param v
     */
    static deepClone<T extends any = any>(v : T) : T {
        // if not array or object or is null return self
        if (typeof v !== 'object'||v === null) return v;
        let newO, i;
        // handle case: array
        if (v instanceof Array) {
            let l;
            newO = [];
            for (i = 0, l = v.length; i < l; i++) newO[i] = CloneUtils.deepClone(v[i]);
            return newO;
        }
        // handle case: object
        newO = {};
        for (i in v) if (v.hasOwnProperty(i)) newO[i] = CloneUtils.deepClone(v[i]);
        return newO;
    }
}