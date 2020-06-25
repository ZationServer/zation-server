/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {AccessConfigValue}                                 from "../../../access/accessOptions";
import ZationToken                                         from "../../../internalApi/zationToken";
import {Notable}                                           from '../../../../api/Notable';

export type NormalAuthAccessCustomFunction = (token: ZationToken | null) => Promise<boolean> | boolean;

export interface AuthAccessConfig<T extends Function = NormalAuthAccessCustomFunction> {
    /**
     * @description
     * Set the (Client Token State) access rule which clients are allowed to access this component.
     * It's possible to invert the result using the $not function.
     * Look in the examples to see what possibilities you have.
     * @default default config otherwise false
     * @example
     * //Boolean
     * true            // All clients are allowed
     * false           // No client is allowed
     * //Special-Keywords
     * 'all'           // All clients are allowed
     * 'allAuth'       // Only all authenticated clients are allowed (constant $allAuth is available)
     * 'allNotAuth'    // Only all not authenticated clients are allowed (all authenticated are not allowed) (constant $allNotAuth is available)
     * //UserGroups
     * 'admin'         // Only all admins are allowed
     * 'guest'         // Only all clients with default user group are allowed
     * //UserId
     * $userId(10)        // Only all clients with user id 10 are allowed
     * $userId(10,false)  // Only all clients with user id 10 or '10' are allowed
     * $userId('lmc')     // Only all clients with user id 'lmc' are allowed
     * //Invert
     * $not(['user','guest',$userId(23)]) // All clients with user group: user, default user group or user id 23 are not allowed.
     * //Custom-Function
     * (token: ZationTokenInfo | null) => {} // If returns true the client is allowed, false will not allow.
     * //Or-Conditions
     * ['user','guest',$userId(23)] // Only all clients with user group: user, default user group or user id 23 are allowed.
     * //And-Conditions (Array in Or-Condition-Array)
     * [['user',$tokenPayloadIncludes({canEdit: true})]] //Only clients with user group: user and token payload
     * property canEdit with the value true are allowed.
     * //Complex
     * ['admin',['user',$tokenPayloadMatches({age: {$gt: 17}})]] //Only clients with user group: admin or
     * clients with user group: user and the token payload property: age with a value that's greater than 17 are allowed.
     */
    access?: Notable<AccessConfigValue<T>>;
}

export interface VersionAccessConfig {
    /**
     * Version access defines access rules which depends on the client app version.
     * Notice that it will not check the system.
     * Look in the examples to see what possibilities you have.
     * @default From default config otherwise all.
     * @example
     * //string
     * versionAccess: 'all'       // All clients are allowed
     * //object
     * versionAccess: {           // Clients with system 'IOS' needs to have at least version 1.0
     *     'IOS': 1.0,            // and clients with system 'ANDROID' needs to have at least version 4.2.
     *     'ANDROID': 4.2
     * }
     * versionAccess: {           // Clients with system 'WEB' needs to have exactly
     *     'WEB': [1.3,1.8,2.2]   // one of the versions 1.3, 1.8 or 2.2.
     * }
     */
    versionAccess?: VersionAccessValue;
}

export type VersionAccessValue = 'all' | Record<string,number | number[]>;

export interface SystemAccessConfig {
    /**
     * System access specifies access rules which depend on the system of the clients.
     * Look in the examples to see what possibilities you have.
     * @default From default config otherwise all.
     * @example
     * //string
     * systemAccess: 'all'         // All clients are allowed
     * //array
     * systemAccess: ['IOS','WEB'] // Only clients with system 'IOS' or 'WEB' are allowed.
     */
    systemAccess?: SystemAccessValue;
}

export type SystemAccessValue = 'all' | string[];