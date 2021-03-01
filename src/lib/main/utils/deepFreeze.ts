/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

/**
 * Deep freeze object/functions deep and safe.
 * @param value
 */
export function deepFreeze<T extends any = any>(value: T): T
{
    if(((typeof value === 'object' && value !== null) || typeof value === 'function') && !Object.isFrozen(value)) {
        Object.freeze(value);
        Object.getOwnPropertyNames(value).forEach((prop) => deepFreeze(value[prop]));
    }
    return value;
}