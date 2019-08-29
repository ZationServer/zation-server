/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

export default class CloneUtils
{
    /**
     * Deep clone any value.
     * Notice that it only clones enumerable properties of an object.
     * @param v
     */
    static deepClone<T extends any = any>(v : T) : T {
        // if not array or object or is null return self
        if (typeof v !== 'object'||v === null) return v;
        let newO, i;
        // handle case: array
        if (Array.isArray(v)) {
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