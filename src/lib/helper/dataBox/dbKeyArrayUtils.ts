/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

export default class DbKeyArrayUtils {

    /**
     * This method can be used to build a raw key array.
     * These arrays are useful to present data in a sequence and as a key-value map.
     * To create a key array you need to have an array that contains objects,
     * and each object has the same property that indicates the key.
     * Later, when you use the DataBox,
     * you easily can access the items by the key.
     * If you did not use a key array, the only possibility to access the elements in an array is per index.
     * But this is problematical if every client has a different amount of elements because
     * then you not able to change one specific item.
     * (Because you would change  on each client a different item.)
     */
    static buildKeyArray<T>(array : T[],key : keyof T) {
        return {
            ___a___ : array,
            k : key
        }
    }
}

export const buildKeyArray = DbKeyArrayUtils.buildKeyArray;