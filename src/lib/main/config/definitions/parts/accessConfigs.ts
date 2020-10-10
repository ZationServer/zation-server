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