/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {AuthAccessConfig, SystemAccessConfig, VersionAccessConfig} from "./configComponents";
import {DataboxClass}                                              from "../../../api/databox/Databox";
import {DataboxFamilyClass}                                        from "../../../api/databox/DataboxFamily";
import Bag                                                         from "../../../api/Bag";
import {DataboxInfo}                                               from "../../databox/dbDefinitions";
import ZSocket                                                     from "../../internalApi/zSocket";
import {Input}                                                     from "./inputConfig";
import {AccessConfigValue}                                         from "../../access/accessOptions";

export type DbAccessFunction = (bag: Bag, socket: ZSocket, dbInfo: DataboxInfo) => Promise<boolean> | boolean;

export interface DataboxConfig extends VersionAccessConfig, SystemAccessConfig, AuthAccessConfig<DbAccessFunction>
{
    /**
     * This property defines the fetch input.
     * The client can send these fetch input whenever he wants to fetch data.
     * That means you can access this data in the fetchData method.
     * It will be used to validate and format the fetch data that flows into the component.
     * It can specify an input that is based on parameters
     * so that you can map models to a parameter name.
     * Or it can specify a single model as an input.
     * - Parameter-based input.
     * To define a parameter based input use an object as a value.
     * The keys of the object are the parameter names,
     * and the value defines an anonymous model or link to a declared model.
     * Notice that it is strongly recommended to only use string keys (with letters) in the object literal,
     * to keep the same order in a for in loop.
     * That is important for zation when you send your data as an array.
     * - Single model input
     * To set a single model input, you have to use an array as a value with exactly one item.
     * This item is an anonymous model or link to a declared model.
     * Notice that you also can use the single method on the Config class
     * for making it more clear that this is a single model input.
     * @example
     * //Parameter-based input
     * input: {
     *     name: {
     *         type: 'string'
     *     },
     *     age: {
     *         type: 'int',
     *         minValue: 14
     *     }
     * }
     * //Client can send  ->
     * {name: 'Luca', age: 20}
     * //or
     * ['Luca',20]
     *
     * //-Single model input-
     * input: [{
     *     type: 'string',
     *     minLength: 4
     * }]
     * //or
     * input: Config.single({
     *     type: 'string',
     *     minLength: 4
     * })
     * //Client can send ->
     * "ThisIsAnyString"
     */
    fetchInput?: Input;
    /**
     * Specifies if any fetch input is allowed
     * that means the fetch input validation and converter are disabled.
     * @default false.
     */
    allowAnyFetchInput ?: boolean;

    /**
     * This property defines the init input.
     * The client can send these init input when it builds the connection.
     * You can access the init input whenever the fetchData method gets triggered,
     * but you not able to change these input in the whole connection.
     * It will be used to validate and format the init data that flows into the component.
     * It can specify an input that is based on parameters
     * so that you can map models to a parameter name.
     * Or it can specify a single model as an input.
     * - Parameter-based input.
     * To define a parameter based input use an object as a value.
     * The keys of the object are the parameter names,
     * and the value defines an anonymous model or link to a declared model.
     * Notice that it is strongly recommended to only use string keys (with letters) in the object literal,
     * to keep the same order in a for in loop.
     * That is important for zation when you send your data as an array.
     * - Single model input
     * To set a single model input, you have to use an array as a value with exactly one item.
     * This item is an anonymous model or link to a declared model.
     * Notice that you also can use the single method on the Config class
     * for making it more clear that this is a single model input.
     * @example
     * //Parameter-based input
     * input: {
     *     name: {
     *         type: 'string'
     *     },
     *     age: {
     *         type: 'int',
     *         minValue: 14
     *     }
     * }
     * //Client can send  ->
     * {name: 'Luca', age: 20}
     * //or
     * ['Luca',20]
     *
     * //-Single model input-
     * input: [{
     *     type: 'string',
     *     minLength: 4
     * }]
     * //or
     * input: Config.single({
     *     type: 'string',
     *     minLength: 4
     * })
     * //Client can send ->
     * "ThisIsAnyString"
     */
    initInput?: Input;
    /**
     * Specifies if any init input is allowed
     * that means the init input validation and converter are disabled.
     * @default false.
     */
    allowAnyInitInput ?: boolean;

    /**
     * @description
     * Set the access rule which clients are allowed to access this Databox.
     * Notice that in case of a DataboxFamily the id is checked before the access.
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
     * (bag: Bag,socket: ZSocket,dbInfo: DataboxInfo) => {} // If returns true the client is allowed, false will not allow.
     */
    access?: AccessConfigValue<DbAccessFunction>;
    /**
     * @description
     * Set the access rule which clients are not allowed to access this Databox.
     * Notice that in case of a DataboxFamily the id is checked before the access.
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
     * (bag: Bag,socket: ZSocket,dbInfo: DataboxInfo) => {}  // If returns true the client is not allowed, false will allow.
     */
    notAccess?: AccessConfigValue<DbAccessFunction>;

    /**
     * This option can be activated when you have designed
     * this Databox in such a way that the fetching of data
     * is independent of the previous fetch.
     * Then the system is able to fetch the data in
     * parallel that will increase the performance in some cases.
     * @default false
     */
    parallelFetch?: boolean;

    /**
     * The maximal backpressure that a client can build up by calling fetch data.
     * (Notice that the restore session has its own backpressure)
     * This option is unnecessary if the parallel fetch option is activated.
     * @default 30
     */
    maxBackpressure?: number;

    /**
     * The maximal amount of input channels that a socket can create.
     * Whenever a socket wants to register to a Databox,
     * the socket will be connected (if it is not already connected)
     * and then an input channel will be created. The input channel is used to
     * communicate from the client to the server, for example, to fetch data.
     * Every input channel has its session,
     * that means that a client can have the same databox many times but independent of each other.
     * The minimum value is 1.
     * @default 20
     */
    maxSocketInputChannels?: number;
}

export type DataboxClassDef = DataboxClass | DataboxFamilyClass