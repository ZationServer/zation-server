/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import {AuthAccessConfig, SystemAccessConfig, VersionAccessConfig} from "./configComponents";
import {DataBoxClass}                                              from "../../../api/dataBox/DataBox";
import {DataBoxFamilyClass}                                        from "../../../api/dataBox/DataBoxFamily";
import {InputConfig}                                               from "./inputConfig";
import Bag                                                         from "../../../api/Bag";
import {DataBoxInfo}                                               from "../../dataBox/dbDefinitions";
import ZSocket                                                     from "../../internalApi/zSocket";

export type DbAccessFunction = (bag : Bag, socket : ZSocket, dbInfo : DataBoxInfo) => Promise<boolean> | boolean;

export interface DataBoxConfig extends VersionAccessConfig, SystemAccessConfig, AuthAccessConfig<DbAccessFunction>, InputConfig
{
    /**
     * @description
     * Set the access rule which clients are allowed to access this DataBox.
     * Notice that in case of a DataBoxFamily the id is checked before the access.
     * Notice that only one of the options 'access' or 'notAccess' is allowed.
     * Look in the examples to see what possibilities you have.
     * @default default config otherwise false
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
     * (bag : Bag,socket : ZSocket,dbInfo : DataBoxInfo) => {} // If returns true the client is allowed, false will not allow.
     */
    access  ?: string | number | (string | number)[] | DbAccessFunction;
    /**
     * @description
     * Set the access rule which clients are not allowed to access this DataBox.
     * Notice that in case of a DataBoxFamily the id is checked before the access.
     * Notice that only one of the options 'access' or 'notAccess' is allowed.
     * Look in the examples to see what possibilities you have.
     * @default default config otherwise false
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
     * (bag : Bag,socket : ZSocket,dbInfo : DataBoxInfo) => {}  // If returns true the client is not allowed, false will allow.
     */
    notAccess  ?: string | number | (string | number)[] | DbAccessFunction;

    /**
     * This option can be activated when you have designed
     * this DataBox in such a way that the fetching of data
     * is independent of the previous fetch.
     * Then the system is able to fetch the data in
     * parallel that will increase the performance in some cases.
     * @default false
     */
    parallelFetch ?: boolean;

    /**
     * The maximal backpressure that a client can build up with by calling fetch data.
     * This option is unnecessary if the parallel fetch option is activated.
     * @default 30
     */
    maxBackpressure ?: number;

    /**
     * The maximal amount of input channels that a socket can create.
     * Whenever a socket wants to register to a DataBox,
     * the socket will be connected (if it is not already connected)
     * and then an input channel will be created. The input channel is used to
     * communicate from the client to the server, for example, to fetch data.
     * Every input channel has its session,
     * that means that a client can have the same dataBox many times but independent of each other.
     * The minimum value is 1.
     * @default 20
     */
    maxSocketInputChannels ?: number;
}

export type DataBoxClassDef = DataBoxClass | DataBoxFamilyClass