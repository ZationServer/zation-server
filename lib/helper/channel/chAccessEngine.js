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
        let info = ChAccessEngine._getChannelChannelInfo(channel);
        return ChAccessEngine._hasAccessTo(info[Const.Channel.CHANNEL_SUBSCRIBE],socket,smallBag);
    }

    static hasAccessToPubInSpecialChannel(socket,channel,smallBag)
    {
        let info = ChAccessEngine._getChannelChannelInfo(channel);
        return ChAccessEngine._hasAccessTo(info[Const.Channel.CHANNEL_PUBLISH],socket,smallBag);
    }


    //Part changedToken

    static getSpecialChannelName(ch)
    {
        ch = ch.replace(Const.Settings.CHANNEL_SPECIAL_CHANNEL_PREFIX,'');
        ch = ch.substring(0,ch.indexOf(Const.Settings.CHANNEL_SPECIAL_CHANNEL_ID));
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
                if(subs[i].indexOf(Const.Settings.CHANNEL_SPECIAL_CHANNEL_PREFIX) !== -1)
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

    static checkSocketZationChAccess(socket,zc)
    {
        if(socket !== undefined)
        {
            // noinspection JSUnresolvedFunction
            let token = socket.getAuthToken();
            let subs = socket.subscriptions();

            let authGroup = undefined;
            let authId = undefined;
            let panelAccess = undefined;

            if(token !== undefined && token !== null)
            {
                authGroup = token[Const.Settings.CLIENT_AUTH_GROUP];
                authId = token[Const.Settings.CLIENT_AUTH_ID];
                panelAccess = token[Const.Settings.CLIENT_PANEL_ACCESS]
            }

            for(let i = 0; i < subs.length; i++)
            {
                //Default group channel
                if(subs[i] === Const.Settings.CHANNEL_DEFAULT_GROUP
                    && authGroup !== ''
                    && authGroup !== undefined)
                {
                    this._kickOut(socket,Const.Settings.CHANNEL_DEFAULT_GROUP);
                }

                //Auth Group
                if(subs[i].indexOf(Const.Settings.CHANNEL_AUTH_GROUP_PREFIX) !== -1)
                {
                    let authGroupSub = subs[i].replace(Const.Settings.CHANNEL_AUTH_GROUP_PREFIX,'');
                    if(authGroup !== authGroupSub)
                    {
                        this._kickOut(socket,subs[i]);
                    }
                }

                //User Channel
                if(subs[i].indexOf(Const.Settings.CHANNEL_USER_CHANNEL_PREFIX) !== -1)
                {
                    let userIdSub = subs[i].replace(Const.Settings.CHANNEL_USER_CHANNEL_PREFIX,'');
                    if(authId !== userIdSub)
                    {
                        this._kickOut(socket,subs[i]);
                    }
                }

                //Panel Channel
                if(subs[i] === Const.Settings.CHANNEL_PANNEL && !panelAccess)
                {
                    this._kickOut(socket,subs[i]);
                }

            }
        }
    }

}

module.exports = ChAccessEngine;
