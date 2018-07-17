/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import Const        = require('./../constants/constWrapper');

class ZationInfo
{
    private readonly _userId : number | string | undefined;
    private readonly _authUserGroup : string | undefined;
    private readonly _tokenId : string;
    private readonly _expire : number;
    private readonly _panelAccess : boolean;
    private readonly _token : object;

    constructor(token : Object)
    {
        this._userId         = token[Const.Settings.CLIENT.USER_ID];
        this._authUserGroup  = token[Const.Settings.CLIENT.AUTH_USER_GROUP];
        this._tokenId        = token[Const.Settings.CLIENT.TOKEN_ID];
        this._expire         = token[Const.Settings.CLIENT.EXPIRE];
        this._panelAccess    = token[Const.Settings.CLIENT.PANEL_ACCESS];
        this._token = token;
    }

    isAuthIn() : boolean
    {
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
}

export = ZationInfo;