/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import SocketInfo           from "../infoObjects/socketInfo";
import SmallBag             from "../../api/SmallBag";
import PubData          from "../infoObjects/pubData";
import CIdChInfo            from "../infoObjects/cIdChInfo";
import CChInfo              from "../infoObjects/cChInfo";

type AnyFunction = (...args : any[]) => Promise<any> | any

export type CIdChannelSubAccessFunction =
    (smallBag : SmallBag, chInfo : CIdChInfo, socketInfo : SocketInfo) => Promise<boolean> | boolean;

export type CIdChannelClientPubAccessFunction =
    (smallBag : SmallBag, chInfo : CIdChInfo, pubData : PubData, socketInfo : SocketInfo) => Promise<boolean> | boolean;

export type CIdChannelOnClientPubFunction =
    (smallBag : SmallBag, chInfo : CIdChInfo, pubData : PubData, socketInfo : SocketInfo) => Promise<void> | void;

export type CIdChannelOnBagPubFunction =
    (smallBag : SmallBag, chInfo : CIdChInfo, pubData : PubData, socketInfo : SocketInfo | undefined) => Promise<void> | void;

export type CIdChannelOnSubFunction =
    (smallBag : SmallBag, chInfo : CIdChInfo, socketInfo : SocketInfo) => Promise<void> | void;

export type CIdChannelOnUnsubFunction =
    (smallBag : SmallBag, chInfo : CIdChInfo, socketInfo : SocketInfo) => Promise<void> | void;


export type CChannelSubAccessFunction =
    (smallBag : SmallBag, chInfo : CChInfo, socketInfo : SocketInfo) => Promise<boolean> | boolean;

export type CChannelClientPubAccessFunction =
    (smallBag : SmallBag, chInfo : CChInfo, pubData : PubData, socketInfo : SocketInfo) => Promise<boolean> | boolean;

export type CChannelOnClientPubFunction =
    (smallBag : SmallBag, chInfo : CChInfo, pubData : PubData, socketInfo : SocketInfo) => Promise<void> | void;

export type CChannelOnBagPubFunction =
    (smallBag : SmallBag, chInfo : CChInfo, pubData : PubData, socketInfo : SocketInfo | undefined) => Promise<void> | void;

export type CChannelOnSubFunction =
    (smallBag : SmallBag, chInfo : CChInfo, socketInfo : SocketInfo) => Promise<void> | void;

export type CChannelOnUnsubFunction =
    (smallBag : SmallBag, chInfo : CChInfo, socketInfo : SocketInfo) => Promise<void> | void;


export type UserChOnClientPubFunction =
    (smallBag : SmallBag, userId : string, pubData : PubData, socketInfo : SocketInfo) => Promise<void> | void;

export type UserChOnBagPubFunction =
    (smallBag : SmallBag, userId : string, pubData : PubData, socketInfo : SocketInfo | undefined) => Promise<void> | void;

export type UserChOnSubFunction =
    (smallBag : SmallBag, userId : string, socketInfo : SocketInfo) => Promise<void> | void;

export type UserChOnUnsubFunction =
    (smallBag : SmallBag, userId : string, socketInfo : SocketInfo) => Promise<void> | void;


export type AuthUserGroupChOnClientPubFunction =
    (smallBag : SmallBag, authUserGroup  : string, pubData : PubData, socketInfo : SocketInfo) => Promise<void> | void;

export type AuthUserGroupChOnBagPubFunction =
    (smallBag : SmallBag, authUserGroup  : string, pubData : PubData, socketInfo : SocketInfo | undefined) => Promise<void> | void;

export type AuthUserGroupChOnSubFunction =
    (smallBag : SmallBag, authUserGroup : string, socketInfo : SocketInfo) => Promise<void> | void;

export type AuthUserGroupChOnUnsubFunction =
    (smallBag : SmallBag, authUserGroup  : string, socketInfo : SocketInfo) => Promise<void> | void;


export type NormalChOnClientPubFunction =
    (smallBag : SmallBag, pubData : PubData, socketInfo : SocketInfo) => Promise<void> | void;

export type NormalChOnBagPubFunction =
    (smallBag : SmallBag, pubData : PubData, socketInfo : SocketInfo | undefined) => Promise<void> | void;

export type NormalChOnSubFunction =
    (smallBag : SmallBag, socketInfo : SocketInfo) => Promise<void> | void;

export type NormalChOnUnsubFunction =
    (smallBag : SmallBag, socketInfo : SocketInfo) => Promise<void> | void;

export interface ChannelConfig
{
    /**
     * Define your custom channels in objects and register event listeners.
     * Use a custom channel if you only need one specific kind of this channel.
     * For example, I have one stream where a particular group of clients can publish in or subscribe.
     * The key of the object is the name of the channel.
     * There is one particular key that is the default key.
     * With this key, you can define default settings for every custom channel.
     * @example
     * customChannels : {
     *     default : {
     *         clientPublishAccess : false,
     *         subscribeAccess : true,
     *     },
     *     stream : {
     *         subscribeAccess : 'allAuth',
     *     }
     * }
     */
    customChannels  ?: Record<string,CustomIdCh> | CChannelDefault;
    /**
     * Define your custom id channels in objects and register event listeners.
     * Use a custom id channel if you need more than one channel of these type.
     * For example, I have a private user chat where more chats can be created with a specific id.
     * Now I can have more channels from type user chat with different identifiers.
     * The key of the object is the name of the channel.
     * There is one particular key that is the default key.
     * With this key, you can define default settings for every custom id channel.
     * @example
     * customIdChannels : {
     *     default : {
     *         clientPublishAccess : false,
     *         subscribeAccess : true,
     *     },
     *     userChat : {
     *         subscribeAccess : 'allAuth',
     *     }
     * }
     */
    customIdChannels  ?: Record<string,CustomCh> | CIdChannelDefault;
    /**
     * Add options or register event listeners to the user channels of zation.
     * Every user id has its own channel.
     * @example
     * userCh : {
     *     onSubscription : () => {}
     * }
     */
    userCh   ?: UserChannel;
    /**
     * Add options or register event listeners to the auth user group channels of zation.
     * Every auth user group has its own channel.
     * @example
     * authUserGroupCh : {
     *     onSubscription : () => {}
     * }
     */
    authUserGroupCh  ?: AuthUserGroupChannel;
    /**
     * Add options or register event listeners to the default user group channel of zation.
     * @example
     * defaultUserGroupCh : {
     *     onSubscription : () => {}
     * }
     */
    defaultUserGroupCh  ?: NormalChannel;
    /**
     * Add options or register event listeners to the all channel of zation.
     * @example
     * allCh : {
     *     onSubscription : () => {}
     * }
     */
    allCh  ?: NormalChannel;
}

export interface PreCompiledChannelConfig extends ChannelConfig{
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
    /**
     * Indicates if the client that publish should get his own publish.
     * @default true
     */
    socketGetOwnPublish  ?: boolean;
}

export interface UserChannel extends ZationChannelConfig{
    /**
     *
     */
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
    onClientPublish  ?: AnyFunction| AnyFunction[];
    onBagPublish  ?: AnyFunction | AnyFunction[];
    onSubscription  ?: AnyFunction | AnyFunction[];
    onUnsubscription  ?: AnyFunction | AnyFunction[];
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

export interface CustomChannelConfig extends ZationChannelConfig{
    clientPublishNotAccess  ?: Function | boolean | string | number | (string|number)[];
    clientPublishAccess  ?: Function | boolean | string | number | (string|number)[];
    subscribeNotAccess  ?: Function | boolean | string | number | (string|number)[];
    subscribeAccess  ?: Function | boolean | string | number | (string|number)[];
}