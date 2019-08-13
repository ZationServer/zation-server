/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

export default class ObjectUtils
{
    /**
     * Merge all objects.
     * @param objects
     */
    static mergeObjects(objects : object[]) : object
    {
        if(objects.length > 1) {
            let mainObj = objects[0];
            for(let i = 1; i < objects.length; i++) {
                mainObj = ObjectUtils.mergeObjToObj(mainObj,objects[i]);
            }
            return mainObj;
        }
        else if(objects.length === 1){
            return objects[0];
        }
        else {
            return {};
        }
    }

    /**
     * Merge objects on all layers (needs more performance)
     * @param mainObj
     * @param toMergeObj
     * @param override
     */
    static mergeObjToObj(mainObj : object, toMergeObj : object, override : boolean = false)
    {
        if(typeof mainObj === "object" && typeof toMergeObj === "object") {
            for(let k in toMergeObj) {
                if(toMergeObj.hasOwnProperty(k)) {
                    if(!mainObj.hasOwnProperty(k) || (typeof mainObj[k] !== 'object' && override)) {
                        mainObj[k] = toMergeObj[k];
                    }
                    else if(typeof mainObj[k] === 'object'){
                        mainObj[k] = ObjectUtils.mergeObjToObj(mainObj[k],toMergeObj[k],override);
                    }
                }
            }
        }
        return mainObj;
    }

    /**
     * Only adds obj to obj on the first Layer.
     * @param mainOb
     * @param addOb
     * @param overwrite
     */
    static addObToOb(mainOb : object,addOb : object,overwrite : boolean = false) : void
    {
        for(let key in addOb) {
            if(addOb.hasOwnProperty(key)) {
                if(overwrite || !mainOb.hasOwnProperty(key)) {
                    mainOb[key] = addOb[key];
                }
            }
        }
    }

    /**
     * Add specific objects values with keys to an object.
     * @param mainOb
     * @param addOb
     * @param overwrite
     * @param onlyAddKeys
     */
    static onlyAddObToOb(mainOb : object,addOb : object,overwrite : boolean = false, onlyAddKeys : object) : void
    {
        for(let key in addOb) {
            if(addOb.hasOwnProperty(key)) {
                if(onlyAddKeys.hasOwnProperty(key) && (overwrite || !mainOb.hasOwnProperty(key))) {
                    mainOb[key] = addOb[key];
                }
            }
        }
    }

    /**
     * Returns an array with the values of the object.
     * @param obj
     */
    static getObjValues(obj : object) : any[]
    {
        let values : any[] = [];
        for(let k in obj) {
            if(obj.hasOwnProperty(k)) {
                values.push(obj[k]);
            }
        }
        return values;
    }

    /**
     * Checks if the object has one of these keys.
     * @param obj
     * @param keys
     */
    static hasOneOf(obj : object,keys : any[]) : boolean
    {
        for(let i = 0; i < keys.length; i++) {
            if(obj.hasOwnProperty(keys[i])) {
                return true;
            }
        }
        return false;
    }

    /**
     * Get all the keys of the search keys that the object owns.
     * @param obj
     * @param keys
     */
    static getFoundKeys(obj : object,keys : any[]) : any[]
    {
        const found : any[] = [];

        for(let i = 0; i < keys.length; i++) {
            if(obj.hasOwnProperty(keys[i])) {
                found.push(keys[i]);
            }
        }
        return found;
    }

    /**
     * Freeze the object deep.
     * @param obj
     */
    static deepFreeze(obj : object) : object
    {
        Object.freeze(obj);
        Object.getOwnPropertyNames(obj).forEach(function (prop) {
            if (obj.hasOwnProperty(prop)
                && obj[prop] !== null
                && (typeof obj[prop] === "object" || typeof obj[prop] === "function")
                && !Object.isFrozen(obj[prop])) {
                ObjectUtils.deepFreeze(obj[prop]);
            }
        });
        return obj;
    }
}