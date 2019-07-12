/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import ZSocket           from "../../internalApi/ZSocket";
import SmallBag             from "../../../api/SmallBag";
import PubData              from "../../internalApi/pubData";
import CChFamilyInfo        from "../../internalApi/cChFamilyInfo";
import CChInfo              from "../../internalApi/cChInfo";
import {IdValidConfig, SystemAccessConfig, VersionAccessConfig} from "./configComponents";

type AnyFunction = (...args : any[]) => Promise<any> | any

export type CChannelFamilyOnClientPubFunction =
    (smallBag : SmallBag, pubData : PubData, socketInfo : ZSocket, chInfo : CChFamilyInfo) => Promise<void> | void;

export type CChannelFamilyOnBagPubFunction =
    (smallBag : SmallBag, pubData : PubData, socketInfo : ZSocket | undefined, chInfo : CChFamilyInfo) => Promise<void> | void;

export type CChannelFamilyOnSubFunction =
    (smallBag : SmallBag, socketInfo : ZSocket, chInfo : CChFamilyInfo) => Promise<void> | void;

export type CChannelFamilyOnUnsubFunction =
    (smallBag : SmallBag, socketInfo : ZSocket, chInfo : CChFamilyInfo) => Promise<void> | void;

export type CChannelFamilyClientPubAccessFunction =
    (smallBag : SmallBag, pubData : PubData, socketInfo : ZSocket, chInfo : CChFamilyInfo) => Promise<boolean> | boolean;

export type CChannelFamilySubAccessFunction =
    (smallBag : SmallBag, socketInfo : ZSocket, chInfo : CChFamilyInfo) => Promise<boolean> | boolean;


export type CChannelOnClientPubFunction =
    (smallBag : SmallBag, pubData : PubData, socketInfo : ZSocket, chInfo : CChInfo) => Promise<void> | void;

export type CChannelOnBagPubFunction =
    (smallBag : SmallBag, pubData : PubData, socketInfo : ZSocket | undefined, chInfo : CChInfo) => Promise<void> | void;

export type CChannelOnSubFunction =
    (smallBag : SmallBag, socketInfo : ZSocket, chInfo : CChInfo) => Promise<void> | void;

export type CChannelOnUnsubFunction =
    (smallBag : SmallBag, socketInfo : ZSocket, chInfo : CChInfo) => Promise<void> | void;

export type CChannelClientPubAccessFunction =
    (smallBag : SmallBag, pubData : PubData, socketInfo : ZSocket, chInfo : CChInfo) => Promise<boolean> | boolean;

export type CChannelSubAccessFunction =
    (smallBag : SmallBag, socketInfo : ZSocket, chInfo : CChInfo) => Promise<boolean> | boolean;


export type UserChOnClientPubFunction =
    (smallBag : SmallBag, pubData : PubData, socketInfo : ZSocket, userId : string) => Promise<void> | void;

export type UserChOnBagPubFunction =
    (smallBag : SmallBag, pubData : PubData, socketInfo : ZSocket | undefined, userId : string) => Promise<void> | void;

export type UserChOnSubFunction =
    (smallBag : SmallBag, socketInfo : ZSocket, userId : string) => Promise<void> | void;

export type UserChOnUnsubFunction =
    (smallBag : SmallBag, socketInfo : ZSocket, userId : string) => Promise<void> | void;

export type UserChClientPubAccessFunction =
    (smallBag : SmallBag, pubData : PubData, socketInfo : ZSocket, userId : string) => Promise<boolean> | boolean;


export type AuthUserGroupChOnClientPubFunction =
    (smallBag : SmallBag, pubData : PubData, socketInfo : ZSocket, authUserGroup  : string,) => Promise<void> | void;

export type AuthUserGroupChOnBagPubFunction =
    (smallBag : SmallBag, pubData : PubData, socketInfo : ZSocket | undefined, authUserGroup  : string) => Promise<void> | void;

export type AuthUserGroupChOnSubFunction =
    (smallBag : SmallBag, socketInfo : ZSocket, authUserGroup : string) => Promise<void> | void;

export type AuthUserGroupChOnUnsubFunction =
    (smallBag : SmallBag, socketInfo : ZSocket, authUserGroup  : string) => Promise<void> | void;

export type AuthUserGroupChClientPubAccessFunction =
    (smallBag : SmallBag, pubData : PubData, socketInfo : ZSocket, authUserGroup : string) => Promise<boolean> | boolean;


export type NormalChOnClientPubFunction =
    (smallBag : SmallBag, pubData : PubData, socketInfo : ZSocket) => Promise<void> | void;

export type NormalChOnBagPubFunction =
    (smallBag : SmallBag, pubData : PubData, socketInfo : ZSocket | undefined) => Promise<void> | void;

export type NormalChOnSubFunction =
    (smallBag : SmallBag, socketInfo : ZSocket) => Promise<void> | void;

export type NormalChOnUnsubFunction =
    (smallBag : SmallBag, socketInfo : ZSocket) => Promise<void> | void;

export type NormalChClientPubAccessFunction =
    (smallBag : SmallBag, pubData : PubData, socketInfo : ZSocket) => Promise<boolean> | boolean;

export interface ZationChannelsConfig
{
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

export type CustomChannelConfig = [CustomChFamily] | [] | CustomCh

export type PreCompiledCustomChannelConfig = [CustomChFamily] | CustomCh;

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

export interface BaseCustomChannelConfig<Pub = AnyFunction,BagPub = AnyFunction,Sub = AnyFunction,Unsub = AnyFunction,PubAccess = AnyFunction,SubAccess = AnyFunction>
    extends ZationChannelConfig<Pub,BagPub,Sub,Unsub,PubAccess>, VersionAccessConfig, SystemAccessConfig {
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

export type CustomChFamily = (BaseCustomChannelConfig<
    CChannelFamilyOnClientPubFunction,
    CChannelFamilyOnBagPubFunction,
    CChannelFamilyOnSubFunction,
    CChannelFamilyOnUnsubFunction,
    CChannelFamilyClientPubAccessFunction,
    CChannelFamilySubAccessFunction
    >) & IdValidConfig;

export type CustomCh = BaseCustomChannelConfig<
    CChannelOnClientPubFunction,
    CChannelOnBagPubFunction,
    CChannelOnSubFunction,
    CChannelOnUnsubFunction,
    CChannelClientPubAccessFunction,
    CChannelSubAccessFunction
    >;