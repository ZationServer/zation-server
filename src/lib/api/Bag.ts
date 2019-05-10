/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import ZationWorker = require("../main/zationWorker");
import useragent    = require('useragent');
import UpSocket         from "../helper/sc/socket";
import ScServer         from "../helper/sc/scServer";
import * as core        from "express-serve-static-core";
import {IncomingHttpHeaders, IncomingMessage} from "http";
import {Agent}                   from "useragent";
import {UploadedFile}            from "express-fileupload";
import ObjectPathCombineSequence from "../helper/utils/objectPathCombineSequence";
import SHBridge              from "../helper/bridges/shBridge";
import AuthEngine            from "../helper/auth/authEngine";
import ProtocolAccessChecker from "../helper/protocolAccess/protocolAccessChecker";
import ObjectPath            from "../helper/utils/objectPath";
import ObjectPathSequence    from "../helper/utils/objectPathSequence";
import SmallBag              from "./SmallBag";
import InputIsNotCompatibleError  from "../helper/error/inputIsNotCompatibleError";
import MethodIsNotCompatibleError from "../helper/error/methodIsNotCompatibleError";
import TokenUtils            from "../helper/token/tokenUtils";
import {ZationToken}         from "../helper/constants/internal";
import JwtSignOptions        from "../helper/constants/jwt";
import ObjectUtils           from "../helper/utils/objectUtils";
import ChUtils               from "../helper/channel/chUtils";
import SocketInfo from "../helper/infoObjects/socketInfo";

export default class Bag extends SmallBag
{
    private bagVariables : object;
    private readonly shBridge : SHBridge;
    private readonly authEngine : AuthEngine;
    private readonly input : any;

    constructor(shBridge : SHBridge, worker : ZationWorker, authEngine : AuthEngine, input : object)
    {
        super(worker,worker.getChannelBagEngine());
        this.bagVariables = {};
        this.shBridge = shBridge;
        this.authEngine = authEngine;
        this.input = input;
    }

    //Part Bag Variable

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Set a bag variable with objectPath.
     * @example
     * setBagVariable('my.variable','hello');
     * @param path
     * The path to the variable, you can split the keys with a dot or an string array.
     * @param value
     */
    setBagVariable(path : string | string[],value : any) : void {
        ObjectPath.set(this.bagVariables,path,value);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Has a bag variable with objectPath.
     * @example
     * hasBagVariable('my.variable');
     * @param path
     * The path to the variable, you can split the keys with a dot or an string array.
     */
    hasBagVariable(path ?: string | string[]) : boolean {
        return ObjectPath.has(this.bagVariables,path);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Get a bag variable with objectPath.
     * @example
     * getBagVariable('my.variable');
     * @param path
     * The path to the variable, you can split the keys with a dot or an string array.
     */
    getBagVariable<R>(path ?: string | string[]) : R {
        return ObjectPath.get(this.bagVariables,path);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Delete a bag variable with objectPath.
     * @example
     * deleteBagVariable('my.variable');
     * deleteBagVariable(); //deletes all variables
     * @param path
     * The path to the variable, you can split the keys with a dot or an string array.
     */
    deleteBagVariables(path ?: string | string[]) : void {
        if(!!path) {
            ObjectPath.del(this.bagVariables,path);
        }
        else {
            this.bagVariables = {};
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
     * Can happen if inputAllAllow is activated and input is not from type object.
     */
    getInput<R>(path ?: string | string[]) : R {
        if(typeof this.input === 'object'){
            return ObjectPath.get(this.input,path);
        }
        else {
            throw new InputIsNotCompatibleError();
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
     * Can happen if inputAllAllow is activated and input is not from type object.
     */
    hasInput(path: string | string[]) : boolean {
        if(typeof this.input === 'object'){
            return ObjectPath.has(this.input,path);
        }
        else {
            throw new InputIsNotCompatibleError();
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
    setSocketVariable(path : string | string[],value : any) : void
    {
        if(this.shBridge.isWebSocket()) {
            ObjectPath.set(this.shBridge.getSocket().zationSocketVariables,path,value);
        }
        else {
            throw new MethodIsNotCompatibleError(this.getProtocol(),'ws','Set a socket variable.');
        }
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
    hasSocketVariable(path ?: string | string[]) : boolean
    {
        if(this.shBridge.isWebSocket()) {
            return ObjectPath.has(this.shBridge.getSocket().zationSocketVariables,path);
        }
        else {
            throw new MethodIsNotCompatibleError(this.getProtocol(),'ws','Check has a socket variable.');
        }
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
    getSocketVariable<R>(path ?: string | string[]) : R
    {
        if(this.shBridge.isWebSocket()) {
            return ObjectPath.get(this.shBridge.getSocket().zationSocketVariables,path);
        }
        else {
            throw new MethodIsNotCompatibleError(this.getProtocol(),'ws','Get a socket variable.');
        }
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
    deleteSocketVariable(path ?: string | string[]) : void
    {
        if(this.shBridge.isWebSocket()) {
            if(!!path) {
                ObjectPath.del(this.shBridge.getSocket().zationSocketVariables,path);
            }
            else {
                this.shBridge.getSocket().zationSocketVariables = {};
            }
        }
        else {
            throw new MethodIsNotCompatibleError(this.getProtocol(),'ws','Delete a socket variable.');
        }
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
     * Notice that the token variables are separated from the main zation token variables.
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

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns true if the server is using the token state check.
     */
    isUseTokenStateCheck() : boolean {
        return this.authEngine.isUseTokenStateCheck();
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
    getCookieVariable<R>(key : string) : R
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
            // @ts-ignore
            return this.shBridge.getRequest().files;
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
    getSocketHandshakeVariable<R>(path ?: string | string[]) : R {
        if(this.shBridge.isWebSocket()) {
            return ObjectPath.get(this.shBridge.getSocket().handshakeVariables,path);
        }
        else {
            throw new MethodIsNotCompatibleError(this.getProtocol(),'ws','To get socket handshake variable.');
        }
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
        if(this.shBridge.isWebSocket()) {
            return ObjectPath.has(this.shBridge.getSocket().handshakeVariables,path);
        }
        else {
            throw new MethodIsNotCompatibleError(this.getProtocol(),'ws','To has socket handshake variable.');
        }
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
     * @throws AuthenticationError if the socket is not authenticated.
     */
    async setTokenVariable(path : string | string[],value : any) : Promise<void> {
        const ctv = ObjectUtils.deepClone(TokenUtils.getCustomTokenVariables(this.shBridge.getToken()));
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
     * @throws AuthenticationError if the socket is not authenticated.
     */
    async deleteTokenVariable(path ?: string | string[]) : Promise<void> {
        if(!!path) {
            const ctv = ObjectUtils.deepClone(TokenUtils.getCustomTokenVariables(this.shBridge.getToken()));
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
     * @throws AuthenticationError if the socket is not authenticated.
     */
    seqEditTokenVariables() : ObjectPathSequence
    {
        return new ObjectPathSequence(ObjectUtils.deepClone(
            TokenUtils.getCustomTokenVariables(this.shBridge.getToken())),
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
     * @throws AuthenticationError if the socket is not authenticated.
     */
    async setTokenVariableIdSync(path : string | string[],value : any) : Promise<void> {
        await this.setTokenVariable(path,value);
        // @ts-ignore
        await this.setTokenVariableOnUserId(this.getUserId(),path,value,this.getSocketSid());
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
     * @throws AuthenticationError if the socket is not authenticated.
     */
    async deleteTokenVariableIdSync(path ?: string | string[]) : Promise<void> {
        await this.deleteTokenVariable(path);
        // @ts-ignore
        await this.deleteTokenVariableOnUserId(this.getUserId(),path,this.getSocketSid());
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
     * @throws AuthenticationError if the socket is not authenticated.
     */
    seqEditTokenVariablesIdSync() : ObjectPathCombineSequence {
        return new ObjectPathCombineSequence(
            this.seqEditTokenVariables(),
            // @ts-ignore
            this.seqEditTokenVariablesOnUserId(this.getUserId(),this.getSocketSid())
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
     * @throws AuthenticationError if the socket is not authenticated.
     */
    async setTokenVariableGroupSync(path : string | string[],value : any) : Promise<void> {
        await this.setTokenVariable(path,value);
        // @ts-ignore
        await this.setTokenVariableOnGroup(this.getAuthUserGroup(),path,value,this.getSocketSid());
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
     * @throws AuthenticationError if the socket is not authenticated.
     */
    async deleteTokenVariableGroupSync(path ?: string | string[]) : Promise<void> {
        await this.deleteTokenVariable(path);
        // @ts-ignore
        await this.deleteTokenVariableOnGroup(this.getAuthUserGroup(),path,this.getSocketSid());
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
     * @throws AuthenticationError if the socket is not authenticated.
     */
    seqEditTokenVariablesGroupSync() : ObjectPathCombineSequence {
        return new ObjectPathCombineSequence(
            this.seqEditTokenVariables(),
            // @ts-ignore
            this.seqEditTokenVariablesOnGroup(this.getAuthUserGroup(),this.getSocketSid())
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
     * @throws AuthenticationError if the socket is not authenticated.
     */
    hasTokenVariable(path ?: string | string[]) : boolean {
        return ObjectPath.has(TokenUtils.getCustomTokenVariables(this.shBridge.getToken()),path);
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
     * @throws AuthenticationError if the socket is not authenticated.
     */
    getTokenVariable<R>(path ?: string | string[]) : R {
        return ObjectPath.get(TokenUtils.getCustomTokenVariables(this.shBridge.getToken()),path);
    }

    //Part Token

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns token id of the token form the socket.
     * @throws AuthenticationError if the socket is not authenticated.
     */
    getTokenId() : string {
        return TokenUtils.getTokenVariable(nameof<ZationToken>(s => s.zationTokenId),this.shBridge.getToken());
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
        return TokenUtils.getTokenVariable(nameof<ZationToken>(s => s.zationPanelAccess),this.shBridge.getToken());
    }

    //Part Socket
    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the socket id of the current socket.
     * Requires ws request!
     * @throws MethodIsNotCompatibleError
     */
    getSocketId() : string
    {
        if(this.shBridge.isWebSocket) {
            return this.shBridge.getSocket().id;
        }
        else {
            throw new MethodIsNotCompatibleError(this.getProtocol(),'ws','Get the socket id.');
        }
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the socket sid of the current socket.
     * The sid is unique in scalable process.
     * Requires ws request!
     * @throws MethodIsNotCompatibleError
     */
    getSocketSid() : string
    {
        if(this.shBridge.isWebSocket) {
            return this.shBridge.getSocket().sid;
        }
        else {
            throw new MethodIsNotCompatibleError(this.getProtocol(),'ws','Get the socket sid.');
        }
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the socket.
     * Requires ws request!
     * @throws MethodIsNotCompatibleError
     */
    getSocket() : UpSocket {
        if(this.shBridge.isWebSocket) {
            return this.shBridge.getSocket();
        }
        else {
            throw new MethodIsNotCompatibleError(this.getProtocol(),'ws','Get the socket.');
        }
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the socket info.
     * Requires ws request!
     * @throws MethodIsNotCompatibleError
     */
    getSocketInfo() : SocketInfo {
        if(this.shBridge.isWebSocket) {
            return this.shBridge.getSocket().socketInfo;
        }
        else {
            throw new MethodIsNotCompatibleError(this.getProtocol(),'ws','Get the socket info.');
        }
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the sc server from worker.
     */
    getScServer() : ScServer {
        return this.worker.scServer;
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
    getRequestId() : string
    {
        return this.shBridge.getReqId();
    }

    //Part Socket

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Emit to socket, the return value is an promises with the result.
     * If this method is used in an http request, an error is thrown.
     * If an error occurs while emitting to socket, this error is also thrown.
     * Requires ws request!
     * @throws MethodIsNotCompatibleError
     * @param eventName
     * @param data
     */
    async emitToSocket(eventName : string,data : any) : Promise<object>
    {
        return new Promise<object>((resolve, reject) => {
            if(this.shBridge.isWebSocket()) {
                this.shBridge.getSocket().emit(eventName,data,(err,data) => {
                    if(err) {
                        reject(err);
                    }
                    else {
                        resolve(data);
                    }
                });
            }
            else {
                reject(new MethodIsNotCompatibleError(this.getProtocol(),'ws','Emit to socket.'));
            }
        });
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the current channel subscriptions of the socket.
     * Requires ws request!
     * @throws MethodIsNotCompatibleError
     */
    getSubscriptions() : string[]
    {
        if(this.shBridge.isWebSocket) {
            return this.shBridge.getSocket().subscriptions();
        }
        else {
            throw new MethodIsNotCompatibleError(this.getProtocol(),'ws','Get subscribed channels.');
        }
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Returns all custom id channel subscriptions of the socket.
     * @param name (optional filter for a specific name)
     * Requires ws request!
     * @throws MethodIsNotCompatibleError
     */
    getCustomIdChSubscriptions(name ?: string) : string[] {
        if(this.shBridge.isWebSocket) {
            return ChUtils.getCustomIdChannelSubscriptions(this.shBridge.getSocket(),name);
        }
        else {
            throw new MethodIsNotCompatibleError(this.getProtocol(),'ws','Get subscribed custom id channels.');
        }
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Returns all custom channel subscriptions of the socket.
     * @param name (optional filter for a specific name)
     * Requires ws request!
     * @throws MethodIsNotCompatibleError
     */
    getCustomChSubscriptions(name ?: string) : string[] {
        if(this.shBridge.isWebSocket) {
            return ChUtils.getCustomChannelSubscriptions(this.shBridge.getSocket(),name);
        }
        else {
            throw new MethodIsNotCompatibleError(this.getProtocol(),'ws','Get subscribed custom channels.');
        }
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Returns if the socket has subscribed the user channel.
     * Requires ws request!
     * @throws MethodIsNotCompatibleError
     */
    hasSubUserCh() : boolean {
        if(this.shBridge.isWebSocket) {
            return ChUtils.hasSubUserCh(this.shBridge.getSocket());
        }
        else {
            throw new MethodIsNotCompatibleError(this.getProtocol(),'ws','Access channel subscriptions');
        }
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Returns if the socket has subscribed the auth user group channel.
     * Requires ws request!
     * @throws MethodIsNotCompatibleError
     */
    hasSubAuthUserGroupCh() : boolean {
        if(this.shBridge.isWebSocket) {
            return ChUtils.hasSubAuthUserGroupCh(this.shBridge.getSocket());
        }
        else {
            throw new MethodIsNotCompatibleError(this.getProtocol(),'ws','Access channel subscriptions');
        }
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Returns if the socket has subscribed the default user group channel.
     * Requires ws request!
     * @throws MethodIsNotCompatibleError
     */
    hasSubDefaultUserGroupCh() : boolean {
        if(this.shBridge.isWebSocket) {
            return ChUtils.hasSubDefaultUserGroupCh(this.shBridge.getSocket());
        }
        else {
            throw new MethodIsNotCompatibleError(this.getProtocol(),'ws','Access channel subscriptions');
        }
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Returns if the socket has subscribed the all channel.
     * Requires ws request!
     * @throws MethodIsNotCompatibleError
     */
    hasSubAllCh() : boolean {
        if(this.shBridge.isWebSocket) {
            return ChUtils.hasSubAllCh(this.shBridge.getSocket());
        }
        else {
            throw new MethodIsNotCompatibleError(this.getProtocol(),'ws','Access channel subscriptions');
        }
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Returns if the socket has subscribed the custom channel.
     * Requires ws request!
     * @throws MethodIsNotCompatibleError
     * @param name
     * if it is not provided,
     * it returns if the socket has subscribed any custom channel.
     */
    hasSubCustomCh(name ?: string) : boolean {
        if(this.shBridge.isWebSocket) {
            return ChUtils.hasSubCustomCh(this.shBridge.getSocket(),name);
        }
        else {
            throw new MethodIsNotCompatibleError(this.getProtocol(),'ws','Access channel subscriptions');
        }
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Returns if the socket has subscribed the custom id channel.
     * Requires ws request!
     * @throws MethodIsNotCompatibleError
     * @param name
     * if it is not provided,
     * it returns if the socket has subscribed any custom id channel.
     * @param id
     * if it is not provided,
     * it returns if the socket has subscribed any custom id channel with the provided name.
     */
    hasSubCustomIdCh(name ?: string, id ?: string) : boolean {
        if(this.shBridge.isWebSocket) {
            return ChUtils.hasSubCustomIdCh(this.shBridge.getSocket(),name,id);
        }
        else {
            throw new MethodIsNotCompatibleError(this.getProtocol(),'ws','Access channel subscriptions');
        }
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Returns if the socket has subscribed the panel out channel.
     * Requires ws request!
     * @throws MethodIsNotCompatibleError
     */
    hasPanelOutCh() : boolean {
        if(this.shBridge.isWebSocket) {
            return ChUtils.hasSubPanelOutCh(this.shBridge.getSocket());
        }
        else {
            throw new MethodIsNotCompatibleError(this.getProtocol(),'ws','Access channel subscriptions');
        }
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Kick the current socket from an custom id channel.
     * Requires ws request!
     * @example
     * kickFromCustomIdCh('images','10');
     * kickFromCustomIdCh('messageStreams');
     * @param channel is optional, if it is not given the users will be kicked out from all custom id channels.
     * @param id is optional, if it is not given the users will be kicked out from all ids of this channel.
     * @throws MethodIsNotCompatibleError
     */
    kickFromCustomIdCh(channel ?: string,id : string = '') : void
    {
        if(this.shBridge.isWebSocket) {
            ChUtils.kickCustomIdChannel(this.shBridge.getSocket(),channel,id);
        }
        else {
            throw new MethodIsNotCompatibleError(this.getProtocol(),'ws','Kick from a channel.');
        }
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Kick the current socket from an custom channel.
     * Requires ws request!
     * @example
     * kickFromCustomCh('stream');
     * @param channel is optional, if it is not given the users will be kicked out from all custom channels.
     * @throws MethodIsNotCompatibleError
     */
    kickFromCustomCh(channel ?: string) : void
    {
        if(this.shBridge.isWebSocket) {
            ChUtils.kickCustomChannel(this.shBridge.getSocket(),channel);
        }
        else {
            throw new MethodIsNotCompatibleError(this.getProtocol(),'ws','Kick from a channel.');
        }
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
    getPublicRemoteAddress() : string
    {
        return this.shBridge.getPublicRemoteAddress();
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns if the user agent of the client is set.
     */
    hasUserAgent() : boolean
    {
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
    getRawUserAgent() : string | undefined
    {
        // @ts-ignore
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
    getUserAgent() : Agent
    {
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
    getAcceptLanguage() : undefined | string | string[]
    {
        return this.getHandshakeHeader()["accept-language"];
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns if the accept language of the client is set.
     */
    hasAcceptLanguage() : boolean
    {
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
        const socketInfo = this.shBridge.isWebSocket() ? this.shBridge.getSocket().socketInfo : undefined;
        return await this.exchangeEngine.publishInUserCh
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
        return await this.publishInUserCh(userId,eventName,data,srcSocketSid);
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
        const socketInfo = this.shBridge.isWebSocket() ? this.shBridge.getSocket().socketInfo : undefined;
        return await this.exchangeEngine.publishInAllCh
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
        return await this.publishInAllCh(eventName,data,srcSocketSid);
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
        const socketInfo = this.shBridge.isWebSocket() ? this.shBridge.getSocket().socketInfo : undefined;
        return await this.exchangeEngine.publishInAuthUserGroupCh
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
        return await this.publishInAuthUserGroupCh(authUserGroup,eventName,data,srcSocketSid);
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
        const socketInfo = this.shBridge.isWebSocket() ? this.shBridge.getSocket().socketInfo : undefined;
        return await this.exchangeEngine.publishInDefaultUserGroupCh
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
        return await this.publishInDefaultUserGroupCh(eventName,data,srcSocketSid);
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
        const socketInfo = this.shBridge.isWebSocket() ? this.shBridge.getSocket().socketInfo : undefined;
        return await this.exchangeEngine.publishInAllAuthUserGroupCh
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
        return await this.publishInAllAuthUserGroupsCh(eventName,data,srcSocketSid);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Publish in an custom id channel.
     * @example
     * publishInCustomIdCh('imageChannel','image2','like',{fromUserId : '1'});
     * @param channel
     * @param id
     * @param eventName
     * @param data
     * @param srcSocketSid
     * If this param is undefined and request is webSocket, the id of the current socket is used.
     * If it is null, will be published anonymously.
     */
    async publishInCustomIdCh(channel : string, id : string, eventName : string, data : object = {},srcSocketSid ?: string | null) : Promise<void>
    {
        const socketInfo = this.shBridge.isWebSocket() ? this.shBridge.getSocket().socketInfo : undefined;
        return await this.exchangeEngine.publishInCustomIdChannel
        (channel,id,eventName,data,this._processSrcSocketSid(srcSocketSid),socketInfo);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Publish in an custom id channel.
     * @example
     * pubCustomIdCh('imageChannel','image2','like',{fromUserId : '1'});
     * @param channel
     * @param id
     * @param eventName
     * @param data
     * @param srcSocketSid
     * If this param is undefined and request is webSocket, the id of the current socket is used.
     * If it is null, will be published anonymously.
     */
    async pubCustomIdCh(channel : string, id : string, eventName : string, data : object = {},srcSocketSid ?: string | null) : Promise<void>
    {
        return await this.publishInCustomIdCh(channel,id,eventName,data,srcSocketSid);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Publish in an custom channel/s.
     * @example
     * publishInCustomCh('messageChannel','message',{message : 'hello',fromUserId : '1'});
     * publishInCustomCh(['messageChannel','otherChannel'],'message',{message : 'hello',fromUserId : '1'});
     * @param channel or an array of channels.
     * @param eventName
     * @param data
     * @param srcSocketSid
     * If this param is undefined and request is webSocket, the id of the current socket is used.
     * If it is null, will be published anonymously.
     */
    async publishInCustomCh(channel : string | string[], eventName : string, data : object = {},srcSocketSid ?: string | null) : Promise<void>
    {
        const socketInfo = this.shBridge.isWebSocket() ? this.shBridge.getSocket().socketInfo : undefined;
        return this.exchangeEngine.publishInCustomChannel
        (channel,eventName,data,this._processSrcSocketSid(srcSocketSid),socketInfo);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Publish in an custom channel/s.
     * @example
     * pubCustomCh('messageChannel','message',{message : 'hello',fromUserId : '1'});
     * pubCustomCh(['messageChannel','otherChannel'],'message',{message : 'hello',fromUserId : '1'});
     * @param channel or an array of channels.
     * @param eventName
     * @param data
     * @param srcSocketSid
     * If this param is undefined and request is webSocket, the id of the current socket is used.
     * If it is null, will be published anonymously.
     */
    async pubCustomCh(channel : string | string[], eventName : string, data : object = {},srcSocketSid ?: string | null) : Promise<void>
    {
        return await this.publishInCustomCh(channel,eventName,data,srcSocketSid);
    }

    private _processSrcSocketSid(srcSocketSid : string | null | undefined) : undefined | string {
        return !!srcSocketSid ? srcSocketSid : (srcSocketSid === null || !this.isWs() ? undefined : this.getSocketSid());
    }
}