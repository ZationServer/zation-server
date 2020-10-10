/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {AccessRules}                                 from "../../../access/accessOptions";
import Socket                                        from '../../../../api/Socket';

export type NormalAccessCustomFunction = (socket: Socket) => Promise<boolean> | boolean;

export interface AccessConfig<T extends Function = NormalAccessCustomFunction> {
    /**
     * @description
     * Define access rules for the component that the client needs to fulfil.
     * You can combine rules by using the functions: $or and $and.
     * It is also possible to invert any rule with $not.
     *
     * Notice that in case of some components (Databoxes and Channels),
     * a connection is created when the access was allowed. But any time later,
     * some variables where the rules rely on could change, and the socket shouldn't
     * have access anymore but is still connected.
     * For these cases, the access will be rechecked whenever the token of a socket has changed.
     * But be careful this will not help in all cases; for example, a rule was based
     * on a value in a database that changed.
     * Whenever you do changes on some values where access rules are based on you
     * can force a recheck of the access for a socket to avoid unexpected longer access.
     *
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
     * //Custom-Function
     * (socket: Socket) => boolean // If returns true the client is allowed, false will not allow.
     * //Or-Conditions
     * ['user','guest',$userId(23)]    // Only all clients with user group: user, default user group or user id 23 are allowed.
     * $or('user','guest',$userId(23)) // Same as above
     * //Invert
     * $not(['user','guest',$userId(23)]) // All clients with user group: user, default user group or user id 23 are not allowed.
     * //And-Conditions
     * $and('user',$tokenPayloadIncludes({canEdit: true})) //Only clients with user group: user and token payload
     * property: canEdit with the value true are allowed.
     * //Complex
     * ['admin',$and('user',$tokenPayloadMatches({age: {$gt: 17}}))] //Only clients with user group: admin or
     * clients with user group: user and the token payload property: age with a value that's greater than 17 are allowed.
     */
    access?: AccessRules<T>;
}