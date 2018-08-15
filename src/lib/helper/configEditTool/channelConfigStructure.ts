/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */
import Const                         = require('./../constants/constWrapper');
import SmallBag                      = require("../../api/SmallBag");
import ChInfo                        = require("../infoObjects/chInfo");

export type GetTokenVarFunction = (key : string) => any;

export type ChannelAccessFunction =
    (smallBag : SmallBag, info : ChInfo, getTokenVar : GetTokenVarFunction) => Promise<boolean> | boolean;

export type ChannelEventFunction =
    (smallBag : SmallBag, info : ChInfo, getTokenVar : GetTokenVarFunction) => Promise<void> | void;

export interface ChannelConfig
{
    [Const.Channel.KEYS.DEFAULTS] ?: Channel;
    [Const.Channel.KEYS.CUSTOM_CHANNELS] ?: Record<string,Channel>;
    [Const.Channel.KEYS.CUSTOM_ID_CHANNELS] ?: Record<string,Channel>;
}

export interface Channel
{
    [Const.Channel.CHANNEL.PUBLISH_NOT_ACCESS] ?: ChannelAccessFunction | boolean | string | number | (string|number)[];
    [Const.Channel.CHANNEL.PUBLISH_ACCESS] ?: ChannelAccessFunction | boolean | string | number | (string|number)[];
    [Const.Channel.CHANNEL.SUBSCRIBE_NOT_ACCESS] ?: ChannelAccessFunction | boolean | string | number | (string|number)[];
    [Const.Channel.CHANNEL.SUBSCRIBE_ACCESS] ?: ChannelAccessFunction | boolean | string | number | (string|number)[];

    [Const.Channel.CHANNEL.ON_PUBLISH] ?: ChannelEventFunction;
    [Const.Channel.CHANNEL.ON_SUBSCRIPTION] ?: ChannelEventFunction;
}
