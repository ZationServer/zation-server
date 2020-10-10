/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {notValueSymbol} from '../../api/Not';

export type AccessKeywordRecord = Record<AccessKeyword,any>;
export type AccessKeyword = 'all' | 'allAuth' | 'allNotAuth';

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

export type AccessRules<T extends Function> = AccessKeyword |
    string | UserIdCheck | T | boolean |
    {[notValueSymbol]: AccessRules<T>} | AccessRules<T>[];