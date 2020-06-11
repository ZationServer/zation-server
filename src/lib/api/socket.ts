/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {ZATION_CUSTOM_EVENT_NAMESPACE, RawZationToken} from "../main/constants/internal";
import {OnHandlerFunction, RawSocket}                  from "../main/sc/socket";
import TokenUtils       from "../main/token/tokenUtils";
import ObjectPath       from "../main/utils/objectPath";
import DataboxFamily    from "./databox/DataboxFamily";
import Databox          from "./databox/Databox";
const  IP                  = require('ip');
import CloneUtils            from "../main/utils/cloneUtils";
import ObjectPathSequenceImp from "../main/internalApi/objectPathSequence/objectPathSequenceImp";
import {ObjectPathSequence}  from "../main/internalApi/objectPathSequence/objectPathSequence";
import ChannelFamily         from './channel/ChannelFamily';
import Channel               from './channel/Channel';

export default class Socket
{
    private readonly _rawSocket: RawSocket;

    constructor(rawSocket: RawSocket) {
        this._rawSocket = rawSocket;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Returns the auth user group of the socket.
     * @throws AuthenticationError if the socket is not authenticated.
     */
    get authUserGroup(): string {
        return TokenUtils.getTokenVariable(nameof<RawZationToken>(s => s.authUserGroup),this._rawSocket.authToken);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Returns the user id of the socket.
     * @throws AuthenticationError if the socket is not authenticated.
     */
    get userId(): string | number | undefined {
        return TokenUtils.getTokenVariable(nameof<RawZationToken>(s => s.userId),this._rawSocket.authToken);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Returns the raw socket.
     */
    get rawSocket(): RawSocket {
        return this._rawSocket;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Returns the socket sid.
     */
    get sid(): string {
        return this._rawSocket.sid;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Returns the socket id.
     */
    get id(): string {
        return this._rawSocket.id;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Returns the token id of the socket.
     * @throws AuthenticationError if the socket is not authenticated.
     */
    get tokenId(): string | undefined {
        return TokenUtils.getTokenVariable(nameof<RawZationToken>(s => s.tid),this._rawSocket.authToken);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Returns if the socket is authenticated with a token.
     */
    get isAuth(): boolean {
        return this._rawSocket.authToken !== null;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Returns the expire of the token.
     * @throws AuthenticationError if the socket is not authenticated.
     */
    get tokenExpire(): number | undefined {
        return TokenUtils.getTokenVariable(nameof<RawZationToken>(s => s.exp),this._rawSocket.authToken);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Returns the panel access of the socket.
     * @throws AuthenticationError if the socket is not authenticated.
     */
    get panelAccess(): boolean | undefined {
        return TokenUtils.getTokenVariable(nameof<RawZationToken>(s => s.panelAccess),this._rawSocket.authToken);
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
    async setTokenVariable(path: string | string[],value: any): Promise<void> {
        const ctv = CloneUtils.deepClone(TokenUtils.getTokenVariables(this._rawSocket.authToken));
        ObjectPath.set(ctv,path,value);
        await TokenUtils.setCustomVar(ctv,this._rawSocket);
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
    async deleteTokenVariable(path?: string | string[]): Promise<void> {
        if(path !== undefined) {
            const ctv = CloneUtils.deepClone(TokenUtils.getTokenVariables(this._rawSocket.authToken));
            ObjectPath.del(ctv,path);
            await TokenUtils.setCustomVar(ctv,this._rawSocket);
        }
        else {
            await TokenUtils.setCustomVar({},this._rawSocket);
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
    seqEditTokenVariables(): ObjectPathSequence
    {
        return new ObjectPathSequenceImp(CloneUtils.deepClone(
            TokenUtils.getTokenVariables(this._rawSocket.authToken)),
            async (obj)=> {
                await TokenUtils.setCustomVar(obj,this._rawSocket);
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
    hasTokenVariable(path?: string | string[]): boolean {
        return ObjectPath.has(TokenUtils.getTokenVariables(this._rawSocket.authToken),path);
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
    getTokenVariable<R = any>(path?: string | string[]): R {
        return ObjectPath.get(TokenUtils.getTokenVariables(this._rawSocket.authToken),path);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Returns the Databoxes where the socket is connected to.
     */
    getDataboxes(): (DataboxFamily | Databox)[] {
        return this._rawSocket.databoxes;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Returns the Channels that the socket has subscribed.
     */
    getChannels(): (ChannelFamily | Channel)[] {
        return this._rawSocket.channels;
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
    async emit<T extends boolean>(event: string,data: any,onlyTransmit: T): Promise<T extends true ? void: any>
    // noinspection JSUnusedGlobalSymbols
    async emit(event: string,data: any,onlyTransmit: boolean = true): Promise<object | void>
    {
        return new Promise<object>((resolve, reject) => {
            // noinspection DuplicatedCode
            if(onlyTransmit){
                this._rawSocket.emit(ZATION_CUSTOM_EVENT_NAMESPACE+event,data);
                resolve();
            }
            else {
                this._rawSocket.emit(ZATION_CUSTOM_EVENT_NAMESPACE+event,data,(err, data) => {
                    err ? reject(err): resolve(data);
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
    on(event: string,handler: OnHandlerFunction){
        this._rawSocket.on(ZATION_CUSTOM_EVENT_NAMESPACE+event,handler);
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
    once(event: string,handler: OnHandlerFunction): void {
        this._rawSocket.once(ZATION_CUSTOM_EVENT_NAMESPACE+event,handler);
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
    setSocketVariable(path: string | string[],value: any): void {
        ObjectPath.set(this._rawSocket.zationSocketVariables,path,value);
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
    hasSocketVariable(path?: string | string[]): boolean {
        return ObjectPath.has(this._rawSocket.zationSocketVariables,path);
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
    getSocketVariable<R = any>(path?: string | string[]): R {
        return ObjectPath.get(this._rawSocket.zationSocketVariables,path);
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
    deleteSocketVariable(path?: string | string[]): void
    {
        if(!!path) {
            ObjectPath.del(this._rawSocket.zationSocketVariables,path);
        }
        else {
            this._rawSocket.zationSocketVariables = {};
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
    getSocketHandshakeVariable<R = any>(path?: string | string[]): R {
        return ObjectPath.get(this._rawSocket.handshakeVariables,path);
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
    hasSocketHandshakeVariable(path?: string | string[]): boolean {
        return ObjectPath.has(this._rawSocket.handshakeVariables,path);
    }

    //Part Address

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the remote ip address (can be a private address) from the current request.
     */
    getRemoteAddress(): string {
        return this._rawSocket.remoteAddress;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the only public remote ip address from the current request.
     */
    getPublicRemoteAddress(): string {
        const remId = this._rawSocket.remoteAddress;
        if(IP.isPrivate(remId)) {
            return IP.address();
        }
        else {
            return remId;
        }
    }
}