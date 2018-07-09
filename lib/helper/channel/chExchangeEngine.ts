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

const Const       = require('../constants/constWrapper');
const ChTools     = require('./chTools');

class ChExchangeEngine
{
    constructor(scServer)
    {
        this._scServer = scServer;
    }

    publishAuthOut(userId)
    {
        this.publishInUserCh(userId,Const.Settings.USER_CHANNEL.AUTH_OUT,{});
    }

    publishReAuth(userId)
    {
        this.publishInUserCh(userId,Const.Settings.USER_CHANNEL.RE_AUTH,{});
    }

    publish(channel,eventName,data,cb)
    {
        this._scServer.exchange.publish(channel,ChExchangeEngine.buildData(eventName,data),cb);
    }

    publishInUserCh(id,eventName,data,cb)
    {
        this.publish(ChTools.buildUserChName(id),eventName,data,cb)
    }

    publishInDefaultUserGroupCh(eventName, data, cb)
    {
        this.publish(Const.Settings.CHANNEL.DEFAULT_USER_GROUP,eventName,data,cb);
    }

    publishInUserChannels(ids,eventName,data,cb)
    {
        for(let i = 0; i < ids.length; i++)
        {
            this.publishInUserCh(ids[i],eventName,data,cb);
        }
    }

    publishInAllCh(eventName,data,cb)
    {
        this.publish(Const.Settings.CHANNEL.ALL,eventName,data,cb);
    }

    publishInAuthUserGroupCh(authUserGroup, eventName, data, cb)
    {
        this.publish(ChTools.buildAuthUserGroupChName(authUserGroup),eventName,data,cb);
    }

    static buildData(eventName,data)
    {
        return {
            e : eventName,
            d : data
        };
    }

    publishToAllAuthUserGroupCh(eventName, data, cb, zc)
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

    publishToCustomIdChannel(channel, id, eventName, data, cb)
    {
        let channelFullName = ChTools.buildCustomIdChannelName(channel,id);
        this.publish(channelFullName,eventName,data,cb);
    }

    publishToCustomChannel(channel, eventName, data, cb)
    {
        let channelFullName = ChTools.buildCustomChannelName(channel);
        this.publish(channelFullName,eventName,data,cb);
    }

    // noinspection JSUnusedGlobalSymbols
    destroyChannel(channel)
    {
        // noinspection JSValidateTypes
        this._scServer.exchange.channel(channel).destroy();
    }

}

module.exports = ChExchangeEngine;
