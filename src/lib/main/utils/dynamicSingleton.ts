/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

const instanceSymbol = Symbol();

export default class DynamicSingleton {

    static create<T extends {new (...args: any[]): I},I>(classDef: T & any,...args: ConstructorParameters<T>): I {
        if(classDef[instanceSymbol]) throw new Error('Instance already created.');
        Object.defineProperty(classDef,instanceSymbol,{
            value: new classDef(...args),
            configurable: false,
            enumerable: false,
            writable: false
        });
        return classDef[instanceSymbol];
    }

    static getInstance<T extends {new (...args: any[]): I},I>(classDef: T & any): I | undefined {
        return classDef[instanceSymbol];
    }
}