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
        return TokenTools.getSocketTokenVariable(Const.Settings.CLIENT.AUTH_USER_GROUP,this._socket);
    }

    get userId(): string | number | undefined {
        return TokenTools.getSocketTokenVariable(Const.Settings.CLIENT.USER_ID,this._socket);
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
        return TokenTools.getSocketTokenVariable(Const.Settings.CLIENT.TOKEN_ID,this._socket);
    }

    get isAuthIn(): boolean {
        return this.authUserGroup !== undefined;
    }

    get tokenExpire(): number | undefined{
        return TokenTools.getSocketTokenVariable(Const.Settings.CLIENT.EXPIRE,this._socket);
    }

    get panelAccess(): number | undefined{
        return TokenTools.getSocketTokenVariable(Const.Settings.CLIENT.PANEL_ACCESS,this._socket);
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
        let ctv = TokenTools.getSocketTokenVariable(Const.Settings.CLIENT.CUSTOM_VARIABLES,this._socket);
        return ObjectPath.has(!!ctv ? ctv : {},path);
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
        let ctv = TokenTools.getSocketTokenVariable(Const.Settings.CLIENT.CUSTOM_VARIABLES,this._socket);
        return ObjectPath.get(!!ctv ? ctv : {},path);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Has socket variable (server side) with object path
     * @example
     * hasSocketVariable('email');
     * @param path
     */
    hasSocketVariable(path ?: string | string[]) : boolean {
        return ObjectPath.has(this._socket[Const.Settings.SOCKET.VARIABLES],path);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Get socket variable (server side) with object path
     * @example
     * getSocketVariable('email');
     * @param path
     */
    getSocketVariable(path ?: string | string[]) : any {
        return ObjectPath.get(this._socket[Const.Settings.SOCKET.VARIABLES],path);
    }
}

export = SocketInfo;