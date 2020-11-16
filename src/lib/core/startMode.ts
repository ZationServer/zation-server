/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

export const startModeSymbol = Symbol();

export enum StartMode {
    Development = 'd',
    Production = 'p',
    Test = 't',
    Check = 'c'
}

export function processRawStartMode(value: string): StartMode {
    if(value === StartMode.Development || value === StartMode.Production ||
        value === StartMode.Test || value === StartMode.Check) return value;
    else return StartMode.Development;
}