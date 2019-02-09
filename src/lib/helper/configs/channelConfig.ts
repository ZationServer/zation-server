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
import BagExtension                    from "../bagExtension/bagExtension";

export type CIdChannelSubAccessFunction<E extends BagExtension = {smallBag:{},bag:{}}> =
    (smallBag : (SmallBag & E["smallBag"]), chInfo : CIdChInfo, socketInfo : SocketInfo) => Promise<boolean> | boolean;

export type CIdChannelClientPubAccessFunction<E extends BagExtension = {smallBag:{},bag:{}}> =
    (smallBag : (SmallBag & E["smallBag"]), chInfo : CIdChInfo, socketInfo : SocketInfo, pubData : PubDataInfo) => Promise<boolean> | boolean;

export type CIdChannelOnClientPubFunction<E extends BagExtension = {smallBag:{},bag:{}}> =
    (smallBag : (SmallBag & E["smallBag"]), chInfo : CIdChInfo, socketInfo : SocketInfo, pubData : PubDataInfo) => Promise<void> | void;

export type CIdChannelOnBagPubFunction<E extends BagExtension = {smallBag:{},bag:{}}> =
    (smallBag : (SmallBag & E["smallBag"]), chInfo : CIdChInfo, pubData : PubDataInfo, socketInfo : SocketInfo | undefined) => Promise<void> | void;

export type CIdChannelOnSubFunction<E extends BagExtension = {smallBag:{},bag:{}}> =
    (smallBag : (SmallBag & E["smallBag"]), chInfo : CIdChInfo, socketInfo : SocketInfo) => Promise<void> | void;

export type CIdChannelOnUnsubFunction<E extends BagExtension = {smallBag:{},bag:{}}> =
    (smallBag : (SmallBag & E["smallBag"]), chInfo : CIdChInfo, socketInfo : SocketInfo) => Promise<void> | void;


export type CChannelSubAccessFunction<E extends BagExtension = {smallBag:{},bag:{}}> =
    (smallBag : (SmallBag & E["smallBag"]), chInfo : CChInfo, socketInfo : SocketInfo) => Promise<boolean> | boolean;

export type CChannelClientPubAccessFunction<E extends BagExtension = {smallBag:{},bag:{}}> =
    (smallBag : (SmallBag & E["smallBag"]), chInfo : CChInfo, socketInfo : SocketInfo, pubData : PubDataInfo) => Promise<boolean> | boolean;

export type CChannelOnClientPubFunction<E extends BagExtension = {smallBag:{},bag:{}}> =
    (smallBag : (SmallBag & E["smallBag"]), chInfo : CChInfo, socketInfo : SocketInfo, pubData : PubDataInfo) => Promise<void> | void;

export type CChannelOnBagPubFunction<E extends BagExtension = {smallBag:{},bag:{}}> =
    (smallBag : (SmallBag & E["smallBag"]), chInfo : CChInfo, pubData : PubDataInfo, socketInfo : SocketInfo | undefined) => Promise<void> | void;

export type CChannelOnSubFunction<E extends BagExtension = {smallBag:{},bag:{}}> =
    (smallBag : (SmallBag & E["smallBag"]), chInfo : CChInfo, socketInfo : SocketInfo) => Promise<void> | void;

export type CChannelOnUnsubFunction<E extends BagExtension = {smallBag:{},bag:{}}> =
    (smallBag : (SmallBag & E["smallBag"]), chInfo : CChInfo, socketInfo : SocketInfo) => Promise<void> | void;


export type UserChOnClientPubFunction<E extends BagExtension = {smallBag:{},bag:{}}> =
    (smallBag : (SmallBag & E["smallBag"]), userId : string | number, socketInfo : SocketInfo, pubData : PubDataInfo) => Promise<void> | void;

export type UserChOnBagPubFunction<E extends BagExtension = {smallBag:{},bag:{}}> =
    (smallBag : (SmallBag & E["smallBag"]), userId : string | number, pubData : PubDataInfo, socketInfo : SocketInfo | undefined) => Promise<void> | void;

export type UserChOnSubFunction<E extends BagExtension = {smallBag:{},bag:{}}> =
    (smallBag : (SmallBag & E["smallBag"]), userId : string | number, socketInfo : SocketInfo) => Promise<void> | void;

export type UserChOnUnsubFunction<E extends BagExtension = {smallBag:{},bag:{}}> =
    (smallBag : (SmallBag & E["smallBag"]), userId : string | number, socketInfo : SocketInfo) => Promise<void> | void;


export type AuthUserGroupChOnClientPubFunction<E extends BagExtension = {smallBag:{},bag:{}}> =
    (smallBag : (SmallBag & E["smallBag"]), userGroup  : string, socketInfo : SocketInfo, pubData : PubDataInfo) => Promise<void> | void;

export type AuthUserGroupChOnBagPubFunction<E extends BagExtension = {smallBag:{},bag:{}}> =
    (smallBag : (SmallBag & E["smallBag"]), userGroup  : string, pubData : PubDataInfo, socketInfo : SocketInfo | undefined) => Promise<void> | void;

export type AuthUserGroupChOnSubFunction<E extends BagExtension = {smallBag:{},bag:{}}> =
    (smallBag : (SmallBag & E["smallBag"]), userGroup : string, socketInfo : SocketInfo) => Promise<void> | void;

export type AuthUserGroupChOnUnsubFunction<E extends BagExtension = {smallBag:{},bag:{}}> =
    (smallBag : (SmallBag & E["smallBag"]), userGroup  : string, socketInfo : SocketInfo) => Promise<void> | void;


export type NormalChOnClientPubFunction<E extends BagExtension = {smallBag:{},bag:{}}> =
    (smallBag : (SmallBag & E["smallBag"]), socketInfo : SocketInfo, pubData : PubDataInfo) => Promise<void> | void;

export type NormalChOnBagPubFunction<E extends BagExtension = {smallBag:{},bag:{}}> =
    (smallBag : (SmallBag & E["smallBag"]), pubData : PubDataInfo, socketInfo : SocketInfo | undefined) => Promise<void> | void;

export type NormalChOnSubFunction<E extends BagExtension = {smallBag:{},bag:{}}> =
    (smallBag : (SmallBag & E["smallBag"]), socketInfo : SocketInfo) => Promise<void> | void;

export type NormalChOnUnsubFunction<E extends BagExtension = {smallBag:{},bag:{}}> =
    (smallBag : (SmallBag & E["smallBag"]), socketInfo : SocketInfo) => Promise<void> | void;

export interface ChannelConfig<E extends BagExtension = {smallBag:{},bag:{}}>
{
    customChannels  ?: Record<string,CustomIdCh<E>> | CChannelDefault<E>;
    customIdChannels  ?: Record<string,CustomCh<E>> | CIdChannelDefault<E>;
    userCh   ?: UserChannel<E>;
    authUserGroupCh  ?: AuthUserGroupChannel<E>;
    defaultUserGroupCh  ?: NormalChannel<E>;
    allCh  ?: NormalChannel<E>;
}

export interface CChannelDefault<E extends BagExtension = {smallBag:{},bag:{}}> extends ChannelDefault{
    default  ?: CustomCh<E>;
}

export interface CIdChannelDefault<E extends BagExtension = {smallBag:{},bag:{}}> extends ChannelDefault {
    default  ?: CustomIdCh<E>;
}

export interface ChannelDefault {
    default ?: any;
}

export interface ChannelSettings {
    socketGetOwnPublish  ?: boolean;
}

export interface UserChannel<E extends BagExtension = {smallBag:{},bag:{}}> extends ZationChannelConfig{
    onClientPublish  ?: UserChOnClientPubFunction<E> | UserChOnClientPubFunction<E>[];
    onBagPublish  ?: UserChOnBagPubFunction<E> | UserChOnBagPubFunction<E>[];
    onSubscription  ?: UserChOnSubFunction<E> | UserChOnSubFunction<E>[];
    onUnsubscription  ?: UserChOnUnsubFunction<E> | UserChOnUnsubFunction<E>[];
}

export interface AuthUserGroupChannel<E extends BagExtension = {smallBag:{},bag:{}}> extends ZationChannelConfig{
    onClientPublish  ?: AuthUserGroupChOnClientPubFunction<E> | AuthUserGroupChOnClientPubFunction<E>[];
    onBagPublish  ?: AuthUserGroupChOnBagPubFunction<E> | AuthUserGroupChOnBagPubFunction<E>[];
    onSubscription  ?: AuthUserGroupChOnSubFunction<E> | AuthUserGroupChOnSubFunction<E>[];
    onUnsubscription  ?: AuthUserGroupChOnUnsubFunction<E> | AuthUserGroupChOnUnsubFunction<E>[];
}

export interface NormalChannel<E extends BagExtension = {smallBag:{},bag:{}}> extends ZationChannelConfig{
    onClientPublish  ?: NormalChOnClientPubFunction<E> | NormalChOnClientPubFunction<E>[];
    onBagPublish  ?: NormalChOnBagPubFunction<E> | NormalChOnBagPubFunction<E>[];
    onSubscription  ?: NormalChOnSubFunction<E> | NormalChOnSubFunction<E>[];
    onUnsubscription  ?: NormalChOnUnsubFunction<E> | NormalChOnUnsubFunction<E>[];
}

export interface ZationChannelConfig extends ChannelSettings{
    onClientPublish  ?: Function | Function[];
    onBagPublish  ?: Function | Function[];
    onSubscription  ?: Function | Function[];
    onUnsubscription  ?: Function | Function[];
    allowClientPublish ?: boolean;
}

export interface CustomIdCh<E extends BagExtension = {smallBag:{},bag:{}}> extends CustomChannelConfig {
    clientPublishNotAccess  ?: CIdChannelClientPubAccessFunction<E> | boolean | string | number | (string|number)[];
    clientPublishAccess  ?: CIdChannelClientPubAccessFunction<E> | boolean | string | number | (string|number)[];
    subscribeNotAccess  ?: CIdChannelSubAccessFunction<E> | boolean | string | number | (string|number)[];
    subscribeAccess  ?: CIdChannelSubAccessFunction<E> | boolean | string | number | (string|number)[];

    onClientPublish  ?: CIdChannelOnClientPubFunction<E> | CIdChannelOnClientPubFunction<E>[];
    onBagPublish  ?: CIdChannelOnBagPubFunction<E> | CIdChannelOnBagPubFunction<E>[];
    onSubscription  ?: CIdChannelOnSubFunction<E> | CIdChannelOnSubFunction<E>[];
    onUnsubscription  ?: CIdChannelOnUnsubFunction<E> | CIdChannelOnUnsubFunction<E>[];
}

export interface CustomCh<E extends BagExtension = {smallBag:{},bag:{}}> extends CustomChannelConfig{
    clientPublishNotAccess  ?: CChannelClientPubAccessFunction<E> | boolean | string | number | (string|number)[];
    clientPublishAccess  ?: CChannelClientPubAccessFunction<E> | boolean | string | number | (string|number)[];
    subscribeNotAccess  ?: CChannelSubAccessFunction<E> | boolean | string | number | (string|number)[];
    subscribeAccess  ?: CChannelSubAccessFunction<E> | boolean | string | number | (string|number)[];

    onClientPublish  ?: CChannelOnClientPubFunction<E> | CChannelOnClientPubFunction<E>[];
    onBagPublish  ?: CChannelOnBagPubFunction<E> | CChannelOnBagPubFunction<E>[];
    onSubscription  ?: CChannelOnSubFunction<E> | CChannelOnSubFunction<E>[];
    onUnsubscription  ?: CChannelOnUnsubFunction<E> | CChannelOnUnsubFunction<E>[];
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