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
     * This property defines the options input.
     * The client can send these options when it builds the connection.
     * You can access the options whenever the fetch / singleFetch method gets triggered,
     * but you not able to change these options in the whole connection.
     * It will be used to validate and format the options data that flows into the component.
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
    optionsInput?: Input;
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
     * @default 10
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
    /**
     * Defines the delay to unregister the Databox or a member of the DataboxFamily
     * internally when no one uses it anymore.
     * When a client starts to use it again, the delay timeout will be cancelled.
     * @default 120000ms
     */
    unregisterDelay?: number;
    /**
     * The maximal amount of members where a socket can connect to within this Databox.
     * Notice this option is only used in Databox Families and the socket can have multiple
     * input connection to a single member.
     * If you want to limit the number of input connections to a single member
     * you can use the option maxSocketInputChannels.
     * @default 20
     */
    maxSocketMembers?: number;
    /**
     * Define initial data where the connected clients should start-with.
     * That option could be useful when you want to start with an empty data structure.
     * For example, a key array where you want to insert messages later on.
     * Notice that the value undefined will be ignored and not transmitted to the clients.
     * @default undefined
     */
    initialData?: any;
    /**
     * Defines the reload strategy that the client Databox should
     * use to reload the data in a newer state.
     * Notice that the client can overwrite the reload strategy.
     * It is also possible to register custom strategies on the client-side
     * and specify them on the server-side with JSON friendly options.
     * If no strategy is defined on the client and server-side,
     * the history-based strategy will be used.
     */
    reloadStrategy?: HistoryBasedReloadStrategy | TimeBasedListReloadStrategy | AnyReloadStrategy
}

interface AnyReloadStrategy {
    name: string,
    options?: any
}
interface HistoryBasedReloadStrategy {
    name: 'HistoryBased',
}
interface TimeBasedListReloadStrategy {
    name: 'TimeBasedList',
    options?: {
        /**
         * The property name where the timestamp is located.
         * @default 'created'
         */
        timestampKey?: string,
        /**
         * The maximal amount of fetches before give up.
         * @default 100
         */
        maxFetchTries?: number
        /**
         * Time delta of disconnected timestamp.
         * @default 5000
         */
        disconnectTimeDelta?: number
    }
}