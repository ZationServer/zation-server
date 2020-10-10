/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

export const notValueSymbol = Symbol();
export const setNotFunctionSymbol = Symbol();

export type Not<T> = {[notValueSymbol]: T};

/**
 * Inverts the value.
 * @param value
 */
export function $not<T>(value: T): Not<T> {
    if(typeof value === 'object' && value !== null && typeof value[setNotFunctionSymbol] === 'function') {
        value[setNotFunctionSymbol]();
        return value as unknown as Not<T>;
    }
    else return {[notValueSymbol]: value};
}

export function isNot(value: any): value is Not<any> {
    return value && typeof value === 'object' && value.hasOwnProperty(notValueSymbol);
}

export function getNotValue<T>(value: Not<T>): any {
    return value[notValueSymbol];
}