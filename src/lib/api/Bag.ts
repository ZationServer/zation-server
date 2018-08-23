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
import InputWrapper  = require("../helper/tools/inputWrapper");
import ZationWorker  = require("../main/zationWorker");
import Const         = require("../helper/constants/constWrapper");
import ObjectPath = require("../helper/tools/objectPath");
import {relativeTimeRounding} from "moment";

class Bag extends SmallBag
{
    private bagVariables : ObjectPath;
    private readonly shBridge : SHBridge;
    private readonly authEngine : AuthEngine;
    private readonly channelEngine : ChannelEngine;
    private readonly tokenEngine : TokenEngine;
    private readonly inputWrapper : InputWrapper;

    constructor(shBridge : SHBridge,worker : ZationWorker,authEngine : AuthEngine,tokenEngine : TokenEngine,inputWrapper : InputWrapper,channelEngine : ChannelEngine = new ChannelEngine(worker.scServer,shBridge))
    {
        super(worker,channelEngine);

        this.bagVariables = new ObjectPath({});
        this.shBridge = shBridge;
        this.authEngine = authEngine;
        this.channelEngine = channelEngine;
        this.tokenEngine = tokenEngine;
        this.inputWrapper = inputWrapper;
    }

    //Part Bag Variable

    // noinspection JSUnusedGlobalSymbols
    setBagVariable(path : string | string[],value : any,overwrite : boolean = true) : boolean {
        return this.bagVariables.set(path,value,overwrite);
    }

    // noinspection JSUnusedGlobalSymbols
    hasBagVariable(path ?: string | string[]) : boolean {
        return this.bagVariables.has(path);
    }

    // noinspection JSUnusedGlobalSymbols
    getBagVariable(path ?: string | string[]) : any {
        return this.bagVariables.get(path);
    }

    // noinspection JSUnusedGlobalSymbols
    deleteBagVariables(path ?: string | string[]) : void {
        this.bagVariables.delete(path);
    }

    //Part Input

    // noinspection JSUnusedGlobalSymbols
    getInput(path ?: string | string[]) : any
    {
        return this.inputWrapper.getInput(path);
    }

    // noinspection JSUnusedGlobalSymbols
    hasInput(path: string | string[]) : boolean
    {
        return this.inputWrapper.hasInput(path);
    }

    //Part ServerSocketVariable

    // noinspection JSUnusedGlobalSymbols
    setSocketVariable(path : string | string[],value : any,overwrite : boolean = true) : boolean
    {
        if(this.shBridge.isWebSocket() && this.shBridge.getSocket().zationSocketVariables instanceof ObjectPath) {
            return this.shBridge.getSocket().zationSocketVariables.set(path,value,overwrite);
        }
        else {
            return false;
        }
    }

    // noinspection JSUnusedGlobalSymbols
    hasSocketVariable(path ?: string | string[]) : boolean
    {
        if(this.shBridge.isWebSocket() && this.shBridge.getSocket().zationSocketVariables instanceof ObjectPath) {
            return this.shBridge.getSocket().zationSocketVariables.has(path);
        }
        else {
            return false;
        }
    }

    // noinspection JSUnusedGlobalSymbols
    getSocketVariable(path ?: string | string[]) : any
    {
        if(this.shBridge.isWebSocket() && this.shBridge.getSocket().zationSocketVariables instanceof ObjectPath) {
            return this.shBridge.getSocket().zationSocketVariables.get(path);
        }
        else {
            return undefined;
        }
    }

    // noinspection JSUnusedGlobalSymbols
    emptySocketVariables() : boolean
    {
        if(this.shBridge.isWebSocket() && this.shBridge.getSocket().zationSocketVariables instanceof ObjectPath) {
            this.shBridge.getSocket().zationSocketVariables.setObj({});
            return true;
        }
        else {
            return false;
        }
    }

    //Part Auth 2

    // noinspection JSUnusedGlobalSymbols
    isAuth() : boolean
    {
        return this.authEngine.isAuth();
    }

    // noinspection JSUnusedGlobalSymbols
    getAuthUserGroup() : string | undefined
    {
        return this.authEngine.getAuthUserGroup();
    }

    // noinspection JSUnusedGlobalSymbols
    getUserGroup() : string | undefined
    {
        return this.authEngine.getUserGroup();
    }

    // noinspection JSUnusedGlobalSymbols
    async authTo(userGroup : string,userId ?: string | number,clientData : object= {}) : Promise<void>
    {
        await this.authEngine.authTo(userGroup,userId,clientData);
    }

    // noinspection JSUnusedGlobalSymbols
    async setUserId(id : string | number) : Promise<void>
    {
        await this.authEngine.setUserId(id);
    }

    // noinspection JSUnusedGlobalSymbols
    getUserId() : number | string
    {
        return this.authEngine.getUserId();
    }

    // noinspection JSUnusedGlobalSymbols
    async authOut() : Promise<void>
    {
        await this.authEngine.authOut();
    }

    // noinspection JSUnusedGlobalSymbols
    getAuthEngine() : AuthEngine
    {
        return this.authEngine;
    }

    // noinspection JSUnusedGlobalSymbols
    isDefault() : boolean
    {
        return this.authEngine.isDefault();
    }

    // noinspection JSUnusedGlobalSymbols
    isUseAuth() : boolean
    {
        return this.authEngine.isUseAuth();
    }

    //Part Cookie

    // noinspection JSUnusedGlobalSymbols
    getCookieVariable(key : string) : any
    {
        if(this.shBridge.isWebSocket())
        {
            return undefined;
        }
        else
        {
            return this.shBridge.getResponse().cookies[key];
        }
    }

    // noinspection JSUnusedGlobalSymbols
    setCookieVariable(key : string,value : any,settings  : object= { maxAge: 900000}) : boolean
    {
        if(this.shBridge.isWebSocket())
        {
            return false;
        }
        else
        {
            this.shBridge.getResponse().cookie(key,value,settings);
            return true;
        }
    }

    // noinspection JSUnusedGlobalSymbols
    clearCookie(key : string) : boolean
    {
        if(this.shBridge.isWebSocket())
        {
            return false;
        }
        else
        {
            this.shBridge.getResponse().clearCookie(key);
            return true;
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
    async setTokenVariable(key : string,value : any) : Promise<boolean>
    {
        return await this.tokenEngine.setTokenVariable({key : value},false);
    }

    // noinspection JSUnusedGlobalSymbols
    getTokenVariable(key : string) : any
    {
        return this.tokenEngine.getTokenVariable(key);
    }

    //Part Token

    // noinspection JSUnusedGlobalSymbols
    getTokenId() : string
    {
        return this.tokenEngine.getTokenVariable(Const.Settings.CLIENT.TOKEN_ID);
    }

    // noinspection JSUnusedGlobalSymbols
    getTokenExpire() : string
    {
        return this.tokenEngine.getTokenVariable(Const.Settings.CLIENT.EXPIRE);
    }

    // noinspection JSUnusedGlobalSymbols
    hasToken() : boolean
    {
        return this.shBridge.getTokenBridge().getToken() !==  undefined;
    }

    //Part Socket
    // noinspection JSUnusedGlobalSymbols
    getSocketId() : string | undefined
    {
        if(this.shBridge.isWebSocket) {
            return this.shBridge.getSocket().id;
        }
        else {
            return undefined;
        }
    }

    // noinspection JSUnusedGlobalSymbols
    getSocket()
    {
        return this.shBridge.getSocket();
    }

    // noinspection JSUnusedGlobalSymbols
    getScServer()
    {
        return this.worker.scServer;
    }

    //Part Protocol

    // noinspection JSUnusedGlobalSymbols
    getProtocol() : string
    {
        return this.authEngine.getProtocol();
    }

    // noinspection JSUnusedGlobalSymbols
    isSocketProtocol() : boolean
    {
        return this.shBridge.isWebSocket();
    }

    //Part Socket

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Emit to socket, the return value is an promises with the result.
     * If this method is used in an http request, an error is thrown.
     * If an error occurs while emitting to socket, this error is also thrown.
     * @throws Error
     * @param eventName
     * @param data
     */
    async emitToSocket(eventName : string,data : any) : Promise<object>
    {
        return await this.channelEngine.emitToSocket(eventName,data);
    }

    // noinspection JSUnusedGlobalSymbols
    getSubChannels() : string[] | undefined
    {
        return this.channelEngine.getSubChannels();
    }

    // noinspection JSUnusedGlobalSymbols
    kickFromCustomIdCh(name : string,id : string = '') : void
    {
        this.channelEngine.kickCustomIdChannel(name,id);
    }

    // noinspection JSUnusedGlobalSymbols
    kickFromCustomCh(name : string) : void
    {
        this.channelEngine.kickCustomChannel(name);
    }

    //Part Remote Address

    // noinspection JSUnusedGlobalSymbols
    getRemoteAddress() : string
    {
        return this.shBridge.getRemoteAddress();
    }

    //Part new publish overwrite (with src)

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Publish to an user channel or channels
     * @example
     * publishToUser('paul10','message',{message : 'hello',fromUserId : 'luca34'});
     * publishToUser(['paul10','lea1'],'message',{message : 'hello',fromUserId : 'luca34'});
     * @param userId or more userIds in array
     * @param eventName
     * @param data
     * @param srcSocketId
     * If this param is undefined and request is webSocket, the id of the current socket is used.
     * If it is null, will be published anonymously.
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
     * @example
     * pubUser('paul10','message',{message : 'hello',fromUserId : 'luca34'});
     * pubUser(['paul10','lea1'],'message',{message : 'hello',fromUserId : 'luca34'});
     * @param userId or more userIds in array
     * @param eventName
     * @param data
     * @param srcSocketId
     * If this param is undefined and request is webSocket, the id of the current socket is used.
     * If it is null, will be published anonymously.
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
     * @example
     * publishToAll('message',{message : 'hello'});
     * @param eventName
     * @param data
     * @param srcSocketId
     * If this param is undefined and request is webSocket, the id of the current socket is used.
     * If it is null, will be published anonymously.
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
     * @example
     * pubAll('message',{message : 'hello'});
     * @param eventName
     * @param data
     * @param srcSocketId
     * If this param is undefined and request is webSocket, the id of the current socket is used.
     * If it is null, will be published anonymously.
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
     * publishToAuthUserGroup('admin','userRegistered',{userId : '1'});
     * publishToAuthUserGroup(['admin','superAdmin'],'userRegistered',{userId : '1'});
     * @param authUserGroup or an array of auth user groups
     * @param eventName
     * @param data
     * @param srcSocketId
     * If this param is undefined and request is webSocket, the id of the current socket is used.
     * If it is null, will be published anonymously.
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
     * @example
     * pubAuthUserGroup('admin','userRegistered',{userId : '1'});
     * pubAuthUserGroup(['admin','superAdmin'],'userRegistered',{userId : '1'});
     * @param authUserGroup or an array of auth user groups
     * @param eventName
     * @param data
     * @param srcSocketId
     * If this param is undefined and request is webSocket, the id of the current socket is used.
     * If it is null, will be published anonymously.
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
     * @example
     * publishToDefaultUserGroup('message',{message : 'hello'});
     * @param eventName
     * @param data
     * @param srcSocketId
     * If this param is undefined and request is webSocket, the id of the current socket is used.
     * If it is null, will be published anonymously.
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
     * @example
     * pubDefaultUserGroup('message',{message : 'hello'});
     * @param eventName
     * @param data
     * @param srcSocketId
     * If this param is undefined and request is webSocket, the id of the current socket is used.
     * If it is null, will be published anonymously.
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
     * @example
     * publishToAllAuthUserGroups('message',{fromUserId : '1',message : 'hello'});
     * @param eventName
     * @param data
     * @param srcSocketId
     * If this param is undefined and request is webSocket, the id of the current socket is used.
     * If it is null, will be published anonymously.
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
     * @example
     * pubAllAuthUserGroups('message',{fromUserId : '1',message : 'hello'});
     * @param eventName
     * @param data
     * @param srcSocketId
     * If this param is undefined and request is webSocket, the id of the current socket is used.
     * If it is null, will be published anonymously.
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
     * @example
     * publishToCustomIdChannel('imageChannel','image2','like',{fromUserId : '1'});
     * @param channel
     * @param id
     * @param eventName
     * @param data
     * @param srcSocketId
     * If this param is undefined and request is webSocket, the id of the current socket is used.
     * If it is null, will be published anonymously.
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
     * @example
     * pubCustomIdChannel('imageChannel','image2','like',{fromUserId : '1'});
     * @param channel
     * @param id
     * @param eventName
     * @param data
     * @param srcSocketId
     * If this param is undefined and request is webSocket, the id of the current socket is used.
     * If it is null, will be published anonymously.
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
     * @example
     * publishToCustomChannel('messageChannel','message',{message : 'hello',fromUserId : '1'});
     * publishToCustomChannel(['messageChannel','otherChannel'],'message',{message : 'hello',fromUserId : '1'});
     * @param channel or an array of channels
     * @param eventName
     * @param data
     * @param srcSocketId
     * If this param is undefined and request is webSocket, the id of the current socket is used.
     * If it is null, will be published anonymously.
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
     * @example
     * pubCustomChannel('messageChannel','message',{message : 'hello',fromUserId : '1'});
     * pubCustomChannel(['messageChannel','otherChannel'],'message',{message : 'hello',fromUserId : '1'});
     * @param channel or an array of channels
     * @param eventName
     * @param data
     * @param srcSocketId
     * If this param is undefined and request is webSocket, the id of the current socket is used.
     * If it is null, will be published anonymously.
     */
    async pubCustomChannel(channel : string | string[], eventName : string, data : object = {},srcSocketId ?: string | null) : Promise<void>
    {
        srcSocketId = !!srcSocketId ? srcSocketId : (srcSocketId === null ? undefined : this.getSocketId());
        return await this.publishToCustomChannel(channel,eventName,data,srcSocketId);
    }
}

export = Bag;