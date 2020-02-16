/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import afterPromise from "./promiseUtils";

export default class AsyncChain {

    private lastPromise: Promise<void> = Promise.resolve();
    private pressure: number = 0;

    /**
     * Adds an async task to the chain
     * and returns the promise of the task.
     * @param task
     */
    runInChain(task: (...args: any[]) => Promise<void>): Promise<void> {
        this.pressure++;
        const promise = afterPromise(this.lastPromise,async () => {
            await task();
            this.pressure--;
        });
        this.lastPromise = promise;
        return promise;
    }

    /**
     * Returns the backpressure of the chain
     * (how many promises are still not resolved).
     */
    getBackpressure(): number {
        return this.pressure;
    }
}