/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

export default class ObjectUtils
{
    /**
     * Merges multiples objects with each other deep.
     * @param objects
     */
    static deepMergeObjects(...objects: object[]): object
    {
        if(objects.length > 1) {
            let mainObj = objects[0];
            for(let i = 1; i < objects.length; i++) {
                mainObj = ObjectUtils.deepMergeTwoObjects(mainObj,objects[i],false);
            }
            return mainObj;
        }
        else {
            return objects.length === 1 ? objects[0] : {};
        }
    }

    /**
     * Merges an object with another object deep.
     * @param mainObj
     * @param toMergeObj
     * @param override
     */
    static deepMergeTwoObjects(mainObj: object, toMergeObj: object, override: boolean = false) {
        let tmpMergeValue;
        for(let k in toMergeObj) {
            if(toMergeObj.hasOwnProperty(k)) {
                tmpMergeValue = toMergeObj[k];
                if(mainObj.hasOwnProperty(k)) {
                    if(typeof mainObj[k] === 'object' && typeof tmpMergeValue === 'object'){
                        mainObj[k] = this.deepMergeTwoObjects(mainObj[k],tmpMergeValue,override);
                    }
                    else if(override){
                        mainObj[k] = tmpMergeValue;
                    }
                }
                else {
                    mainObj[k] = tmpMergeValue;
                }
            }
        }
        return mainObj;
    }

    /**
     * Merges the root layer of an object with another.
     * @param mainObj
     * @param addObj
     * @param overwrite
     */
    static mergeTwoObjects(mainObj: object, addObj: object, overwrite: boolean = false): void
    {
        for(let key in addObj) {
            if(addObj.hasOwnProperty(key)) {
                if(overwrite || !mainObj.hasOwnProperty(key)) {
                    mainObj[key] = addObj[key];
                }
            }
        }
    }

    /**
     * Returns all values of an object in an array.
     * @param obj
     */
    static getObjValues(obj: object): any[]
    {
        let values: any[] = [];
        for(let k in obj) {
            if(obj.hasOwnProperty(k)) {
                values.push(obj[k]);
            }
        }
        return values;
    }

    /**
     * Returns if the object owns one of the property keys.
     * @param obj
     * @param keys
     */
    static hasOneOf(obj: object,keys: string[]): boolean
    {
        for(let i = 0; i < keys.length; i++) {
            if(obj.hasOwnProperty(keys[i])) {
                return true;
            }
        }
        return false;
    }

    /**
     * Finds all keys in a specific scope of keys in an object.
     * @param obj
     * @param scope
     */
    static findKeysOfScope(obj: object, scope: string[]): string[]
    {
        const found: string[] = [];
        for(let i = 0; i < scope.length; i++) {
            if(obj.hasOwnProperty(scope[i])) {
                found.push(scope[i]);
            }
        }
        return found;
    }

    /**
     * Filters specific scope of properties from an object
     * and returns the filtered properties in a new object.
     * @param obj
     * @param keys
     */
    static filterObjectProps(obj: object, keys: string[]): object {
        const keyLength = keys.length;
        const result = {};
        let tmpKey;
        for(let i = 0; i < keyLength; i++){
            tmpKey = keys[i];
            if(obj.hasOwnProperty(tmpKey)){
                result[tmpKey] = obj[tmpKey];
            }
        }
        return result;
    }

    /**
     * Freeze the object deep.
     * @param obj
     */
    static deepFreeze(obj: object): object
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

    /**
     * Adds props to the prototype of the class.
     * @param classValue
     * @param props
     * @param skipUndefined
     */
    static addPropsToClass(classValue,props: Record<string,any>,skipUndefined: boolean) {
        for(let k in props) {
            if(props.hasOwnProperty(k) && (!skipUndefined || props[k] !== undefined)) {
                classValue.prototype[k] = props[k];
            }
        }
    }
}