/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

const ChannelEngine = require('./../helper/channel/channelEngine');
const SmallBag      = require('./SmallBag');


class Bag extends SmallBag
{

    constructor(shBridge,worker,authEngine,tokenEngine,inputWrapper)
    {
        let channelEngine = new ChannelEngine(worker.scServer,shBridge,worker.getZationConfig());

        super(worker,channelEngine);

        this._bagVariables = {};

        this._shBridge = shBridge;
        this._authEngine = authEngine;
        this._channelEngine = channelEngine;
        this._tokenEngine = tokenEngine;
        this._inputWrapper = inputWrapper;
    }

    //Part Bag Variable

    // noinspection JSUnusedGlobalSymbols
    setBagVariable(key,value,overwrite = true)
    {
        if((this._bagVariables.hasOwnProperty(key) && overwrite)
        || !this._bagVariables.hasOwnProperty(key))
        {
            this._bagVariables[key] = value;
        }
    }

    // noinspection JSUnusedGlobalSymbols
    hasBagVariable(key)
    {
        return this._bagVariables.hasOwnProperty(key);
    }

    // noinspection JSUnusedGlobalSymbols
    getBagVariable(key)
    {
        return this._bagVariables[key];
    }

    //Part Input

    // noinspection JSUnusedGlobalSymbols
    getInput(path)
    {
        return this._inputWrapper.getInput(path);
    }

    // noinspection JSUnusedGlobalSymbols
    isInput(path)
    {
        return this._inputWrapper.getInput(path) !== undefined;
    }

    // noinspection JSUnusedGlobalSymbols
    isInputMissing()
    {
        return this._inputWrapper.isInputMissing();
    }

    //Part Auth 2

    // noinspection JSUnusedGlobalSymbols
    isAuth()
    {
        return this._authEngine.isAuth();
    }

    // noinspection JSUnusedGlobalSymbols
    getAuthUserGroup()
    {
        return this._authEngine.getAuthUserGroup();
    }

    // noinspection JSUnusedGlobalSymbols
    getUserGroup()
    {
        return this._authEngine.getUserGroup();
    }

    // noinspection JSUnusedGlobalSymbols
    async authTo(userGroup,userId,clientData = {})
    {
        await this._authEngine.authTo(userGroup,userId,clientData);
    }

    // noinspection JSUnusedGlobalSymbols
    async setUserId(id)
    {
        await this._authEngine.setUserId(id);
    }

    // noinspection JSUnusedGlobalSymbols
    getUserId()
    {
        this._authEngine.getUserId();
    }

    // noinspection JSUnusedGlobalSymbols
    async authOut()
    {
        await this._authEngine.authOut();
    }

    // noinspection JSUnusedGlobalSymbols
    getAuthEngine()
    {
        return this._authEngine;
    }

    // noinspection JSUnusedGlobalSymbols
    isDefault()
    {
        return this._authEngine.isDefault();
    }

    // noinspection JSUnusedGlobalSymbols
    isUseAuth()
    {
        return this._authEngine.isUseAuth();
    }

    //Part Cookie

    // noinspection JSUnusedGlobalSymbols
    getCookieVariable(key)
    {
        if(this._isSocket)
        {
            return undefined;
        }
        else
        {
            return this._req.cookies[key];
        }
    }

    // noinspection JSUnusedGlobalSymbols
    setCookieVariable(key,value,settings = { maxAge: 900000})
    {
        if(this._isSocket)
        {
            return false;
        }
        else
        {
            this._res.cookie(key,value,settings);
            return true;
        }
    }

    // noinspection JSUnusedGlobalSymbols
    clearCookie(key)
    {
        if(this._isSocket)
        {
            return false;
        }
        else
        {
            this._res.clearCookie(key);
            return true;
        }
    }

    //Part Http

    // noinspection JSUnusedGlobalSymbols
    getResponse()
    {
        return this._shBridge.getResponse();
    }

    // noinspection JSUnusedGlobalSymbols
    getRequest()
    {
        return this._shBridge.getRequest();
    }

    //Part Token

    // noinspection JSUnusedGlobalSymbols
    setTokenVariable(key,value)
    {
        //TODO

    }

    // noinspection JSUnusedGlobalSymbols
    getTokenVariable(key)
    {
        //TODO

    }

    //Part Socket

    // noinspection JSUnusedGlobalSymbols
    getSocketId()
    {
        if(this._shBridge.isSocket)
        {
            return this._shBridge.getSocket().id;
        }
        else
        {
            return undefined;
        }
    }

    // noinspection JSUnusedGlobalSymbols
    getSocket()
    {
        return this._shBridge.getSocket();
    }

    // noinspection JSUnusedGlobalSymbols
    getScServer()
    {
        return this._worker.scServer;
    }

    //Part Protocol

    // noinspection JSUnusedGlobalSymbols
    getProtocol()
    {
        return this._shBridge.isSocket() ? 'socket' : 'http';
    }

    // noinspection JSUnusedGlobalSymbols
    isSocketProtocol()
    {
        return this._shBridge.isSocket();
    }

    //Part Socket Channel

    // noinspection JSUnusedGlobalSymbols
    emitToThisClient(eventName,data,cb)
    {
        return this._channelEngine.emitToSocket(eventName,data,cb);
    }

    //Part Remote Address

    getRemoteAddress()
    {
        return this._shBridge.getRemoteAddress();
    }

    //Part Amazon s3

    // noinspection JSUnusedGlobalSymbols
    uploadFileToBucket()
    {
        //TODO

    }

    // noinspection JSUnusedGlobalSymbols
    getFileFromBucket()
    {
        //TODO

    }

}

module.exports = Bag;