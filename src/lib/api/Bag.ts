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
import Const         = require("../helper/constants/constWrapper");
import ObjectPath    = require("../helper/tools/objectPath");
import MethodIsNotCompatible = require("../helper/error/methodIsNotCompatible");
import ObjectPathSequence    = require("../helper/tools/objectPathSequence");
import {Socket} from "../helper/socket/socket";

class Bag extends SmallBag
{
    private bagVariables : object;
    private readonly shBridge : SHBridge;
    private readonly authEngine : AuthEngine;
    private readonly channelEngine : ChannelEngine;
    private readonly tokenEngine : TokenEngine;
    private readonly input : object;

    constructor(shBridge : SHBridge,worker : ZationWorker,authEngine : AuthEngine,tokenEngine : TokenEngine,input : object,channelEngine : ChannelEngine = new ChannelEngine(worker.scServer,shBridge))
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
     * Set a bag variable with objectPath
     * @example
     * setBagVariable('my.variable','hello');
     * @param path
     * @param value
     */
    setBagVariable(path : string | string[],value : any) : void {
        ObjectPath.set(this.bagVariables,path,value);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Has a bag variable with objectPath
     * @example
     * hasBagVariable('my.variable');
     * @param path
     */
    hasBagVariable(path ?: string | string[]) : boolean {
        return ObjectPath.has(this.bagVariables,path);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Get a bag variable with objectPath
     * @example
     * getBagVariable('my.variable');
     * @param path
     */
    getBagVariable(path ?: string | string[]) : any {
        return ObjectPath.get(this.bagVariables,path);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Delete a bag variable with objectPath
     * @example
     * deleteBagVariable('my.variable');
     * deleteBagVariable(); //deletes all variables
     * @param path
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
     * Get input with object path
     * @example
     * getInput('person.name');
     * @param path
     */
    getInput(path ?: string | string[]) : any {
        return ObjectPath.get(this.input,path);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Has input with object path
     * @example
     * hasInput('person.name');
     * @param path
     */
    hasInput(path: string | string[]) : boolean {
        return ObjectPath.has(this.input,path);
    }

    //Part ServerSocketVariable

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Set socket variable (server side) with object path
     * Requires web socket request!
     * @example
     * setSocketVariable('email','example@gmail.com');
     * @param path
     * @param value
     * @throws MethodIsNotCompatible
     */
    setSocketVariable(path : string | string[],value : any) : void
    {
        if(this.shBridge.isWebSocket()) {
            ObjectPath.set(this.shBridge.getSocket()[Const.Settings.SOCKET.VARIABLES],path,value);
        }
        else {
            throw new MethodIsNotCompatible(this.getProtocol(),'ws');
        }
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Has socket variable (server side) with object path
     * Requires web socket request!
     * @example
     * hasSocketVariable('email');
     * @param path
     * @throws MethodIsNotCompatible
     */
    hasSocketVariable(path ?: string | string[]) : boolean
    {
        if(this.shBridge.isWebSocket()) {
            return ObjectPath.has(this.shBridge.getSocket()[Const.Settings.SOCKET.VARIABLES],path);
        }
        else {
            throw new MethodIsNotCompatible(this.getProtocol(),'ws');
        }
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Get socket variable (server side) with object path
     * Requires web socket request!
     * @example
     * getSocketVariable('email');
     * @param path
     * @throws MethodIsNotCompatible
     */
    getSocketVariable(path ?: string | string[]) : any
    {
        if(this.shBridge.isWebSocket()) {
            return ObjectPath.get(this.shBridge.getSocket()[Const.Settings.SOCKET.VARIABLES],path);
        }
        else {
            throw new MethodIsNotCompatible(this.getProtocol(),'ws');
        }
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Delete socket variable (server side) with object path
     * Requires web socket request!
     * @example
     * deleteSocketVariable('email');
     * @param path
     * @throws MethodIsNotCompatible
     */
    deleteSocketVariable(path ?: string | string[]) : void
    {
        if(this.shBridge.isWebSocket()) {
            if(!!path) {
                ObjectPath.del(this.shBridge.getSocket()[Const.Settings.SOCKET.VARIABLES],path);
            }
            else {
                this.shBridge.getSocket()[Const.Settings.SOCKET.VARIABLES] = {};
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
     * Returns if current socket is authenticated
     */
    isAuth() : boolean {
        return this.authEngine.isAuth();
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
     * The user group can be the default group or one of the auth groups
     */
    getUserGroup() : string | undefined {
        return this.authEngine.getUserGroup();
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Authenticate an socket.
     * This method will throw errors if the process fails
     * @example
     * await authenticate('user','tom12',{email : 'example@gmail.com'});
     * @param authUserGroup The authUserGroup must exist in the app.config. Otherwise an error will be thrown.
     * @param userId
     * @param tokenCustomVar If this parameter is used all previous variables will be deleted.
     * @throws AuthenticationError
     */
    async authenticate(authUserGroup : string,userId ?: string | number,tokenCustomVar ?: object) : Promise<void> {
        await this.authEngine.authenticate(authUserGroup,userId,tokenCustomVar);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Deauthenticate current socket.
     * The token will be rendered useless.
     * @example
     * await deauthenticate();
     */
    async deauthenticate() : Promise<void> {
        await this.authEngine.deauthenticate();
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Set the user id for this socket.
     * The method return true if the process is success.
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
     * Returns the user id of the current socket.
     */
    getUserId() : number | string | undefined {
        return this.authEngine.getUserId();
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
    isUseAuth() : boolean {
        return this.authEngine.isUseAuth();
    }

    //Part Cookie

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Get cookie variable
     * Requires http request!
     * @throws MethodIsNotCompatible
     * @param key
     */
    getCookieVariable(key : string) : any
    {
        if(this.shBridge.isWebSocket()) {
            throw new MethodIsNotCompatible(this.getProtocol(),'http');
        }
        else {
            return this.shBridge.getResponse().cookies[key];
        }
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Set cookie variable
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
     * Clear cookie variable
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
    getResponse() : Express.Response
    {
        return this.shBridge.getResponse();
    }

    // noinspection JSUnusedGlobalSymbols
    getRequest() : Express.Request
    {
        return this.shBridge.getRequest();
    }

    //Part Token Variable
    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Set a custom token variable with object path
     * You can access this variables on client and server side
     * @example
     * await setCustomTokenVar('person.email','example@gmail.com');
     * @param path
     * @param value
     */
    async setCustomTokenVar(path : string | string[],value : any) : Promise<void> {
        const ctv = this.tokenEngine.getCustomTokenVar();
        ObjectPath.set(ctv,path,value);
        await this.tokenEngine.setCustomTokenVar(ctv);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Delete a custom token variable with object path
     * You can access this variables on client and server side
     * @example
     * await deleteCustomTokenVar('person.email');
     * @param path
     */
    async deleteCustomTokenVar(path ?: string | string[]) : Promise<void> {
        if(!!path) {
            const ctv = this.tokenEngine.getCustomTokenVar();
            ObjectPath.del(ctv,path);
            await this.tokenEngine.setCustomTokenVar(ctv);
        }
        else {
            await this.tokenEngine.setCustomTokenVar({});
        }
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Sequence edit the custom token variables
     * Useful if you want to make several changes.
     * This will do everything in one and saves performance.
     * You can access this variables on client and server side
     * @example
     * await seqEditCustomTokenVar()
     *       .delete('person.lastName')
     *       .set('person.name','Luca')
     *       .set('person.email','example@gmail.com')
     *       .commit();
     */
    seqEditCustomTokenVar() : ObjectPathSequence
    {
        return new ObjectPathSequence(this.tokenEngine.getCustomTokenVar(),
            async (obj)=> {
            await  this.tokenEngine.setCustomTokenVar(obj);
        });
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
        return ObjectPath.has(this.tokenEngine.getCustomTokenVar(),path);
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
        return ObjectPath.get(this.tokenEngine.getCustomTokenVar(),path);
    }

    //Part Token

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns token id of the token form the socket.
     */
    getTokenId() : string | undefined
    {
        return this.tokenEngine.getTokenVariable(Const.Settings.CLIENT.TOKEN_ID);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the expire of the token from the socket.
     */
    getTokenExpire() : string | undefined
    {
        return this.tokenEngine.getTokenVariable(Const.Settings.CLIENT.EXPIRE);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Checks if the current request has a token.
     */
    hasToken() : boolean
    {
        return this.shBridge.getTokenBridge().getToken() !==  undefined;
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
    getSocket() : Socket {
        return this.shBridge.getSocket();
    }

    // noinspection JSUnusedGlobalSymbols
    getScServer() : any {
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
        return this.authEngine.getProtocol();
    }

    // noinspection JSUnusedGlobalSymbols
    isWebSocketProtocol() : boolean {
        return this.shBridge.isWebSocket();
    }

    // noinspection JSUnusedGlobalSymbols
    isHttpProtocol() : boolean {
        return !this.shBridge.isWebSocket();
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
     * If the request protocol is 'http' the method will be return undefined.
     * Requires ws request!
     */
    getSubChannels() : string[] | undefined
    {
        return this.channelEngine.getSubChannels();
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Kick the current socket from an custom id channel.
     * @example
     * kickFromCustomIdCh('images','10');
     * kickFromCustomIdCh('messageStreams');
     * @param name
     * @param id (if it is not provided the socket will be kicked from all ids)
     */
    kickFromCustomIdCh(name : string,id : string = '') : void
    {
        this.channelEngine.kickCustomIdChannel(name,id);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Kick the current socket from an custom channel.
     * @example
     * kickFromCustomCh('stream');
     * @param name
     */
    kickFromCustomCh(name : string) : void
    {
        this.channelEngine.kickCustomChannel(name);
    }

    //Part Remote Address

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the remote ip address from the current request.
     */
    getRemoteAddress() : string
    {
        return this.shBridge.getRemoteAddress();
    }

    //Part new publish overwrite (with src)

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Publish to an user channel or channels
     * If this param is undefined and request is webSocket, the id of the current socket is used.
     * If it is null, will be published anonymously.
     * @example
     * publishToUser('paul10','message',{message : 'hello',fromUserId : 'luca34'});
     * publishToUser(['paul10','lea1'],'message',{message : 'hello',fromUserId : 'luca34'});
     * @param userId or more userIds in array
     * @param eventName
     * @param data
     * @param srcSocketId
     */
    async publishToUser(userId : string | number | (number|string)[],eventName :string,data : object = {},srcSocketId ?: string | null) : Promise<void>
    {
        srcSocketId = !!srcSocketId ? srcSocketId : (srcSocketId === null ? undefined : this.getSocketId());
        return await this.exchangeEngine.publishInUserCh(userId,eventName,data,srcSocketId);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Publish to an user channel or channels
     * If this param is undefined and request is webSocket, the id of the current socket is used.
     * If it is null, will be published anonymously.
     * @example
     * pubUser('paul10','message',{message : 'hello',fromUserId : 'luca34'});
     * pubUser(['paul10','lea1'],'message',{message : 'hello',fromUserId : 'luca34'});
     * @param userId or more userIds in array
     * @param eventName
     * @param data
     * @param srcSocketId
     */
    async pubUser(userId : string | number | (number|string)[],eventName :string,data : object = {},srcSocketId ?: string | null) : Promise<void>
    {
        srcSocketId = !!srcSocketId ? srcSocketId : (srcSocketId === null ? undefined : this.getSocketId());
        return await this.publishToUser(userId,eventName,data,srcSocketId)
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Publish to all channel
     * If this param is undefined and request is webSocket, the id of the current socket is used.
     * If it is null, will be published anonymously.
     * @example
     * publishToAll('message',{message : 'hello'});
     * @param eventName
     * @param data
     * @param srcSocketId
     */
    async publishToAll(eventName : string,data : object = {},srcSocketId ?: string | null) : Promise<void>
    {
        srcSocketId = !!srcSocketId ? srcSocketId : (srcSocketId === null ? undefined : this.getSocketId());
        return await this.exchangeEngine.publishInAllCh(eventName,data,srcSocketId);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Publish to all channel
     * If this param is undefined and request is webSocket, the id of the current socket is used.
     * If it is null, will be published anonymously.
     * @example
     * pubAll('message',{message : 'hello'});
     * @param eventName
     * @param data
     * @param srcSocketId
     */
    async pubAll(eventName : string,data : object = {},srcSocketId ?: string | null) : Promise<void>
    {
        srcSocketId = !!srcSocketId ? srcSocketId : (srcSocketId === null ? undefined : this.getSocketId());
        return await this.publishToAll(eventName,data,srcSocketId);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Publish to auth user group or groups
     * If this param is undefined and request is webSocket, the id of the current socket is used.
     * If it is null, will be published anonymously.
     * @example
     * publishToAuthUserGroup('admin','userRegistered',{userId : '1'});
     * publishToAuthUserGroup(['admin','superAdmin'],'userRegistered',{userId : '1'});
     * @param authUserGroup or an array of auth user groups
     * @param eventName
     * @param data
     * @param srcSocketId
     */
    async publishToAuthUserGroup(authUserGroup : string | string[], eventName : string, data : object = {},srcSocketId ?: string | null) : Promise<void>
    {
        srcSocketId = !!srcSocketId ? srcSocketId : (srcSocketId === null ? undefined : this.getSocketId());
        return await this.exchangeEngine.publishInAuthUserGroupCh(authUserGroup,eventName,data,srcSocketId);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Publish to auth user group or groups
     * If this param is undefined and request is webSocket, the id of the current socket is used.
     * If it is null, will be published anonymously.
     * @example
     * pubAuthUserGroup('admin','userRegistered',{userId : '1'});
     * pubAuthUserGroup(['admin','superAdmin'],'userRegistered',{userId : '1'});
     * @param authUserGroup or an array of auth user groups
     * @param eventName
     * @param data
     * @param srcSocketId
     */
    async pubAuthUserGroup(authUserGroup : string | string[], eventName : string, data : object = {},srcSocketId ?: string | null) : Promise<void>
    {
        srcSocketId = !!srcSocketId ? srcSocketId : (srcSocketId === null ? undefined : this.getSocketId());
        return await this.publishToAuthUserGroup(authUserGroup,eventName,data,srcSocketId);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Publish to default user group
     * If this param is undefined and request is webSocket, the id of the current socket is used.
     * If it is null, will be published anonymously.
     * @example
     * publishToDefaultUserGroup('message',{message : 'hello'});
     * @param eventName
     * @param data
     * @param srcSocketId
     */
    async publishToDefaultUserGroup(eventName : string, data : object = {},srcSocketId ?: string | null) : Promise<void>
    {
        srcSocketId = !!srcSocketId ? srcSocketId : (srcSocketId === null ? undefined : this.getSocketId());
        return await this.exchangeEngine.publishInDefaultUserGroupCh(eventName,data,srcSocketId);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Publish to default user group
     * If this param is undefined and request is webSocket, the id of the current socket is used.
     * If it is null, will be published anonymously.
     * @example
     * pubDefaultUserGroup('message',{message : 'hello'});
     * @param eventName
     * @param data
     * @param srcSocketId
     */
    async pubDefaultUserGroup(eventName : string, data : object = {},srcSocketId ?: string | null) : Promise<void>
    {
        srcSocketId = !!srcSocketId ? srcSocketId : (srcSocketId === null ? undefined : this.getSocketId());
        return await this.publishToDefaultUserGroup(eventName,data,srcSocketId);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Publish in all auth user groups
     * If this param is undefined and request is webSocket, the id of the current socket is used.
     * If it is null, will be published anonymously.
     * @example
     * publishToAllAuthUserGroups('message',{fromUserId : '1',message : 'hello'});
     * @param eventName
     * @param data
     * @param srcSocketId
     */
    async publishToAllAuthUserGroups(eventName : string, data : object = {},srcSocketId ?: string | null) : Promise<void>
    {
        srcSocketId = !!srcSocketId ? srcSocketId : (srcSocketId === null ? undefined : this.getSocketId());
        return await this.exchangeEngine.publishToAllAuthUserGroupCh(eventName,data,this.zc,srcSocketId);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Publish in all auth user groups
     * If this param is undefined and request is webSocket, the id of the current socket is used.
     * If it is null, will be published anonymously.
     * @example
     * pubAllAuthUserGroups('message',{fromUserId : '1',message : 'hello'});
     * @param eventName
     * @param data
     * @param srcSocketId
     */
    async pubAllAuthUserGroups(eventName : string, data : object = {},srcSocketId ?: string | null) : Promise<void>
    {
        srcSocketId = !!srcSocketId ? srcSocketId : (srcSocketId === null ? undefined : this.getSocketId());
        return await this.publishToAllAuthUserGroups(eventName,data,srcSocketId);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Publish in an custom id Channel
     * If this param is undefined and request is webSocket, the id of the current socket is used.
     * If it is null, will be published anonymously.
     * @example
     * publishToCustomIdChannel('imageChannel','image2','like',{fromUserId : '1'});
     * @param channel
     * @param id
     * @param eventName
     * @param data
     * @param srcSocketId
     */
    async publishToCustomIdChannel(channel : string, id : string, eventName : string, data : object = {},srcSocketId ?: string | null) : Promise<void>
    {
        srcSocketId = !!srcSocketId ? srcSocketId : (srcSocketId === null ? undefined : this.getSocketId());
        return await this.exchangeEngine.publishToCustomIdChannel(channel,id,eventName,data,srcSocketId);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Publish in an custom id Channel
     * If this param is undefined and request is webSocket, the id of the current socket is used.
     * If it is null, will be published anonymously.
     * @example
     * pubCustomIdChannel('imageChannel','image2','like',{fromUserId : '1'});
     * @param channel
     * @param id
     * @param eventName
     * @param data
     * @param srcSocketId
     */
    async pubCustomIdChannel(channel : string, id : string, eventName : string, data : object = {},srcSocketId ?: string | null) : Promise<void>
    {
        srcSocketId = !!srcSocketId ? srcSocketId : (srcSocketId === null ? undefined : this.getSocketId());
        return await this.publishToCustomIdChannel(channel,id,eventName,data,srcSocketId);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Publish in an custom channel
     * If this param is undefined and request is webSocket, the id of the current socket is used.
     * If it is null, will be published anonymously.
     * @example
     * publishToCustomChannel('messageChannel','message',{message : 'hello',fromUserId : '1'});
     * publishToCustomChannel(['messageChannel','otherChannel'],'message',{message : 'hello',fromUserId : '1'});
     * @param channel or an array of channels
     * @param eventName
     * @param data
     * @param srcSocketId
     */
    async publishToCustomChannel(channel : string | string[], eventName : string, data : object = {},srcSocketId ?: string | null) : Promise<void>
    {
        srcSocketId = !!srcSocketId ? srcSocketId : (srcSocketId === null ? undefined : this.getSocketId());
        return this.exchangeEngine.publishToCustomChannel(channel,eventName,data,srcSocketId);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Publish in an custom channel or channels
     * If this param is undefined and request is webSocket, the id of the current socket is used.
     * If it is null, will be published anonymously.
     * @example
     * pubCustomChannel('messageChannel','message',{message : 'hello',fromUserId : '1'});
     * pubCustomChannel(['messageChannel','otherChannel'],'message',{message : 'hello',fromUserId : '1'});
     * @param channel or an array of channels
     * @param eventName
     * @param data
     * @param srcSocketId
     */
    async pubCustomChannel(channel : string | string[], eventName : string, data : object = {},srcSocketId ?: string | null) : Promise<void>
    {
        srcSocketId = !!srcSocketId ? srcSocketId : (srcSocketId === null ? undefined : this.getSocketId());
        return await this.publishToCustomChannel(channel,eventName,data,srcSocketId);
    }
}

export = Bag;