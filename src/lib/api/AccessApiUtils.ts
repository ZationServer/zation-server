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
 * This function can be used to check the access with the token payload of a socket.
 * You can set that the token payload has to match with a forint query.
 * @example
 * access: $tokenPayloadMatches({age: {$gt: 18}})
 * @param query
 */
export function $tokenPayloadMatches<T>(query: ForintQuery<T>) {
    const checker = forint({[nameof<RawZationToken>(s => s.payload)]: query});
    return (socket: Socket) => checker(socket.rawToken);
}

/**
 * This function can be used to check the access with the handshake attachment of a socket.
 * You can set that the handshake attachment has to match with a forint query.
 * @example
 * access: $handshakeAttachmentMatches({device: 'MO'})
 * @param query
 */
export function $handshakeAttachmentMatches<T>(query: ForintQuery<T>) {
    const checker = forint(query);
    return (socket: Socket) => checker(socket.getHandshakeAttachment());
}

/**
 * This function can be used to check the access with the socket attachment.
 * You can set that the socket attachment has to match with a forint query.
 * @example
 * access: $socketAttachmentMatches({code: 2313})
 * @param query
 */
export function $socketAttachmentMatches<T>(query: ForintQuery<T>) {
    const checker = forint(query);
    return (socket: Socket) => checker(socket.attachment);
}

/**
 * This function can be used to check the access with the token user id of a socket.
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