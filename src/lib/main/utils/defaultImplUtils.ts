/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

const defaultImplSymbol = Symbol();

export function markAsDefaultImpl(method: Function) {
    method[defaultImplSymbol] = true;
}

export function isDefaultImpl(method: Function): boolean {
    return method[defaultImplSymbol];
}