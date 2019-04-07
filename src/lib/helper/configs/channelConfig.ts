/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import CChInfo                       = require("../infoObjects/cChInfo");
import CIdChInfo                     = require("../infoObjects/cIdChInfo");
import PubDataInfo                   = require("../infoObjects/pubDataInfo");
import SmallBag                      = require("../../api/SmallBag");
import SocketInfo                      from "../infoObjects/socketInfo";

export type CIdChannelSubAccessFunction =
    (smallBag : SmallBag, chInfo : CIdChInfo, socketInfo : SocketInfo) => Promise<boolean> | boolean;

export type CIdChannelClientPubAccessFunction =
    (smallBag : SmallBag, chInfo : CIdChInfo, socketInfo : SocketInfo, pubData : PubDataInfo) => Promise<boolean> | boolean;

export type CIdChannelOnClientPubFunction =
    (smallBag : SmallBag, chInfo : CIdChInfo, socketInfo : SocketInfo, pubData : PubDataInfo) => Promise<void> | void;

export type CIdChannelOnBagPubFunction =
    (smallBag : SmallBag, chInfo : CIdChInfo, pubData : PubDataInfo, socketInfo : SocketInfo | undefined) => Promise<void> | void;

export type CIdChannelOnSubFunction =
    (smallBag : SmallBag, chInfo : CIdChInfo, socketInfo : SocketInfo) => Promise<void> | void;

export type CIdChannelOnUnsubFunction =
    (smallBag : SmallBag, chInfo : CIdChInfo, socketInfo : SocketInfo) => Promise<void> | void;


export type CChannelSubAccessFunction =
    (smallBag : SmallBag, chInfo : CChInfo, socketInfo : SocketInfo) => Promise<boolean> | boolean;

export type CChannelClientPubAccessFunction =
    (smallBag : SmallBag, chInfo : CChInfo, socketInfo : SocketInfo, pubData : PubDataInfo) => Promise<boolean> | boolean;

export type CChannelOnClientPubFunction =
    (smallBag : SmallBag, chInfo : CChInfo, socketInfo : SocketInfo, pubData : PubDataInfo) => Promise<void> | void;

export type CChannelOnBagPubFunction =
    (smallBag : SmallBag, chInfo : CChInfo, pubData : PubDataInfo, socketInfo : SocketInfo | undefined) => Promise<void> | void;

export type CChannelOnSubFunction =
    (smallBag : SmallBag, chInfo : CChInfo, socketInfo : SocketInfo) => Promise<void> | void;

export type CChannelOnUnsubFunction =
    (smallBag : SmallBag, chInfo : CChInfo, socketInfo : SocketInfo) => Promise<void> | void;


export type UserChOnClientPubFunction =
    (smallBag : SmallBag, userId : string | number, socketInfo : SocketInfo, pubData : PubDataInfo) => Promise<void> | void;

export type UserChOnBagPubFunction =
    (smallBag : SmallBag, userId : string | number, pubData : PubDataInfo, socketInfo : SocketInfo | undefined) => Promise<void> | void;

export type UserChOnSubFunction =
    (smallBag : SmallBag, userId : string | number, socketInfo : SocketInfo) => Promise<void> | void;

export type UserChOnUnsubFunction =
    (smallBag : SmallBag, userId : string | number, socketInfo : SocketInfo) => Promise<void> | void;


export type AuthUserGroupChOnClientPubFunction =
    (smallBag : SmallBag, userGroup  : string, socketInfo : SocketInfo, pubData : PubDataInfo) => Promise<void> | void;

export type AuthUserGroupChOnBagPubFunction =
    (smallBag : SmallBag, userGroup  : string, pubData : PubDataInfo, socketInfo : SocketInfo | undefined) => Promise<void> | void;

export type AuthUserGroupChOnSubFunction =
    (smallBag : SmallBag, userGroup : string, socketInfo : SocketInfo) => Promise<void> | void;

export type AuthUserGroupChOnUnsubFunction =
    (smallBag : SmallBag, userGroup  : string, socketInfo : SocketInfo) => Promise<void> | void;


export type NormalChOnClientPubFunction =
    (smallBag : SmallBag, socketInfo : SocketInfo, pubData : PubDataInfo) => Promise<void> | void;

export type NormalChOnBagPubFunction =
    (smallBag : SmallBag, pubData : PubDataInfo, socketInfo : SocketInfo | undefined) => Promise<void> | void;

export type NormalChOnSubFunction =
    (smallBag : SmallBag, socketInfo : SocketInfo) => Promise<void> | void;

export type NormalChOnUnsubFunction =
    (smallBag : SmallBag, socketInfo : SocketInfo) => Promise<void> | void;

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
    onClientPublish  ?: UserChOnClientPubFunction | UserChOnClientPubFunction[];
    onBagPublish  ?: UserChOnBagPubFunction | UserChOnBagPubFunction[];
    onSubscription  ?: UserChOnSubFunction | UserChOnSubFunction[];
    onUnsubscription  ?: UserChOnUnsubFunction | UserChOnUnsubFunction[];
}

export interface AuthUserGroupChannel extends ZationChannelConfig{
    onClientPublish  ?: AuthUserGroupChOnClientPubFunction | AuthUserGroupChOnClientPubFunction[];
    onBagPublish  ?: AuthUserGroupChOnBagPubFunction | AuthUserGroupChOnBagPubFunction[];
    onSubscription  ?: AuthUserGroupChOnSubFunction | AuthUserGroupChOnSubFunction[];
    onUnsubscription  ?: AuthUserGroupChOnUnsubFunction | AuthUserGroupChOnUnsubFunction[];
}

export interface NormalChannel extends ZationChannelConfig{
    onClientPublish  ?: NormalChOnClientPubFunction | NormalChOnClientPubFunction[];
    onBagPublish  ?: NormalChOnBagPubFunction | NormalChOnBagPubFunction[];
    onSubscription  ?: NormalChOnSubFunction | NormalChOnSubFunction[];
    onUnsubscription  ?: NormalChOnUnsubFunction | NormalChOnUnsubFunction[];
}

export interface ZationChannelConfig extends ChannelSettings{
    onClientPublish  ?: Function | Function[];
    onBagPublish  ?: Function | Function[];
    onSubscription  ?: Function | Function[];
    onUnsubscription  ?: Function | Function[];
    allowClientPublish ?: boolean;
}

export interface CustomIdCh extends CustomChannelConfig {
    clientPublishNotAccess  ?: CIdChannelClientPubAccessFunction | boolean | string | number | (string|number)[];
    clientPublishAccess  ?: CIdChannelClientPubAccessFunction | boolean | string | number | (string|number)[];
    subscribeNotAccess  ?: CIdChannelSubAccessFunction | boolean | string | number | (string|number)[];
    subscribeAccess  ?: CIdChannelSubAccessFunction | boolean | string | number | (string|number)[];

    onClientPublish  ?: CIdChannelOnClientPubFunction | CIdChannelOnClientPubFunction[];
    onBagPublish  ?: CIdChannelOnBagPubFunction | CIdChannelOnBagPubFunction[];
    onSubscription  ?: CIdChannelOnSubFunction | CIdChannelOnSubFunction[];
    onUnsubscription  ?: CIdChannelOnUnsubFunction | CIdChannelOnUnsubFunction[];
}

export interface CustomCh extends CustomChannelConfig{
    clientPublishNotAccess  ?: CChannelClientPubAccessFunction | boolean | string | number | (string|number)[];
    clientPublishAccess  ?: CChannelClientPubAccessFunction | boolean | string | number | (string|number)[];
    subscribeNotAccess  ?: CChannelSubAccessFunction | boolean | string | number | (string|number)[];
    subscribeAccess  ?: CChannelSubAccessFunction | boolean | string | number | (string|number)[];

    onClientPublish  ?: CChannelOnClientPubFunction | CChannelOnClientPubFunction[];
    onBagPublish  ?: CChannelOnBagPubFunction | CChannelOnBagPubFunction[];
    onSubscription  ?: CChannelOnSubFunction | CChannelOnSubFunction[];
    onUnsubscription  ?: CChannelOnUnsubFunction | CChannelOnUnsubFunction[];
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