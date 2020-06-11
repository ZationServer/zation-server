/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import ZationWorker             = require("../core/zationWorker");
import useragent                = require('useragent');
import {OnHandlerFunction, RawSocket} from "../main/sc/socket";
import {IncomingHttpHeaders, IncomingMessage} from "http";
import {Agent}                    from "useragent";
import AuthEngine                 from "../main/auth/authEngine";
import ObjectPath                 from "../main/utils/objectPath";
import ObjectPathSequenceImp      from "../main/internalApi/objectPathSequence/objectPathSequenceImp";
import ObjectPathSequenceBoxImp   from "../main/internalApi/objectPathSequence/objectPathSequenceBoxImp";
import Bag                        from "./Bag";
import InputIsIncompatibleError   from "../main/error/inputIsIncompatibleError";
import TokenUtils                 from "../main/token/tokenUtils";
import {RawZationToken}           from "../main/constants/internal";
import {JwtSignOptions}           from "../main/constants/jwt";
import Socket                     from "./socket";
import ApiLevelUtils              from "../main/apiLevel/apiLevelUtils";
import CloneUtils                 from "../main/utils/cloneUtils";
// noinspection TypeScriptPreferShortImport,ES6PreferShortImport
import {ObjectPathSequence}       from "../main/internalApi/objectPathSequence/objectPathSequence";

export default class RequestBag extends Bag
{
    private reqVariables: object = {};
    private readonly _socket: RawSocket;
    private readonly authEngine: AuthEngine;
    private readonly input: any;
    private readonly reqApiLevel: number | undefined;

    constructor(socket: RawSocket, worker: ZationWorker, input: object, reqApiLevel: number | undefined)
    {
        super(worker,worker.getInternalChannelEngine());
        this._socket = socket;
        this.authEngine = socket.authEngine;
        this.input = input;
        this.reqApiLevel = reqApiLevel;
    }

    //Part Request Variables

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Set a request variable with objectPath.
     * @example
     * setReqVariable('my.variable','hello');
     * @param path
     * The path to the variable, you can split the keys with a dot or an string array.
     * @param value
     */
    setReqVariable(path: string | string[], value: any): void {
        ObjectPath.set(this.reqVariables,path,value);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Has a request variable with objectPath.
     * @example
     * hasReqVariable('my.variable');
     * @param path
     * The path to the variable, you can split the keys with a dot or an string array.
     */
    hasReqVariable(path?: string | string[]): boolean {
        return ObjectPath.has(this.reqVariables,path);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Get a request variable with objectPath.
     * @example
     * getReqVariable('my.variable');
     * @param path
     * The path to the variable, you can split the keys with a dot or an string array.
     */
    getReqVariable<R = any>(path?: string | string[]): R {
        return ObjectPath.get(this.reqVariables,path);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Delete a request variable with objectPath.
     * @example
     * deleteReqVariable('my.variable');
     * deleteReqVariable(); //deletes all variables
     * @param path
     * The path to the variable, you can split the keys with a dot or an string array.
     */
    deleteReqVariable(path?: string | string[]): void {
        if(path !== undefined) {
            ObjectPath.del(this.reqVariables,path);
        }
        else {
            this.reqVariables = {};
        }
    }

    //Part Input

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Get input with object path.
     * @example
     * getInput('person.name');
     * @param path
     * The path to the variable, you can split the keys with a dot or an string array.
     * @throws InputIsIncompatibleError
     * Can happen if you provided a path, inputAllAllow is activated,
     * and input is not from type object.
     */
    getInput<R = any>(path?: string | string[]): R {
        if(path !== undefined){
            if(typeof this.input === 'object'){
                return ObjectPath.get(this.input,path);
            }
            else {
                throw new InputIsIncompatibleError();
            }
        }
        else {
            return this.input;
        }
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Has input with object path.
     * @example
     * hasInput('person.name');
     * @param path
     * The path to the variable, you can split the keys with a dot or an string array.
     * @throws InputIsIncompatibleError
     * Can happen if you provided a path, inputAllAllow is activated,
     * and input is not from type object.
     */
    hasInput(path: string | string[]): boolean {
        if(path !== undefined){
            if(typeof this.input === 'object'){
                return ObjectPath.has(this.input,path);
            }
            else {
                throw new InputIsIncompatibleError();
            }
        }
        else {
            return this.input !== undefined;
        }
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns if the input is an object.
     * @example
     * inputIsObject();
     */
    inputIsObject(): boolean {
        return typeof this.input === 'object';
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the type of the input.
     * @example
     * getInputType();
     */
    getInputType(): string {
       return typeof this.input;
    }

    //Part ServerSocketVariable

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
        this.socket.setSocketVariable(path,value);
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
        return this.socket.hasSocketVariable(path);
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
        return this.socket.getSocketVariable(path);
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
    deleteSocketVariable(path?: string | string[]): void {
        this.socket.deleteSocketVariable(path);
    }

    //Part Auth 2

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns if current socket is authenticated.
     */
    isAuth(): boolean {
        return this.authEngine.isAuth();
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns if current socket is authenticated.
     */
    isAuthenticated(): boolean {
        return this.isAuth();
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the authentication user group of current socket.
     * If the socket is not authenticated, it will return undefined.
     */
    getAuthUserGroup(): string | undefined {
        return this.authEngine.getAuthUserGroup();
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the user group of current socket.
     * The user group can be the default group or one of the auth groups.
     */
    getUserGroup(): string | undefined {
        return this.authEngine.getUserGroup();
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Authenticate an socket.
     * This method will throw errors if the process fails.
     * @example
     * await authenticate('user','tom12',{email: 'example@gmail.com'});
     * @param authUserGroup The authUserGroup must exist in the appConfig. Otherwise an error will be thrown.
     * @param userId
     * @param tokenVariables
     * If this parameter is used all previous variables will be deleted.
     * Notice that the token variables are separated from the main zation token.
     * @param jwtOptions This optional options argument is an Object which can be used to modify the token's behavior.
     * Valid properties include any option accepted by the jsonwebtoken library's sign method.
     * For example, you can change the default expire of the token or add a time before the token gets valid.
     * @throws AuthenticationError
     */
    async authenticate(authUserGroup: string,userId?: string | number,tokenVariables: object = {},jwtOptions: JwtSignOptions = {}): Promise<void> {
        await this.authEngine.authenticate(authUserGroup,userId,tokenVariables);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Deauthenticate current socket.
     * @example
     * await deauthenticate();
     */
    async deauthenticate(): Promise<void> {
        await this.authEngine.deauthenticate();
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Set the user id of the token from this socket.
     * @example
     * await setUserId('luca23');
     * @param id
     * @throws AuthenticationError
     */
    async setUserId(id: string | number): Promise<void> {
        await this.authEngine.setUserId(id);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Remove the user id of the token from this socket.
     * @example
     * await removeUserId();
     * @throws AuthenticationError
     */
    async removeUserId(): Promise<void> {
        await this.authEngine.removeUserId();
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the user id of token from the current socket.
     */
    getUserId(): number | string | undefined {
        return this.authEngine.getUserId();
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns if token has a user id of the current socket.
     */
    hasUserId(): boolean {
        return this.authEngine.getUserId() !== undefined;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns if token has panel access.
     */
    hasPanelAccess(): boolean {
        return this.authEngine.hasPanelAccess();
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Set the panel access for this socket.
     * @example
     * await setPanelAccess(true);
     * @throws AuthenticationError
     * @param access
     */
    async setPanelAccess(access: boolean): Promise<void> {
        await this.authEngine.setPanelAccess(access);
    }

    // noinspection JSUnusedGlobalSymbols
    getAuthEngine(): AuthEngine {
        return this.authEngine;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns true if the current socket is not authenticated (default user group).
     */
    isDefault(): boolean {
        return this.authEngine.isDefault();
    }

    //Part Http
    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the handshake request.
     */
    getHandshakeRequest(): IncomingMessage {
       return this._socket.request;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the handshake request header.
     */
    getHandshakeHeader(): IncomingHttpHeaders {
       return this._socket.request.headers;
    }

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
        return this.socket.getSocketHandshakeVariable(path);
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
        return this.socket.hasSocketHandshakeVariable(path);
    }

    //Part Token Variable

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
     * @throws AuthenticationError if the client is not authenticated.
     */
    async setTokenVariable(path: string | string[],value: any): Promise<void> {
        const ctv = CloneUtils.deepClone(TokenUtils.getTokenVariables(this._socket.authToken));
        ObjectPath.set(ctv,path,value);
        await TokenUtils.setCustomVar(ctv,this._socket);
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
     * @throws AuthenticationError if the client is not authenticated.
     */
    async deleteTokenVariable(path?: string | string[]): Promise<void> {
        if(path !== undefined) {
            const ctv = CloneUtils.deepClone(TokenUtils.getTokenVariables(this._socket.authToken));
            ObjectPath.del(ctv,path);
            await TokenUtils.setCustomVar(ctv,this._socket);
        }
        else {
            await TokenUtils.setCustomVar({},this._socket);
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
     * @throws AuthenticationError if the client is not authenticated.
     */
    seqEditTokenVariables(): ObjectPathSequence
    {
        return new ObjectPathSequenceImp(CloneUtils.deepClone(
            TokenUtils.getTokenVariables(this._socket.authToken)),
            async (obj)=> {
                await TokenUtils.setCustomVar(obj,this._socket);
            });
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Set a token variable on every token with the current userId (synchronized on user id) with object path.
     * But first on the current socket, afterwards on all other tokens with the same user id.
     * Every change on the token will update the authentication of each socket. (Like a new authentication on top)
     * Notice that the token variables are separated from the main zation token variables.
     * That means there can be no naming conflicts with zation variables.
     * You can access this variables on client and server side.
     * But only change, delete or set on the server.
     * Check that the socket is authenticated (has a token).
     * @example
     * await setTokenVariableIdSync('person.email','example@gmail.com');
     * @param path
     * The path to the variable, you can split the keys with a dot or an string array.
     * @param value
     * @throws AuthenticationError if the client is not authenticated.
     */
    async setTokenVariableIdSync(path: string | string[],value: any): Promise<void> {
        await this.setTokenVariable(path,value);
        const id = this.getUserId();
        if(id !== undefined)
        await this.setTokenVariableOnUserId(id,path,value,this.getSocketSid());
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Delete a token variable on every token with the current userId (synchronized on user id) with object path.
     * But first on the current socket, afterwards on all other tokens with the same user id.
     * Every change on the token will update the authentication of each socket. (Like a new authentication on top)
     * Notice that the token variables are separated from the main zation token variables.
     * You can access this variables on client and server side.
     * But only change, delete or set on the server.
     * Check that the socket is authenticated (has a token).
     * @example
     * await deleteTokenVariableIdSync('person.email');
     * @param path
     * The path to the variable, you can split the keys with a dot or an string array.
     * @throws AuthenticationError if the client is not authenticated.
     */
    async deleteTokenVariableIdSync(path?: string | string[]): Promise<void> {
        await this.deleteTokenVariable(path);
        const id = this.getUserId();
        if(id !== undefined)
        await this.deleteTokenVariableOnUserId(id,path,this.getSocketSid());
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Sequence edit the token variables on every token with the current userId (synchronized on user id).
     * But first on the current socket, afterwards on all other tokens with the same user id.
     * Useful if you want to make several changes.
     * This will do everything in one and saves performance.
     * Every change on the token will update the authentication of each socket. (Like a new authentication on top)
     * Notice that the token variables are separated from the main zation token variables.
     * That means there can be no naming conflicts with zation variables.
     * You can access this variables on client and server side.
     * But only change, delete or set on the server.
     * Check that the socket is authenticated (has a token).
     * @example
     * await seqEditTokenVariablesIdSync()
     *       .delete('person.lastName')
     *       .set('person.name','Luca')
     *       .set('person.email','example@gmail.com')
     *       .commit();
     * @throws AuthenticationError if the client is not authenticated.
     */
    seqEditTokenVariablesIdSync(): ObjectPathSequence {
        const id = this.getUserId();
        return new ObjectPathSequenceBoxImp(
            this.seqEditTokenVariables(),
            ...(id !== undefined ? [this.seqEditTokenVariablesOnUserId(id,this.getSocketSid())]: [])
        );
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Set a token variable on every token with the current auth user group (synchronized on auth user group) with object path.
     * But first on the current socket, afterwards on all other tokens with the same auth user group.
     * Every change on the token will update the authentication of each socket. (Like a new authentication on top)
     * Notice that the token variables are separated from the main zation token variables.
     * That means there can be no naming conflicts with zation variables.
     * You can access this variables on client and server side.
     * But only change, delete or set on the server.
     * Check that the socket is authenticated (has a token).
     * @example
     * await setTokenVariableGroupSync('person.email','example@gmail.com');
     * @param path
     * The path to the variable, you can split the keys with a dot or an string array.
     * @param value
     * @throws AuthenticationError if the client is not authenticated.
     */
    async setTokenVariableGroupSync(path: string | string[],value: any): Promise<void> {
        await this.setTokenVariable(path,value);
        await this.setTokenVariableOnGroup(this.getAuthUserGroup() as string,path,value,this.getSocketSid());
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Delete a token variable on every token with the current auth user group (synchronized on auth user group) with object path.
     * But first on the current socket, afterwards on all other tokens with the same auth user group.
     * Every change on the token will update the authentication of each socket. (Like a new authentication on top)
     * Notice that the token variables are separated from the main zation token variables.
     * You can access this variables on client and server side.
     * But only change, delete or set on the server.
     * Check that the socket is authenticated (has a token).
     * @example
     * await deleteTokenVariableGroupSync('person.email');
     * @param path
     * The path to the variable, you can split the keys with a dot or an string array.
     * @throws AuthenticationError if the client is not authenticated.
     */
    async deleteTokenVariableGroupSync(path?: string | string[]): Promise<void> {
        await this.deleteTokenVariable(path);
        await this.deleteTokenVariableOnGroup(this.getAuthUserGroup() as string,path,this.getSocketSid());
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Sequence edit the token variables on every token with the current auth user group (synchronized on auth user group).
     * But first on the current socket, afterwards on all other tokens with the same auth user group.
     * Useful if you want to make several changes.
     * This will do everything in one and saves performance.
     * Every change on the token will update the authentication of each socket. (Like a new authentication on top)
     * Notice that the token variables are separated from the main zation token variables.
     * That means there can be no naming conflicts with zation variables.
     * You can access this variables on client and server side.
     * But only change, delete or set on the server.
     * Check that the socket is authenticated (has a token).
     * @example
     * await seqEditTokenVariablesGroupSync()
     *       .delete('person.lastName')
     *       .set('person.name','Luca')
     *       .set('person.email','example@gmail.com')
     *       .commit();
     * @throws AuthenticationError if the client is not authenticated.
     */
    seqEditTokenVariablesGroupSync(): ObjectPathSequence {
        return new ObjectPathSequenceBoxImp(
            this.seqEditTokenVariables(),
            this.seqEditTokenVariablesOnGroup(this.getAuthUserGroup() as string,this.getSocketSid())
        );
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Check has a token variable with object path.
     * Notice that the token variables are separated from the main zation token variables.
     * You can access this variables on client and server side.
     * But only change, delete or set on the server.
     * Check that the socket is authenticated (has a token).
     * @example
     * hasTokenVariable('person.email');
     * @param path
     * The path to the variable, you can split the keys with a dot or an string array.
     * @throws AuthenticationError if the client is not authenticated.
     */
    hasTokenVariable(path?: string | string[]): boolean {
        return ObjectPath.has(TokenUtils.getTokenVariables(this._socket.authToken),path);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Get a token variable with object path.
     * Notice that the token variables are separated from the main zation token variables.
     * You can access this variables on client and server side.
     * But only change, delete or set on the server.
     * Check that the socket is authenticated (has a token).
     * @example
     * getTokenVariable('person.email');
     * @param path
     * The path to the variable, you can split the keys with a dot or an string array.
     * @throws AuthenticationError if the client is not authenticated.
     */
    getTokenVariable<R = any>(path?: string | string[]): R {
        return ObjectPath.get(TokenUtils.getTokenVariables(this._socket.authToken),path);
    }

    //Part Token

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns token id of the token form the socket.
     * @throws AuthenticationError if the socket is not authenticated.
     */
    getTokenId(): string {
        return TokenUtils.getTokenVariable(nameof<RawZationToken>(s => s.tid),this._socket.authToken);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the expire of the token from the socket.
     * @throws AuthenticationError if the socket is not authenticated.
     */
    getTokenExpire(): number {
        return TokenUtils.getTokenVariable(nameof<RawZationToken>(s => s.exp),this._socket.authToken);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the panel access of the token from the socket.
     * @throws AuthenticationError if the socket is not authenticated.
     */
    getPanelAccess(): boolean {
        return TokenUtils.getTokenVariable(nameof<RawZationToken>(s => s.panelAccess),this._socket.authToken);
    }

    //Part Socket
    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the socket id of the current socket.
     */
    getSocketId(): string {
        return this._socket.id;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the socket sid of the current socket.
     * The sid is unique in scalable process.
     */
    getSocketSid(): string {
        return this._socket.sid;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the raw socket.
     */
    getRawSocket(): RawSocket {
        return this._socket;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the zSocket.
     */
    get socket(): Socket {
        return this._socket.socket;
    }

    //Part Socket

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
    async socketEmit<T extends boolean>(event: string, data: any, onlyTransmit: T): Promise<T extends true ? void: any>
    // noinspection JSUnusedGlobalSymbols
    async socketEmit(event: string, data: any, onlyTransmit: boolean = true): Promise<object | void> {
        return this.socket.emit(event,data,onlyTransmit);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Respond on an emit-event of the socket.
     * It uses the custom zation event namespace
     * (so you cannot have name conflicts with internal event names).
     * @param event
     * @param handler
     * The function that gets called when the event occurs,
     * parameters are the data and a response function that you can call to respond on the event back.
     */
    socketOn(event: string,handler: OnHandlerFunction){
        this._socket.on(event,handler);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Respond on emit-event of the socket but only once.
     * It uses the custom zation event namespace
     * (so you cannot have name conflicts with internal event names).
     * @param event
     * @param handler
     * The function that gets called when the event occurs,
     * parameters are the data and a response function that you can call to respond on the event back.
     */
    socketOnce(event: string,handler: OnHandlerFunction): void {
        this.socket.once(event,handler);
    }

    //Part General req info

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the remote ip address (can be a private address) from the current request.
     */
    getRemoteAddress(): string {
        return this._socket.remoteAddress;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the only public remote ip address from the current request.
     */
    getPublicRemoteAddress(): string {
        return this.socket.getPublicRemoteAddress();
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns if the user agent of the client is set.
     */
    hasUserAgent(): boolean {
        return this.getHandshakeHeader()["user-agent"] !== undefined;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the raw user agent of the client.
     * Note that it is possible that no user agent was included in the header.
     * You can check it with the method hasUserAgent().
     * @example
     * Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.107 Safari/537.36
     */
    getRawUserAgent(): string | undefined {
        return this.getHandshakeHeader()["user-agent"];
    }


    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the agent of the client
     * with using the npm package 'useragent' to parse it.
     * Note that it is possible that no user agent was included in the header.
     * You can check it with the method hasUserAgent().
     * @example
     * //get operating system
     * getUserAgent().os.toString(); // 'Mac OSX 10.8.1'
     * //get device
     * getUserAgent().device.toString(); // 'Asus A100'
     */
    getUserAgent(): Agent {
        return useragent.parse(this.getRawUserAgent());
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the accept language of the client.
     * Note that it is possible that no accept language was included in the header.
     * You can check it with the method hasAcceptLanguage().
     * @example
     * en-US,en;q=0.8,et;q=0.6"
     */
    getAcceptLanguage(): undefined | string | string[]{
        return this.getHandshakeHeader()["accept-language"];
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns if the accept language of the client is set.
     */
    hasAcceptLanguage(): boolean {
        return this.getHandshakeHeader()["accept-language"] !== undefined;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the system from the client that requests.
     */
    getClientSystem(): string {
        return this._socket.clientSystem;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the system version from the client that requests.
     */
    getClientVersion(): number {
        return this._socket.clientVersion;
    }

    //Part API Level

    // noinspection JSUnusedGlobalSymbols
    /**
     * Returns the API level of the client.
     * This API level can be the request, connection, or default API level.
     */
    getApiLevel(): number {
        return this.reqApiLevel || this._socket.apiLevel || this.zc.mainConfig.defaultClientApiLevel;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Returns the API level of the request,
     * can be undefined if the client did not provide it.
     */
    getRequestApiLevel(): number | undefined {
        return this.reqApiLevel;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Returns the API level of the connection,
     * can be undefined if the client did not provide it.
     */
    getConnectionApiLevel(): number | undefined {
        return this._socket.apiLevel;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Checks if the API level of the client is compatible with the API level.
     * @param reqApiLevel
     */
    isCompatibleApiLevel(reqApiLevel: number): boolean {
        return ApiLevelUtils.apiLevelIsCompatible(this.getApiLevel(),reqApiLevel);
    }
}