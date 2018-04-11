/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

/*
Class Description :
This class is to check the access for publish or subscribe channels.
It is used to check the access in the middleware or to check when the
token is changed.
 */

const Const         = require('./../constante/constWrapper');

class ChAccessEngine
{
    //Part middleware access
    static _getChannelDefaultSettings(typ,zc)
    {
        let res = false;
        let defaultRights = zc.getChannel([Const.Channel.CHANNEL_DEFAULT_RIGHTS]);
        if(defaultRights !== undefined && defaultRights[typ] !== undefined)
        {
            res = defaultRights[typ];
        }
        return res;
    }

    static _getChannelChannelInfo(channel,zc)
    {
        let info = {};
        let specialChannels = zc.getChannel(Const.Channel.CHANNEL_SPECIAL_CHANNELS);

        if(specialChannels !== undefined && specialChannels[channel] !== undefined)
        {
            let specialChannel = specialChannels[channel];

            //Pub
            if(specialChannel[Const.Channel.CHANNEL_PUBLISH] !== undefined)
            {
                info[Const.Channel.CHANNEL_PUBLISH] = specialChannel[Const.Channel.CHANNEL_PUBLISH];
            }
            else
            {
                info[Const.Channel.CHANNEL_PUBLISH] =
                    ChAccessEngine._getChannelDefaultSettings(Const.Channel.CHANNEL_PUBLISH,zc);
            }

            //Sub
            if(specialChannel[Const.Channel.CHANNEL_SUBSCRIBE] !== undefined)
            {
                info[Const.Channel.CHANNEL_SUBSCRIBE] = specialChannel[Const.Channel.CHANNEL_SUBSCRIBE];
            }
            else
            {
                info[Const.Channel.CHANNEL_SUBSCRIBE] =
                    ChAccessEngine.getChannelDefaultSettings(Const.Channel.CHANNEL_SUBSCRIBE,zc);
            }
        }
        else
        {
            info[Const.Channel.CHANNEL_PUBLISH] =
                ChAccessEngine.getChannelDefaultSettings(Const.Channel.CHANNEL_PUBLISH,zc);

            info[Const.Channel.CHANNEL_SUBSCRIBE] =
                ChAccessEngine.getChannelDefaultSettings(Const.Channel.CHANNEL_SUBSCRIBE,zc);
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


    //Part changedToken

    static getSpecialChannelName(ch)
    {
        ch = ch.replace(Const.Settings.SOCKET_SPECIAL_CHANNEL_PREFIX,'');
        ch = ch.substring(0,ch.indexOf(Const.Settings.SOCKET_SPECIAL_CHANNEL_ID));
        return ch;
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
