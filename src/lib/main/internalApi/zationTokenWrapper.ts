/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {ZationToken}  from "../constants/internal";
import ObjectPath     from "../utils/objectPath";

export default class ZationTokenWrapper
{
    private readonly _token: ZationToken;

    constructor(token: ZationToken) {
        this._token = token;
    }

    // noinspection JSUnusedGlobalSymbols
    isAuthIn(): boolean {
        return this._token.authUserGroup !== undefined;
    }

    // noinspection JSUnusedGlobalSymbols
    get userId(): number | string | undefined {
        return this._token.userId;
    }

    // noinspection JSUnusedGlobalSymbols
    get authUserGroup(): string | undefined {
        return this._token.authUserGroup;
    }

    // noinspection JSUnusedGlobalSymbols
    get tokenId(): string {
        return this._token.tid;
    }

    // noinspection JSUnusedGlobalSymbols
    get expire(): number {
        return this._token.exp;
    }

    // noinspection JSUnusedGlobalSymbols
    get panelAccess(): boolean {
        return !!this._token.panelAccess;
    }

    // noinspection JSUnusedGlobalSymbols
    getToken(): object {
        return this._token;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Has a token variable with object path.
     * Notice that the token variables are separated from the main zation token variables.
     * That means there can be no naming conflicts with zation variables.
     * You can access this variables on client and server side.
     * But only change, delete or set on the server.
     * @example
     * hasTokenVariable('person.email');
     * @param path
     */
    hasTokenVariable(path?: string | string[]): boolean {
        return ObjectPath.has(this._token.variables || {},path);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Get a token variable with object path.
     * Notice that the token variables are separated from the main zation token variables.
     * That means there can be no naming conflicts with zation variables.
     * You can access this variables on client and server side.
     * But only change, delete or set on the server.
     * @example
     * getTokenVariable('person.email');
     * @param path
     */
    getTokenVariable<R = any>(path?: string | string[]): R {
        return ObjectPath.get(this._token.variables || {},path);
    }
}

