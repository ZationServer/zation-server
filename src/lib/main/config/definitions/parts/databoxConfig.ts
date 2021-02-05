/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {AccessConfig}                                              from "./accessConfigs";
import {DataboxInfo}                                               from "../../../databox/dbDefinitions";
import Socket                                                      from "../../../../api/Socket";
import {Input}                                                     from "./inputConfig";

export type DbAccessFunction = (socket: Socket, dbInfo: DataboxInfo) => Promise<boolean> | boolean;

export interface DataboxConfig extends AccessConfig<DbAccessFunction>
{
    /**
     * This property defines the fetch input.
     * The client can send these fetch input whenever he wants to fetch data.
     * That means you can access this data in the fetch / singleFetch method.
     * It will be used to validate and format the fetch data that flows into the component.
     * The input can be defined with a model, or you can allow any input with 'any' literal.
     * If you don't want to have any input you can use the 'nothing' literal.
     * @default 'nothing'
     * @example
     * @ObjectModel()
     * class Person {
     *
     *  name = Model({type: 'string'});
     *
     *  age = Model({type: 'int', minValue: 14});
     *
     * }
     * fetchInput: Person
     * //Client can send  ->
     * {name: 'Luca', age: 20}
     */
    fetchInput?: Input;
    /**
     * This property defines the init input.
     * The client can send these init input when it builds the connection.
     * You can access the init input whenever the fetch / singleFetch method gets triggered,
     * but you not able to change these input in the whole connection.
     * It will be used to validate and format the init data that flows into the component.
     * The input can be defined with a model, or you can allow any input with 'any' literal.
     * If you don't want to have any input you can use the 'nothing' literal.
     * @default 'nothing'
     * @example
     * @ObjectModel()
     * class Person {
     *
     *  name = Model({type: 'string'});
     *
     *  age = Model({type: 'int', minValue: 14});
     *
     * }
     * initInput: Person
     * //Client can send  ->
     * {name: 'Luca', age: 20}
     */
    initInput?: Input;
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
    /**
     * Defines the timeout for fetching the last cud data from the other workers.
     * That process is done when the Databox initializes, or the DataboxFamily creates a new member.
     * You also can deactivate this behaviour by specifying false or 0.
     * But when you have more workers, this will tend to more reload-processes
     * even if the client missed no cud operation.
     * @default 500
     */
    fetchLastCudData?: number | false;
}