/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import Const        = require('./../constants/constWrapper');
import TokenTools   = require("../token/tokenTools");
import ObjectPath   = require("../tools/objectPath");
import {Socket}       from "../socket/socket";

class SocketInfo
{
    private readonly _socket : Socket;

    constructor(socket : Socket) {
        this._socket = socket;
    }

    get authUserGroup(): string | undefined {
        return TokenTools.getSocketTokenVariable(Const.Settings.TOKEN.AUTH_USER_GROUP,this._socket);
    }

    get userId(): string | number | undefined {
        return TokenTools.getSocketTokenVariable(Const.Settings.TOKEN.USER_ID,this._socket);
    }

    get socket(): object {
        return this._socket;
    }

    get socketSid(): string {
        return this._socket.sid;
    }

    get socketId(): string {
        return this._socket.id;
    }

    get tokenId(): string | undefined {
        return TokenTools.getSocketTokenVariable(Const.Settings.TOKEN.TOKEN_ID,this._socket);
    }

    get isAuthIn(): boolean {
        return this.authUserGroup !== undefined;
    }

    get tokenExpire(): number | undefined{
        return TokenTools.getSocketTokenVariable(Const.Settings.TOKEN.EXPIRE,this._socket);
    }

    get panelAccess(): number | undefined{
        return TokenTools.getSocketTokenVariable(Const.Settings.TOKEN.PANEL_ACCESS,this._socket);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Has a custom token variable with object path
     * You can protocolAccess this variables on client and server side
     * @example
     * hasCustomTokenVar('person.email');
     * @param path
     */
    hasCustomTokenVar(path ?: string | string[]) : boolean {
        let ctv = TokenTools.getSocketTokenVariable(Const.Settings.TOKEN.CUSTOM_VARIABLES,this._socket);
        return ObjectPath.has(!!ctv ? ctv : {},path);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Get a custom token variable with object path
     * You can protocolAccess this variables on client and server side
     * @example
     * getCustomTokenVar('person.email');
     * @param path
     */
    getCustomTokenVar(path ?: string | string[]) : any {
        let ctv = TokenTools.getSocketTokenVariable(Const.Settings.TOKEN.CUSTOM_VARIABLES,this._socket);
        return ObjectPath.get(!!ctv ? ctv : {},path);
    }
}

export = SocketInfo;