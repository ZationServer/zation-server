/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import {ZationToken}  from "../constants/internal";
import Socket         from "../sc/socket";
import TokenUtils     from "../token/tokenUtils";
import ObjectPath     from "../utils/objectPath";

export default class SocketInfo
{
    private readonly _socket : Socket;

    constructor(socket : Socket) {
        this._socket = socket;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Returns the auth user group of the socket or undefined if the socket has no token.
     */
    get authUserGroup(): string | undefined {
        return TokenUtils.getSocketTokenVariable(nameof<ZationToken>(s => s.zationAuthUserGroup),this._socket);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Returns the user id of the socket or undefined if the socket has no token.
     */
    get userId(): string | number | undefined {
        return TokenUtils.getSocketTokenVariable(nameof<ZationToken>(s => s.zationUserId),this._socket);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Returns the raw socket.
     */
    get socket(): object {
        return this._socket;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Returns the socket sid.
     */
    get socketSid(): string {
        return this._socket.sid;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Returns the socket id.
     */
    get socketId(): string {
        return this._socket.id;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Returns the token id of the socket or undefined if the socket has no token.
     */
    get tokenId(): string | undefined {
        return TokenUtils.getSocketTokenVariable(nameof<ZationToken>(s => s.zationTokenId),this._socket);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Returns if the socket is authenticated with a token.
     */
    get isAuthIn(): boolean {
        return this._socket.getAuthToken() !== null;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Returns the expire of the token or undefined if the socket has no token.
     */
    get tokenExpire(): number | undefined {
        return TokenUtils.getSocketTokenVariable(nameof<ZationToken>(s => s.exp),this._socket);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Returns the panel access of the socket or undefined if the socket has no token.
     */
    get panelAccess(): boolean | undefined {
        return TokenUtils.getSocketTokenVariable(nameof<ZationToken>(s => s.zationPanelAccess),this._socket);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Has a token variable with object path.
     * Notice that the token variables are separated from the main zation token variables.
     * You can access this variables on client and server side.
     * But only change, delete or set on the server.
     * @example
     * hasTokenVariable('person.email');
     * @param path
     */
    hasTokenVariable(path ?: string | string[]) : boolean {
        let ctv = TokenUtils.getSocketTokenVariable(nameof<ZationToken>(s => s.zationCustomVariables),this._socket);
        return ObjectPath.has(!!ctv ? ctv : {},path);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Get a token variable with object path.
     * Notice that the token variables are separated from the main zation token variables.
     * You can access this variables on client and server side.
     * But only change, delete or set on the server.
     * @example
     * getTokenVariable('person.email');
     * @param path
     */
    getTokenVariable<R>(path ?: string | string[]) : R {
        let ctv = TokenUtils.getSocketTokenVariable(nameof<ZationToken>(s => s.zationCustomVariables),this._socket);
        return ObjectPath.get(!!ctv ? ctv : {},path);
    }
}

