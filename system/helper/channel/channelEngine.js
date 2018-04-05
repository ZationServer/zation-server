/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

const Const         = require('./../constante/constWrapper');
const TokenTools    = require('../token/tokenTools');

class ChannelEngine
{
    constructor(scServer,zc,isSocket,socket)
    {
        this._zc = zc;
        this._scServer = scServer;
        this._socket = socket;
        this._isSocket = isSocket;
    }

    emitToSocket(eventName,data,cb)
    {
        if(this.isSocket)
        {
            this.socket.emit(eventName,data,cb);
            return true;
        }
        else
        {
            return false;
        }
    }

    authOutAllClientsWithId(id)
    {
        this.publishInUserCh(id,CA.USER_CHANNEL_AUTH_OUT,{});
    }

    reAuthAllClientsWithId(id)
    {
        this.publishInUserCh(id,CA.USER_CHANNEL_RE_AUTH,{});
    }

    publish(channel,eventName,data,cb)
    {
        this.scServer.exchange.publish(channel,ChannelEngine.buildData(eventName,data),cb);
    }

    publishInUserCh(id,eventName,data,cb)
    {
        this.publish(CA.SOCKET_USER_CHANNEL_PREFIX+id,eventName,data,cb,this.scServer)
    }

    publishInDefaultGroupCh(eventName,data,cb)
    {
        this.publish(CA.SOCKET_DEFAULT_GROUP,eventName,data,cb);
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
        this.publish(CA.SOCKET_ALL,eventName,data,cb);
    }

    publishInAuthGroupCh(authGroup,eventName,data,cb)
    {
        this.publish(CA.SOCKET_AUTH_GROUP_PREFIX + authGroup,eventName,data,cb);
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
        let channelFullName = CA.SOCKET_SPECIAL_CHANNEL_PREFIX + channel + CA.SOCKET_SPECIAL_CHANNEL_ID + id;
        this.publish(channelFullName,eventName,data,cb);
    }

    // noinspection JSUnusedGlobalSymbols
    kickOutUserChannelAndDestroy(authId)
    {
        let userChannel = CA.SOCKET_USER_CHANNEL_PREFIX + authId;
        this.kickOutChannel(userChannel);
        this.destroyChannel(userChannel);
    }

    kickOutUserChannel(authId)
    {
        let userChannel = CA.SOCKET_USER_CHANNEL_PREFIX + authId;
        this.kickOutChannel(userChannel);
    }

    kickOutFromAllAuthGroupChannels()
    {
        this.kickOutFromChannelsWithIn(CA.SOCKET_AUTH_GROUP_PREFIX);
    }

    kickOutFromAuthGroupChannel(authGroup)
    {
        this.kickOutFromChannelsWithIn(CA.SOCKET_AUTH_GROUP_PREFIX + authGroup);
    }

    kickOutFromDefaultGroupChannel()
    {
        this.kickOutChannel(CA.SOCKET_DEFAULT_GROUP);
    }

    kickOutFromChannelsWithIn(string)
    {
        if(this.isSocket)
        {
            let subs = this.socket.subscriptions();

            for(let i = 0; i < subs.length; i++)
            {
                if(subs[i].indexOf(string) !== -1)
                {
                    // noinspection JSValidateTypes
                    this.socket.kickOut(subs[i]);
                }
            }
        }
    }

    kickOutChannel(channel)
    {
        if(this.isSocket)
        {
            // noinspection JSValidateTypes
            this.socket.kickOut(channel);
        }
    }

    destroyChannel(channel)
    {
        this.scServer.exchange.channel(channel).destroy();
    }

    static getChannelDefaultSettings(typ)
    {
        let res = false;

        if(channelConfig[CA.CHANNEL_DEFAULT_RIGHTS] !== undefined &&
            channelConfig[CA.CHANNEL_DEFAULT_RIGHTS][typ] !== undefined)
        {
            res = channelConfig[CA.CHANNEL_DEFAULT_RIGHTS][typ];
        }

        return res;
    }

    static getChannelChannelInfo(channel)
    {
        let info = {};

        if(channelConfig[CA.CHANNEL_SPECIAL_CHANNELS]!== undefined
            && channelConfig[CA.CHANNEL_SPECIAL_CHANNELS][channel] !== undefined)
        {
            let channels = channelConfig[CA.CHANNEL_SPECIAL_CHANNELS];

            //Pub
            if(channels[channel][CA.CHANNEL_PUBLISH] !== undefined)
            {
                info[CA.CHANNEL_PUBLISH] = channels[channel][CA.CHANNEL_PUBLISH];
            }
            else
            {
                info[CA.CHANNEL_PUBLISH] = ChannelEngine.getChannelDefaultSettings(CA.CHANNEL_PUBLISH);
            }

            //Sub
            if(channels[channel][CA.CHANNEL_SUBSCRIBE] !== undefined)
            {
                info[CA.CHANNEL_SUBSCRIBE] = channels[channel][CA.CHANNEL_SUBSCRIBE];
            }
            else
            {
                info[CA.CHANNEL_SUBSCRIBE] = ChannelEngine.getChannelDefaultSettings(CA.CHANNEL_SUBSCRIBE);
            }
        }
        else
        {
            info[CA.CHANNEL_PUBLISH] = ChannelEngine.getChannelDefaultSettings(CA.CHANNEL_PUBLISH);
            info[CA.CHANNEL_SUBSCRIBE] = ChannelEngine.getChannelDefaultSettings(CA.CHANNEL_SUBSCRIBE);
        }
        return info;
    }


    static generateInfo(socket)
    {
        let info = {};

        let type = ClientStorage.getClientVariable([Const.Settings.CLIENT_AUTH_GROUP],true,socket);
        info[Const.Channel.CHANNEL_INFO_AUTH_GROUP] = type;

        info[Const.Channel.CHANNEL_INFO_ID] =
            ClientStorage.getClientVariable([Const.Settings.CLIENT_AUTH_ID],true,socket);

        info[Const.Channel.CHANNEL_INFO_SOCKET] = socket;

        info[Const.Channel.CHANNEL_INFO_TOKEN_ID] =
            ClientStorage.getClientVariable([Const.Settings.CLIENT_TOKEN_ID],true,socket);

        info[Const.Channel.CHANNEL_INFO_IS_AUTH_IN] = type !== undefined;

        return info;
    }

    static _getGetSocketDataFunc(socket)
    {
        //TODO
        return (key) => {ClientStorage.getClientVariable(key,true,socket)};
    }

    static _hasAccessTo(param,socket)
    {
        let access = false;
        if(typeof param === 'boolean')
        {
            access = param;
        }
        else if(typeof param === "function")
        {
            let res = param(ChannelEngine.generateInfo(socket),ChannelEngine._getGetSocketDataFunc(socket));
            if(typeof res === 'boolean')
            {
                access = res;
            }
        }
        return access;
    }

    static getSpecialChannelName(ch)
    {
        ch = ch.replace(Const.Settings.SOCKET_SPECIAL_CHANNEL_PREFIX,'');
        ch = ch.substring(0,ch.indexOf(Const.Settings.SOCKET_SPECIAL_CHANNEL_ID));
        return ch;
    }

    static hasAccessToSubSpecialChannel(socket,channel)
    {
        let info = ChannelEngine.getChannelChannelInfo(channel);
        return ChannelEngine._hasAccessTo(info[Const.Channel.CHANNEL_SUBSCRIBE],socket);
    }

    static hasAccessToPubInSpecialChannel(socket,channel)
    {
        let info = ChannelEngine.getChannelChannelInfo(channel);
        return ChannelEngine._hasAccessTo(info[Const.Channel.CHANNEL_PUBLISH],socket);
    }


    static checkSocketSpecialChAccess(socket)
    {
        if(socket !== undefined)
        {
            let subs = socket.subscriptions();

            for(let i = 0; i < subs.length; i++)
            {
                if(subs[i].indexOf(Const.Settings.SOCKET_SPECIAL_CHANNEL_PREFIX) !== -1)
                {
                    let chName = ChannelEngine._getSpecialChannelName(subs[i]);
                    if(!ChannelEngine._hasAccessToSubSpecialChannel(socket,chName))
                    {
                        // noinspection JSUnresolvedFunction
                        socket.kickOut(subs[i]);
                    }
                }
            }
        }
    }

    static checkSocketZationChAccess(socket)
    {




    }


}

module.exports = ChannelEngine;
