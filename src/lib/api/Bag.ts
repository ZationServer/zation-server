/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import ChannelEngine = require('./../helper/channel/channelEngine');
import SmallBag      = require('./SmallBag');
import SHBridge      = require("../helper/bridges/shBridge");
import AuthEngine    = require("../helper/auth/authEngine");
import TokenEngine   = require("../helper/token/tokenEngine");
import ZationWorker  = require("../main/zationWorker");
import ObjectPath    = require("../helper/tools/objectPath");
import useragent     = require('useragent');
import MethodIsNotCompatible = require("../helper/error/methodIsNotCompatible");
import ObjectPathSequence    = require("../helper/tools/objectPathSequence");
import {Socket}                from "../helper/sc/socket";
import AuthenticationError   = require("../helper/error/authenticationError");
import ProtocolAccessChecker = require("../helper/protocolAccess/protocolAccessChecker");
import {ScServer}              from "../helper/sc/scServer";
import * as core               from "express-serve-static-core";
import {IncomingHttpHeaders, IncomingMessage} from "http";
import {Agent}        from "useragent";
import {UploadedFile} from "express-fileupload";

export class Bag extends SmallBag
{
    private bagVariables : object;
    private readonly shBridge : SHBridge;
    private readonly authEngine : AuthEngine;
    private readonly channelEngine : ChannelEngine;
    private readonly tokenEngine : TokenEngine;
    private readonly input : object;

    constructor(shBridge : SHBridge,worker : ZationWorker,authEngine : AuthEngine,tokenEngine : TokenEngine,input : object,channelEngine : ChannelEngine = new ChannelEngine(worker,shBridge))
    {
        super(worker,channelEngine);

        this.bagVariables = {};
        this.shBridge = shBridge;
        this.authEngine = authEngine;
        this.channelEngine = channelEngine;
        this.tokenEngine = tokenEngine;
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
     */
    getInput<R>(path ?: string | string[]) : R {
        return ObjectPath.get(this.input,path);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Has input with object path.
     * @example
     * hasInput('person.name');
     * @param path
     * The path to the variable, you can split the keys with a dot or an string array.
     */
    hasInput(path: string | string[]) : boolean {
        return ObjectPath.has(this.input,path);
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
     * @throws MethodIsNotCompatible
     */
    setSocketVariable(path : string | string[],value : any) : void
    {
        if(this.shBridge.isWebSocket()) {
            ObjectPath.set(this.shBridge.getSocket().zationSocketVariables,path,value);
        }
        else {
            throw new MethodIsNotCompatible(this.getProtocol(),'ws');
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
     * @throws MethodIsNotCompatible
     */
    hasSocketVariable(path ?: string | string[]) : boolean
    {
        if(this.shBridge.isWebSocket()) {
            return ObjectPath.has(this.shBridge.getSocket().zationSocketVariables,path);
        }
        else {
            throw new MethodIsNotCompatible(this.getProtocol(),'ws');
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
     * @throws MethodIsNotCompatible
     */
    getSocketVariable<R>(path ?: string | string[]) : R
    {
        if(this.shBridge.isWebSocket()) {
            return ObjectPath.get(this.shBridge.getSocket().zationSocketVariables,path);
        }
        else {
            throw new MethodIsNotCompatible(this.getProtocol(),'ws');
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
     * @throws MethodIsNotCompatible
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
            throw new MethodIsNotCompatible(this.getProtocol(),'ws');
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
     * @throws AuthenticationError
     */
    async authenticate(authUserGroup : string,userId ?: string | number,tokenVariables ?: object) : Promise<void> {
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
     * Returns true if the server is using authentication.
     */
    isUseAuth() : boolean {
        return this.authEngine.isUseAuth();
    }

    //Part Cookie

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Get cookie variable.
     * Requires http request!
     * @throws MethodIsNotCompatible
     * @param key
     */
    getCookieVariable<R>(key : string) : R
    {
        if(this.shBridge.isWebSocket()) {
            throw new MethodIsNotCompatible(this.getProtocol(),'http');
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
     * @throws MethodIsNotCompatible
     * @param key
     * @param value
     * @param settings
     */
    setCookieVariable(key : string,value : any,settings  : object= { maxAge: 900000}) : void
    {
        if(this.shBridge.isWebSocket()) {
            throw new MethodIsNotCompatible(this.getProtocol(),'http');
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
     * @throws MethodIsNotCompatible
     * @param key
     */
    clearCookie(key : string) : void
    {
        if(this.shBridge.isWebSocket()) {
            throw new MethodIsNotCompatible(this.getProtocol(),'http');
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
     * @throws MethodIsNotCompatible
     */
    getHttpResponse() : core.Response {
        if(this.shBridge.isWebSocket()) {
            throw new MethodIsNotCompatible(this.getProtocol(),'http');
        }
        else {
            return this.shBridge.getResponse();
        }
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Return the http request.
     * @throws MethodIsNotCompatible
     */
    getHttpRequest() : core.Request {
        if(this.shBridge.isWebSocket()) {
            throw new MethodIsNotCompatible(this.getProtocol(),'http');
        }
        else {
            return this.shBridge.getRequest();
        }
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Return the http method.
     * @throws MethodIsNotCompatible
     */
    getHttpMethod() : string {
        if(this.shBridge.isWebSocket()) {
            throw new MethodIsNotCompatible(this.getProtocol(),'http');
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
     * @throws MethodIsNotCompatible
     */
    getHttpFiles() : Record<string,UploadedFile> {
        if(this.shBridge.isWebSocket()) {
            throw new MethodIsNotCompatible(this.getProtocol(),'http');
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
     * @throws MethodIsNotCompatible
     */
    getHttpBody() : Record<string,any>
    {
        if(this.shBridge.isWebSocket()) {
            throw new MethodIsNotCompatible(this.getProtocol(),'http');
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

    //Part Token Variable
    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Set a token variable with object path.
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
     * @throws AuthenticationError
     */
    async setTokenVariable(path : string | string[],value : any) : Promise<void> {
        if(this.shBridge.getTokenBridge().hasToken()) {
            const ctv = this.tokenEngine.getCustomTokenVariable();
            ObjectPath.set(ctv,path,value);
            await this.tokenEngine.setCustomTokenVariable(ctv);
        }
        else {
            throw new AuthenticationError(`Can't set token variable when socket is not authenticated!`);
        }
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Delete a token variable with object path.
     * Notice that the token variables are separated from the main zation token variables.
     * You can access this variables on client and server side.
     * But only change, delete or set on the server.
     * Check that the socket is authenticated (has a token).
     * @example
     * await deleteTokenVariable('person.email');
     * @param path
     * The path to the variable, you can split the keys with a dot or an string array.
     * @throws AuthenticationError
     */
    async deleteTokenVariable(path ?: string | string[]) : Promise<void> {
        if(this.shBridge.getTokenBridge().hasToken()) {
            if(!!path) {
                const ctv = this.tokenEngine.getCustomTokenVariable();
                ObjectPath.del(ctv,path);
                await this.tokenEngine.setCustomTokenVariable(ctv);
            }
            else {
                await this.tokenEngine.setCustomTokenVariable({});
            }
        }
        else {
            throw new AuthenticationError(`Can't set token variable when socket is not authenticated!`);
        }
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Sequence edit the token variables.
     * Useful if you want to make several changes.
     * This will do everything in one and saves performance.
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
     * @throws AuthenticationError
     */
    seqEditTokenVariables() : ObjectPathSequence
    {
        if(this.shBridge.getTokenBridge().hasToken()) {
            return new ObjectPathSequence(this.tokenEngine.getCustomTokenVariable(),
                async (obj)=> {
                    await  this.tokenEngine.setCustomTokenVariable(obj);
                });
        }
        else {
            throw new AuthenticationError(`Can't set token variable when socket is not authenticated!`);
        }
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
     * @throws AuthenticationError
     */
    hasTokenVariable(path ?: string | string[]) : boolean {
        if(this.shBridge.getTokenBridge().hasToken()) {
            return ObjectPath.has(this.tokenEngine.getCustomTokenVariable(),path);
        }
        else {
            throw new AuthenticationError(`Can't access token variable when socket is not authenticated!`);
        }
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
     * @throws AuthenticationError
     */
    getTokenVariable<R>(path ?: string | string[]) : R {
        if(this.shBridge.getTokenBridge().hasToken()) {
            return ObjectPath.get(this.tokenEngine.getCustomTokenVariable(),path);
        }
        else {
            throw new AuthenticationError(`Can't access token variable when socket is not authenticated!`);
        }
    }

    //Part Token

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns token id of the token form the socket.
     * @throws AuthenticationError
     */
    getTokenId() : string
    {
        if(this.shBridge.getTokenBridge().hasToken()){
            return this.shBridge.getTokenBridge().getPlainToken().zationTokenId;
        }
        else {
            throw new AuthenticationError(`Can't access token variable when socket is not authenticated!`);
        }
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the expire of the token from the socket.
     * @throws AuthenticationError
     */
    getTokenExpire() : number
    {
        if(this.shBridge.getTokenBridge().hasToken()){
            return this.shBridge.getTokenBridge().getPlainToken().exp;
        }
        else {
            throw new AuthenticationError(`Can't access token variable when socket is not authenticated!`);
        }
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the panel access of the token from the socket.
     * @throws AuthenticationError
     */
    getPanelAccess() : boolean
    {
        if(this.shBridge.getTokenBridge().hasToken()){
            return !!this.shBridge.getTokenBridge().getPlainToken().zationPanelAccess;
        }
        else {
            throw new AuthenticationError(`Can't access token variable when socket is not authenticated!`);
        }
    }

    //Part Socket
    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the socket id of the current socket.
     * Requires ws request!
     * @throws MethodIsNotCompatible
     */
    getSocketId() : string
    {
        if(this.shBridge.isWebSocket) {
            return this.shBridge.getSocket().id;
        }
        else {
            throw new MethodIsNotCompatible(this.getProtocol(),'ws');
        }
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the socket sid of the current socket.
     * The sid is unique in scalable process.
     * Requires ws request!
     * @throws MethodIsNotCompatible
     */
    getSocketSid() : string
    {
        if(this.shBridge.isWebSocket) {
            return this.shBridge.getSocket().sid;
        }
        else {
            throw new MethodIsNotCompatible(this.getProtocol(),'ws');
        }
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the socket.
     * @throws MethodIsNotCompatible
     */
    getSocket() : Socket {
        if(this.shBridge.isWebSocket) {
            return this.shBridge.getSocket();
        }
        else {
            throw new MethodIsNotCompatible(this.getProtocol(),'ws');
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
     * @desc Require web socket request!
     * @throws Error,MethodIsNotCompatible
     * @param eventName
     * @param data
     */
    async emitToSocket(eventName : string,data : any) : Promise<object>
    {
        return await this.channelEngine.emitToSocket(eventName,data);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the current channel subscriptions of the socket.
     * Requires ws request!
     * @throws MethodIsNotCompatible
     */
    getSubChannels() : string[]
    {
        if(this.shBridge.isWebSocket) {
            return this.channelEngine.getSubChannels();
        }
        else {
            throw new MethodIsNotCompatible(this.getProtocol(),'ws');
        }
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Kick the current socket from an custom id channel.
     * @example
     * kickFromCustomIdCh('images','10');
     * kickFromCustomIdCh('messageStreams');
     * @param name
     * @param id if it is not provided the socket will be kicked from all ids.
     * @throws MethodIsNotCompatible
     */
    kickFromCustomIdCh(name : string,id : string = '') : void
    {
        if(this.shBridge.isWebSocket) {
            this.channelEngine.kickCustomIdChannel(name,id);
        }
        else {
            throw new MethodIsNotCompatible(this.getProtocol(),'ws');
        }
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Kick the current socket from an custom channel.
     * @example
     * kickFromCustomCh('stream');
     * @param name
     * @throws MethodIsNotCompatible
     */
    kickFromCustomCh(name : string) : void
    {
        if(this.shBridge.isWebSocket) {
            this.channelEngine.kickCustomChannel(name);
        }
        else {
            throw new MethodIsNotCompatible(this.getProtocol(),'ws');
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
     * Publish to an user channel or channels.
     * @example
     * publishToUser('paul10','message',{message : 'hello',fromUserId : 'luca34'});
     * publishToUser(['paul10','lea1'],'message',{message : 'hello',fromUserId : 'luca34'});
     * @param userId or more userIds in array.
     * @param eventName
     * @param data
     * @param srcSocketSid
     * If this param is undefined and request is webSocket, the id of the current socket is used.
     * If it is null, will be published anonymously.
     */
    async publishToUser(userId : string | number | (number|string)[],eventName :string,data : object = {},srcSocketSid ?: string | null) : Promise<void>
    {
        const socketInfo = this.shBridge.isWebSocket() ? this.shBridge.getSocket().socketInfo : undefined;
        return await this.exchangeEngine.publishInUserCh
        (userId,eventName,data,this._processSrcSocketSid(srcSocketSid),socketInfo);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Publish to an user channel or channels.
     * @example
     * pubUser('paul10','message',{message : 'hello',fromUserId : 'luca34'});
     * pubUser(['paul10','lea1'],'message',{message : 'hello',fromUserId : 'luca34'});
     * @param userId or more userIds in array.
     * @param eventName
     * @param data
     * @param srcSocketSid
     * If this param is undefined and request is webSocket, the id of the current socket is used.
     * If it is null, will be published anonymously.
     */
    async pubUser(userId : string | number | (number|string)[],eventName :string,data : object = {},srcSocketSid ?: string | null) : Promise<void>
    {
        return await this.publishToUser(userId,eventName,data,srcSocketSid);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Publish to all channel.
     * @example
     * publishToAll('message',{message : 'hello'});
     * @param eventName
     * @param data
     * @param srcSocketSid
     * If this param is undefined and request is webSocket, the id of the current socket is used.
     * If it is null, will be published anonymously.
     */
    async publishToAll(eventName : string,data : object = {},srcSocketSid ?: string | null) : Promise<void>
    {
        const socketInfo = this.shBridge.isWebSocket() ? this.shBridge.getSocket().socketInfo : undefined;
        return await this.exchangeEngine.publishInAllCh
        (eventName,data,this._processSrcSocketSid(srcSocketSid),socketInfo);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Publish to all channel.
     * @example
     * pubAll('message',{message : 'hello'});
     * @param eventName
     * @param data
     * @param srcSocketSid
     * If this param is undefined and request is webSocket, the id of the current socket is used.
     * If it is null, will be published anonymously.
     */
    async pubAll(eventName : string,data : object = {},srcSocketSid ?: string | null) : Promise<void>
    {
        return await this.publishToAll(eventName,data,srcSocketSid);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Publish to auth user group or groups.
     * @example
     * publishToAuthUserGroup('admin','userRegistered',{userId : '1'});
     * publishToAuthUserGroup(['admin','superAdmin'],'userRegistered',{userId : '1'});
     * @param authUserGroup or an array of auth user groups.
     * @param eventName
     * @param data
     * @param srcSocketSid
     * If this param is undefined and request is webSocket, the id of the current socket is used.
     * If it is null, will be published anonymously.
     */
    async publishToAuthUserGroup(authUserGroup : string | string[], eventName : string, data : object = {},srcSocketSid ?: string | null) : Promise<void>
    {
        const socketInfo = this.shBridge.isWebSocket() ? this.shBridge.getSocket().socketInfo : undefined;
        return await this.exchangeEngine.publishInAuthUserGroupCh
        (authUserGroup,eventName,data,this._processSrcSocketSid(srcSocketSid),socketInfo);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Publish to auth user group or groups.
     * @example
     * pubAuthUserGroup('admin','userRegistered',{userId : '1'});
     * pubAuthUserGroup(['admin','superAdmin'],'userRegistered',{userId : '1'});
     * @param authUserGroup or an array of auth user groups.
     * @param eventName
     * @param data
     * @param srcSocketSid
     * If this param is undefined and request is webSocket, the id of the current socket is used.
     * If it is null, will be published anonymously.
     */
    async pubAuthUserGroup(authUserGroup : string | string[], eventName : string, data : object = {},srcSocketSid ?: string | null) : Promise<void>
    {
        return await this.publishToAuthUserGroup(authUserGroup,eventName,data,srcSocketSid);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Publish to default user group.
     * @example
     * publishToDefaultUserGroup('message',{message : 'hello'});
     * @param eventName
     * @param data
     * @param srcSocketSid
     * If this param is undefined and request is webSocket, the id of the current socket is used.
     * If it is null, will be published anonymously.
     */
    async publishToDefaultUserGroup(eventName : string, data : object = {},srcSocketSid ?: string | null) : Promise<void>
    {
        const socketInfo = this.shBridge.isWebSocket() ? this.shBridge.getSocket().socketInfo : undefined;
        return await this.exchangeEngine.publishInDefaultUserGroupCh
        (eventName,data,this._processSrcSocketSid(srcSocketSid),socketInfo);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Publish to default user group.
     * @example
     * pubDefaultUserGroup('message',{message : 'hello'});
     * @param eventName
     * @param data
     * @param srcSocketSid
     * If this param is undefined and request is webSocket, the id of the current socket is used.
     * If it is null, will be published anonymously.
     */
    async pubDefaultUserGroup(eventName : string, data : object = {},srcSocketSid ?: string | null) : Promise<void>
    {
        return await this.publishToDefaultUserGroup(eventName,data,srcSocketSid);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Publish in all auth user groups.
     * @example
     * publishToAllAuthUserGroups('message',{fromUserId : '1',message : 'hello'});
     * @param eventName
     * @param data
     * @param srcSocketSid
     * If this param is undefined and request is webSocket, the id of the current socket is used.
     * If it is null, will be published anonymously.
     */
    async publishToAllAuthUserGroups(eventName : string, data : object = {},srcSocketSid ?: string | null) : Promise<void>
    {
        const socketInfo = this.shBridge.isWebSocket() ? this.shBridge.getSocket().socketInfo : undefined;
        return await this.exchangeEngine.publishToAllAuthUserGroupCh
        (eventName,data,this.zc,this._processSrcSocketSid(srcSocketSid),socketInfo);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Publish in all auth user groups.
     * @example
     * pubAllAuthUserGroups('message',{fromUserId : '1',message : 'hello'});
     * @param eventName
     * @param data
     * @param srcSocketSid
     * If this param is undefined and request is webSocket, the id of the current socket is used.
     * If it is null, will be published anonymously.
     */
    async pubAllAuthUserGroups(eventName : string, data : object = {},srcSocketSid ?: string | null) : Promise<void>
    {
        return await this.publishToAllAuthUserGroups(eventName,data,srcSocketSid);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Publish in an custom id Channel.
     * @example
     * publishToCustomIdChannel('imageChannel','image2','like',{fromUserId : '1'});
     * @param channel
     * @param id
     * @param eventName
     * @param data
     * @param srcSocketSid
     * If this param is undefined and request is webSocket, the id of the current socket is used.
     * If it is null, will be published anonymously.
     */
    async publishToCustomIdChannel(channel : string, id : string, eventName : string, data : object = {},srcSocketSid ?: string | null) : Promise<void>
    {
        const socketInfo = this.shBridge.isWebSocket() ? this.shBridge.getSocket().socketInfo : undefined;
        return await this.exchangeEngine.publishToCustomIdChannel
        (channel,id,eventName,data,this._processSrcSocketSid(srcSocketSid),socketInfo);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Publish in an custom id Channel.
     * @example
     * pubCustomIdChannel('imageChannel','image2','like',{fromUserId : '1'});
     * @param channel
     * @param id
     * @param eventName
     * @param data
     * @param srcSocketSid
     * If this param is undefined and request is webSocket, the id of the current socket is used.
     * If it is null, will be published anonymously.
     */
    async pubCustomIdChannel(channel : string, id : string, eventName : string, data : object = {},srcSocketSid ?: string | null) : Promise<void>
    {
        return await this.publishToCustomIdChannel(channel,id,eventName,data,srcSocketSid);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Publish in an custom channel.
     * @example
     * publishToCustomChannel('messageChannel','message',{message : 'hello',fromUserId : '1'});
     * publishToCustomChannel(['messageChannel','otherChannel'],'message',{message : 'hello',fromUserId : '1'});
     * @param channel or an array of channels.
     * @param eventName
     * @param data
     * @param srcSocketSid
     * If this param is undefined and request is webSocket, the id of the current socket is used.
     * If it is null, will be published anonymously.
     */
    async publishToCustomChannel(channel : string | string[], eventName : string, data : object = {},srcSocketSid ?: string | null) : Promise<void>
    {
        const socketInfo = this.shBridge.isWebSocket() ? this.shBridge.getSocket().socketInfo : undefined;
        return this.exchangeEngine.publishToCustomChannel
        (channel,eventName,data,this._processSrcSocketSid(srcSocketSid),socketInfo);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Publish in an custom channel or channels.
     * @example
     * pubCustomChannel('messageChannel','message',{message : 'hello',fromUserId : '1'});
     * pubCustomChannel(['messageChannel','otherChannel'],'message',{message : 'hello',fromUserId : '1'});
     * @param channel or an array of channels.
     * @param eventName
     * @param data
     * @param srcSocketSid
     * If this param is undefined and request is webSocket, the id of the current socket is used.
     * If it is null, will be published anonymously.
     */
    async pubCustomChannel(channel : string | string[], eventName : string, data : object = {},srcSocketSid ?: string | null) : Promise<void>
    {
        return await this.publishToCustomChannel(channel,eventName,data,srcSocketSid);
    }

    private _processSrcSocketSid(srcSocketSid : string | null | undefined) : undefined | string {
        return !!srcSocketSid ? srcSocketSid : (srcSocketSid === null || !this.isWs() ? undefined : this.getSocketSid());
    }
}

