/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import {ZationToken}  from "../constants/internal";
import Socket         from "../sc/socket";
import TokenTools     from "../token/tokenTools";
import ObjectPath     from "../tools/objectPath";

export default class SocketInfo
{
    private readonly _socket : Socket;

    constructor(socket : Socket) {
        this._socket = socket;
    }

    // noinspection JSUnusedGlobalSymbols
    get authUserGroup(): string | undefined {
        return TokenTools.getSocketTokenVariable(nameof<ZationToken>(s => s.zationAuthUserGroup),this._socket);
    }

    // noinspection JSUnusedGlobalSymbols
    get userId(): string | number | undefined {
        return TokenTools.getSocketTokenVariable(nameof<ZationToken>(s => s.zationUserId),this._socket);
    }

    // noinspection JSUnusedGlobalSymbols
    get socket(): object {
        return this._socket;
    }

    // noinspection JSUnusedGlobalSymbols
    get socketSid(): string {
        return this._socket.sid;
    }

    // noinspection JSUnusedGlobalSymbols
    get socketId(): string {
        return this._socket.id;
    }

    // noinspection JSUnusedGlobalSymbols
    get tokenId(): string | undefined {
        return TokenTools.getSocketTokenVariable(nameof<ZationToken>(s => s.zationTokenId),this._socket);
    }

    // noinspection JSUnusedGlobalSymbols
    get isAuthIn(): boolean {
        return this.authUserGroup !== undefined;
    }

    // noinspection JSUnusedGlobalSymbols
    get tokenExpire(): number | undefined{
        return TokenTools.getSocketTokenVariable(nameof<ZationToken>(s => s.exp),this._socket);
    }

    // noinspection JSUnusedGlobalSymbols
    get panelAccess(): number | undefined{
        return TokenTools.getSocketTokenVariable(nameof<ZationToken>(s => s.zationPanelAccess),this._socket);
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
        let ctv = TokenTools.getSocketTokenVariable(nameof<ZationToken>(s => s.zationCustomVariables),this._socket);
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
        let ctv = TokenTools.getSocketTokenVariable(nameof<ZationToken>(s => s.zationCustomVariables),this._socket);
        return ObjectPath.get(!!ctv ? ctv : {},path);
    }
}

