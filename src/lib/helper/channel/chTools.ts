/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import Const         = require('../constants/constWrapper');
import TokenTools    = require('../token/tokenTools');
import Logger        = require('../logger/logger');
import ZationConfig  = require("../../main/zationConfig");

class ChTools
{

    static buildCustomIdChannelName(name : string,id : string = '') : string
    {
        return Const.Settings.CHANNEL.CUSTOM_ID_CHANNEL_PREFIX + name
        + Const.Settings.CHANNEL.CUSTOM_CHANNEL_ID + id;
    }

    static buildCustomChannelName(name : string) : string
    {
        return Const.Settings.CHANNEL.CUSTOM_CHANNEL_PREFIX + name;
    }

    static buildAuthUserGroupChName(authUserGroup : string) : string
    {
        return Const.Settings.CHANNEL.AUTH_USER_GROUP_PREFIX + authUserGroup;
    }

    static buildUserChName(id : number | string) : string
    {
        return Const.Settings.CHANNEL.USER_CHANNEL_PREFIX+id;
    }

    static kickOut(socket,channel : string) : void
    {
        // noinspection JSUnresolvedFunction,JSValidateTypes,TypeScriptValidateJSTypes
        socket.kickOut(channel);
        Logger.printDebugInfo(`Socket with id: ${socket.id} is kick out from channel ${channel}`);
    }

    static getCustomIdChannelInfo(ch : string) : any
    {
        let nameAndId = ch.replace(Const.Settings.CHANNEL.CUSTOM_ID_CHANNEL_PREFIX,'')
            .split(Const.Settings.CHANNEL.CUSTOM_CHANNEL_ID);

        if(nameAndId.length === 2)
        {
            return {
                name : nameAndId[0],
                id : nameAndId[1]
            };
        }
        else
        {
            return {
                name : nameAndId[0]
            };
        }
    }

    static getCustomIdChannelName(ch : string) : string {
        return ChTools.getCustomIdChannelInfo(ch).name;
    }

    static getCustomIdChConfig(zc : ZationConfig,name : string) : object
    {
        //precompiler creates {} if is not set!
        return zc.getChannel(Const.Channel.KEYS.CUSTOM_ID_CHANNELS)[name];
    }

    static getCustomChConfig(zc : ZationConfig,name : string) : object
    {
        //precompiler creates {} if is not set!
        return zc.getChannel(Const.Channel.KEYS.CUSTOM_CHANNELS)[name];
    }

    static getCustomChannelName(ch : string) : string
    {
        return ch.replace(Const.Settings.CHANNEL.CUSTOM_CHANNEL_PREFIX,'');
    }


}

export = ChTools;
