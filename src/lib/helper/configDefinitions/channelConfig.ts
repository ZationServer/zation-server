/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import SocketInfo           from "../infoObjects/socketInfo";
import SmallBag             from "../../api/SmallBag";
import PubData              from "../infoObjects/pubData";
import CIdChInfo            from "../infoObjects/cIdChInfo";
import CChInfo              from "../infoObjects/cChInfo";

type AnyFunction = (...args : any[]) => Promise<any> | any

export type CIdChannelOnClientPubFunction =
    (smallBag : SmallBag, chInfo : CIdChInfo, pubData : PubData, socketInfo : SocketInfo) => Promise<void> | void;

export type CIdChannelOnBagPubFunction =
    (smallBag : SmallBag, chInfo : CIdChInfo, pubData : PubData, socketInfo : SocketInfo | undefined) => Promise<void> | void;

export type CIdChannelOnSubFunction =
    (smallBag : SmallBag, chInfo : CIdChInfo, socketInfo : SocketInfo) => Promise<void> | void;

export type CIdChannelOnUnsubFunction =
    (smallBag : SmallBag, chInfo : CIdChInfo, socketInfo : SocketInfo) => Promise<void> | void;

export type CIdChannelClientPubAccessFunction =
    (smallBag : SmallBag, pubData : PubData, socketInfo : SocketInfo, chInfo : CIdChInfo) => Promise<boolean> | boolean;

export type CIdChannelSubAccessFunction =
    (smallBag : SmallBag, socketInfo : SocketInfo, chInfo : CIdChInfo) => Promise<boolean> | boolean;


export type CChannelOnClientPubFunction =
    (smallBag : SmallBag, chInfo : CChInfo, pubData : PubData, socketInfo : SocketInfo) => Promise<void> | void;

export type CChannelOnBagPubFunction =
    (smallBag : SmallBag, chInfo : CChInfo, pubData : PubData, socketInfo : SocketInfo | undefined) => Promise<void> | void;

export type CChannelOnSubFunction =
    (smallBag : SmallBag, chInfo : CChInfo, socketInfo : SocketInfo) => Promise<void> | void;

export type CChannelOnUnsubFunction =
    (smallBag : SmallBag, chInfo : CChInfo, socketInfo : SocketInfo) => Promise<void> | void;

export type CChannelClientPubAccessFunction =
    (smallBag : SmallBag, pubData : PubData, socketInfo : SocketInfo, chInfo : CChInfo) => Promise<boolean> | boolean;

export type CChannelSubAccessFunction =
    (smallBag : SmallBag, socketInfo : SocketInfo, chInfo : CChInfo) => Promise<boolean> | boolean;


export type UserChOnClientPubFunction =
    (smallBag : SmallBag, userId : string, pubData : PubData, socketInfo : SocketInfo) => Promise<void> | void;

export type UserChOnBagPubFunction =
    (smallBag : SmallBag, userId : string, pubData : PubData, socketInfo : SocketInfo | undefined) => Promise<void> | void;

export type UserChOnSubFunction =
    (smallBag : SmallBag, userId : string, socketInfo : SocketInfo) => Promise<void> | void;

export type UserChOnUnsubFunction =
    (smallBag : SmallBag, userId : string, socketInfo : SocketInfo) => Promise<void> | void;

export type UserChClientPubAccessFunction =
    (smallBag : SmallBag, pubData : PubData, socketInfo : SocketInfo, userId : string) => Promise<boolean> | boolean;


export type AuthUserGroupChOnClientPubFunction =
    (smallBag : SmallBag, authUserGroup  : string, pubData : PubData, socketInfo : SocketInfo) => Promise<void> | void;

export type AuthUserGroupChOnBagPubFunction =
    (smallBag : SmallBag, authUserGroup  : string, pubData : PubData, socketInfo : SocketInfo | undefined) => Promise<void> | void;

export type AuthUserGroupChOnSubFunction =
    (smallBag : SmallBag, authUserGroup : string, socketInfo : SocketInfo) => Promise<void> | void;

export type AuthUserGroupChOnUnsubFunction =
    (smallBag : SmallBag, authUserGroup  : string, socketInfo : SocketInfo) => Promise<void> | void;

export type AuthUserGroupChClientPubAccessFunction =
    (smallBag : SmallBag, pubData : PubData, socketInfo : SocketInfo, authUserGroup : string) => Promise<boolean> | boolean;


export type NormalChOnClientPubFunction =
    (smallBag : SmallBag, pubData : PubData, socketInfo : SocketInfo) => Promise<void> | void;

export type NormalChOnBagPubFunction =
    (smallBag : SmallBag, pubData : PubData, socketInfo : SocketInfo | undefined) => Promise<void> | void;

export type NormalChOnSubFunction =
    (smallBag : SmallBag, socketInfo : SocketInfo) => Promise<void> | void;

export type NormalChOnUnsubFunction =
    (smallBag : SmallBag, socketInfo : SocketInfo) => Promise<void> | void;

export type NormalChClientPubAccessFunction =
    (smallBag : SmallBag, pubData : PubData, socketInfo : SocketInfo) => Promise<boolean> | boolean;

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
    customChannels  ?: Record<string,CustomCh> | ChannelDefault<CustomCh>;
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
    customIdChannels  ?: Record<string,CustomIdCh> | ChannelDefault<CustomIdCh>;
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

export interface ChannelDefault<T = any> {
    /**
     * Set the default options.
     */
    default ?: T;
}

export interface ChannelSettings {
    /**
     * Indicates if the client that publish should get his own publish.
     * @default true
     */
    socketGetOwnPublish  ?: boolean;
}

export interface ZationChannelConfig<Pub = AnyFunction,BagPub = AnyFunction,Sub = AnyFunction,Unsub = AnyFunction,PubAccess = AnyFunction> extends ChannelSettings{
    /**
     * @description
     * Set event listener that gets triggered when the client is publishing in this channel.
     */
    onClientPublish  ?: Pub | Pub[];
    /**
     * @description
     * Set event listener that gets triggered when the bag is publishing in this channel.
     */
    onBagPublish  ?: BagPub | BagPub[];
    /**
     * @description
     * Set event listener that gets triggered when the client is subscribing that channel.
     */
    onSubscription  ?: Sub | Sub[];
    /**
     * @description
     * Set event listener that gets triggered when the client is unsubscribing that channel.
     */
    onUnsubscription  ?: Unsub | Unsub[];
    /**
     * @description
     * Set the access rule which clients are not allowed to publish in this channel.
     * Notice that only one of the options 'clientPublishNotAccess' or 'clientPublishAccess' is allowed.
     * Look in the examples to see what possibilities you have.
     * @default (use clientPublishAccess)
     * @example
     * //boolean
     * true            // No client is allowed
     * false           // All clients are allowed
     * //string
     * 'all'           // No client is allowed
     * 'allAuth'       // All authenticated clients are not allowed
     * 'allNotAuth'    // All not authenticated clients are not allowed (all authenticated are allowed)
     * 'admin'         // All admins are not allowed
     * //number
     * 10              // All clients with user id 10 are not allowed
     * //array
     * ['user','guest',23] // All clients with user group user, default user group or user id 23 are not allowed.
     * //function
     * (smallBag,...) => {} // If returns true the client is not allowed, false will allow.
     * To see all arguments of the function, check out the current generic function type.
     */
    clientPublishNotAccess  ?: PubAccess | boolean | string | number | (string|number)[];
    /**
     * @description
     * Set the access rule which clients are allowed to publish in this channel.
     * Notice that only one of the options 'clientPublishNotAccess' or 'clientPublishAccess' is allowed.
     * Look in the examples to see what possibilities you have.
     * @default false
     * @example
     * //boolean
     * true            // All clients are allowed
     * false           // No client is allowed
     * //string
     * 'all'           // All clients are allowed
     * 'allAuth'       // Only all authenticated clients are allowed
     * 'allNotAuth'    // Only all not authenticated clients are allowed (all authenticated are not allowed)
     * 'admin'         // Only all admins are allowed
     * //number
     * 10              // Only all clients with user id 10 are allowed
     * //array
     * ['user','guest',23] // Only all clients with user group user, default user group or user id 23 are allowed.
     * //function
     * (smallBag,...) => {} // If returns true the client is allowed, false will not allow.
     * To see all arguments of the function, check out the current generic function type.
     */
    clientPublishAccess  ?: PubAccess | boolean | string | number | (string|number)[];
}

export type UserChannel = ZationChannelConfig<
    UserChOnClientPubFunction,
    UserChOnBagPubFunction,
    UserChOnSubFunction,
    UserChOnUnsubFunction,
    UserChClientPubAccessFunction
    >;

export type AuthUserGroupChannel = ZationChannelConfig<
    AuthUserGroupChOnClientPubFunction,
    AuthUserGroupChOnBagPubFunction,
    AuthUserGroupChOnSubFunction,
    AuthUserGroupChOnUnsubFunction,
    AuthUserGroupChClientPubAccessFunction
    >;

export type NormalChannel = ZationChannelConfig<
    NormalChOnClientPubFunction,
    NormalChOnBagPubFunction,
    NormalChOnSubFunction,
    NormalChOnUnsubFunction,
    NormalChClientPubAccessFunction
    >;

export interface CustomChannelConfig<Pub = AnyFunction,BagPub = AnyFunction,Sub = AnyFunction,Unsub = AnyFunction,PubAccess = AnyFunction,SubAccess = AnyFunction>
    extends ZationChannelConfig<Pub,BagPub,Sub,Unsub,PubAccess> {
    /**
     * @description
     * Set the access rule which clients are not allowed to subscribe this channel.
     * Notice that only one of the options 'subscribeNotAccess' or 'subscribeAccess' is allowed.
     * Look in the examples to see what possibilities you have.
     * @default (use subscribeAccess)
     * @example
     * //boolean
     * true            // No client is allowed
     * false           // All clients are allowed
     * //string
     * 'all'           // No client is allowed
     * 'allAuth'       // All authenticated clients are not allowed
     * 'allNotAuth'    // All not authenticated clients are not allowed (all authenticated are allowed)
     * 'admin'         // All admins are not allowed
     * //number
     * 10              // All clients with user id 10 are not allowed
     * //array
     * ['user','guest',23] // All clients with user group user, default user group or user id 23 are not allowed.
     * //function
     * (smallBag,...) => {} // If returns true the client is not allowed, false will allow.
     * To see all arguments of the function, check out the current generic function type.
     */
    subscribeNotAccess  ?: SubAccess | boolean | string | number | (string|number)[];
    /**
     * @description
     * Set the access rule which clients are allowed to subscribe this channel.
     * Notice that only one of the options 'subscribeNotAccess' or 'subscribeAccess' is allowed.
     * Look in the examples to see what possibilities you have.
     * @default false
     * @example
     * //boolean
     * true            // All clients are allowed
     * false           // No client is allowed
     * //string
     * 'all'           // All clients are allowed
     * 'allAuth'       // Only all authenticated clients are allowed
     * 'allNotAuth'    // Only all not authenticated clients are allowed (all authenticated are not allowed)
     * 'admin'         // Only all admins are allowed
     * //number
     * 10              // Only all clients with user id 10 are allowed
     * //array
     * ['user','guest',23] // Only all clients with user group user, default user group or user id 23 are allowed.
     * //function
     * (smallBag,...) => {} // If returns true the client is allowed, false will not allow.
     * To see all arguments of the function, check out the current generic function type.
     */
    subscribeAccess  ?: SubAccess | boolean | string | number | (string|number)[];
}

export type CustomIdCh = CustomChannelConfig<
    CIdChannelOnClientPubFunction,
    CIdChannelOnBagPubFunction,
    CIdChannelOnSubFunction,
    CIdChannelOnUnsubFunction,
    CIdChannelClientPubAccessFunction,
    CIdChannelSubAccessFunction
    >;

export type CustomCh = CustomChannelConfig<
    CChannelOnClientPubFunction,
    CChannelOnBagPubFunction,
    CChannelOnSubFunction,
    CChannelOnUnsubFunction,
    CChannelClientPubAccessFunction,
    CChannelSubAccessFunction
    >;