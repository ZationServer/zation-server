/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {createTokenCheckFunction, createUserIdCheck} from "../main/access/accessOptions";
import forint, {ForintQuery}                         from "forint";
import {ZationToken}                                 from "../main/constants/internal";

/**
 * This function can be used to check the access with the token of a client.
 * You can use it in the access check properties,
 * for example, in the controller, databox, or custom channel config.
 * You can check if some specific key-value pairs exist in the token variables.
 * @example
 * access: $tokenHasVariables({canCreateItems : true})
 * @param checkProps
 */
export function $tokenHasVariables(checkProps : Record<string,any>) {
    const checkKeys = Object.keys(checkProps);
    const checkKeysLength = checkKeys.length;
    return createTokenCheckFunction((token) => {
        if(token !== null && token.variables !== undefined) {
            const tokenVariables = token.variables;
            let tmpKey;
            for(let i = 0; i < checkKeysLength; i++){
                tmpKey = checkKeys[i];
                if(tokenVariables[tmpKey] !== checkProps[tmpKey]){
                    return false;
                }
            }
            return true;
        }
        return false;
    });
}

/**
 * This function can be used to check the access with the token of a client.
 * You can use it in the access check properties,
 * for example, in the controller, databox, or custom channel config.
 * You can check if the token variables are matching with a query
 * (it works with the forint library).
 * @example
 * access: $tokenVariablesMatch({age : {$gt : 18}})
 * @param query
 */
export function $tokenVariablesMatch<T>(query : ForintQuery<T>) {
    const checker = forint({[nameof<ZationToken>(s => s.variables)] : query});
    return createTokenCheckFunction((token) => checker(token));
}

/**
 * This function can be used to check the access with the token of a client.
 * You can use it in the access check properties,
 * for example, in the controller, databox, or custom channel config.
 * You can check if the token user id matches with a specific user id.
 * @example
 * access: [$userId('luca'),$userId(221,false)]
 * @param id
 * @param strictTypeCheck
 * indicates if the type should also be checked (number and string).
 */
export function $userId(id : number | string, strictTypeCheck : boolean = true) {
    return createUserIdCheck(id,strictTypeCheck);
}
