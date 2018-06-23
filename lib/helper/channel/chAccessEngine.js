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

const Const         = require('../constants/constWrapper');
const TokenTools    = require('./../token/tokenTools');
const Logger        = require('./../logger/logger');

class ChAccessEngine
{
    //Part middleware access
    static _getChannelDefaultSettings(typ,zc)
    {
        let res = false;
        let defaults = zc.getChannel([Const.Channel.KEYS.DEFAULT]);
        if(defaults !== undefined && defaults[typ] !== undefined)
        {
            res = defaults[typ];
        }
        return res;
    }

    static _getChannelInfo(channel, zc)
    {
        let info = {};
        let customChannels = zc.getChannel(Const.Channel.KEYS.CUSTOM_CHANNELS);

        if(customChannels !== undefined && customChannels[channel] !== undefined)
        {
            let customChannel = customChannels[channel];

            //Pub
            if(customChannel[Const.Channel.CHANNEL.PUBLISH] !== undefined)
            {
                info[Const.Channel.CHANNEL.PUBLISH] = customChannel[Const.Channel.CHANNEL.PUBLISH];
            }
            else
            {
                info[Const.Channel.CHANNEL.PUBLISH] =
                    ChAccessEngine._getChannelDefaultSettings(Const.Channel.CHANNEL.PUBLISH,zc);
            }

            //Sub
            if(customChannel[Const.Channel.CHANNEL.SUBSCRIBE] !== undefined)
            {
                info[Const.Channel.CHANNEL.SUBSCRIBE] = customChannel[Const.Channel.CHANNEL.SUBSCRIBE];
            }
            else
            {
                info[Const.Channel.CHANNEL.SUBSCRIBE] =
                    ChAccessEngine._getChannelDefaultSettings(Const.Channel.CHANNEL.SUBSCRIBE,zc);
            }
        }
        else
        {
            info[Const.Channel.CHANNEL.PUBLISH] =
                ChAccessEngine._getChannelDefaultSettings(Const.Channel.CHANNEL.PUBLISH,zc);

            info[Const.Channel.CHANNEL.SUBSCRIBE] =
                ChAccessEngine._getChannelDefaultSettings(Const.Channel.CHANNEL.SUBSCRIBE,zc);
        }
        return info;
    }


    static _generateInfo(socket)
    {
        let info = {};

        let type = TokenTools.getSocketTokenVariable([Const.Settings.CLIENT.AUTH_USER_GROUP],socket);

        info[Const.Channel.CHANNEL.INFO.AUTH_USER_GROUP] = type;

        info[Const.Channel.CHANNEL.INFO.USER_ID] =
            TokenTools.getSocketTokenVariable([Const.Settings.CLIENT.USER_ID],socket);

        info[Const.Channel.CHANNEL.INFO.SOCKET] = socket;

        info[Const.Channel.CHANNEL.INFO.TOKEN_ID] =
            TokenTools.getSocketTokenVariable([Const.Settings.CLIENT.TOKEN_ID],socket);

        info[Const.Channel.CHANNEL.INFO.IS_AUTH_IN] = type !== undefined;

        return info;
    }

    static _getGetSocketDataFunc(socket)
    {
        return (key) => {TokenTools.getSocketTokenVariable(key,socket);};
    }

    static _hasAccessTo(param,socket,smallBag)
    {
        let access = false;
        if(typeof param === 'boolean')
        {
            access = param;
        }
        else if(typeof param === "function")
        {
            let res = param(smallBag,ChAccessEngine._generateInfo(socket),ChAccessEngine._getGetSocketDataFunc(socket));
            if(typeof res === 'boolean')
            {
                access = res;
            }
        }
        return access;
    }

    static hasAccessToSubSpecialChannel(socket,channel,smallBag)
    {
        let info = ChAccessEngine._getChannelInfo(channel);
        return ChAccessEngine._hasAccessTo(info[Const.Channel.CHANNEL.SUBSCRIBE],socket,smallBag);
    }

    static hasAccessToPubInSpecialChannel(socket,channel,smallBag)
    {
        let info = ChAccessEngine._getChannelInfo(channel);
        return ChAccessEngine._hasAccessTo(info[Const.Channel.CHANNEL.PUBLISH],socket,smallBag);
    }


    //Part changedToken

    static getSpecialChannelName(ch)
    {
        ch = ch.replace(Const.Settings.CHANNEL.CUSTOM_CHANNEL_PREFIX,'');
        ch = ch.substring(0,ch.indexOf(Const.Settings.CHANNEL.CUSTOM_CHANNEL_ID));
        return ch;
    }

    static _kickOut(socket,channel)
    {
        // noinspection JSUnresolvedFunction,JSValidateTypes
        socket.kickOut(channel);
        Logger.printDebugInfo(`Socket with id: ${socket.id} is kick out from channel ${channel}`);
    }

    static checkSocketSpecialChAccess(socket,worker)
    {
        if(socket !== undefined)
        {
            let subs = socket.subscriptions();

            for(let i = 0; i < subs.length; i++)
            {
                if(subs[i].indexOf(Const.Settings.CHANNEL.CUSTOM_CHANNEL_PREFIX) !== -1)
                {
                    let chName = ChAccessEngine.getSpecialChannelName(subs[i]);
                    if(!ChAccessEngine.hasAccessToSubSpecialChannel(socket,chName,worker.getPreparedSmallBag()))
                    {
                        ChAccessEngine._kickOut(socket,subs[i]);
                    }
                }
            }
        }
    }

    static checkSocketZationChAccess(socket)
    {
        if(socket !== undefined)
        {
            // noinspection JSUnresolvedFunction
            let token = socket.getAuthToken();
            let subs = socket.subscriptions();

            let authUserGroup = undefined;
            let userId = undefined;
            let panelAccess = undefined;

            if(token !== undefined && token !== null)
            {
                authUserGroup = token[Const.Settings.CLIENT.AUTH_USER_GROUP];
                userId = token[Const.Settings.CLIENT.USER_ID];
                panelAccess = token[Const.Settings.CLIENT.PANEL_ACCESS]
            }

            for(let i = 0; i < subs.length; i++)
            {
                //Default group channel
                if(subs[i] === Const.Settings.CHANNEL.DEFAULT_USER_GROUP
                    && authUserGroup !== ''
                    && authUserGroup !== undefined)
                {
                    this._kickOut(socket,Const.Settings.CHANNEL.DEFAULT_USER_GROUP);
                }

                //Auth Group
                if(subs[i].indexOf(Const.Settings.CHANNEL.AUTH_USER_GROUP_PREFIX) !== -1)
                {
                    let authGroupSub = subs[i].replace(Const.Settings.CHANNEL.AUTH_USER_GROUP_PREFIX,'');
                    if(authUserGroup !== authGroupSub)
                    {
                        this._kickOut(socket,subs[i]);
                    }
                }

                //User Channel
                if(subs[i].indexOf(Const.Settings.CHANNEL.USER_CHANNEL_PREFIX) !== -1)
                {
                    let userIdSub = subs[i].replace(Const.Settings.CHANNEL.USER_CHANNEL_PREFIX,'');
                    if(userId !== userIdSub)
                    {
                        this._kickOut(socket,subs[i]);
                    }
                }

                //Panel Channel
                if(subs[i] === Const.Settings.CHANNEL.PANNEL && !panelAccess)
                {
                    this._kickOut(socket,subs[i]);
                }

            }
        }
    }

}

module.exports = ChAccessEngine;
