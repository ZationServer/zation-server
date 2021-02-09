/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

export function buildOptions<T>(defaults: Required<T>, options: Partial<T>): T {
    for(let k in options) {
        if(options.hasOwnProperty(k) && defaults.hasOwnProperty(k) && options[k] !== undefined) defaults[k] = options[k]!;
    }
    return defaults;
}