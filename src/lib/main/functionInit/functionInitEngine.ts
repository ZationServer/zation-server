/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import Bag from '../../api/Bag';

export const initFunctionSymbol = Symbol();
export const replaceValueSymbol = Symbol();

export type FunctionInitFunction<T> = (bag: Bag) => Promise<T> | T;
export type InitFunction<T> = {(bag: Bag): T | Promise<T>, [initFunctionSymbol]: true};

export default class FunctionInitEngine {

    private static readonly initTask: ((bag: Bag) => Promise<void>)[] = [];

    /**
     * Create a new init function and
     * add it to the initialize process.
     * @param initFunction
     */
    static initFunction<T>(initFunction: FunctionInitFunction<T>): InitFunction<T> {
        let notInitialized = true;
        let realFunction;
        const placeholderFunc = async (...args) => {
            if(notInitialized) throw new Error("Called uninitialized function.");
            return await realFunction(...args);
        };
        this.initTask.push(async (bag) => {
            realFunction = await initFunction(bag);
            notInitialized = false;
            if(typeof placeholderFunc[replaceValueSymbol] === 'function') {
                placeholderFunc[replaceValueSymbol](realFunction);
            }
        });
        placeholderFunc[initFunctionSymbol] = true;
        return placeholderFunc as InitFunction<T>;
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