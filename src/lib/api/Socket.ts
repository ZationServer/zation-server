/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {ZATION_CUSTOM_EVENT_NAMESPACE, RawZationToken, PrepareZationToken} from '../main/constants/internal';
import {OnHandlerFunction, RawSocket}                  from "../main/sc/socket";
import TokenUtils       from "../main/token/tokenUtils";
import DataboxFamily    from "./databox/DataboxFamily";
import Databox          from "./databox/Databox";
import useragent           = require('useragent');
const  IP                  = require('ip');
import CloneUtils            from "../main/utils/cloneUtils";
import ObjectPathSequenceImp from "../main/internalApi/objectPathSequence/objectPathSequenceImp";
// noinspection ES6PreferShortImport
import {ObjectPathSequence}  from "../main/internalApi/objectPathSequence/objectPathSequence";
import ChannelFamily         from './channel/ChannelFamily';
import Channel               from './channel/Channel';
import {JwtSignOptions}      from '../main/constants/jwt';
import AuthenticationError   from '../main/error/authenticationError';
import AuthConfig            from '../main/auth/authConfig';
import ObjectPathSequenceBoxImp from '../main/internalApi/objectPathSequence/objectPathSequenceBoxImp';
import {bag}                    from './Bag';
import * as ObjectPath          from 'object-path';
import {IncomingHttpHeaders, IncomingMessage} from 'http';
import ApiLevelUtils                          from '../main/apiLevel/apiLevelUtils';
import {Agent}                                from 'useragent';

type BeforeTokenUpdateHandler = (token: null | RawZationToken, newToken: null | RawZationToken) => Promise<void> | void

export default class Socket<A extends object = any, TP extends object = any>
{
    private readonly _rawSocket: RawSocket;

    private readonly _databoxes: (Databox | DataboxFamily)[] = [];
    private readonly _channels: (Channel | ChannelFamily)[] = [];

    private _attachment: Partial<A> = {};

    /**
     * @description
     * Internal emit.
     * @internal
     */
    readonly _emit: RawSocket['emit'];
    /**
     * @description
     * Internal on.
     * @internal
     */
    readonly _on: RawSocket['on'];
    /**
     * @description
     * Internal off.
     * @internal
     */
    readonly _off: RawSocket['off'];

    //auth
    protected _auth: boolean;
    protected _userGroup: string;
    protected _userId: string | number | undefined;
    protected _beforeTokenUpdateHandler: BeforeTokenUpdateHandler[] = [];

    constructor(rawSocket: RawSocket,private authConfig: AuthConfig) {
        this._rawSocket = rawSocket;

        this._emit = rawSocket.emit.bind(rawSocket);
        this._on = rawSocket.on.bind(rawSocket);
        this._off = rawSocket.off.bind(rawSocket);

        this._userId = undefined;
        this._userGroup = authConfig.getDefaultUserGroup();
        this._auth = false;

        this._connectToRawSocket();
    }

    /**
     * Disconnect this socket.
     */
    disconnect(code?: any, data?: any) {
        this._rawSocket.disconnect(code,data);
    }

    private _connectToRawSocket() {
        this._connectTokenUpdate();
        this._beforeTokenUpdateHandler.push(this.stillAccessCheck.bind(this));
    }

    /**
     * @description
     * This function can be used to check that the socket has still
     * access to all components where this socket is connected to (Databoxes, Channels).
     * If the access was denied the socket will be kicked out from this component.
     * It will automatically run whenever the token state of this socket had changed.
     */
    async stillAccessCheck() {
        const p: Promise<void>[] = [];
        const checkObjectives = [...this._databoxes,...this._channels];
        for(let i = 0; i < checkObjectives.length; i++) {
            p.push(checkObjectives[i]._checkSocketHasStillAccess(this));
        }
        await Promise.all(p);
    }

    private _connectTokenUpdate() {
        let currentToken: RawZationToken | null = null;
        Object.defineProperty(this.rawSocket, 'authToken', {
            get: () => currentToken,
            /**
             * @param newToken
             * Notice that the token expire can be undefined of the new token.
             */
            set: (newToken: RawZationToken | null) => {
                if(newToken === undefined) newToken = null;
                this._loadNewToken(newToken);

                const promises: (Promise<void> | void)[] = [];
                for(let i = 0; i < this._beforeTokenUpdateHandler.length; i++){
                    promises[i] = this._beforeTokenUpdateHandler[i](currentToken,newToken);
                }
                Promise.all(promises).finally(() => currentToken = newToken);
            },
            enumerable: true,
            configurable: true
        });
    }

    //Part Auth
    /**
     * @internal
     * @private
     */
    _addBeforeTokenUpdateHandler(handler: BeforeTokenUpdateHandler) {
        this._beforeTokenUpdateHandler.push(handler);
    }

    private _loadNewToken(token: RawZationToken | null) {
        if(token != null) {
            this._userId = token.userId;
            this._userGroup = token.authUserGroup;
            this._auth = true;
        }
        else {
            this._userId = undefined;
            this._userGroup = this.authConfig.getDefaultUserGroup();
            this._auth = false;
        }
    }

    /**
     * Used internally.
     * @internal
     * @param data
     * @param jwtOptions
     * @private
     */
    _setToken(data: object, jwtOptions: JwtSignOptions = {}): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this._rawSocket.setAuthToken(data,jwtOptions,(err) => {
                if(err){
                    reject(new AuthenticationError('Failed to set the auth token. Error => ' +
                        err.toString()))
                }
                else {resolve();}
            });
        });
    }

    /**
     * @description
     * Authenticate this socket.
     * @example
     * await socket.authenticate('user','tom12',{email: 'example@gmail.com'});
     * @param authUserGroup
     * The authUserGroup must exist in the app config.
     * Otherwise, an error will be thrown.
     * @param userId
     * @param payload
     * Sets the payload of the token.
     * Notice that when you call authenticate and the socket is
     * already authenticated that the complete payload will be overridden.
     * @param jwtOptions
     * This optional options argument is an Object which can be used to modify the token's behavior.
     * Valid properties include any option accepted by the jsonwebtoken library's sign method.
     * For example, you can change the default expire of the token or add a time before the token gets valid.
     * @throws AuthenticationError
     */
    async authenticate(authUserGroup: string, userId?: string | number,payload: Partial<TP> = {},jwtOptions: JwtSignOptions = {}): Promise<void> {
        if(!this.authConfig.isValidAuthUserGroup(authUserGroup))
            throw new AuthenticationError(`Auth user group '${authUserGroup}' is not defined in the server config.`);

        const currentToken = this.rawSocket.authToken;
        const token: PrepareZationToken = currentToken != null ? currentToken :
            TokenUtils.generateToken(this.authConfig.getTokenClusterCheckKey());

        token.authUserGroup = authUserGroup;
        token.payload = payload;
        if(userId != undefined) {token.userId = userId;}
        if(this.authConfig.hasAuthUserGroupPanelAccess(authUserGroup)) {token.panelAccess = true;}

        return this._setToken(token,jwtOptions);
    }

    /**
     * Deauthenticate this socket.
     */
    deauthenticate() {
        if(this._auth) {this.rawSocket.deauthenticate();}
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Returns if the socket is authenticated.
     */
    isAuthenticated(): boolean {
        return this._auth;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Returns if the socket is not authenticated.
     */
    isNotAuthenticated(): boolean {
        return !this._auth;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Returns the auth user group of the socket.
     */
    get authUserGroup(): string | undefined {
        return this._auth ? this._userGroup : undefined;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Returns the auth user group of the socket.
     * @throws AuthenticationError if the socket is not authenticated.
     */
    getAuthUserGroup(): string {
        if(!this._auth)
            throw new AuthenticationError('Can\'t access the auth user group when the socket is not authenticated.');
        return this._userGroup;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Returns the user group of the socket.
     */
    get userGroup(): string {
        return this._userGroup;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Sets the user id of this socket.
     * Notice that it only can be updated when the socket is authenticated.
     * @param userId
     */
    setUserId(userId: number | string | undefined): Promise<void> {
        let token = this.rawSocket.authToken;
        if(token == null)
            throw new AuthenticationError(`User id can not be updated if the socket is not authenticated.`);
        token = {...token};
        token.userId = userId;
        return this._setToken(token);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Returns the user id of the socket.
     */
    get userId(): string | number | undefined {
        return this._userId;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Returns the user id of the socket.
     * @throws AuthenticationError if the socket is not authenticated or has no user id.
     */
    getUserId(): string | number {
        if(!this._auth)
            throw new AuthenticationError('Can\'t access the user id when the socket is not authenticated.');
        if(this._userId !== undefined)
            return this._userId!;
        else {
            throw new AuthenticationError('The socket has no user id.');
        }
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Returns the token id of the socket.
     */
    get tokenId(): string | undefined {
        return this._rawSocket.authToken?.tid;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Returns the token id of the socket.
     * @throws AuthenticationError if the socket is not authenticated.
     */
    getTokenId(): string {
        if(!this._auth)
            throw new AuthenticationError('Can\'t access the token id when the socket is not authenticated.');
        return this._rawSocket.authToken!.tid;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Returns the expire of the token.
     */
    get tokenExpire(): number | undefined {
        return this._rawSocket.authToken?.exp;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Returns the expire of the token.
     * @throws AuthenticationError if the socket is not authenticated.
     */
    getTokenExpire(): number {
        if(!this._auth)
            throw new AuthenticationError('Can\'t access the token expire when the socket is not authenticated.');
        return this._rawSocket.authToken!.exp;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Sets if the socket has panel access.
     * Notice that it only can be updated when the socket is authenticated.
     * @param access
     */
    setPanelAccess(access: boolean): Promise<void> {
        let token = this.rawSocket.authToken;
        if(token == null)
            throw new AuthenticationError(`Panel access can not be updated if the socket is not authenticated.`);
        token = {...token};
        token.panelAccess = access;
        return this._setToken(token);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Returns if the socket has panel access.
     */
    hasPanelAccess(): boolean {
        return this._auth && this._rawSocket.authToken?.panelAccess === true;
    }

    // noinspection JSUnusedGlobalSymbols
    get rawToken(): RawZationToken | null {
        return this.rawSocket.authToken;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Returns the token payload of this socket.
     */
    get tokenPayload(): Partial<TP> | undefined {
        if(!this._auth) return undefined;
        return CloneUtils.deepClone(this.rawSocket.authToken!.payload!);
    }

    /**
     * Returns the token payload of this socket.
     * @throws AuthenticationError if this socket is not authenticated.
     */
    getTokenPayload(): Partial<TP> {
        if(!this._auth)
            throw new AuthenticationError('Can\'t access the token payload when the socket is not authenticated.');
        return CloneUtils.deepClone(this.rawSocket.authToken!.payload!);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Sets the token payload by overriding the old payload.
     * Every change on the token will update the
     * authentication of this socket. (Like a new authentication on top).
     * You can access the token payload on the client and server-side.
     * But only change, delete or set from the server-side.
     * Notice that this socket must be authenticated.
     * @example
     * await setTokenPayload({name: 'Luc'});
     * @param payload
     * @throws AuthenticationError if the client is not authenticated.
     */
    setTokenPayload(payload: Partial<TP>): Promise<void> {
        let token = this.rawSocket.authToken;
        if(token == null)
            throw new AuthenticationError(`Can't set token payload when socket is not authenticated.`);
        token = {...token};
        token.payload = payload;
        return this._setToken(token);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Clears the token payload.
     * Every change on the token will update the
     * authentication of this socket. (Like a new authentication on top).
     * You can access the token payload on the client and server-side.
     * But only change, delete or set from the server-side.
     * Notice that this socket must be authenticated.
     * @throws AuthenticationError if the client is not authenticated.
     */
    clearTokenPayload(): Promise<void> {
        return this.setTokenPayload({});
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Set a token payload property with object path.
     * Every change on the token will update the
     * authentication of this socket. (Like a new authentication on top).
     * You can access the token payload on the client and server-side.
     * But only change, delete or set from the server-side.
     * Notice that this socket must be authenticated.
     * @example
     * await setTokenPayloadProp('person.email','example@gmail.com');
     * await setTokenPayloadProp(['person','email'],'example@gmail.com');
     * @param path
     * The path to the property can be a string array or a string.
     * In case of a string, the keys are split with dots.
     * @param value
     * @throws AuthenticationError if the client is not authenticated.
     */
    setTokenPayloadProp(path: string | string[], value: any): Promise<void> {
        const payload = this.getTokenPayload();
        ObjectPath.set(payload,path,value);
        return this.setTokenPayload(payload);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Delete a token payload property with object path.
     * Every change on the token will update the
     * authentication of this socket. (Like a new authentication on top).
     * You can access the token payload on the client and server-side.
     * But only change, delete or set from the server-side.
     * Notice that this socket must be authenticated.
     * @example
     * await deleteTokenPayloadProp('person.email');
     * await deleteTokenPayloadProp(['person','email']);
     * @param path
     * The path to the property can be a string array or a string.
     * In case of a string, the keys are split with dots.
     * @throws AuthenticationError if the client is not authenticated.
     */
    deleteTokenPayloadProp(path: string | string[]): Promise<void> {
        const payload = this.getTokenPayload();
        ObjectPath.del(payload,path);
        return this.setTokenPayload(payload);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Sequence edit the token payload.
     * Useful if you want to make several changes because it
     * will do everything in one action, and therefore it saves performance.
     * Every change on the token will update the
     * authentication of this socket. (Like a new authentication on top).
     * You can access the token payload on the client and server-side.
     * But only change, delete or set from the server-side.
     * Notice that this socket must be authenticated.
     * @example
     * await seqEditTokenPayload()
     *      .delete('person.lastName')
     *      .set('person.name','Luca')
     *      .set('person.email','example@gmail.com')
     *      .commit();
     * @throws AuthenticationError if the client is not authenticated.
     */
    seqEditTokenPayload(): ObjectPathSequence {
        return new ObjectPathSequenceImp(this.getTokenPayload(), (payload) =>
            this.setTokenPayload(payload));
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Set a token payload property on every token with the
     * current userId (synchronized on user-id) with object path.
     * Every change on the token will update the
     * authentication of this socket. (Like a new authentication on top).
     * You can access the token payload on the client and server-side.
     * But only change, delete or set from the server-side.
     * Notice that this socket must be authenticated.
     * @example
     * await setTokenPayloadPropUserIdSync('person.email','example@gmail.com');
     * await setTokenPayloadPropUserIdSync(['person','email'],'example@gmail.com');
     * @param path
     * The path to the property can be a string array or a string.
     * In case of a string, the keys are split with dots.
     * @param value
     * @throws AuthenticationError if the client is not authenticated.
     */
    async setTokenPayloadPropUserIdSync(path: string | string[],value: any): Promise<void> {
        await this.setTokenPayloadProp(path,value);
        const id = this._userId;
        if(id != undefined) return bag.setTokenPayloadPropOnUserId(id,path,value,this.sid);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Delete a token payload property on every token with the
     * current userId (synchronized on user-id) with object path.
     * Every change on the token will update the
     * authentication of this socket. (Like a new authentication on top).
     * You can access the token payload on the client and server-side.
     * But only change, delete or set from the server-side.
     * Notice that this socket must be authenticated.
     * @example
     * await deleteTokenPayloadPropUserIdSync('person.email');
     * await deleteTokenPayloadPropUserIdSync(['person','email']);
     * @param path
     * The path to the property can be a string array or a string.
     * In case of a string, the keys are split with dots.
     * @throws AuthenticationError if the client is not authenticated.
     */
    async deleteTokenPayloadPropUserIdSync(path: string | string[]): Promise<void> {
        await this.deleteTokenPayloadProp(path);
        const id = this._userId;
        if(id !== undefined) return bag.deleteTokenPayloadPropOnUserId(id,path,this.sid);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Sequence edit the token payload on every token with the
     * current userId (synchronized on user-id) with object path.
     * Useful if you want to make several changes because it
     * will do everything in one action, and therefore it saves performance.
     * Every change on the token will update the
     * authentication of this socket. (Like a new authentication on top).
     * You can access the token payload on the client and server-side.
     * But only change, delete or set from the server-side.
     * Notice that this socket must be authenticated.
     * @example
     * await seqEditTokenPayloadUserIdSync()
     *      .delete('person.lastName')
     *      .set('person.name','Luca')
     *      .set('person.email','example@gmail.com')
     *      .commit();
     * @throws AuthenticationError if the client is not authenticated.
     */
    seqEditTokenPayloadUserIdSync(): ObjectPathSequence {
        const id = this._userId;
        return new ObjectPathSequenceBoxImp(
            this.seqEditTokenPayload(),
            ...(id !== undefined ? [bag.seqEditTokenPayloadOnUserId(id,this.sid)]: [])
        );
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Set a token payload property on every token with the
     * current auth user group (synchronized on auth user group) with object path.
     * Every change on the token will update the
     * authentication of this socket. (Like a new authentication on top).
     * You can access the token payload on the client and server-side.
     * But only change, delete or set from the server-side.
     * Notice that this socket must be authenticated.
     * @example
     * await setTokenPayloadPropGroupSync('person.email','example@gmail.com');
     * await setTokenPayloadPropGroupSync(['person','email'],'example@gmail.com');
     * @param path
     * The path to the property can be a string array or a string.
     * In case of a string, the keys are split with dots.
     * @param value
     * @throws AuthenticationError if the client is not authenticated.
     */
    async setTokenPayloadPropGroupSync(path: string | string[], value: any): Promise<void> {
        await this.setTokenPayloadProp(path,value);
        const group = this.authUserGroup;
        if(group !== undefined) return bag.setTokenPayloadPropOnGroup(group,path,value,this.sid);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Delete a token payload property on every token with the
     * current auth user group (synchronized on auth user group) with object path.
     * Every change on the token will update the
     * authentication of this socket. (Like a new authentication on top).
     * You can access the token payload on the client and server-side.
     * But only change, delete or set from the server-side.
     * Notice that this socket must be authenticated.
     * @example
     * await deleteTokenPayloadPropGroupSync('person.email');
     * await deleteTokenPayloadPropGroupSync(['person','email']);
     * @param path
     * The path to the property can be a string array or a string.
     * In case of a string, the keys are split with dots.
     * @throws AuthenticationError if the client is not authenticated.
     */
    async deleteTokenPayloadPropGroupSync(path: string | string[]): Promise<void> {
        await this.deleteTokenPayloadProp(path);
        const group = this.authUserGroup;
        if(group !== undefined) return bag.deleteTokenPayloadPropOnGroup(group,path,this.sid);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Sequence edit the token payload on every token with the
     * current auth user group (synchronized on auth user group) with object path.
     * Useful if you want to make several changes because it
     * will do everything in one action, and therefore it saves performance.
     * Every change on the token will update the
     * authentication of this socket. (Like a new authentication on top).
     * You can access the token payload on the client and server-side.
     * But only change, delete or set from the server-side.
     * Notice that this socket must be authenticated.
     * @example
     * await seqEditTokenPayloadGroupSync()
     *      .delete('person.lastName')
     *      .set('person.name','Luca')
     *      .set('person.email','example@gmail.com')
     *      .commit();
     * @throws AuthenticationError if the client is not authenticated.
     */
    seqEditTokenPayloadGroupSync(): ObjectPathSequence {
        const group = this.authUserGroup;
        return new ObjectPathSequenceBoxImp(
            this.seqEditTokenPayload(),
            ...(group !== undefined ? [bag.seqEditTokenPayloadOnGroup(group,this.sid)]: [])
        );
    }

    //Part attachment
    // noinspection JSUnusedGlobalSymbols
    get attachment(): Partial<A> {
        return this._attachment;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Clears the attachment.
     */
    clearAttachment(): void {
        this._attachment = {};
    }

    //Ids
    // noinspection JSUnusedGlobalSymbols
    /**
     * Returns this socket id.
     */
    get id(): string {
        return this._rawSocket.id;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Returns this socket sid.
     */
    get sid(): string {
        return this._rawSocket.sid;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Returns this socket tid.
     */
    get tid(): string {
        return this._rawSocket.tid;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Returns the raw socket.
     */
    get rawSocket(): RawSocket {
        return this._rawSocket;
    }

    //Part connected components
    // noinspection JSUnusedGlobalSymbols
    /**
     * Returns the Databoxes where this socket is connected to.
     */
    getDataboxes(): (DataboxFamily | Databox)[] {
        return this._databoxes;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Returns the Channels that this socket has subscribed.
     */
    getChannels(): (ChannelFamily | Channel)[] {
        return this._channels;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Emit to this socket.
     * If you not only transmit the return value is a promise with the result,
     * and if an error occurs while emitting the error is thrown.
     * @param event
     * @param data
     * @param onlyTransmit
     * Indicates if you only want to transmit data.
     */
    emit<T extends boolean>(event: string,data: any,onlyTransmit?: T): T extends true ? void : Promise<any>
    // noinspection JSUnusedGlobalSymbols
    emit(event: string,data: any,onlyTransmit: boolean = true): Promise<any> | void {
        event = ZATION_CUSTOM_EVENT_NAMESPACE + event;
        if(onlyTransmit) {
            this._rawSocket.emit(event, data);
        }
        else {
            return new Promise<any>((resolve, reject) => {
                this._rawSocket.emit(event,data,(err, data) => {
                    err ? reject(err): resolve(data);
                });
            });
        }
    }

    /**
     * Respond on an emit-event of this socket.
     * @param event
     * @param handler
     * The function that gets called when the event occurs, parameters are
     * the data and a response function that you can call to respond to the event.
     */
    on(event: string,handler: OnHandlerFunction){
        this._rawSocket.on(ZATION_CUSTOM_EVENT_NAMESPACE + event,handler);
    }

    /**
     * Respond on emit-event of this socket but only once.
     * @param event
     * @param handler
     * The function that gets called when the event occurs, parameters are
     * the data and a response function that you can call to respond to the event.
     */
    once(event: string,handler: OnHandlerFunction): void {
        this._rawSocket.once(ZATION_CUSTOM_EVENT_NAMESPACE + event,handler);
    }

    /**
     * Removes a specific or all handler from an emit-event of this socket.
     * @param event
     * @param handler
     */
    off(event: string,handler?: OnHandlerFunction): void {
        this._rawSocket.off(ZATION_CUSTOM_EVENT_NAMESPACE + event,handler);
    }

    //Part Handshake
    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the handshake request.
     */
    getHandshakeRequest(): IncomingMessage {
        return this._rawSocket.request;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the handshake request header.
     */
    getHandshakeHeader(): IncomingHttpHeaders {
        return this._rawSocket.request.headers;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the socket handshake attachment.
     * @example
     * getHandshakeAttachment()?.deviceCode;
     */
    getHandshakeAttachment(): any {
        return this._rawSocket.handshakeAttachment;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the accept language of this socket.
     * Note that it is possible that no accept language was included in the header.
     * @example
     * en-US,en;q=0.8,et;q=0.6"
     */
    getAcceptLanguage(): undefined | string | string[] {
        return this.getHandshakeHeader()["accept-language"];
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the agent of the client by using the
     * npm package 'useragent' to parse it.
     * Note that it is possible that no user agent was included in the header.
     * @example
     * //get operating system
     * getUserAgent().os.toString(); // 'Mac OSX 10.8.1'
     * //get device
     * getUserAgent().device.toString(); // 'Asus A100'
     */
    getUserAgent(): Agent {
        return useragent.parse(this.getHandshakeHeader()["user-agent"]);
    }

    //Part Address
    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the remote IP address
     * (can be a private address) of this socket.
     */
    getRemoteAddress(): string {
        return this._rawSocket.remoteAddress;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the public remote IP address of this socket.
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

    //Part version / system
    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the system of the client.
     */
    get clientSystem() {
        return this._rawSocket.clientSystem;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the version of the client.
     */
    get clientVersion() {
        return this._rawSocket.clientVersion;
    }

    //Part API Level
    // noinspection JSUnusedGlobalSymbols
    /**
     * Returns the API level of the client.
     * This API level can be the connection, or default API level.
     */
    getApiLevel(): number {
        return this._rawSocket.apiLevel || bag.getZationConfig().mainConfig.defaultClientApiLevel;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Returns the API level of the connection,
     * can be undefined if the client did not provide it.
     */
    get connectionApiLevel(): number | undefined {
        return this._rawSocket.apiLevel;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Checks if the API level of the client is compatible with the API level.
     * @param apiLevel
     */
    isCompatibleApiLevel(apiLevel: number): boolean {
        return ApiLevelUtils.apiLevelIsCompatible(this.getApiLevel(),apiLevel);
    }
}