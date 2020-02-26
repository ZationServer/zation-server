/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import Bag from '../../api/Bag';

export const replaceValueSymbol = Symbol();

export type FunctionInitFunction<T> = (bag: Bag) => Promise<T> | T;

export default class FunctionInitEngine {

    private static readonly initTask: ((bag: Bag) => Promise<void>)[] = [];

    /**
     * Create a new init function and
     * add it to the initialize process.
     * @param initFunction
     */
    static initFunction<T extends (...args: any) => any>(initFunction: FunctionInitFunction<T>): T {
        let notInitialized = true;
        let realFunction;
        const placeholderFunc = async (...args) => {
            if(notInitialized) throw new Error("Called uninitialized function. Notice that init functions only work on worker processes.");
            return await realFunction(...args);
        };
        this.initTask.push(async (bag) => {
            realFunction = await initFunction(bag);
            notInitialized = false;
            if(typeof placeholderFunc[replaceValueSymbol] === 'function') {
                placeholderFunc[replaceValueSymbol](realFunction);
            }
        });
        return placeholderFunc as T;
    }

    /**
     * Initialize all init functions.
     * @param bag
     */
    static async initFunctions(bag: Bag): Promise<void> {
        const promises: Promise<void>[] = [];
        for(let i = 0; i < this.initTask.length; i++) {
            promises.push(this.initTask[i](bag));
        }
        await Promise.all(promises);
    }
}