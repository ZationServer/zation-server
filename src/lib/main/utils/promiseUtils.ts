/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

/**
 * Promise until function that works like finally.
 * It will process the next promise after the previous one is finished,
 * independent if it was fulfilled or rejected.
 * @param promise
 * @param func
 */
export default function afterPromise(promise : Promise<any>,func : () => Promise<void> | void) : Promise<void> {
    return promise.then(func,func);
}