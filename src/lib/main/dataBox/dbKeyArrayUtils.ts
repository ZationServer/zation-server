/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

export default class DbKeyArrayUtils {

    /**
     * This method can be used to build a raw key array.
     * These arrays are useful to present data in a sequence and as a key-value map.
     * Later, when you use the DataBox,
     * you easily can access the items by the key.
     * If you did not use a key array, the only possibility to
     * access the elements in an array is per index.
     * But this is problematical if every client has a different amount
     * of elements because then you not able to change one specific item.
     * (Because you would change on each client a different item.)
     * You have two possibilities to create a key array:
     * First one is useful when you have objects,
     * where each of them has the same property that indicates a key.
     * For example, I have 20 message objects, and each message object has a id property.
     * Then you quickly can build the key array by invoking this method with
     * an array that contains the 20 messages and the property name, which represents the key.
     * The second possibility is useful if you want to have any value in
     * your key array and not only objects.
     * Here you need to invoke the method with an array of objects where each
     * object maps a key to a value.
     * Then you provide the property name to the key and the value.
     * @example
     * //First possibility:
     * buildKeyArray(
     * [{id : '2033323',msg : 'hello'},{id : '2435435',msg : 'hi'}],
     * 'id');
     * //Second possibility:
     * buildKeyArray(
     * [{k : 'name',v : 'luca'},{k : 'age',v : 20}],
     * 'k','v');
     */
    static buildKeyArray<T>(array : T[],key : keyof T,value ?: keyof T) {
        return {
            ___a___ : array,
            k : key,
            ...(value !== undefined ? {v : value} : {})
        }
    }
}

export const buildKeyArray = DbKeyArrayUtils.buildKeyArray;