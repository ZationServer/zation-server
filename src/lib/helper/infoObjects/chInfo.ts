/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import Const        = require('./../constants/constWrapper');
import TokenTools   = require("../token/tokenTools");

class ChInfo
{
    private readonly _authUserGroup : string | undefined;
    private readonly _userId : string | number | undefined;
    private readonly _socket : object;
    private readonly _tokenId : string | undefined;
    private readonly _isAuthIn : boolean;
    private readonly _tokenExpire : number | undefined;
    private readonly _panelAccess : number | undefined;
    private readonly _channelId : string | undefined;
    private readonly _channelName : string;
    private readonly _isCustomIdCh : boolean;

    constructor(socket : object,chName : string,chId ?: string)
    {
        this._authUserGroup = TokenTools.getSocketTokenVariable([Const.Settings.CLIENT.AUTH_USER_GROUP],socket);
        this._userId  = TokenTools.getSocketTokenVariable([Const.Settings.CLIENT.USER_ID],socket);
        this._socket = socket;
        this._tokenId = TokenTools.getSocketTokenVariable([Const.Settings.CLIENT.TOKEN_ID],socket);
        this._tokenExpire = TokenTools.getSocketTokenVariable([Const.Settings.CLIENT.EXPIRE],socket);
        this._panelAccess = TokenTools.getSocketTokenVariable([Const.Settings.CLIENT.PANEL_ACCESS],socket);
        this._isAuthIn = this._authUserGroup !== undefined;
        this._channelId = chId;
        this._channelName = chName;
        this._isCustomIdCh = chId !== undefined;
    }

    get authUserGroup(): string | undefined {
        return this._authUserGroup;
    }

    get userId(): string | number | undefined {
        return this._userId;
    }

    get socket(): object {
        return this._socket;
    }

    get tokenId(): string {
        return this._tokenId;
    }

    get isAuthIn(): boolean {
        return this._isAuthIn;
    }

    get tokenExpire(): number {
        return this._tokenExpire;
    }

    get panelAccess(): number {
        return this._panelAccess;
    }

    get channelId(): string | undefined {
        return this._channelId;
    }

    get isCustomIdCh(): boolean {
        return this._isCustomIdCh;
    }

    get channelName(): string {
        return this._channelName;
    }
}

export = ChInfo;