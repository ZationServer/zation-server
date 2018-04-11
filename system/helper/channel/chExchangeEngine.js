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

const Const         = require('./../constante/constWrapper');

class ChExchangeEngine
{
    constructor(scServer)
    {
        this._scServer = scServer;
    }

    publishAuthOut(id)
    {
        this.publishInUserCh(id,Const.Settings.USER_CHANNEL_AUTH_OUT,{});
    }

    publishReAuth(id)
    {
        this.publishInUserCh(id,Const.Settings.USER_CHANNEL_RE_AUTH,{});
    }

    publish(channel,eventName,data,cb)
    {
        this._scServer.exchange.publish(channel,ChExchangeEngine.buildData(eventName,data),cb);
    }

    publishInUserCh(id,eventName,data,cb)
    {
        this.publish(Const.Settings.SOCKET_USER_CHANNEL_PREFIX+id,eventName,data,cb)
    }

    publishInDefaultGroupCh(eventName,data,cb)
    {
        this.publish(Const.Settings.SOCKET_DEFAULT_GROUP,eventName,data,cb);
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
        this.publish(Const.Settings.SOCKET_ALL,eventName,data,cb);
    }

    publishInAuthGroupCh(authGroup,eventName,data,cb)
    {
        this.publish(Const.Settings.SOCKET_AUTH_GROUP_PREFIX + authGroup,eventName,data,cb);
    }

    static buildData(eventName,data)
    {
        return {
            e : eventName,
            d : data
        };
    }

    publishInSpecialChannel(channel,id,eventName,data,cb)
    {
        let channelFullName = Const.Settings.SOCKET_SPECIAL_CHANNEL_PREFIX + channel +
            Const.Settings.SOCKET_SPECIAL_CHANNEL_ID + id;

        this.publish(channelFullName,eventName,data,cb);
    }

    destroyChannel(channel)
    {
        // noinspection JSValidateTypes
        this._scServer.exchange.channel(channel).destroy();
    }

}

module.exports = ChExchangeEngine;
