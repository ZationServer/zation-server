/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */
import Const                         = require('./../constants/constWrapper');
import SmallBag                      = require("../../api/SmallBag");
import ChInfo                        = require("../infoObjects/chAccessInfo");

export type ChannelAccessFunction =
    (smallBag : SmallBag, info : ChInfo) => Promise<boolean> | boolean;

export type ChannelEventFunction =
    (smallBag : SmallBag, info : ChInfo) => Promise<void> | void;

export interface ChannelConfig
{
    [Const.Channel.KEYS.CUSTOM_CHANNELS] ?: Record<string,(Channel | ChannelSettings)> | ChannelDefault;
    [Const.Channel.KEYS.CUSTOM_ID_CHANNELS] ?: Record<string,(Channel | ChannelSettings)> | ChannelDefault;
    [Const.Channel.KEYS.USER_CH]  ?: ChannelSettings;
    [Const.Channel.KEYS.USER_GROUP_CH] ?: ChannelSettings;
    [Const.Channel.KEYS.DEFAULT_USER_GROUP_CH] ?: ChannelSettings;
    [Const.Channel.KEYS.ALL_CH] ?: ChannelSettings;
}

export interface ChannelDefault {
    [Const.Channel.CHANNEL_DEFAULT.DEFAULT] ?: (Channel | ChannelSettings);
}

export interface ChannelSettings {
    [Const.Channel.CHANNEL_SETTINGS.SOCKET_GET_OWN_PUBLISH] ?: boolean;
}

export interface Channel
{
    [Const.Channel.CHANNEL.PUBLISH_NOT_ACCESS] ?: ChannelAccessFunction | boolean | string | number | (string|number)[];
    [Const.Channel.CHANNEL.PUBLISH_ACCESS] ?: ChannelAccessFunction | boolean | string | number | (string|number)[];
    [Const.Channel.CHANNEL.SUBSCRIBE_NOT_ACCESS] ?: ChannelAccessFunction | boolean | string | number | (string|number)[];
    [Const.Channel.CHANNEL.SUBSCRIBE_ACCESS] ?: ChannelAccessFunction | boolean | string | number | (string|number)[];

    [Const.Channel.CHANNEL.ON_PUBLISH] ?: ChannelEventFunction;
    [Const.Channel.CHANNEL.ON_SUBSCRIPTION] ?: ChannelEventFunction;
    [Const.Channel.CHANNEL.ON_UNSUBSCRIPTION] ?: ChannelEventFunction;
}

