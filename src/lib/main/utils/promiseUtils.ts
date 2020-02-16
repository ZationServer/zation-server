/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

/**
 * Promise util function that works like finally.
 * It calls the function after the promise is fulfilled or rejected
 * and returns a new promise.
 * @param promise
 * @param func
 */
export default function afterPromise(promise: Promise<any>,func: () => Promise<void> | void): Promise<void> {
    return promise.then(func,func);
}