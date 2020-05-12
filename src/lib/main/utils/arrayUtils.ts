/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

/**
 * Remove a value (first found) from an array.
 */
export function removeValueFromArray<T>(arr: T[],value: T): void {
    const index = arr.indexOf(value);
    if (index > -1) {
        arr.splice(index, 1);
    }
}