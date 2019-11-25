/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

// noinspection TypeScriptPreferShortImport
import {InputConfigTranslatable, ModelConfigTranslatable}  from "../../../api/ConfigTranslatable";
import {AccessConfigValue}                                 from "../../access/accessOptions";
import {IdValid}                                           from "../../id/idValidCheckerUtils";
import Bag                                                 from "../../../api/Bag";
import ZationTokenWrapper                                  from "../../internalApi/zationTokenWrapper";

export type NormalAuthAccessCustomFunction = (bag : Bag, token : ZationTokenWrapper | null) => Promise<boolean> | boolean;

export interface AuthAccessConfig<T extends Function = NormalAuthAccessCustomFunction> {
    /**
     * @description
     * Set the (Client Token State) access rule which clients are allowed to access this component.
     * Notice that only one of the options 'access' or 'notAccess' is allowed.
     * Look in the examples to see what possibilities you have.
     * @default default config otherwise false
     * @example
     * //Boolean
     * true            // All clients are allowed
     * false           // No client is allowed
     * //Special-Keywords
     * 'all'           // All clients are allowed
     * 'allAuth'       // Only all authenticated clients are allowed
     * 'allNotAuth'    // Only all not authenticated clients are allowed (all authenticated are not allowed)
     * //UserGroups
     * 'admin'         // Only all admins are allowed
     * 'guest'         // Only all clients with default user group are allowed
     * //UserId
     * $userId(10)        // Only all clients with user id 10 are allowed
     * $userId(10,false)  // Only all clients with user id 10 or '10' are allowed
     * $userId('lmc')     // Only all clients with user id 'lmc' are allowed
     * //Custom-Function
     * (bag : Bag,token : ZationTokenInfo | null) => {} // If returns true the client is allowed, false will not allow.
     * //Or-Conditions
     * ['user','guest',$userId(23)] // Only all clients with user group: user, default user group or user id 23 are allowed.
     * //And-Conditions (Array in Or-Condition-Array)
     * [['user',$tokenHasVariables({canEdit : true})]] //Only clients with user group: user and token variable
     * canEdit with the value true are allowed.
     * //Complex
     * ['admin',['user',$tokenVariablesMatch({age : {$gt : 17}})]] //Only clients with user group: admin or
     * clients with user group: user and the token variable: age witch a value that's greater than 17, are allowed.
     */
    access ?: AccessConfigValue<T>;
    /**
     * @description
     * Set the (Client Token State) access rule which clients are not allowed to access this component.
     * Notice that only one of the options 'access' or 'notAccess' is allowed.
     * Look in the examples to see what possibilities you have.
     * @default (use access)
     * @example
     * //Boolean
     * true            // No client is allowed
     * false           // All clients are allowed
     * //Special-Keywords
     * 'all'           // No client is allowed
     * 'allAuth'       // All authenticated clients are not allowed
     * 'allNotAuth'    // All not authenticated clients are not allowed (all authenticated are allowed)
     * //UserGroups
     * 'admin'         // All admins are not allowed
     * 'guest'         // All clients with default user group are not allowed
     * //UserId
     * $userId(10)        // All clients with user id 10 are not allowed
     * $userId(10,false)  // All clients with user id 10 or '10' are not allowed
     * $userId('lmc')     // All clients with user id 'lmc' are not allowed
     * //Custom-Function
     * (bag : Bag,token : ZationTokenInfo | null) => {} // If returns true the client is not allowed, false will allow.
     * //Or-Conditions
     * ['user','guest',$userId(23)] // All clients with user group: user, default user group or user id 23 are not allowed.
     * //And-Conditions (Array in Or-Condition-Array)
     * [['user',$tokenHasVariables({canEdit : true})]] //All clients with user group: user and token variable
     * canEdit with the value true are not allowed.
     * //Complex
     * ['admin',['user',$tokenVariablesMatch({age : {$gt : 17}})]] //All clients with user group: admin or
     * clients with user group: user and the token variable: age witch a value that's greater than 17, are not allowed.
     */
    notAccess ?: AccessConfigValue<T>;
}

export interface IdValidConfig {

    /**
     * Check if the id is valid or not.
     * To block the id, you only need to return an object (that can be error information) or false.
     * If you want to allow the id, you have to return nothing or a true.
     */
    idValid ?: IdValid
}

export interface VersionAccessConfig {
    /**
     * Version access defines access rules which depends on the client app version.
     * Notice that it will not check the system.
     * Look in the examples to see what possibilities you have.
     * @default From default config otherwise all.
     * @example
     * //string
     * versionAccess : 'all'       // All clients are allowed
     * //object
     * versionAccess : {           // Clients with system 'IOS' needs to have at least version 1.0
     *     'IOS' : 1.0,            // and clients with system 'ANDROID' needs to have at least version 4.2.
     *     'ANDROID' : 4.2
     * }
     * versionAccess : {           // Clients with system 'WEB' needs to have exactly
     *     'WEB' : [1.3,1.8,2.2]   // one of the versions 1.3, 1.8 or 2.2.
     * }
     */
    versionAccess  ?: 'all' | Record<string,number | number[]>;
}

export interface SystemAccessConfig {
    /**
     * System access specifies access rules which depend on the system of the clients.
     * Look in the examples to see what possibilities you have.
     * @default From default config otherwise all.
     * @example
     * //string
     * systemAccess : 'all'         // All clients are allowed
     * //array
     * systemAccess : ['IOS','WEB'] // Only clients with system 'IOS' or 'WEB' are allowed.
     */
    systemAccess ?: 'all' | string[];
}

export interface AnyClass {
    prototype : object,
    new () : any
    [key : string] : any;
}

export interface AnyInputConfigTranslatable extends InputConfigTranslatable {
    [key : string] : any;
}

export interface AnyModelConfigTranslatable extends ModelConfigTranslatable {
    [key : string] : any;
}