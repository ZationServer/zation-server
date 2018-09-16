/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import Const        = require('./../constants/constWrapper');
import ObjectPath   = require("../tools/objectPath");

class ZationToken
{
    private readonly _userId : number | string | undefined;
    private readonly _authUserGroup : string | undefined;
    private readonly _tokenId : string;
    private readonly _expire : number;
    private readonly _panelAccess : boolean;
    private readonly _token : object;
    private readonly _ctv : object;

    constructor(token : Object)
    {
        this._userId         = token[Const.Settings.TOKEN.USER_ID];
        this._authUserGroup  = token[Const.Settings.TOKEN.AUTH_USER_GROUP];
        this._tokenId        = token[Const.Settings.TOKEN.TOKEN_ID];
        this._expire         = token[Const.Settings.TOKEN.EXPIRE];
        this._panelAccess    = token[Const.Settings.TOKEN.PANEL_ACCESS];

        this._ctv = !!token[Const.Settings.TOKEN.CUSTOM_VARIABLES] ?
            token[Const.Settings.TOKEN.CUSTOM_VARIABLES] : {};
    }

    isAuthIn() : boolean {
        return this._authUserGroup !== undefined;
    }

    get userId(): number | string | undefined {
        return this._userId;
    }

    get authUserGroup(): string | undefined {
        return this._authUserGroup;
    }

    get tokenId(): string {
        return this._tokenId;
    }

    get expire(): number {
        return this._expire;
    }

    get panelAccess(): boolean {
        return this._panelAccess;
    }

    getToken(): object {
        return this._token;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Has a custom token variable with object path
     * You can access this variables on client and server side
     * @example
     * hasCustomTokenVar('person.email');
     * @param path
     */
    hasCustomTokenVar(path ?: string | string[]) : boolean {
        return ObjectPath.has(this._ctv,path);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Get a custom token variable with object path
     * You can access this variables on client and server side
     * @example
     * getCustomTokenVar('person.email');
     * @param path
     */
    getCustomTokenVar(path ?: string | string[]) : any {
        return ObjectPath.get(this._ctv,path);
    }
}

export = ZationToken;