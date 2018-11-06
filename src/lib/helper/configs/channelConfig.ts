/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import SmallBag                      = require("../../api/SmallBag");
import CChInfo                       = require("../infoObjects/cChInfo");
import CIdChInfo                     = require("../infoObjects/cIdChInfo");
import SocketInfo                    = require("../infoObjects/socketInfo");
import PubData                       = require("../infoObjects/pubDataInfo");

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
    (smallBag : SmallBag, chInfo : CIdChInfo, pubData : PubData) => Promise<void> | void;

export type CChannelOnBagPubFunction =
    (smallBag : SmallBag, chInfo : CChInfo, pubData : PubData) => Promise<void> | void;

export type CIdChannelOnSubFunction =
    (smallBag : SmallBag, chInfo : CIdChInfo, socketInfo : SocketInfo) => Promise<void> | void;

export type CChannelOnSubFunction =
    (smallBag : SmallBag, chInfo : CChInfo, socketInfo : SocketInfo) => Promise<void> | void;

export type UserChOnSubFunction =
    (smallBag : SmallBag, userId : string, socketInfo : SocketInfo) => Promise<void> | void;

export type UserChOnUnsubFunction =
    (smallBag : SmallBag, userId : string, socketInfo : SocketInfo) => Promise<void> | void;

export type UserChOnBagPubFunction =
    (smallBag : SmallBag, userId : string, pubData : PubData) => Promise<void> | void;

export type AuthUserGroupChOnSubFunction =
    (smallBag : SmallBag, userGroup : string, socketInfo : SocketInfo) => Promise<void> | void;

export type AuthUserGroupChOnUnsubFunction =
    (smallBag : SmallBag, userGroup  : string, socketInfo : SocketInfo) => Promise<void> | void;

export type AuthUserGroupChOnBagPubFunction =
    (smallBag : SmallBag, userGroup  : string, pubData : PubData) => Promise<void> | void;

export type NormalChOnSubFunction =
    (smallBag : SmallBag, socketInfo : SocketInfo) => Promise<void> | void;

export type NormalChOnUnsubFunction =
    (smallBag : SmallBag, socketInfo : SocketInfo) => Promise<void> | void;

export type NormalChOnBagPubFunction =
    (smallBag : SmallBag, pubData : PubData) => Promise<void> | void;

export interface ChannelConfig
{
    customChannels  ?: Record<string,CustomIdCh> | CChannelDefault;
    customIdChannels  ?: Record<string,CustomCh> | CIdChannelDefault;
    userCh   ?: UserChannel;
    authUserGroupCh  ?: AuthUserGroupChannel;
    defaultUserGroupCh  ?: NormalChannel;
    allCh  ?: NormalChannel;
}

export interface CChannelDefault extends ChannelDefault{
    default  ?: CustomCh;
}

export interface CIdChannelDefault extends ChannelDefault {
    default  ?: CustomIdCh;
}

export interface ChannelDefault {
    default ?: any;
}

export interface ChannelSettings {
    socketGetOwnPublish  ?: boolean;
}

export interface UserChannel extends ZationChannelConfig{
    onSubscription  ?: UserChOnSubFunction | UserChOnSubFunction[];
    onUnsubscription  ?: UserChOnUnsubFunction | UserChOnUnsubFunction[];
    onBagPublish  ?: UserChOnBagPubFunction | UserChOnBagPubFunction [];
}

export interface AuthUserGroupChannel extends ZationChannelConfig{
    onSubscription  ?: AuthUserGroupChOnSubFunction | AuthUserGroupChOnSubFunction[];
    onUnsubscription  ?: AuthUserGroupChOnUnsubFunction | AuthUserGroupChOnUnsubFunction[];
    onBagPublish  ?: AuthUserGroupChOnBagPubFunction | AuthUserGroupChOnBagPubFunction[];
}

export interface NormalChannel extends ZationChannelConfig{
    onSubscription  ?: NormalChOnSubFunction | NormalChOnSubFunction[];
    onUnsubscription  ?: NormalChOnUnsubFunction | NormalChOnUnsubFunction[];
    onBagPublish  ?: NormalChOnBagPubFunction | NormalChOnBagPubFunction[];
}

export interface ZationChannelConfig extends ChannelSettings{
    onSubscription  ?: Function | Function[];
    onUnsubscription  ?: Function | Function[];
    onBagPublish  ?: Function | Function[];
}

export interface CustomIdCh extends CustomChannelConfig {
    clientPublishNotAccess  ?: CIdChannelClientPubAccessFunction | boolean | string | number | (string|number)[];
    clientPublishAccess  ?: CIdChannelClientPubAccessFunction | boolean | string | number | (string|number)[];
    subscribeNotAccess  ?: CIdChannelSubAccessFunction | boolean | string | number | (string|number)[];
    subscribeAccess  ?: CIdChannelSubAccessFunction | boolean | string | number | (string|number)[];

    onClientPublish  ?: CIdChannelOnClientPubFunction | CIdChannelOnClientPubFunction[];
    onBagPublish  ?: CIdChannelOnBagPubFunction | CIdChannelOnBagPubFunction[];
    onSubscription  ?: CIdChannelOnSubFunction | CIdChannelOnSubFunction[];
    onUnsubscription  ?: CIdChannelOnSubFunction | CIdChannelOnSubFunction[];
}

export interface CustomCh extends CustomChannelConfig{
    clientPublishNotAccess  ?: CChannelClientPubAccessFunction | boolean | string | number | (string|number)[];
    clientPublishAccess  ?: CChannelClientPubAccessFunction | boolean | string | number | (string|number)[];
    subscribeNotAccess  ?: CChannelSubAccessFunction | boolean | string | number | (string|number)[];
    subscribeAccess  ?: CChannelSubAccessFunction | boolean | string | number | (string|number)[];

    onClientPublish  ?: CChannelOnClientPubFunction | CChannelOnClientPubFunction[];
    onBagPublish  ?: CChannelOnBagPubFunction | CChannelOnBagPubFunction[];
    onSubscription  ?: CChannelOnSubFunction | CChannelOnSubFunction[];
    onUnsubscription  ?: CChannelOnSubFunction | CChannelOnSubFunction[];
}

export interface CustomChannelConfig extends ChannelSettings{
    clientPublishNotAccess  ?: Function | boolean | string | number | (string|number)[];
    clientPublishAccess  ?: Function | boolean | string | number | (string|number)[];
    subscribeNotAccess  ?: Function | boolean | string | number | (string|number)[];
    subscribeAccess  ?: Function | boolean | string | number | (string|number)[];

    onClientPublish  ?: Function | Function[];
    onBagPublish  ?: Function | Function[];
    onSubscription  ?: Function | Function[];
    onUnsubscription  ?: Function | Function[];
}