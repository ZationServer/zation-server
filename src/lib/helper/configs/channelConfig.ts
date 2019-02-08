/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import SmallBag                      = require("../../api/SmallBag");
import CChInfo                       = require("../infoObjects/cChInfo");
import CIdChInfo                     = require("../infoObjects/cIdChInfo");
import SocketInfo                    = require("../infoObjects/socketInfo");
import PubDataInfo                   = require("../infoObjects/pubDataInfo");

export type CIdChannelSubAccessFunction<SB = {}> =
    (smallBag : (SmallBag & SB), chInfo : CIdChInfo, socketInfo : SocketInfo) => Promise<boolean> | boolean;

export type CIdChannelClientPubAccessFunction<SB = {}> =
    (smallBag : (SmallBag & SB), chInfo : CIdChInfo, socketInfo : SocketInfo, pubData : PubDataInfo) => Promise<boolean> | boolean;

export type CIdChannelOnClientPubFunction<SB = {}> =
    (smallBag : (SmallBag & SB), chInfo : CIdChInfo, socketInfo : SocketInfo, pubData : PubDataInfo) => Promise<void> | void;

export type CIdChannelOnBagPubFunction<SB = {}> =
    (smallBag : (SmallBag & SB), chInfo : CIdChInfo, pubData : PubDataInfo, socketInfo : SocketInfo | undefined) => Promise<void> | void;

export type CIdChannelOnSubFunction<SB = {}> =
    (smallBag : (SmallBag & SB), chInfo : CIdChInfo, socketInfo : SocketInfo) => Promise<void> | void;

export type CIdChannelOnUnsubFunction<SB = {}> =
    (smallBag : (SmallBag & SB), chInfo : CIdChInfo, socketInfo : SocketInfo) => Promise<void> | void;


export type CChannelSubAccessFunction<SB = {}> =
    (smallBag : (SmallBag & SB), chInfo : CChInfo, socketInfo : SocketInfo) => Promise<boolean> | boolean;

export type CChannelClientPubAccessFunction<SB = {}> =
    (smallBag : (SmallBag & SB), chInfo : CChInfo, socketInfo : SocketInfo, pubData : PubDataInfo) => Promise<boolean> | boolean;

export type CChannelOnClientPubFunction<SB = {}> =
    (smallBag : (SmallBag & SB), chInfo : CChInfo, socketInfo : SocketInfo, pubData : PubDataInfo) => Promise<void> | void;

export type CChannelOnBagPubFunction<SB = {}> =
    (smallBag : (SmallBag & SB), chInfo : CChInfo, pubData : PubDataInfo, socketInfo : SocketInfo | undefined) => Promise<void> | void;

export type CChannelOnSubFunction<SB = {}> =
    (smallBag : (SmallBag & SB), chInfo : CChInfo, socketInfo : SocketInfo) => Promise<void> | void;

export type CChannelOnUnsubFunction<SB = {}> =
    (smallBag : (SmallBag & SB), chInfo : CChInfo, socketInfo : SocketInfo) => Promise<void> | void;


export type UserChOnClientPubFunction<SB = {}> =
    (smallBag : (SmallBag & SB), userId : string | number, socketInfo : SocketInfo, pubData : PubDataInfo) => Promise<void> | void;

export type UserChOnBagPubFunction<SB = {}> =
    (smallBag : (SmallBag & SB), userId : string | number, pubData : PubDataInfo, socketInfo : SocketInfo | undefined) => Promise<void> | void;

export type UserChOnSubFunction<SB = {}> =
    (smallBag : (SmallBag & SB), userId : string | number, socketInfo : SocketInfo) => Promise<void> | void;

export type UserChOnUnsubFunction<SB = {}> =
    (smallBag : (SmallBag & SB), userId : string | number, socketInfo : SocketInfo) => Promise<void> | void;


export type AuthUserGroupChOnClientPubFunction<SB = {}> =
    (smallBag : (SmallBag & SB), userGroup  : string, socketInfo : SocketInfo, pubData : PubDataInfo) => Promise<void> | void;

export type AuthUserGroupChOnBagPubFunction<SB = {}> =
    (smallBag : (SmallBag & SB), userGroup  : string, pubData : PubDataInfo, socketInfo : SocketInfo | undefined) => Promise<void> | void;

export type AuthUserGroupChOnSubFunction<SB = {}> =
    (smallBag : (SmallBag & SB), userGroup : string, socketInfo : SocketInfo) => Promise<void> | void;

export type AuthUserGroupChOnUnsubFunction<SB = {}> =
    (smallBag : (SmallBag & SB), userGroup  : string, socketInfo : SocketInfo) => Promise<void> | void;


export type NormalChOnClientPubFunction<SB = {}> =
    (smallBag : (SmallBag & SB), socketInfo : SocketInfo, pubData : PubDataInfo) => Promise<void> | void;

export type NormalChOnBagPubFunction<SB = {}> =
    (smallBag : (SmallBag & SB), pubData : PubDataInfo, socketInfo : SocketInfo | undefined) => Promise<void> | void;

export type NormalChOnSubFunction<SB = {}> =
    (smallBag : (SmallBag & SB), socketInfo : SocketInfo) => Promise<void> | void;

export type NormalChOnUnsubFunction<SB = {}> =
    (smallBag : (SmallBag & SB), socketInfo : SocketInfo) => Promise<void> | void;

export interface ChannelConfig<SB = {}>
{
    customChannels  ?: Record<string,CustomIdCh<SB>> | CChannelDefault<SB>;
    customIdChannels  ?: Record<string,CustomCh<SB>> | CIdChannelDefault<SB>;
    userCh   ?: UserChannel<SB>;
    authUserGroupCh  ?: AuthUserGroupChannel<SB>;
    defaultUserGroupCh  ?: NormalChannel<SB>;
    allCh  ?: NormalChannel<SB>;
}

export interface CChannelDefault<SB = {}> extends ChannelDefault{
    default  ?: CustomCh<SB>;
}

export interface CIdChannelDefault<SB = {}> extends ChannelDefault {
    default  ?: CustomIdCh<SB>;
}

export interface ChannelDefault {
    default ?: any;
}

export interface ChannelSettings {
    socketGetOwnPublish  ?: boolean;
}

export interface UserChannel<SB = {}> extends ZationChannelConfig{
    onClientPublish  ?: UserChOnClientPubFunction<SB> | UserChOnClientPubFunction<SB>[];
    onBagPublish  ?: UserChOnBagPubFunction<SB> | UserChOnBagPubFunction<SB>[];
    onSubscription  ?: UserChOnSubFunction<SB> | UserChOnSubFunction<SB>[];
    onUnsubscription  ?: UserChOnUnsubFunction<SB> | UserChOnUnsubFunction<SB>[];
}

export interface AuthUserGroupChannel<SB = {}> extends ZationChannelConfig{
    onClientPublish  ?: AuthUserGroupChOnClientPubFunction<SB> | AuthUserGroupChOnClientPubFunction<SB>[];
    onBagPublish  ?: AuthUserGroupChOnBagPubFunction<SB> | AuthUserGroupChOnBagPubFunction<SB>[];
    onSubscription  ?: AuthUserGroupChOnSubFunction<SB> | AuthUserGroupChOnSubFunction<SB>[];
    onUnsubscription  ?: AuthUserGroupChOnUnsubFunction<SB> | AuthUserGroupChOnUnsubFunction<SB>[];
}

export interface NormalChannel<SB = {}> extends ZationChannelConfig{
    onClientPublish  ?: NormalChOnClientPubFunction<SB> | NormalChOnClientPubFunction<SB>[];
    onBagPublish  ?: NormalChOnBagPubFunction<SB> | NormalChOnBagPubFunction<SB>[];
    onSubscription  ?: NormalChOnSubFunction<SB> | NormalChOnSubFunction<SB>[];
    onUnsubscription  ?: NormalChOnUnsubFunction<SB> | NormalChOnUnsubFunction<SB>[];
}

export interface ZationChannelConfig extends ChannelSettings{
    onClientPublish  ?: Function | Function[];
    onBagPublish  ?: Function | Function[];
    onSubscription  ?: Function | Function[];
    onUnsubscription  ?: Function | Function[];
    allowClientPublish ?: boolean;
}

export interface CustomIdCh<SB = {}> extends CustomChannelConfig {
    clientPublishNotAccess  ?: CIdChannelClientPubAccessFunction<SB> | boolean | string | number | (string|number)[];
    clientPublishAccess  ?: CIdChannelClientPubAccessFunction<SB> | boolean | string | number | (string|number)[];
    subscribeNotAccess  ?: CIdChannelSubAccessFunction<SB> | boolean | string | number | (string|number)[];
    subscribeAccess  ?: CIdChannelSubAccessFunction<SB> | boolean | string | number | (string|number)[];

    onClientPublish  ?: CIdChannelOnClientPubFunction<SB> | CIdChannelOnClientPubFunction<SB>[];
    onBagPublish  ?: CIdChannelOnBagPubFunction<SB> | CIdChannelOnBagPubFunction<SB>[];
    onSubscription  ?: CIdChannelOnSubFunction<SB> | CIdChannelOnSubFunction<SB>[];
    onUnsubscription  ?: CIdChannelOnUnsubFunction<SB> | CIdChannelOnUnsubFunction<SB>[];
}

export interface CustomCh<SB = {}> extends CustomChannelConfig{
    clientPublishNotAccess  ?: CChannelClientPubAccessFunction<SB> | boolean | string | number | (string|number)[];
    clientPublishAccess  ?: CChannelClientPubAccessFunction<SB> | boolean | string | number | (string|number)[];
    subscribeNotAccess  ?: CChannelSubAccessFunction<SB> | boolean | string | number | (string|number)[];
    subscribeAccess  ?: CChannelSubAccessFunction<SB> | boolean | string | number | (string|number)[];

    onClientPublish  ?: CChannelOnClientPubFunction<SB> | CChannelOnClientPubFunction<SB>[];
    onBagPublish  ?: CChannelOnBagPubFunction<SB> | CChannelOnBagPubFunction<SB>[];
    onSubscription  ?: CChannelOnSubFunction<SB> | CChannelOnSubFunction<SB>[];
    onUnsubscription  ?: CChannelOnUnsubFunction<SB> | CChannelOnUnsubFunction<SB>[];
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