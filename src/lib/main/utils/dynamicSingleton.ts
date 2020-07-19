/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import InstanceNotFound from '../error/instanceNotFound';
import {AnyClass}       from './typeUtils';

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

    /**
     * This method loads the instance of the singleton and returns it.
     * If the instance is not found, the method throws an error.
     * @param classDef
     */
    static getInstanceSafe<T extends AnyClass>(classDef: T): T['prototype'] {
        const instance = DynamicSingleton.getInstance<T,T['prototype']>(classDef);
        if(instance === undefined) {
            throw new InstanceNotFound(classDef.name);
        }
        return instance;
    }
}