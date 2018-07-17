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

class Bag extends SmallBag
{
    private bagVariables : object;
    private readonly shBridge : SHBridge;
    private readonly authEngine : AuthEngine;
    private readonly channelEngine : ChannelEngine;
    private readonly tokenEngine : TokenEngine;
    private readonly inputWrapper : InputWrapper;

    constructor(shBridge : SHBridge,worker : ZationWorker,authEngine : AuthEngine,tokenEngine : TokenEngine,inputWrapper : InputWrapper,channelEngine : ChannelEngine = new ChannelEngine(worker.scServer,shBridge))
    {
        super(worker,channelEngine);

        this.bagVariables = {};
        this.shBridge = shBridge;
        this.authEngine = authEngine;
        this.channelEngine = channelEngine;
        this.tokenEngine = tokenEngine;
        this.inputWrapper = inputWrapper;
    }

    //Part Bag Variable

    // noinspection JSUnusedGlobalSymbols
    setBagVariable(key : string,value : any,overwrite : boolean = true) : void
    {
        if((this.bagVariables.hasOwnProperty(key) && overwrite)
        || !this.bagVariables.hasOwnProperty(key))
        {
            this.bagVariables[key] = value;
        }
    }

    // noinspection JSUnusedGlobalSymbols
    hasBagVariable(key : string) : boolean
    {
        return this.bagVariables.hasOwnProperty(key);
    }

    // noinspection JSUnusedGlobalSymbols
    getBagVariable(key : string) : any
    {
        return this.bagVariables[key];
    }

    // noinspection JSUnusedGlobalSymbols
    emptyBagVariable() : void
    {
        this.bagVariables = {};
    }

    //Part Input

    // noinspection JSUnusedGlobalSymbols
    getInput(path : string | string[]) : any
    {
        return this.inputWrapper.getInput(path);
    }

    // noinspection JSUnusedGlobalSymbols
    isInput(path: string | string[]) : boolean
    {
        return this.inputWrapper.getInput(path) !== undefined;
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

    //Part Token

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
        if(this.shBridge.isWebSocket)
        {
            return this.shBridge.getSocket().id;
        }
        else
        {
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

    //Part Socket Channel

    // noinspection JSUnusedGlobalSymbols
    emitToThisClient(eventName : string,data : object,cb ?: Function) : void
    {
        this.channelEngine.emitToSocket(eventName,data,cb);
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
}

export = Bag;