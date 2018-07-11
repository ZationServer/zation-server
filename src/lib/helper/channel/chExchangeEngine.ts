/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

/*
Class Description :
This class is to publish into channels with the scServer.exchange object.
It is used by the SmallBag and the ChannelEngine.
 */

import Const       = require('../constants/constWrapper');
import ChTools     = require('./chTools');
import ZationConfig = require("../../main/zationConfig");

class ChExchangeEngine
{
    private readonly scServer : any;

    constructor(scServer)
    {
        this.scServer = scServer;
    }

    publishAuthOut(userId  : any) : void
    {
        this.publishInUserCh(userId,Const.Settings.USER_CHANNEL.AUTH_OUT,{});
    }

    publishReAuth(userId : any) : void
    {
        this.publishInUserCh(userId,Const.Settings.USER_CHANNEL.RE_AUTH,{});
    }

    publish(channel : string,eventName : string,data : any,cb ?: Function) : void
    {
        // noinspection TypeScriptValidateJSTypes
        this.scServer.exchange.publish(channel,ChExchangeEngine.buildData(eventName,data),cb);
    }

    publishInUserCh(id : any,eventName : string,data : any,cb ?: Function) : void
    {
        this.publish(ChTools.buildUserChName(id),eventName,data,cb)
    }

    publishInDefaultUserGroupCh(eventName : string, data : any, cb ?: Function) : void
    {
        this.publish(Const.Settings.CHANNEL.DEFAULT_USER_GROUP,eventName,data,cb);
    }

    publishInUserChannels(ids : any[],eventName : string,data : any,cb ?: Function) : void
    {
        for(let i = 0; i < ids.length; i++)
        {
            this.publishInUserCh(ids[i],eventName,data,cb);
        }
    }

    publishInAllCh(eventName : string,data : any,cb ?: Function) : void
    {
        this.publish(Const.Settings.CHANNEL.ALL,eventName,data,cb);
    }

    publishInAuthUserGroupCh(authUserGroup : string, eventName : string, data : any, cb ?: Function) : void
    {
        this.publish(ChTools.buildAuthUserGroupChName(authUserGroup),eventName,data,cb);
    }

    static buildData(eventName : string,data : any) : object
    {
        return {
            e : eventName,
            d : data
        };
    }

    publishToAllAuthUserGroupCh(eventName : string, data : any,zc : ZationConfig,cb ?: Function)
    {
        let groups = zc.getApp(Const.App.KEYS.USER_GROUPS)[Const.App.USER_GROUPS.AUTH];
        for(let k in groups)
        {
            if(groups.hasOwnProperty(k))
            {
                this.publishInAuthUserGroupCh(groups[k],eventName,data,cb);
            }
        }
    }

    publishToCustomIdChannel(channel : string, id : any, eventName : string, data : any, cb ?: Function) : void
    {
        let channelFullName = ChTools.buildCustomIdChannelName(channel,id);
        this.publish(channelFullName,eventName,data,cb);
    }

    publishToCustomChannel(channel : string, eventName : string, data : any, cb ?: Function) : void
    {
        let channelFullName = ChTools.buildCustomChannelName(channel);
        this.publish(channelFullName,eventName,data,cb);
    }

    // noinspection JSUnusedGlobalSymbols
    destroyChannel(channel : string) : void
    {
        // noinspection JSValidateTypes
        this.scServer.exchange.channel(channel).destroy();
    }

}

export = ChExchangeEngine;
