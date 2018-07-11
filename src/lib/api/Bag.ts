/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import ChannelEngine = require('./../helper/channel/channelEngine');
import SmallBag      = require('./SmallBag');
import SHBridge      = require("../helper/bridges/shBridge");
import AuthEngine    = require("../helper/auth/authEngine");
import TokenEngine = require("../helper/token/tokenEngine");
import InputWrapper = require("../helper/tools/inputWrapper");
import ZationWorker = require("../main/zationWorker");

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
    getInput(path)
    {
        return this.inputWrapper.getInput(path);
    }

    // noinspection JSUnusedGlobalSymbols
    isInput(path)
    {
        return this.inputWrapper.getInput(path) !== undefined;
    }

    //Part Auth 2

    // noinspection JSUnusedGlobalSymbols
    isAuth()
    {
        return this.authEngine.isAuth();
    }

    // noinspection JSUnusedGlobalSymbols
    getAuthUserGroup()
    {
        return this.authEngine.getAuthUserGroup();
    }

    // noinspection JSUnusedGlobalSymbols
    getUserGroup()
    {
        return this.authEngine.getUserGroup();
    }

    // noinspection JSUnusedGlobalSymbols
    async authTo(userGroup,userId,clientData = {})
    {
        await this.authEngine.authTo(userGroup,userId,clientData);
    }

    // noinspection JSUnusedGlobalSymbols
    async setUserId(id)
    {
        await this.authEngine.setUserId(id);
    }

    // noinspection JSUnusedGlobalSymbols
    getUserId()
    {
        this.authEngine.getUserId();
    }

    // noinspection JSUnusedGlobalSymbols
    async authOut()
    {
        await this.authEngine.authOut();
    }

    // noinspection JSUnusedGlobalSymbols
    getAuthEngine()
    {
        return this.authEngine;
    }

    // noinspection JSUnusedGlobalSymbols
    isDefault()
    {
        return this.authEngine.isDefault();
    }

    // noinspection JSUnusedGlobalSymbols
    isUseAuth()
    {
        return this.authEngine.isUseAuth();
    }

    //Part Cookie

    // noinspection JSUnusedGlobalSymbols
    getCookieVariable(key)
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
    setCookieVariable(key,value,settings = { maxAge: 900000})
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
    clearCookie(key)
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
    getResponse()
    {
        return this.shBridge.getResponse();
    }

    // noinspection JSUnusedGlobalSymbols
    getRequest()
    {
        return this.shBridge.getRequest();
    }

    //Part Token

    // noinspection JSUnusedGlobalSymbols
    async setTokenVariable(key,value)
    {
        return await this.tokenEngine.setTokenVariable({key : value},false);
    }

    // noinspection JSUnusedGlobalSymbols
    getTokenVariable(key)
    {
        return this.tokenEngine.getTokenVariable(key);
    }

    //Part Socket

    // noinspection JSUnusedGlobalSymbols
    getSocketId()
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
    getProtocol()
    {
        return this.authEngine.getProtocol();
    }

    // noinspection JSUnusedGlobalSymbols
    isSocketProtocol()
    {
        return this.shBridge.isWebSocket();
    }

    //Part Socket Channel

    // noinspection JSUnusedGlobalSymbols
    emitToThisClient(eventName,data,cb)
    {
        return this.channelEngine.emitToSocket(eventName,data,cb);
    }

    // noinspection JSUnusedGlobalSymbols
    getSubChannels()
    {
        return this.channelEngine.getSubChannels();
    }

    // noinspection JSUnusedGlobalSymbols
    kickFromCustomIdCh(name,id = '')
    {
        return this.channelEngine.kickCustomIdChannel(name,id);
    }

    // noinspection JSUnusedGlobalSymbols
    kickFromCustomCh(name)
    {
        return this.channelEngine.kickCustomChannel(name);
    }

    //Part Remote Address

    // noinspection JSUnusedGlobalSymbols
    getRemoteAddress()
    {
        return this.shBridge.getRemoteAddress();
    }
}

export = Bag;