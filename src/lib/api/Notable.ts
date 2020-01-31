/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */
export const notableNot = Symbol();
export const notableValue = Symbol();

export type Notable<T> = (T extends object ? (T & {[notableNot]: boolean}) :
    {[notableValue]: T,[notableNot]: boolean}) | T;

/**
 * Inverts the value.
 * @param value
 */
export function $not<T extends object>(value: T): Notable<T>;
/**
 * Inverts the value.
 * @param value
 */
export function $not<T>(value: T): Notable<T>;
/**
 * Inverts the value.
 * @param value
 */
export function $not(value: any): Notable<any> {
    if(value && typeof value === 'object'){
        value[notableNot] = true;
    }
    else {
        return {[notableNot]: true,[notableValue]: value};
    }
}

export function isNotableNot<T>(value : Notable<T>) : boolean {
    return value && typeof value === 'object' &&
        (value as object).hasOwnProperty(notableNot) && value[notableNot];
}

export function getNotableValue<T>(value : Notable<T>) : any {
    if(value && typeof value === 'object' && (value as object).hasOwnProperty(notableValue)){
        return value[notableValue];
    }
    return value as T;
}