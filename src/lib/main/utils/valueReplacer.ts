/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

export const valueReplacerSymbol = Symbol();

/**
 * Sets the value replacer of an object.
 * @param value
 * @param replacer
 */
export function setValueReplacer<T extends object>(value: T,replacer: (value: any) => {}) {
    value[valueReplacerSymbol] = replacer;
}