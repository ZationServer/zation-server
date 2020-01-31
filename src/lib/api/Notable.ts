/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */
export const not = Symbol();

export type Notable<T> = T & {[not]: boolean};

/**
 * Inverts the value.
 * @param value
 */
export function $not<T extends object>(value: T): Notable<T>;
/**
 * Inverts the value.
 * @param value
 */
export function $not<T>(value: T): Notable<{value: T}>;
/**
 * Inverts the value.
 * @param value
 */
export function $not(value: any): Notable<any> {
    if(value && typeof value === 'object'){
        value[not] = true;
    }
    else {
        return {[not]: true,value: value};
    }
}

export function isNotable<T>(value: T) : value is Notable<T> {
    return value && typeof value[not] === 'boolean';
}