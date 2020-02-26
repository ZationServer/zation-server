/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

export const startModeSymbol = Symbol();

export enum StartMode {
    Normal = 0,
    Test = 1,
    Check = 2
}

export function processRawStartMode(value: number | string): StartMode {
    if(typeof value === 'string'){value = parseInt(value);}
    value = value !== 0 && value !== 1 && value !== 2 ? 0: value;
    return value;
}