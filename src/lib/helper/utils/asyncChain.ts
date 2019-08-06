/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

export default class AsyncChain {

    private lastPromise: Promise<void> = Promise.resolve();
    private pressure: number = 0;

    /**
     * Adds an async task to the chain.
     * @param task
     */
    addToChain(task : (...args : any[]) => Promise<void>) {
        this.pressure++;
        this.lastPromise = this.lastPromise.then(async () => {
            await task();
            this.pressure--;
        })
    }

    /**
     * Returns the backpressure of the chain
     * (how many promises are still not resolved).
     */
    getBackpressure() : number {
        return this.pressure;
    }
}