/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import SmallBag from "../../api/SmallBag";

export type IdCheck = (id : string,smallBag : SmallBag) => Promise<boolean | Record<string,any> | void> | boolean | Record<string,any> | void;

export interface IdCheckConfig {

    /**
     * Check if the id is valid or not.
     * To block the id, you only need to return an object (that can be error information) or false.
     * If you want to allow the id, you have to return nothing or a true.
     */
    idCheck ?: IdCheck
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