/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */
export const notableNot = Symbol();
export const notableValue = Symbol();

export type Notable<T> = ({[notableValue]: T,[notableNot]: boolean}) | T;

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
    const isObject = typeof value === 'object';
    if(!isObject || (value && value[notableNot] === undefined)){
        return {[notableNot]: true,[notableValue]: value};
    }
    return value;
}

export function isNotableNot<T>(value : Notable<T> | undefined) : boolean {
    return value && typeof value === 'object' && value[notableNot];
}

export function getNotableValue<T>(value : Notable<T> | undefined) : any {
    if(value && typeof value === 'object' && (value as object).hasOwnProperty(notableValue)){
        return value[notableValue];
    }
    return value as T;
}