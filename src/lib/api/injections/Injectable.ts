/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

/**
 * @description
 * Makes a class injectable.
 * So that it can be used with the Inject decorator.
 */
export default interface Injectable<T = any> {
    /**
     * @description
     * The getInstance method will be called every time
     * when the Inject decorator is used with this class.
     * The function should return an instance of the class that can
     * be injected into the property.
     * Notice that this method should not access the non-static context.
     */
    getInstance(): T | Promise<T>
}

export interface InjectableClass {
    prototype: { getInstance(): any | Promise<any>; }
}