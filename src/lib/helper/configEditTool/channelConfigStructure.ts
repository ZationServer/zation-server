/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */
import Const                         = require('./../constants/constWrapper');
import SmallBag                      = require("../../api/SmallBag");
import AccessChInfo                  = require("../infoObjects/accessChInfo");

export type GetTokenVarFunction = (key : string) => any;

export type ChannelAccessFunction =
    (smallBag : SmallBag,info : AccessChInfo,getTokenVar : GetTokenVarFunction) => Promise<boolean> | boolean;

export interface ChannelConfig
{
    [Const.Channel.KEYS.DEFAULTS] ?: ChannelAccess;
    [Const.Channel.KEYS.CUSTOM_CHANNELS] ?: Record<string,ChannelAccess>;
    [Const.Channel.KEYS.CUSTOM_ID_CHANNELS] ?: Record<string,ChannelAccess>;
}

export interface ChannelAccess
{
    [Const.Channel.CHANNEL.NOT_PUBLISH] ?: ChannelAccessFunction | boolean | string | number | (string|number)[];
    [Const.Channel.CHANNEL.PUBLISH] ?: ChannelAccessFunction | boolean | string | number | (string|number)[];
    [Const.Channel.CHANNEL.NOT_SUBSCRIBE] ?: ChannelAccessFunction | boolean | string | number | (string|number)[];
    [Const.Channel.CHANNEL.SUBSCRIBE] ?: ChannelAccessFunction | boolean | string | number | (string|number)[];
}
