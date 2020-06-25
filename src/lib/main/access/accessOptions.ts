/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {ZationAccess, RawZationToken} from '../definitions/internal';
import {DeepReadonly}                 from 'ts-essentials';

//TokenCheckFunction
export const tokenCheckFunctionSymbol = Symbol();
export type TokenCheckFunction = {(token: DeepReadonly<RawZationToken> | null): boolean,[tokenCheckFunctionSymbol]: boolean};

/**
 * Creates a token check function.
 * It can be used for more advanced use cases.
 * @param checkFunction
 */
export function createTokenCheckFunction(checkFunction: (token: DeepReadonly<RawZationToken> | null) => boolean): TokenCheckFunction {
    checkFunction[tokenCheckFunctionSymbol] = true;
    return checkFunction as TokenCheckFunction;
}

/**
 * Returns if the function is a token check function.
 * @param func
 */
export function isTokenCheckFunction(func: Function): func is TokenCheckFunction {
    return func[tokenCheckFunctionSymbol];
}

//UserIdCheck
export type UserIdCheck = {id: number | string,strictTypeCheck: boolean};

/**
 * Creates a user id check.
 * @param id
 * @param strictTypeCheck
 */
export function createUserIdCheck(id: number | string,strictTypeCheck: boolean): UserIdCheck {
    return {id,strictTypeCheck};
}

export type AccessCheckItem<T extends Function> = ZationAccess | string | UserIdCheck | T | TokenCheckFunction | boolean;
export type AccessConfigValue<T extends Function> = AccessCheckItem<T> | (AccessCheckItem<T> | AccessCheckItem<T>[])[];