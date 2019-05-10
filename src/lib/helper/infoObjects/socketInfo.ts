/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import {ZationToken}  from "../constants/internal";
import UpSocket         from "../sc/socket";
import TokenUtils     from "../token/tokenUtils";
import ObjectPath     from "../utils/objectPath";
import ChUtils from "../channel/chUtils";

export default class SocketInfo
{
    private readonly _socket : UpSocket;

    constructor(socket : UpSocket) {
        this._socket = socket;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Returns the auth user group of the socket.
     * @throws AuthenticationError if the socket is not authenticated.
     */
    get authUserGroup(): string | undefined {
        return TokenUtils.getTokenVariable(nameof<ZationToken>(s => s.zationAuthUserGroup),this._socket.authToken);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Returns the user id of the socket.
     * @throws AuthenticationError if the socket is not authenticated.
     */
    get userId(): string | number | undefined {
        return TokenUtils.getTokenVariable(nameof<ZationToken>(s => s.zationUserId),this._socket.authToken);
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
     * Returns the token id of the socket.
     * @throws AuthenticationError if the socket is not authenticated.
     */
    get tokenId(): string | undefined {
        return TokenUtils.getTokenVariable(nameof<ZationToken>(s => s.zationTokenId),this._socket.authToken);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Returns if the socket is authenticated with a token.
     */
    get isAuthIn(): boolean {
        return this._socket.authToken !== null;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Returns the expire of the token.
     * @throws AuthenticationError if the socket is not authenticated.
     */
    get tokenExpire(): number | undefined {
        return TokenUtils.getTokenVariable(nameof<ZationToken>(s => s.exp),this._socket.authToken);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Returns the panel access of the socket.
     * @throws AuthenticationError if the socket is not authenticated.
     */
    get panelAccess(): boolean | undefined {
        return TokenUtils.getTokenVariable(nameof<ZationToken>(s => s.zationPanelAccess),this._socket.authToken);
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
     * The path to the variable, you can split the keys with a dot or an string array.
     * @throws AuthenticationError if the socket is not authenticated.
     */
    hasTokenVariable(path ?: string | string[]) : boolean {
        return ObjectPath.has(TokenUtils.getCustomTokenVariables(this._socket.authToken),path);
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
     * The path to the variable, you can split the keys with a dot or an string array.
     * @throws AuthenticationError if the socket is not authenticated.
     */
    getTokenVariable<R>(path ?: string | string[]) : R {
        return ObjectPath.get(TokenUtils.getCustomTokenVariables(this._socket.authToken),path);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns all socket subscriptions as a string array.
     */
    getSubscriptions() : string[] {
        return this._socket.subscriptions();
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Returns all custom id channel subscriptions of the socket.
     * @param name (optional filter for a specific name)
     */
    getCustomIdChSubscriptions(name ?: string) : string[] {
        return ChUtils.getCustomIdChannelSubscriptions(this._socket,name);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Returns all custom channel subscriptions of the socket.
     * @param name (optional filter for a specific name)
     */
    getCustomChSubscriptions(name ?: string) : string[] {
        return ChUtils.getCustomChannelSubscriptions(this._socket,name);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Returns if the socket has subscribed the user channel.
     */
    hasSubUserCh() : boolean {
        return ChUtils.hasSubUserCh(this._socket);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Returns if the socket has subscribed the auth user group channel.
     */
    hasSubAuthUserGroupCh() : boolean {
        return ChUtils.hasSubAuthUserGroupCh(this._socket);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Returns if the socket has subscribed the default user group channel.
     */
    hasSubDefaultUserGroupCh() : boolean {
        return ChUtils.hasSubDefaultUserGroupCh(this._socket);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Returns if the socket has subscribed the all channel.
     */
    hasSubAllCh() : boolean {
        return ChUtils.hasSubAllCh(this._socket);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Returns if the socket has subscribed the custom channel.
     * @param name
     * if it is not provided,
     * it returns if the socket has subscribed any custom channel.
     */
    hasSubCustomCh(name ?: string) : boolean {
        return ChUtils.hasSubCustomCh(this._socket,name);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Returns if the socket has subscribed the custom id channel.
     * @param name
     * if it is not provided,
     * it returns if the socket has subscribed any custom id channel.
     * @param id
     * if it is not provided,
     * it returns if the socket has subscribed any custom id channel with the provided name.
     */
    hasSubCustomIdCh(name ?: string, id ?: string) : boolean {
        return ChUtils.hasSubCustomIdCh(this._socket,name,id);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Returns if the socket has subscribed the panel out channel.
     */
    hasPanelOutCh() : boolean {
        return ChUtils.hasSubPanelOutCh(this._socket);
    }
}