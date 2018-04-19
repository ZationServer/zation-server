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
const TokenTools    = require('./../token/tokenTools');

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
                    ChAccessEngine._getChannelDefaultSettings(Const.Channel.CHANNEL_SUBSCRIBE,zc);
            }
        }
        else
        {
            info[Const.Channel.CHANNEL_PUBLISH] =
                ChAccessEngine._getChannelDefaultSettings(Const.Channel.CHANNEL_PUBLISH,zc);

            info[Const.Channel.CHANNEL_SUBSCRIBE] =
                ChAccessEngine._getChannelDefaultSettings(Const.Channel.CHANNEL_SUBSCRIBE,zc);
        }
        return info;
    }


    static _generateInfo(socket)
    {
        let info = {};

        let type = TokenTools.getSocketTokenVariable([Const.Settings.CLIENT_AUTH_GROUP],socket);

        info[Const.Channel.CHANNEL_INFO_AUTH_GROUP] = type;

        info[Const.Channel.CHANNEL_INFO_ID] =
            TokenTools.getSocketTokenVariable([Const.Settings.CLIENT_AUTH_ID],socket);

        info[Const.Channel.CHANNEL_INFO_SOCKET] = socket;

        info[Const.Channel.CHANNEL_INFO_TOKEN_ID] =
            TokenTools.getSocketTokenVariable([Const.Settings.CLIENT_TOKEN_ID],socket);

        info[Const.Channel.CHANNEL_INFO_IS_AUTH_IN] = type !== undefined;

        return info;
    }

    static _getGetSocketDataFunc(socket)
    {
        return (key) => {TokenTools.getSocketTokenVariable(key,socket);};
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
            let res = param(ChAccessEngine._generateInfo(socket),ChAccessEngine._getGetSocketDataFunc(socket));
            if(typeof res === 'boolean')
            {
                access = res;
            }
        }
        return access;
    }

    static hasAccessToSubSpecialChannel(socket,channel)
    {
        let info = ChAccessEngine._getChannelChannelInfo(channel);
        return ChAccessEngine._hasAccessTo(info[Const.Channel.CHANNEL_SUBSCRIBE],socket);
    }

    static hasAccessToPubInSpecialChannel(socket,channel)
    {
        let info = ChAccessEngine._getChannelChannelInfo(channel);
        return ChAccessEngine._hasAccessTo(info[Const.Channel.CHANNEL_PUBLISH],socket);
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
                    let chName = ChAccessEngine.getSpecialChannelName(subs[i]);
                    if(!ChAccessEngine.hasAccessToSubSpecialChannel(socket,chName))
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

module.exports = ChAccessEngine;
