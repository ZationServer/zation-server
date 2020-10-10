/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {createUserIdCheck}                           from "../main/access/accessOptions";
import forint, {ForintQuery}                         from "forint";
import {RawZationToken}                              from '../main/definitions/internal';
import Socket                                        from './Socket';

/**
 * @description
 * This function can be used to check the access with the token payload of a client.
 * You can set that the token payload has to include some specific key-value pairs.
 * @example
 * access: $tokenPayloadIncludes({canCreateItems: true})
 * @param pairs
 */
export function $tokenPayloadIncludes(pairs: Record<string,any>) {
    const checkKeys = Object.keys(pairs);
    const checkKeysLength = checkKeys.length;
    return (socket: Socket) => {
        const token = socket.rawToken;
        if(token != null && token.payload != undefined) {
            const payload = token.payload;
            let tmpKey;
            for(let i = 0; i < checkKeysLength; i++){
                tmpKey = checkKeys[i];
                if(payload[tmpKey] !== pairs[tmpKey]){return false;}
            }
            return true;
        }
        return false;
    };
}

/**
 * This function can be used to check the access with the token payload of a client.
 * You can set that the token payload has to match with a forint query.
 * @example
 * access: $tokenPayloadMatches({age: {$gt: 18}})
 * @param query
 */
export function $tokenPayloadMatches<T>(query: ForintQuery<T>) {
    const checker = forint({[nameof<RawZationToken>(s => s.payload)]: query});
    return (socket: Socket) => {
        const token = socket.rawToken;
        return token != null && checker(token);
    };
}

/**
 * This function can be used to check the access with the token user id of a client.
 * You can set that the token user-id has to match with a specific string or number.
 * @example
 * access: [$userId('luca'),$userId(221,false)]
 * @param id
 * @param strictTypeCheck
 * indicates if the type should also be checked (number and string).
 */
export function $userId(id: number | string, strictTypeCheck: boolean = true) {
    return createUserIdCheck(id,strictTypeCheck);
}