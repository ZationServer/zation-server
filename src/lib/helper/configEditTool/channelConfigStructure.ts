/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */
import Const                         = require('./../constants/constWrapper');
import SmallBag                      = require("../../api/SmallBag");
import CChInfo                       = require("../infoObjects/cChInfo");
import CIdChInfo                     = require("../infoObjects/cIdChInfo");
import SocketInfo                    = require("../infoObjects/socketInfo");

export type CIdChannelSubAccessFunction =
    (smallBag : SmallBag, chInfo : CIdChInfo, socketInfo : SocketInfo) => Promise<boolean> | boolean;

export type CChannelSubAccessFunction =
    (smallBag : SmallBag, chInfo : CChInfo, socketInfo : SocketInfo) => Promise<boolean> | boolean;

export type CIdChannelClientPubAccessFunction =
    (smallBag : SmallBag, chInfo : CIdChInfo, socketInfo : SocketInfo, pubData : PubData) => Promise<boolean> | boolean;

export type CChannelClientPubAccessFunction =
    (smallBag : SmallBag, chInfo : CChInfo, socketInfo : SocketInfo, pubData : PubData) => Promise<boolean> | boolean;

export type CIdChannelOnClientPubFunction =
    (smallBag : SmallBag, chInfo : CIdChInfo, socketInfo : SocketInfo, pubData : PubData) => Promise<void> | void;

export type CChannelOnClientPubFunction =
    (smallBag : SmallBag, chInfo : CChInfo, socketInfo : SocketInfo, pubData : PubData) => Promise<void> | void;

export type CIdChannelOnBagPubFunction =
    (smallBag : SmallBag, chInfo : CIdChInfo, pubData : any) => Promise<void> | void;

export type CChannelOnBagPubFunction =
    (smallBag : SmallBag, chInfo : CChInfo, pubData : any) => Promise<void> | void;

export type CIdChannelOnSubFunction =
    (smallBag : SmallBag, chInfo : CIdChInfo, socketInfo : SocketInfo) => Promise<void> | void;

export type CChannelOnSubFunction =
    (smallBag : SmallBag, chInfo : CChInfo, socketInfo : SocketInfo) => Promise<void> | void;

export interface ChannelConfig
{
    [Const.Channel.KEYS.CUSTOM_CHANNELS] ?: Record<string,(ChannelSettings | CustomIdCh)> | CChannelDefault;
    [Const.Channel.KEYS.CUSTOM_ID_CHANNELS] ?: Record<string,(ChannelSettings | CustomCh)> | CIdChannelDefault;
    [Const.Channel.KEYS.USER_CH]  ?: ChannelSettings;
    [Const.Channel.KEYS.AUTH_USER_GROUP_CH] ?: ChannelSettings;
    [Const.Channel.KEYS.DEFAULT_USER_GROUP_CH] ?: ChannelSettings;
    [Const.Channel.KEYS.ALL_CH] ?: ChannelSettings;
}

export interface PubData {
    e : string,
    d : any,
    ssi : string | undefined
}

export interface CChannelDefault {
    [Const.Channel.CHANNEL_DEFAULT.DEFAULT] ?: (ChannelSettings | CustomCh);
}

export interface CIdChannelDefault {
    [Const.Channel.CHANNEL_DEFAULT.DEFAULT] ?: (ChannelSettings | CustomIdCh);
}

export interface ChannelSettings {
    [Const.Channel.CHANNEL_SETTINGS.SOCKET_GET_OWN_PUBLISH] ?: boolean;
}

export interface CustomIdCh {
    [Const.Channel.CHANNEL.CLIENT_PUBLISH_NOT_ACCESS] ?: CIdChannelClientPubAccessFunction | boolean | string | number | (string|number)[];
    [Const.Channel.CHANNEL.CLIENT_PUBLISH_ACCESS] ?: CIdChannelClientPubAccessFunction | boolean | string | number | (string|number)[];
    [Const.Channel.CHANNEL.SUBSCRIBE_NOT_ACCESS] ?: CIdChannelSubAccessFunction | boolean | string | number | (string|number)[];
    [Const.Channel.CHANNEL.SUBSCRIBE_ACCESS] ?: CIdChannelSubAccessFunction | boolean | string | number | (string|number)[];

    [Const.Channel.CHANNEL.ON_CLIENT_PUBLISH] ?: CIdChannelOnClientPubFunction | CIdChannelOnClientPubFunction[];
    [Const.Channel.CHANNEL.ON_BAG_PUBLISH] ?: CIdChannelOnBagPubFunction | CIdChannelOnBagPubFunction[];
    [Const.Channel.CHANNEL.ON_SUBSCRIPTION] ?: CIdChannelOnSubFunction | CIdChannelOnSubFunction[];
    [Const.Channel.CHANNEL.ON_UNSUBSCRIPTION] ?: CIdChannelOnSubFunction | CIdChannelOnSubFunction[];
}

export interface CustomCh {
    [Const.Channel.CHANNEL.CLIENT_PUBLISH_NOT_ACCESS] ?: CChannelClientPubAccessFunction | boolean | string | number | (string|number)[];
    [Const.Channel.CHANNEL.CLIENT_PUBLISH_ACCESS] ?: CChannelClientPubAccessFunction | boolean | string | number | (string|number)[];
    [Const.Channel.CHANNEL.SUBSCRIBE_NOT_ACCESS] ?: CChannelSubAccessFunction | boolean | string | number | (string|number)[];
    [Const.Channel.CHANNEL.SUBSCRIBE_ACCESS] ?: CChannelSubAccessFunction | boolean | string | number | (string|number)[];

    [Const.Channel.CHANNEL.ON_CLIENT_PUBLISH] ?: CChannelOnClientPubFunction | CChannelOnClientPubFunction[];
    [Const.Channel.CHANNEL.ON_BAG_PUBLISH] ?: CChannelOnBagPubFunction | CChannelOnBagPubFunction[];
    [Const.Channel.CHANNEL.ON_SUBSCRIPTION] ?: CChannelOnSubFunction | CChannelOnSubFunction[];
    [Const.Channel.CHANNEL.ON_UNSUBSCRIPTION] ?: CChannelOnSubFunction | CChannelOnSubFunction[];
}