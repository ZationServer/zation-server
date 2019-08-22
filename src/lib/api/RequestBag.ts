/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import ZationWorker             = require("../core/zationWorker");
import useragent                = require('useragent');
import UpSocket, {OnHandlerFunction} from "../main/sc/socket";
import * as core                  from "express-serve-static-core";
import {IncomingHttpHeaders, IncomingMessage} from "http";
import {Agent}                    from "useragent";
import {UploadedFile}             from "express-fileupload";
import SHBridge                   from "../main/bridges/shBridge";
import AuthEngine                 from "../main/auth/authEngine";
import ProtocolAccessChecker      from "../main/protocolAccess/protocolAccessChecker";
import ObjectPath                 from "../main/utils/objectPath";
import ObjectPathSequenceImp      from "../main/internalApi/objectPathSequence/objectPathSequenceImp";
import ObjectPathSequenceBoxImp   from "../main/internalApi/objectPathSequence/objectPathSequenceBoxImp";
import Bag                        from "./Bag";
import InputIsNotCompatibleError  from "../main/error/inputIsNotCompatibleError";
import MethodIsNotCompatibleError from "../main/error/methodIsNotCompatibleError";
import TokenUtils                 from "../main/token/tokenUtils";
import {ZationToken}              from "../main/constants/internal";
import {JwtSignOptions}           from "../main/constants/jwt";
import ZSocket                    from "../main/internalApi/ZSocket";
import ApiLevelUtils              from "../main/apiLevel/apiLevelUtils";
import CloneUtils                 from "../main/utils/cloneUtils";
// noinspection TypeScriptPreferShortImport
import {ObjectPathSequence}       from "../main/internalApi/objectPathSequence/objectPathSequence";

export default class RequestBag extends Bag
{
    private reqVariables : object;
    private readonly shBridge : SHBridge;
    private readonly authEngine : AuthEngine;
    private readonly input : any;

    constructor(shBridge : SHBridge, worker : ZationWorker, authEngine : AuthEngine, input : object)
    {
        super(worker,worker.getChannelBagEngine());
        this.reqVariables = {};
        this.shBridge = shBridge;
        this.authEngine = authEngine;
        this.input = input;
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
    setReqVariable(path : string | string[], value : any) : void {
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
    hasReqVariable(path ?: string | string[]) : boolean {
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
    getReqVariable<R = any>(path ?: string | string[]) : R {
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
    deleteReqVariable(path ?: string | string[]) : void {
        if(!!path) {
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
     * @throws InputIsNotCompatibleError
     * Can happen if you provided a path, inputAllAllow is activated,
     * and input is not from type object.
     */
    getInput<R = any>(path ?: string | string[]) : R {
        if(path !== undefined){
            if(typeof this.input === 'object'){
                return ObjectPath.get(this.input,path);
            }
            else {
                throw new InputIsNotCompatibleError();
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
     * @throws InputIsNotCompatibleError
     * Can happen if you provided a path, inputAllAllow is activated,
     * and input is not from type object.
     */
    hasInput(path: string | string[]) : boolean {
        if(path !== undefined){
            if(typeof this.input === 'object'){
                return ObjectPath.has(this.input,path);
            }
            else {
                throw new InputIsNotCompatibleError();
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
    inputIsObject() : boolean {
        return typeof this.input === 'object';
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the type of the input.
     * @example
     * getInputType();
     */
    getInputType() : string {
       return typeof this.input;
    }

    //Part ServerSocketVariable

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Set socket variable (server side) with object path.
     * Requires web socket request!
     * @example
     * setSocketVariable('email','example@gmail.com');
     * @param path
     * The path to the variable, you can split the keys with a dot or an string array.
     * @param value
     * @throws MethodIsNotCompatibleError
     */
    setSocketVariable(path : string | string[],value : any) : void {
        this.socket.setSocketVariable(path,value);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Has socket variable (server side) with object path.
     * Requires web socket request!
     * @example
     * hasSocketVariable('email');
     * @param path
     * The path to the variable, you can split the keys with a dot or an string array.
     * @throws MethodIsNotCompatibleError
     */
    hasSocketVariable(path ?: string | string[]) : boolean {
        return this.socket.hasSocketVariable(path);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Get socket variable (server side) with object path.
     * Requires web socket request!
     * @example
     * getSocketVariable('email');
     * @param path
     * The path to the variable, you can split the keys with a dot or an string array.
     * @throws MethodIsNotCompatibleError
     */
    getSocketVariable<R = any>(path ?: string | string[]) : R {
        return this.socket.getSocketVariable(path);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Delete socket variable (server side) with object path.
     * Requires web socket request!
     * @example
     * deleteSocketVariable('email');
     * @param path
     * The path to the variable, you can split the keys with a dot or an string array.
     * @throws MethodIsNotCompatibleError
     */
    deleteSocketVariable(path ?: string | string[]) : void {
        this.socket.deleteSocketVariable(path);
    }

    //Part Auth 2

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns if current socket is authenticated.
     */
    isAuth() : boolean {
        return this.authEngine.isAuth();
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns if current socket is authenticated.
     */
    isAuthenticated() : boolean {
        return this.isAuth();
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the authentication user group of current socket.
     * If the socket is not authenticated, it will return undefined.
     */
    getAuthUserGroup() : string | undefined {
        return this.authEngine.getAuthUserGroup();
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the user group of current socket.
     * The user group can be the default group or one of the auth groups.
     */
    getUserGroup() : string | undefined {
        return this.authEngine.getUserGroup();
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Authenticate an socket.
     * This method will throw errors if the process fails.
     * @example
     * await authenticate('user','tom12',{email : 'example@gmail.com'});
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
    async authenticate(authUserGroup : string,userId ?: string | number,tokenVariables : object = {},jwtOptions : JwtSignOptions = {}) : Promise<void> {
        await this.authEngine.authenticate(authUserGroup,userId,tokenVariables);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Deauthenticate current socket.
     * @example
     * await deauthenticate();
     */
    async deauthenticate() : Promise<void> {
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
    async setUserId(id : string | number) : Promise<void> {
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
    async removeUserId() : Promise<void> {
        await this.authEngine.removeUserId();
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the user id of token from the current socket.
     */
    getUserId() : number | string | undefined {
        return this.authEngine.getUserId();
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns if token has a user id of the current socket.
     */
    hasUserId() : boolean {
        return this.authEngine.getUserId() !== undefined;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns if token has panel access.
     */
    hasPanelAccess() : boolean {
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
    async setPanelAccess(access : boolean) : Promise<void> {
        await this.authEngine.setPanelAccess(access);
    }

    // noinspection JSUnusedGlobalSymbols
    getAuthEngine() : AuthEngine {
        return this.authEngine;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns true if the current socket is not authenticated (default user group).
     */
    isDefault() : boolean {
        return this.authEngine.isDefault();
    }

    //Part Cookie

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Get cookie variable.
     * Requires http request!
     * @throws MethodIsNotCompatibleError
     * @param key
     */
    getCookieVariable<R = any>(key : string) : R
    {
        if(this.shBridge.isWebSocket()) {
            throw new MethodIsNotCompatibleError(this.getProtocol(),'http','Get a cookie variable.');
        }
        else {
            return this.shBridge.getRequest().cookies[key];
        }
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Set cookie variable.
     * Requires http request!
     * @throws MethodIsNotCompatibleError
     * @param key
     * @param value
     * @param settings
     */
    setCookieVariable(key : string,value : any,settings  : object= { maxAge: 900000}) : void
    {
        if(this.shBridge.isWebSocket()) {
            throw new MethodIsNotCompatibleError(this.getProtocol(),'http','Set a cookie variable.');
        }
        else {
            this.shBridge.getResponse().cookie(key,value,settings);
        }
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Clear cookie variable.
     * Requires http request!
     * @throws MethodIsNotCompatibleError
     * @param key
     */
    clearCookie(key : string) : void
    {
        if(this.shBridge.isWebSocket()) {
            throw new MethodIsNotCompatibleError(this.getProtocol(),'http','Clear a cookie.');
        }
        else {
            this.shBridge.getResponse().clearCookie(key);
        }
    }

    //Part Http

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Return the http response.
     * Requires http request!
     * @throws MethodIsNotCompatibleError
     */
    getHttpResponse() : core.Response {
        if(this.shBridge.isWebSocket()) {
            throw new MethodIsNotCompatibleError(this.getProtocol(),'http','Get http response.');
        }
        else {
            return this.shBridge.getResponse();
        }
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Return the http request.
     * Requires http request!
     * @throws MethodIsNotCompatibleError
     */
    getHttpRequest() : core.Request {
        if(this.shBridge.isWebSocket()) {
            throw new MethodIsNotCompatibleError(this.getProtocol(),'http','Get http request.');
        }
        else {
            return this.shBridge.getRequest();
        }
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Return the http method.
     * Requires http request!
     * @throws MethodIsNotCompatibleError
     */
    getHttpMethod() : string {
        if(this.shBridge.isWebSocket()) {
            throw new MethodIsNotCompatibleError(this.getProtocol(),'http','Get http method.');
        }
        else {
            return this.shBridge.getRequest().method;
        }
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the attached files from the http request.
     * By using the npm package express-fileupload.
     * You can attach files on the client side
     * by using the method attachHttpContent.
     * Requires http request!
     * @throws MethodIsNotCompatibleError
     */
    getHttpFiles() : Record<string,UploadedFile> {
        if(this.shBridge.isWebSocket()) {
            throw new MethodIsNotCompatibleError(this.getProtocol(),'http','Get http files.');
        }
        else {
            //using express-fileupload
            return (this.shBridge.getRequest().files || {}) as Record<string,UploadedFile>;
        }
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the http request body.
     * You can use it to access attached http content.
     * Requires http request!
     * @throws MethodIsNotCompatibleError
     */
    getHttpBody() : Record<string,any>
    {
        if(this.shBridge.isWebSocket()) {
            throw new MethodIsNotCompatibleError(this.getProtocol(),'http','Get http body.');
        }
        else {
            return this.shBridge.getRequest().body;
        }
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * If it is an http request it returns the request.
     * Otherwise (webSocket request) it returns the handshake request.
     */
    getHandshakeRequest() : IncomingMessage
    {
       return this.shBridge.getHandshakeRequest();
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * If it is an http request it returns the request header.
     * Otherwise (webSocket request) it returns the handshake request header.
     */
    getHandshakeHeader() : IncomingHttpHeaders
    {
       return this.shBridge.getHandshakeRequest().headers;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Get a socket handshake variable with object path.
     * Requires ws request!
     * @example
     * getSocketHandshakeVariable('deviceCode');
     * @param path
     * The path to the variable, you can split the keys with a dot or an string array.
     * @throws MethodIsNotCompatibleError
     */
    getSocketHandshakeVariable<R = any>(path ?: string | string[]) : R {
        return this.socket.getSocketHandshakeVariable(path);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Has a socket handshake variable with object path.
     * Requires ws request!
     * @example
     * hasSocketHandshakeVariable('deviceCode');
     * @param path
     * The path to the variable, you can split the keys with a dot or an string array.
     * @throws MethodIsNotCompatibleError
     */
    hasSocketHandshakeVariable(path ?: string | string[]) : boolean {
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
    async setTokenVariable(path : string | string[],value : any) : Promise<void> {
        const ctv = CloneUtils.deepClone(TokenUtils.getTokenVariables(this.shBridge.getToken()));
        ObjectPath.set(ctv,path,value);
        await TokenUtils.setCustomVar(ctv,this.shBridge);
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
    async deleteTokenVariable(path ?: string | string[]) : Promise<void> {
        if(!!path) {
            const ctv = CloneUtils.deepClone(TokenUtils.getTokenVariables(this.shBridge.getToken()));
            ObjectPath.del(ctv,path);
            await TokenUtils.setCustomVar(ctv,this.shBridge);
        }
        else {
            await TokenUtils.setCustomVar({},this.shBridge);
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
    seqEditTokenVariables() : ObjectPathSequence
    {
        return new ObjectPathSequenceImp(CloneUtils.deepClone(
            TokenUtils.getTokenVariables(this.shBridge.getToken())),
            async (obj)=> {
                await TokenUtils.setCustomVar(obj,this.shBridge);
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
    async setTokenVariableIdSync(path : string | string[],value : any) : Promise<void> {
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
    async deleteTokenVariableIdSync(path ?: string | string[]) : Promise<void> {
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
    seqEditTokenVariablesIdSync() : ObjectPathSequence {
        const id = this.getUserId();
        return new ObjectPathSequenceBoxImp(
            this.seqEditTokenVariables(),
            ...(id !== undefined ? [this.seqEditTokenVariablesOnUserId(id,this.getSocketSid())] : [])
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
    async setTokenVariableGroupSync(path : string | string[],value : any) : Promise<void> {
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
    async deleteTokenVariableGroupSync(path ?: string | string[]) : Promise<void> {
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
    seqEditTokenVariablesGroupSync() : ObjectPathSequence {
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
    hasTokenVariable(path ?: string | string[]) : boolean {
        return ObjectPath.has(TokenUtils.getTokenVariables(this.shBridge.getToken()),path);
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
    getTokenVariable<R = any>(path ?: string | string[]) : R {
        return ObjectPath.get(TokenUtils.getTokenVariables(this.shBridge.getToken()),path);
    }

    //Part Token

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns token id of the token form the socket.
     * @throws AuthenticationError if the socket is not authenticated.
     */
    getTokenId() : string {
        return TokenUtils.getTokenVariable(nameof<ZationToken>(s => s.tid),this.shBridge.getToken());
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the expire of the token from the socket.
     * @throws AuthenticationError if the socket is not authenticated.
     */
    getTokenExpire() : number {
        return TokenUtils.getTokenVariable(nameof<ZationToken>(s => s.exp),this.shBridge.getToken());
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the panel access of the token from the socket.
     * @throws AuthenticationError if the socket is not authenticated.
     */
    getPanelAccess() : boolean {
        return TokenUtils.getTokenVariable(nameof<ZationToken>(s => s.panelAccess),this.shBridge.getToken());
    }

    //Part Socket
    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the socket id of the current socket.
     * Requires ws request!
     * @throws MethodIsNotCompatibleError
     */
    getSocketId() : string {
        return this.socket.socketId;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the socket sid of the current socket.
     * The sid is unique in scalable process.
     * Requires ws request!
     * @throws MethodIsNotCompatibleError
     */
    getSocketSid() : string {
        return this.socket.socketSid;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the raw socket.
     * Requires ws request!
     * @throws MethodIsNotCompatibleError
     */
    getRawSocket() : UpSocket {
        return this.socket.rawSocket;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the zSocket.
     * Requires ws request!
     * @throws MethodIsNotCompatibleError
     */
    get socket() : ZSocket {
        if(this.shBridge.isWebSocket) {
            return this.shBridge.getSocket().zSocket;
        }
        else {
            throw new MethodIsNotCompatibleError(this.getProtocol(),'ws','Access the socket.');
        }
    }

    //Part Protocol

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the current protocol of this request.
     * It can be 'ws' or 'http'.
     */
    getProtocol() : string {
        return ProtocolAccessChecker.getProtocol(this.shBridge);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the current request protocol is web socket.
     */
    isWebSocketProtocol() : boolean {
        return this.shBridge.isWebSocket();
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the current request protocol is web socket.
     */
    isWs() : boolean {
        return this.isWebSocketProtocol();
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the current request protocol is http.
     */
    isHttpProtocol() : boolean {
        return !this.shBridge.isWebSocket();
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the current request protocol is http.
     */
    isHttp() : boolean {
        return this.isHttpProtocol();
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the unique request id for this request,
     * based on instanceId, workerFullId, request count and timestamp.
     * @Example
     * 7dd60337-bdeb-494a-ae5d-a92188b0c535-2.90-1543143397178.0.0
     */
    getRequestId() : string {
        return this.shBridge.getReqId();
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
     * Requires ws request!
     * @throws MethodIsNotCompatibleError
     * @param event
     * @param data
     * @param onlyTransmit
     * Indicates if you only want to transmit data.
     * If not than the promise will be resolved with the result when the client responded on the emit.
     */
    async socketEmit<T extends boolean>(event : string, data : any, onlyTransmit : T) : Promise<T extends true ? void : any>
    // noinspection JSUnusedGlobalSymbols
    async socketEmit(event : string, data : any, onlyTransmit : boolean = true) : Promise<object | void> {
        return this.socket.emit(event,data,onlyTransmit);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Respond on an emit-event of the socket.
     * It uses the custom zation event namespace
     * (so you cannot have name conflicts with internal event names).
     * Requires ws request!
     * @throws MethodIsNotCompatibleError
     * @param event
     * @param handler
     * The function that gets called when the event occurs,
     * parameters are the data and a response function that you can call to respond on the event back.
     */
    socketOn(event : string,handler : OnHandlerFunction){
        this.socket.on(event,handler);
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
    socketOnce(event : string,handler : OnHandlerFunction) : void {
        this.socket.once(event,handler);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the current channel subscriptions of the socket.
     * Requires ws request!
     * @throws MethodIsNotCompatibleError
     */
    getSubscriptions() : string[] {
        return this.socket.getSubscriptions();
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Returns all custom channel subscriptions of the socket.
     * @param name (optional filter for a specific name)
     * Requires ws request!
     * @throws MethodIsNotCompatibleError
     */
    getCustomChSubscriptions(name ?: string) : string[] {
        return this.socket.getCustomChSubscriptions(name);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Returns if the socket has subscribed the user channel.
     * Requires ws request!
     * @throws MethodIsNotCompatibleError
     */
    hasSubUserCh() : boolean {
        return this.socket.hasSubUserCh();
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Returns if the socket has subscribed the auth user group channel.
     * Requires ws request!
     * @throws MethodIsNotCompatibleError
     */
    hasSubAuthUserGroupCh() : boolean {
        return this.socket.hasSubAuthUserGroupCh();
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Returns if the socket has subscribed the default user group channel.
     * Requires ws request!
     * @throws MethodIsNotCompatibleError
     */
    hasSubDefaultUserGroupCh() : boolean {
        return this.socket.hasSubDefaultUserGroupCh();
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Returns if the socket has subscribed the all channel.
     * Requires ws request!
     * @throws MethodIsNotCompatibleError
     */
    hasSubAllCh() : boolean {
        return this.socket.hasSubAllCh();
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Returns if the socket has subscribed the custom channel.
     * Requires ws request!
     * @throws MethodIsNotCompatibleError
     * @param name
     * if it is not provided,
     * it returns if the socket has subscribed any custom channel.
     * @param id
     * if it is not provided,
     * it returns if the socket has subscribed any custom channel with the provided name.
     */
    hasSubCustomCh(name ?: string, id ?: string) : boolean {
        return this.socket.hasSubCustomCh(name,id);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Returns if the socket has subscribed the panel out channel.
     * Requires ws request!
     * @throws MethodIsNotCompatibleError
     */
    hasSubPanelOutCh() : boolean {
        return this.socket.hasSubPanelOutCh();
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Kick the current socket from an custom channel.
     * Requires ws request!
     * @example
     * kickFromCustomCh('images','10');
     * kickFromCustomCh('publicChat');
     * @param name is optional, if it is not given the users will be kicked out from all custom channels.
     * @param id only provide an id if you want to kick the socket from a specific member of a custom channel family.
     * @throws MethodIsNotCompatibleError
     */
    kickFromCustomCh(name ?: string,id ?: string) : void {
        this.socket.kickFromCustomCh(name,id);
    }

    //Part General req info

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the remote ip address (can be a private address) from the current request.
     */
    getRemoteAddress() : string {
        return this.shBridge.getRemoteAddress();
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the only public remote ip address from the current request.
     */
    getPublicRemoteAddress() : string {
        return this.shBridge.getPublicRemoteAddress();
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns if the user agent of the client is set.
     */
    hasUserAgent() : boolean {
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
    getRawUserAgent() : string | undefined {
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
    getUserAgent() : Agent {
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
    getAcceptLanguage() : undefined | string | string[]{
        return this.getHandshakeHeader()["accept-language"];
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns if the accept language of the client is set.
     */
    hasAcceptLanguage() : boolean {
        return this.getHandshakeHeader()["accept-language"] !== undefined;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the system from the client that requests.
     */
    getClientSystem() : string {
        return this.shBridge.getSystem();
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the system version from the client that requests.
     */
    getClientVersion() : number {
        return this.shBridge.getVersion();
    }

    //Part API Level

    // noinspection JSUnusedGlobalSymbols
    /**
     * Returns the API level of the client.
     * This API level can be the request, connection, or default API level.
     */
    getApiLevel() : number {
        return this.shBridge.getApiLevel();
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Returns the API level of the request,
     * can be undefined if the client did not provide it.
     */
    getRequestApiLevel() : number | undefined {
        return this.shBridge.getRequestApiLevel();
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Returns the API level of the connection,
     * can be undefined if the client did not provide it or it is an HTTP request.
     */
    getConnectionApiLevel() : number | undefined {
        return this.shBridge.getConnectionApiLevel();
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Checks if the API level of the client is compatible with the API level.
     * @param reqApiLevel
     */
    isCompatibleApiLevel(reqApiLevel : number) : boolean {
        return ApiLevelUtils.apiLevelIsCompatible(this.getApiLevel(),reqApiLevel);
    }

    //Part new publish overwrite (with src)

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Publish in an user channel or channels.
     * @example
     * publishInUserCh('paul10','message',{message : 'hello',fromUserId : 'luca34'});
     * publishInUserCh(['paul10','lea1'],'message',{message : 'hello',fromUserId : 'luca34'});
     * @param userId or more userIds in array.
     * @param eventName
     * @param data
     * @param srcSocketSid
     * If this param is undefined and request is webSocket, the id of the current socket is used.
     * If it is null, will be published anonymously.
     */
    async publishInUserCh(userId : string | number | (number|string)[],eventName :string,data : object = {},srcSocketSid ?: string | null) : Promise<void>
    {
        const socketInfo = this.shBridge.isWebSocket() ? this.shBridge.getSocket().zSocket : undefined;
        return this.exchangeEngine.publishInUserCh
        (userId,eventName,data,this._processSrcSocketSid(srcSocketSid),socketInfo);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Publish in an user channel or channels.
     * @example
     * pubUserCh('paul10','message',{message : 'hello',fromUserId : 'luca34'});
     * pubUserCh(['paul10','lea1'],'message',{message : 'hello',fromUserId : 'luca34'});
     * @param userId or more userIds in array.
     * @param eventName
     * @param data
     * @param srcSocketSid
     * If this param is undefined and request is webSocket, the id of the current socket is used.
     * If it is null, will be published anonymously.
     */
    async pubUserCh(userId : string | number | (number|string)[],eventName :string,data : object = {},srcSocketSid ?: string | null) : Promise<void>
    {
        return this.publishInUserCh(userId,eventName,data,srcSocketSid);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Publish in all channel.
     * @example
     * publishInAllCh('message',{message : 'hello'});
     * @param eventName
     * @param data
     * @param srcSocketSid
     * If this param is undefined and request is webSocket, the id of the current socket is used.
     * If it is null, will be published anonymously.
     */
    async publishInAllCh(eventName : string,data : object = {},srcSocketSid ?: string | null) : Promise<void>
    {
        const socketInfo = this.shBridge.isWebSocket() ? this.shBridge.getSocket().zSocket : undefined;
        return this.exchangeEngine.publishInAllCh
        (eventName,data,this._processSrcSocketSid(srcSocketSid),socketInfo);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Publish in all channel.
     * @example
     * pubAllCh('message',{message : 'hello'});
     * @param eventName
     * @param data
     * @param srcSocketSid
     * If this param is undefined and request is webSocket, the id of the current socket is used.
     * If it is null, will be published anonymously.
     */
    async pubAllCh(eventName : string,data : object = {},srcSocketSid ?: string | null) : Promise<void>
    {
        return this.publishInAllCh(eventName,data,srcSocketSid);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Publish in auth user group channel/s.
     * @example
     * publishInAuthUserGroupCh('admin','userRegistered',{userId : '1'});
     * publishInAuthUserGroupCh(['admin','superAdmin'],'userRegistered',{userId : '1'});
     * @param authUserGroup or an array of auth user groups.
     * @param eventName
     * @param data
     * @param srcSocketSid
     * If this param is undefined and request is webSocket, the id of the current socket is used.
     * If it is null, will be published anonymously.
     */
    async publishInAuthUserGroupCh(authUserGroup : string | string[], eventName : string, data : object = {},srcSocketSid ?: string | null) : Promise<void>
    {
        const socketInfo = this.shBridge.isWebSocket() ? this.shBridge.getSocket().zSocket : undefined;
        return this.exchangeEngine.publishInAuthUserGroupCh
        (authUserGroup,eventName,data,this._processSrcSocketSid(srcSocketSid),socketInfo);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Publish in auth user group channel/s.
     * @example
     * pubAuthUserGroupCh('admin','userRegistered',{userId : '1'});
     * pubAuthUserGroupCh(['admin','superAdmin'],'userRegistered',{userId : '1'});
     * @param authUserGroup or an array of auth user groups.
     * @param eventName
     * @param data
     * @param srcSocketSid
     * If this param is undefined and request is webSocket, the id of the current socket is used.
     * If it is null, will be published anonymously.
     */
    async pubAuthUserGroupCh(authUserGroup : string | string[], eventName : string, data : object = {},srcSocketSid ?: string | null) : Promise<void>
    {
        return this.publishInAuthUserGroupCh(authUserGroup,eventName,data,srcSocketSid);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Publish in default user group channel.
     * @example
     * publishInDefaultUserGroupCh('message',{message : 'hello'});
     * @param eventName
     * @param data
     * @param srcSocketSid
     * If this param is undefined and request is webSocket, the id of the current socket is used.
     * If it is null, will be published anonymously.
     */
    async publishInDefaultUserGroupCh(eventName : string, data : object = {},srcSocketSid ?: string | null) : Promise<void>
    {
        const socketInfo = this.shBridge.isWebSocket() ? this.shBridge.getSocket().zSocket : undefined;
        return this.exchangeEngine.publishInDefaultUserGroupCh
        (eventName,data,this._processSrcSocketSid(srcSocketSid),socketInfo);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Publish in default user group channel.
     * @example
     * pubDefaultUserGroupCh('message',{message : 'hello'});
     * @param eventName
     * @param data
     * @param srcSocketSid
     * If this param is undefined and request is webSocket, the id of the current socket is used.
     * If it is null, will be published anonymously.
     */
    async pubDefaultUserGroupCh(eventName : string, data : object = {},srcSocketSid ?: string | null) : Promise<void>
    {
        return this.publishInDefaultUserGroupCh(eventName,data,srcSocketSid);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Publish in all auth user groups channels.
     * @example
     * publishInAllAuthUserGroupsCh('message',{fromUserId : '1',message : 'hello'});
     * @param eventName
     * @param data
     * @param srcSocketSid
     * If this param is undefined and request is webSocket, the id of the current socket is used.
     * If it is null, will be published anonymously.
     */
    async publishInAllAuthUserGroupsCh(eventName : string, data : object = {},srcSocketSid ?: string | null) : Promise<void>
    {
        const socketInfo = this.shBridge.isWebSocket() ? this.shBridge.getSocket().zSocket : undefined;
        return this.exchangeEngine.publishInAllAuthUserGroupCh
        (eventName,data,this._processSrcSocketSid(srcSocketSid),socketInfo);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Publish in all auth user groups channels.
     * @example
     * pubAllAuthUserGroupsCh('message',{fromUserId : '1',message : 'hello'});
     * @param eventName
     * @param data
     * @param srcSocketSid
     * If this param is undefined and request is webSocket, the id of the current socket is used.
     * If it is null, will be published anonymously.
     */
    async pubAllAuthUserGroupsCh(eventName : string, data : object = {},srcSocketSid ?: string | null) : Promise<void>
    {
        return this.publishInAllAuthUserGroupsCh(eventName,data,srcSocketSid);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Publish in an custom channel.
     * @example
     * publishInCustomCh({name : 'imageChannel', id : 'image2'},'like',{fromUserId : '1'});
     * publishInCustomCh({name : 'publicChat'},'msg',{msg : 'Hello',fromUserId : '1'});
     * @param target
     * @param eventName
     * @param data
     * @param srcSocketSid
     * If this param is undefined and request is webSocket, the id of the current socket is used.
     * If it is null, will be published anonymously.
     * @throws UnknownCustomCh
     */
    async publishInCustomCh(target : {name : string,id ?: string}, eventName: string, data: object = {}, srcSocketSid ?: string): Promise<void> {
        const socketInfo = this.shBridge.isWebSocket() ? this.shBridge.getSocket().zSocket : undefined;
        return this.exchangeEngine.publishInCustomCh(target,eventName,data,this._processSrcSocketSid(srcSocketSid),socketInfo);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Publish in an custom channel.
     * @example
     * publishInCustomCh({name : 'imageChannel', id : 'image2'},'like',{fromUserId : '1'});
     * publishInCustomCh({name : 'publicChat'},'msg',{msg : 'Hello',fromUserId : '1'});
     * @param target
     * @param eventName
     * @param data
     * @param srcSocketSid
     * If this param is undefined and request is webSocket, the id of the current socket is used.
     * If it is null, will be published anonymously.
     * @throws UnknownCustomCh
     */
    async pubCustomCh(target : {name : string,id ?: string}, eventName: string, data: object = {}, srcSocketSid ?: string): Promise<void> {
        return this.publishInCustomCh(target,eventName,data,srcSocketSid);
    }

    private _processSrcSocketSid(srcSocketSid : string | null | undefined) : undefined | string {
        return !!srcSocketSid ? srcSocketSid : (srcSocketSid === null || !this.isWs() ? undefined : this.getSocketSid());
    }
}