/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import {ZationCustomEventNamespace, ZationToken} from "../constants/internal";
import UpSocket, {OnHandlerFunction}            from "../sc/socket";
import TokenUtils       from "../token/tokenUtils";
import ObjectPath       from "../utils/objectPath";
import ChUtils          from "../channel/chUtils";
import BaseSHBridge     from "../bridges/baseSHBridge";
import DataBoxFamily    from "../../api/dataBox/DataBoxFamily";
import DataBox          from "../../api/dataBox/DataBox";
import CloneUtils         from "../utils/cloneUtils";
import ObjectPathSequence from "../utils/objectPathSequence";

export default class ZSocket
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
    get rawSocket(): UpSocket {
        return this._socket;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Returns the base sh bridge of the socket.
     */
    get shBridge() : BaseSHBridge {
        return this._socket.baseSHBridge;
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
    get isAuth(): boolean {
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
     * Set a token variable with object path.
     * Every change on the token will update the authentication of the socket. (Like a new authentication on top)
     * Notice that the token variables are separated from the main zation token variables.
     * That means there can be no naming conflicts with zation variables.
     * You can access this variables on client and server side.
     * But only change, delete or set on the server.
     * Check that the socket is authenticated (has a token).
     * @example
     * await setTokenVariable('person.email','example@gmail.com');
     * @param path
     * The path to the variable, you can split the keys with a dot or an string array.
     * @param value
     * @throws AuthenticationError if the socket is not authenticated.
     */
    async setTokenVariable(path : string | string[],value : any) : Promise<void> {
        const ctv = CloneUtils.deepClone(TokenUtils.getCustomTokenVariables(this._socket.authToken));
        ObjectPath.set(ctv,path,value);
        await TokenUtils.setCustomVar(ctv,this._socket.baseSHBridge);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Delete a token variable with object path.
     * Every change on the token will update the authentication of the socket. (Like a new authentication on top)
     * Notice that the token variables are separated from the main zation token variables.
     * You can access this variables on client and server side.
     * But only change, delete or set on the server.
     * Check that the socket is authenticated (has a token).
     * @example
     * await deleteTokenVariable('person.email');
     * @param path
     * The path to the variable, you can split the keys with a dot or an string array.
     * @throws AuthenticationError if the socket is not authenticated.
     */
    async deleteTokenVariable(path ?: string | string[]) : Promise<void> {
        if(!!path) {
            const ctv = CloneUtils.deepClone(TokenUtils.getCustomTokenVariables(this._socket.authToken));
            ObjectPath.del(ctv,path);
            await TokenUtils.setCustomVar(ctv,this._socket.baseSHBridge);
        }
        else {
            await TokenUtils.setCustomVar({},this._socket.baseSHBridge);
        }
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Sequence edit the token variables.
     * Useful if you want to make several changes.
     * This will do everything in one and saves performance.
     * Every change on the token will update the authentication of the socket. (Like a new authentication on top)
     * Notice that the token variables are separated from the main zation token variables.
     * That means there can be no naming conflicts with zation variables.
     * You can access this variables on client and server side.
     * But only change, delete or set on the server.
     * Check that the socket is authenticated (has a token).
     * @example
     * await seqEditTokenVariables()
     *       .delete('person.lastName')
     *       .set('person.name','Luca')
     *       .set('person.email','example@gmail.com')
     *       .commit();
     * @throws AuthenticationError if the socket is not authenticated.
     */
    seqEditTokenVariables() : ObjectPathSequence
    {
        return new ObjectPathSequence(CloneUtils.deepClone(
            TokenUtils.getCustomTokenVariables(this._socket.authToken)),
            async (obj)=> {
                await TokenUtils.setCustomVar(obj,this._socket.baseSHBridge);
            });
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
    getTokenVariable<R = any>(path ?: string | string[]) : R {
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
     * @param id
     * if it is not provided,
     * it returns if the socket has subscribed any custom channel with the provided name.
     */
    hasSubCustomCh(name ?: string, id ?: string) : boolean {
        return ChUtils.hasSubCustomCh(this._socket,name);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Returns if the socket has subscribed the panel out channel.
     */
    hasSubPanelOutCh() : boolean {
        return ChUtils.hasSubPanelOutCh(this._socket);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Kick the current socket from an custom channel.
     * @example
     * kickFromCustomCh('images','10');
     * kickFromCustomCh('publicChat');
     * @param name is optional, if it is not given the users will be kicked out from all custom channels.
     * @param id only provide an id if you want to kick the socket from a specific member of a custom channel family.
     */
    kickFromCustomCh(name ?: string,id ?: string) : void {
        ChUtils.kickCustomChannel(this._socket,name,id);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Returns the DataBoxes where the socket is connected to.
     */
    getDataBoxes() : (DataBoxFamily | DataBox)[] {
        return this._socket.dataBoxes;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Emit to the socket.
     * If you not only transmit than the return value is a promise with the result,
     * and if an error occurs while emitting to socket, this error is thrown.
     * It uses the custom zation event namespace
     * (so you cannot have name conflicts with internal event names).
     * @param event
     * @param data
     * @param onlyTransmit
     * Indicates if you only want to transmit data.
     * If not than the promise will be resolved with the result when the client responded on the emit.
     */
    async emit<T extends boolean>(event : string,data : any,onlyTransmit : T) : Promise<T extends true ? void : any>
    // noinspection JSUnusedGlobalSymbols
    async emit(event : string,data : any,onlyTransmit : boolean = true) : Promise<object | void>
    {
        return new Promise<object>((resolve, reject) => {
            // noinspection DuplicatedCode
            if(onlyTransmit){
                this.shBridge.getSocket().emit(ZationCustomEventNamespace+event,data);
                resolve();
            }
            else {
                this.shBridge.getSocket().emit(ZationCustomEventNamespace+event,data,(err, data) => {
                    err ? reject(err) : resolve(data);
                });
            }
        });
    }

    /**
     * Respond on an emit-event of the socket.
     * It uses the custom zation event namespace
     * (so you cannot have name conflicts with internal event names).
     * @param event
     * @param handler
     * The function that gets called when the event occurs,
     * parameters are the data and a response function that you can call to respond on the event back.
     */
    on(event : string,handler : OnHandlerFunction){
        this._socket.on(ZationCustomEventNamespace+event,handler);
    }

    /**
     * Respond on emit-event of the socket but only once.
     * It uses the custom zation event namespace
     * (so you cannot have name conflicts with internal event names).
     * @param event
     * @param handler
     * The function that gets called when the event occurs,
     * parameters are the data and a response function that you can call to respond on the event back.
     */
    once(event : string,handler : OnHandlerFunction) : void {
        const tmpHandler : OnHandlerFunction = (data, response) => {
            tmpHandler(data,response);
            this._socket.off(event,tmpHandler);
        };
        this._socket.on(event,tmpHandler);
    }

    //Part Socket Variables

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Set socket variable (server side) with object path.
     * @example
     * setSocketVariable('email','example@gmail.com');
     * @param path
     * The path to the variable, you can split the keys with a dot or an string array.
     * @param value
     */
    setSocketVariable(path : string | string[],value : any) : void {
        ObjectPath.set(this._socket.zationSocketVariables,path,value);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Has socket variable (server side) with object path.
     * @example
     * hasSocketVariable('email');
     * @param path
     * The path to the variable, you can split the keys with a dot or an string array.
     */
    hasSocketVariable(path ?: string | string[]) : boolean {
        return ObjectPath.has(this._socket.zationSocketVariables,path);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Get socket variable (server side) with object path.
     * @example
     * getSocketVariable('email');
     * @param path
     * The path to the variable, you can split the keys with a dot or an string array.
     */
    getSocketVariable<R = any>(path ?: string | string[]) : R {
        return ObjectPath.get(this._socket.zationSocketVariables,path);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Delete socket variable (server side) with object path.
     * @example
     * deleteSocketVariable('email');
     * @param path
     * The path to the variable, you can split the keys with a dot or an string array.
     */
    deleteSocketVariable(path ?: string | string[]) : void
    {
        if(!!path) {
            ObjectPath.del(this._socket.zationSocketVariables,path);
        }
        else {
            this._socket.zationSocketVariables = {};
        }
    }

    //Part Handshake variables

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Get a socket handshake variable with object path.
     * @example
     * getSocketHandshakeVariable('deviceCode');
     * @param path
     * The path to the variable, you can split the keys with a dot or an string array.
     */
    getSocketHandshakeVariable<R = any>(path ?: string | string[]) : R {
        return ObjectPath.get(this._socket.handshakeVariables,path);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Has a socket handshake variable with object path.
     * @example
     * hasSocketHandshakeVariable('deviceCode');
     * @param path
     * The path to the variable, you can split the keys with a dot or an string array.
     */
    hasSocketHandshakeVariable(path ?: string | string[]) : boolean {
        return ObjectPath.has(this._socket.handshakeVariables,path);
    }
}