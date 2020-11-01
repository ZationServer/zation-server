/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

/**
 * This method can be used to build a raw key array.
 * These arrays are useful to present data in a sequence and as a key-value map.
 * Later, when you use the Databox,
 * you easily can access the items by the key.
 * If you did not use a key array, the only possibility to
 * access the elements in an array is per index.
 * But this is problematical if every client has a different amount
 * of elements because then you are not able to change one specific item.
 * (Because you would change on each client a different item.)
 * You have more possibilities to create a key array, all are explained in the examples.
 * @example
 * // 1: From objects with a key property
 * // This one is useful when you have objects,
 * // where each of them has the same property that indicates a key.
 * // For example, I have 20 message objects,
 * // and each message object has an id property.
 * // Then you quickly can build the key array by invoking this
 * // method with an array that contains the 20 messages and the property name,
 * // which represents the key.
 * buildKeyArray([{id: '2033323',msg: 'hello'},{id: '2435435',msg: 'hi'}], 'id');
 *
 * // 2: From objects with a key and value property
 * // That option is useful when you want to point with the key to only
 * // a single property value of the object instead of to the whole object.
 * // Therefore you specify in which property the value can be found.
 * // In the message example, we could use the msg property as a value and the id as a key.
 * // The fourth parameter indicates if the data should be compressed.
 * // By default, this is enabled. Compress will convert every object
 * // into a key-value pair array; this helps to remove unnecessary properties
 * // and makes the data that needs to be sent smaller.
 * buildKeyArray([{id: '2033323',msg: 'hello'},
 *  {id: '2435435',msg: 'hi'}], 'id', 'msg', true);
 *
 * // 3: From key-value pair arrays
 * // This option will build the key-array from key-value pair arrays.
 * // That means you specify key-value pairs with arrays.
 * // The first item of each array represents the key and the second item the associated value.
 * buildKeyArray([['2033323','hello'],['2435435','hi']])
 */
export function buildKeyArray(array: [string, any][])
/**
 * This method can be used to build a raw key array.
 * These arrays are useful to present data in a sequence and as a key-value map.
 * Later, when you use the Databox,
 * you easily can access the items by the key.
 * If you did not use a key array, the only possibility to
 * access the elements in an array is per index.
 * But this is problematical if every client has a different amount
 * of elements because then you are not able to change one specific item.
 * (Because you would change on each client a different item.)
 * You have more possibilities to create a key array, all are explained in the examples.
 * @example
 * // 1: From objects with a key property
 * // This one is useful when you have objects,
 * // where each of them has the same property that indicates a key.
 * // For example, I have 20 message objects,
 * // and each message object has an id property.
 * // Then you quickly can build the key array by invoking this
 * // method with an array that contains the 20 messages and the property name,
 * // which represents the key.
 * buildKeyArray([{id: '2033323',msg: 'hello'},{id: '2435435',msg: 'hi'}], 'id');
 *
 * // 2: From objects with a key and value property
 * // That option is useful when you want to point with the key to only
 * // a single property value of the object instead of to the whole object.
 * // Therefore you specify in which property the value can be found.
 * // In the message example, we could use the msg property as a value and the id as a key.
 * // The fourth parameter indicates if the data should be compressed.
 * // By default, this is enabled. Compress will convert every object
 * // into a key-value pair array; this helps to remove unnecessary properties
 * // and makes the data that needs to be sent smaller.
 * buildKeyArray([{id: '2033323',msg: 'hello'},
 *  {id: '2435435',msg: 'hi'}], 'id', 'msg', true);
 *
 * // 3: From key-value pair arrays
 * // This option will build the key-array from key-value pair arrays.
 * // That means you specify key-value pairs with arrays.
 * // The first item of each array represents the key and the second item the associated value.
 * buildKeyArray([['2033323','hello'],['2435435','hi']])
 */
export function buildKeyArray<T>(array: T[], key: keyof T)
/**
 * This method can be used to build a raw key array.
 * These arrays are useful to present data in a sequence and as a key-value map.
 * Later, when you use the Databox,
 * you easily can access the items by the key.
 * If you did not use a key array, the only possibility to
 * access the elements in an array is per index.
 * But this is problematical if every client has a different amount
 * of elements because then you are not able to change one specific item.
 * (Because you would change on each client a different item.)
 * You have more possibilities to create a key array, all are explained in the examples.
 * @example
 * // 1: From objects with a key property
 * // This one is useful when you have objects,
 * // where each of them has the same property that indicates a key.
 * // For example, I have 20 message objects,
 * // and each message object has an id property.
 * // Then you quickly can build the key array by invoking this
 * // method with an array that contains the 20 messages and the property name,
 * // which represents the key.
 * buildKeyArray([{id: '2033323',msg: 'hello'},{id: '2435435',msg: 'hi'}], 'id');
 *
 * // 2: From objects with a key and value property
 * // That option is useful when you want to point with the key to only
 * // a single property value of the object instead of to the whole object.
 * // Therefore you specify in which property the value can be found.
 * // In the message example, we could use the msg property as a value and the id as a key.
 * // The fourth parameter indicates if the data should be compressed.
 * // By default, this is enabled. Compress will convert every object
 * // into a key-value pair array; this helps to remove unnecessary properties
 * // and makes the data that needs to be sent smaller.
 * buildKeyArray([{id: '2033323',msg: 'hello'},
 *  {id: '2435435',msg: 'hi'}], 'id', 'msg', true);
 *
 * // 3: From key-value pair arrays
 * // This option will build the key-array from key-value pair arrays.
 * // That means you specify key-value pairs with arrays.
 * // The first item of each array represents the key and the second item the associated value.
 * buildKeyArray([['2033323','hello'],['2435435','hi']])
 */
export function buildKeyArray<T>(array: T[], key: keyof T, value: keyof T, compress?: boolean)
/**
 * This method can be used to build a raw key array.
 * These arrays are useful to present data in a sequence and as a key-value map.
 * Later, when you use the Databox,
 * you easily can access the items by the key.
 * If you did not use a key array, the only possibility to
 * access the elements in an array is per index.
 * But this is problematical if every client has a different amount
 * of elements because then you are not able to change one specific item.
 * (Because you would change on each client a different item.)
 * You have more possibilities to create a key array, all are explained in the examples.
 * @example
 * // 1: From objects with a key property
 * // This one is useful when you have objects,
 * // where each of them has the same property that indicates a key.
 * // For example, I have 20 message objects,
 * // and each message object has an id property.
 * // Then you quickly can build the key array by invoking this
 * // method with an array that contains the 20 messages and the property name,
 * // which represents the key.
 * buildKeyArray([{id: '2033323',msg: 'hello'},{id: '2435435',msg: 'hi'}], 'id');
 *
 * // 2: From objects with a key and value property
 * // That option is useful when you want to point with the key to only
 * // a single property value of the object instead of to the whole object.
 * // Therefore you specify in which property the value can be found.
 * // In the message example, we could use the msg property as a value and the id as a key.
 * // The fourth parameter indicates if the data should be compressed.
 * // By default, this is enabled. Compress will convert every object
 * // into a key-value pair array; this helps to remove unnecessary properties
 * // and makes the data that needs to be sent smaller.
 * buildKeyArray([{id: '2033323',msg: 'hello'},
 *  {id: '2435435',msg: 'hi'}], 'id', 'msg', true);
 *
 * // 3: From key-value pair arrays
 * // This option will build the key-array from key-value pair arrays.
 * // That means you specify key-value pairs with arrays.
 * // The first item of each array represents the key and the second item the associated value.
 * buildKeyArray([['2033323','hello'],['2435435','hi']])
 */
export function buildKeyArray(array: any[], key?: any, value?: any, compress: boolean = true) {
    if (value != null && compress) return {
        ___ka___: array.map(item => [item[key], item[value]]),
    };
    else return {
        ___ka___: array,
        ...(key != null ? {k: key} : {}),
        ...(value != null ? {v: value} : {})
    };
}