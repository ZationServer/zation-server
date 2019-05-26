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
import {ChannelConfig} from "../../../../dist/lib/helper/configDefinitions/channelConfig";

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

export interface ZationChannelConfig extends ChannelSettings{
    /**
     * @description
     * Set event listener that gets triggered when the client is publishing in this channel.
     */
    onClientPublish  ?: AnyFunction| AnyFunction[];
    /**
     * @description
     * Set event listener that gets triggered when the bag is publishing in this channel.
     */
    onBagPublish  ?: AnyFunction | AnyFunction[];
    /**
     * @description
     * Set event listener that gets triggered when the client is subscribing that channel.
     */
    onSubscription  ?: AnyFunction | AnyFunction[];
    /**
     * @description
     * Set event listener that gets triggered when the client is unsubscribing that channel.
     */
    onUnsubscription  ?: AnyFunction | AnyFunction[];
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
     * (smallBag) => {} // If returns true the client is not allowed, false will allow.
     */
    clientPublishNotAccess  ?: Function | boolean | string | number | (string|number)[];
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
     * (smallBag) => {} // If returns true the client is allowed, false will not allow.
     */
    clientPublishAccess  ?: Function | boolean | string | number | (string|number)[];
}

export interface UserChannel extends ZationChannelConfig{
    /**
     * @description
     * Set event listener that gets triggered when the client is publishing in a user channel.
     * @example (smallBag, userId, pubData, socketInfo) => {}
     */
    onClientPublish  ?: UserChOnClientPubFunction | UserChOnClientPubFunction[];
    /**
     * @description
     * Set event listener that gets triggered when the bag is publishing in a user channel.
     * @example (smallBag, userId, pubData, socketInfo) => {}
     */
    onBagPublish  ?: UserChOnBagPubFunction | UserChOnBagPubFunction[];
    /**
     * @description
     * Set event listener that gets triggered when the client is subscribing a user channel.
     * @example (smallBag, userId, socketInfo) => {}
     */
    onSubscription  ?: UserChOnSubFunction | UserChOnSubFunction[];
    /**
     * @description
     * Set event listener that gets triggered when the client is unsubscribing a user channel.
     * @example (smallBag, userId, socketInfo) => {}
     */
    onUnsubscription  ?: UserChOnUnsubFunction | UserChOnUnsubFunction[];
}

export interface AuthUserGroupChannel extends ZationChannelConfig{
    /**
     * @description
     * Set event listener that gets triggered when the client is publishing in a auth user group channel.
     * @example (smallBag, authUserGroup, pubData, socketInfo) => {}
     */
    onClientPublish  ?: AuthUserGroupChOnClientPubFunction | AuthUserGroupChOnClientPubFunction[];
    /**
     * @description
     * Set event listener that gets triggered when the bag is publishing in a auth user group channel.
     * @example (smallBag, authUserGroup, pubData, socketInfo) => {}
     */
    onBagPublish  ?: AuthUserGroupChOnBagPubFunction | AuthUserGroupChOnBagPubFunction[];
    /**
     * @description
     * Set event listener that gets triggered when the client is subscribing a auth user group channel.
     * @example (smallBag, authUserGroup, socketInfo) => {}
     */
    onSubscription  ?: AuthUserGroupChOnSubFunction | AuthUserGroupChOnSubFunction[];
    /**
     * @description
     * Set event listener that gets triggered when the client is unsubscribing a auth user group channel.
     * @example (smallBag, authUserGroup, socketInfo) => {}
     */
    onUnsubscription  ?: AuthUserGroupChOnUnsubFunction | AuthUserGroupChOnUnsubFunction[];
}

export interface NormalChannel extends ZationChannelConfig{
    /**
     * @description
     * Set event listener that gets triggered when the client is publishing in this channel.
     * @example (smallBag, pubData, socketInfo) => {}
     */
    onClientPublish  ?: NormalChOnClientPubFunction | NormalChOnClientPubFunction[];
    /**
     * @description
     * Set event listener that gets triggered when the bag is publishing in this channel.
     * @example (smallBag, pubData, socketInfo) => {}
     */
    onBagPublish  ?: NormalChOnBagPubFunction | NormalChOnBagPubFunction[];
    /**
     * @description
     * Set event listener that gets triggered when the client is subscribing that channel.
     * @example (smallBag, socketInfo) => {}
     */
    onSubscription  ?: NormalChOnSubFunction | NormalChOnSubFunction[];
    /**
     * @description
     * Set event listener that gets triggered when the client is unsubscribing that channel.
     * @example (smallBag, socketInfo) => {}
     */
    onUnsubscription  ?: NormalChOnUnsubFunction | NormalChOnUnsubFunction[];
}

export interface CustomChannelConfig extends ZationChannelConfig{
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
     * (smallBag) => {} // If returns true the client is not allowed, false will allow.
     */
    subscribeNotAccess  ?: Function | boolean | string | number | (string|number)[];
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
     * (smallBag) => {} // If returns true the client is allowed, false will not allow.
     */
    subscribeAccess  ?: Function | boolean | string | number | (string|number)[];
}

export interface CustomIdCh extends CustomChannelConfig {
    /**
     * @description
     * Set the access rule which clients are not allowed to publish in the custom id channel.
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
     * (smallBag, chInfo, pubData, socketInfo) => {} // If returns true the client is not allowed, false will allow.
     */
    clientPublishNotAccess  ?: CIdChannelClientPubAccessFunction | boolean | string | number | (string|number)[];
    /**
     * @description
     * Set the access rule which clients are allowed to publish in the custom id channel.
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
     * (smallBag, chInfo, pubData, socketInfo) => {} // If returns true the client is allowed, false will not allow.
     */
    clientPublishAccess  ?: CIdChannelClientPubAccessFunction | boolean | string | number | (string|number)[];
    /**
     * @description
     * Set the access rule which clients are not allowed to subscribe the custom id channel.
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
     * (smallBag, chInfo, socketInfo) => {} // If returns true the client is not allowed, false will allow.
     */
    subscribeNotAccess  ?: CIdChannelSubAccessFunction | boolean | string | number | (string|number)[];
    /**
     * @description
     * Set the access rule which clients are allowed to subscribe the custom id channel.
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
     * (smallBag, chInfo, socketInfo) => {} // If returns true the client is allowed, false will not allow.
     */
    subscribeAccess  ?: CIdChannelSubAccessFunction | boolean | string | number | (string|number)[];

    /**
     * @description
     * Set event listener that gets triggered when the client is publishing in this custom id channel.
     * @example (smallBag, chInfo, pubData, socketInfo) => {}
     */
    onClientPublish  ?: CIdChannelOnClientPubFunction | CIdChannelOnClientPubFunction[];
    /**
     * @description
     * Set event listener that gets triggered when the bag is publishing in this custom id channel.
     * @example (smallBag, chInfo, pubData, socketInfo) => {}
     */
    onBagPublish  ?: CIdChannelOnBagPubFunction | CIdChannelOnBagPubFunction[];
    /**
     * @description
     * Set event listener that gets triggered when the client is subscribing that custom id channel.
     * @example (smallBag, chInfo, socketInfo) => {}
     */
    onSubscription  ?: CIdChannelOnSubFunction | CIdChannelOnSubFunction[];
    /**
     * @description
     * Set event listener that gets triggered when the client is unsubscribing that custom id channel.
     * @example (smallBag, socketInfo) => {}
     */
    onUnsubscription  ?: CIdChannelOnUnsubFunction | CIdChannelOnUnsubFunction[];
}

export interface CustomCh extends CustomChannelConfig{
    /**
     * @description
     * Set the access rule which clients are not allowed to publish in the custom channel.
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
     * (smallBag, chInfo, pubData, socketInfo) => {} // If returns true the client is not allowed, false will allow.
     */
    clientPublishNotAccess  ?: CChannelClientPubAccessFunction | boolean | string | number | (string|number)[];
    /**
     * @description
     * Set the access rule which clients are allowed to publish in the custom channel.
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
     * (smallBag, chInfo, pubData, socketInfo) => {} // If returns true the client is allowed, false will not allow.
     */
    clientPublishAccess  ?: CChannelClientPubAccessFunction | boolean | string | number | (string|number)[];
    /**
     * @description
     * Set the access rule which clients are not allowed to subscribe the custom channel.
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
     * (smallBag, chInfo, socketInfo) => {} // If returns true the client is not allowed, false will allow.
     */
    subscribeNotAccess  ?: CChannelSubAccessFunction | boolean | string | number | (string|number)[];
    /**
     * @description
     * Set the access rule which clients are allowed to subscribe the custom channel.
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
     * (smallBag, chInfo, socketInfo) => {} // If returns true the client is allowed, false will not allow.
     */
    subscribeAccess  ?: CChannelSubAccessFunction | boolean | string | number | (string|number)[];

    /**
     * @description
     * Set event listener that gets triggered when the client is publishing in this custom channel.
     * @example (smallBag, chInfo, pubData, socketInfo) => {}
     */
    onClientPublish  ?: CChannelOnClientPubFunction | CChannelOnClientPubFunction[];
    /**
     * @description
     * Set event listener that gets triggered when the bag is publishing in this custom channel.
     * @example (smallBag, chInfo, pubData, socketInfo) => {}
     */
    onBagPublish  ?: CChannelOnBagPubFunction | CChannelOnBagPubFunction[];
    /**
     * @description
     * Set event listener that gets triggered when the client is subscribing that custom channel.
     * @example (smallBag, chInfo, socketInfo) => {}
     */
    onSubscription  ?: CChannelOnSubFunction | CChannelOnSubFunction[];
    /**
     * @description
     * Set event listener that gets triggered when the client is unsubscribing that custom channel.
     * @example (smallBag, socketInfo) => {}
     */
    onUnsubscription  ?: CChannelOnUnsubFunction | CChannelOnUnsubFunction[];
}