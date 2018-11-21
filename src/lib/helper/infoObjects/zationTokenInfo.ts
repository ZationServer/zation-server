/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import ObjectPath   = require("../tools/objectPath");
import {ZationToken}  from "../constants/internal";

class ZationTokenInfo
{
    private readonly _userId : number | string | undefined;
    private readonly _authUserGroup : string | undefined;
    private readonly _tokenId : string;
    private readonly _expire : number;
    private readonly _panelAccess : boolean;
    private readonly _token : object;
    private readonly _ctv : object;

    constructor(token : ZationToken)
    {
        this._userId         = token.zationUserId;
        this._authUserGroup  = token.zationAuthUserGroup;
        this._tokenId        = token.zationTokenId;
        this._expire         = token.exp;
        this._panelAccess    = !!token.zationPanelAccess;
        this._ctv = !!token.zationCustomVariables ? token.zationCustomVariables : {};
    }

    // noinspection JSUnusedGlobalSymbols
    isAuthIn() : boolean {
        return this._authUserGroup !== undefined;
    }

    // noinspection JSUnusedGlobalSymbols
    get userId(): number | string | undefined {
        return this._userId;
    }

    // noinspection JSUnusedGlobalSymbols
    get authUserGroup(): string | undefined {
        return this._authUserGroup;
    }

    // noinspection JSUnusedGlobalSymbols
    get tokenId(): string {
        return this._tokenId;
    }

    // noinspection JSUnusedGlobalSymbols
    get expire(): number {
        return this._expire;
    }

    // noinspection JSUnusedGlobalSymbols
    get panelAccess(): boolean {
        return this._panelAccess;
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
     * @example
     * hasTokenVariable('person.email');
     * @param path
     */
    hasTokenVariable(path ?: string | string[]) : boolean {
        return ObjectPath.has(this._ctv,path);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Get a token variable with object path.
     * Notice that the token variables are separated from the main zation token variables.
     * That means there can be no naming conflicts with zation variables.
     * You can access this variables on client and server side.
     * @example
     * getTokenVariable('person.email');
     * @param path
     */
    getTokenVariable<R>(path ?: string | string[]) : R {
        return ObjectPath.get(this._ctv,path);
    }
}

export = ZationTokenInfo;