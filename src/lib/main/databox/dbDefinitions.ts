/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {ForintQuery}  from "forint";
import Socket         from '../../api/Socket';
import {DeepReadonly} from '../utils/typeUtils';

export interface DataboxConnectReq {
    /**
     * databox (identifier)
     */
    d: string,
    /**
     * member
     */
    m?: any,
    /**
     * apiLevel
     */
    a?: number,
    /**
     * token
     * If defined will be used instead of
     * creating a new token with options.
     */
    t?: string,
    /**
     * options
     */
    o?: any
}

export interface DataboxConnectRes {
    /**
     * Input key
     */
    i: string,
    /**
     * Output key
     */
    o: string,
    /**
     * Last cud id
     */
    lc: string,
    /**
     * Parallel fetching
     */
    p: boolean,
    /**
     * Initial data
     */
    id?: any,
    /**
     * Reload strategy
     */
    rs?: [string,any?]
}

export type UnregisterSocketFunction = (inputChannelId?: string) => void;

export const DATABOX_START_INDICATOR = 'D>';

export const enum CudType {
    insert,
    update,
    delete
}

/**
 * A full-defined cud package that the server can send to the clients.
 */
export interface CudPackage extends PreCudPackage{
    /**
     * timestamp
     */
    t: number,
}

/**
 * A pre-defined cud package.
 */
export interface PreCudPackage {
    /**
     * cudId
     */
    ci: string,
    /**
     * timestamp
     */
    t?: number,
    /**
     * operations
     */
    o: CudOperation[]
}

/**
 * A cud action.
 */
export interface CudOperation {
    /**
     * type
     */
    t: CudType,
    /**
     * selector
     */
    s: DbProcessedSelector,
    /**
     * value
     */
    v?: any;
    /**
     * code
     */
    c?: any;
    /**
     * data
     */
    d?: any;
    /**
     * if conditions
     */
    i?: IfOptionProcessedValue;
    /**
     * potential Insert/Update
     */
    p?: 0 | 1;
}

/**
 * The package that the client can send to the server to invoke an action.
 */
export interface DbClientInputPackage {
    /**
     * Action
     */
    a: DbClientInputAction,
    /**
     * Session Target
     */
    t?: DBClientInputSessionTarget
}

/**
 * The package that the client can send to the server to send a signal.
 */
export interface DbClientInputSignalPackage extends DbClientInputPackage{
    a: DbClientInputAction.signal,
    /**
     * signal
     */
    s: string,
    /**
     * data
     */
    d: any
}

/**
 * The package that the client can send to the server to fetch data.
 */
export interface DbClientInputFetchPackage extends DbClientInputPackage{
    a: DbClientInputAction.fetch,
    /**
     * input
     */
    i: any
}

export interface DbClientInputFetchResponse {
    /**
     * counter
     */
    c: number,
    /**
     * token
     */
    t: string,
    /**
     * data
     */
    d: any,
    /**
     * Timestamp
     */
    ti: number
}

/**
 * Events that a client can receive from the server.
 */
export enum DbClientOutputEvent {
    cud,
    close,
    reload,
    kickOut,
    signal
}

/**
 * Packages that the server can send to the clients.
 */
export interface DbClientOutputPackage {
    /**
     * action
     */
    a: DbClientOutputEvent,
    /**
     * data
     */
    d?: any,
    /**
     * code
     */
    c?: number | string,
}

/**
 * Cud package that the server can send to the clients.
 * In case of an insert, update, or delete of data.
 */
export interface DbClientOutputCudPackage extends DbClientOutputPackage{
    /**
     * action
     */
    a: DbClientOutputEvent.cud,
    /**
     * data
     */
    d: CudPackage
}

/**
 * Reload package that the server can send to the clients.
 */
export interface DbClientOutputReloadPackage extends DbClientOutputPackage{
    /**
     * action
     */
    a: DbClientOutputEvent.reload,
    /**
     * data
     */
    d?: any
}

/**
 * Close package that the server can send to the clients.
 */
export interface DbClientOutputClosePackage extends DbClientOutputPackage{
    /**
     * action
     */
    a: DbClientOutputEvent.close,
    /**
     * data
     */
    d?: any
}

/**
 * Kick out package that the server can send to the clients.
 */
export interface DbClientOutputKickOutPackage extends DbClientOutputPackage{
    /**
     * action
     */
    a: DbClientOutputEvent.kickOut,
    /**
     * data
     */
    d?: any
}

/**
 * Signal package that the server can send to the clients.
 */
export interface DbClientOutputSignalPackage extends DbClientOutputPackage{
    /**
     * action
     */
    a: DbClientOutputEvent.signal,
    /**
     * signal
     */
    s: string
    /**
     * data
     */
    d?: any
}

/**
 * The target session that the server should use to process.
 */
export const enum DBClientInputSessionTarget {
    mainSession,
    reloadSession
}

/**
 * Actions that a client can send to the server.
 */
export const enum DbClientInputAction {
    fetch,
    resetSession,
    copySession,
    disconnect,
    getLastCudId,
    signal
}

/**
 * Actions that a worker can send to another worker.
 */
export const enum DbWorkerAction {
    /**
     * New create,update delete operation.
     */
    cud,
    /**
     * Broadcast a client signal package.
     */
    signal,
    /**
     * Close the Databox
     */
    close,
    /**
     * Broadcast a client package.
     */
    broadcast,
    /**
     * Current cud data request.
     */
    cudDataRequest,
    /**
     * Current cud data response.
     */
    cudDataResponse,
    /**
     * Recheck member access request.
     */
    recheckMemberAccess
}

/**
 * A package that a worker can send to the other workers.
 */
export interface DbWorkerPackage {
    /**
     * source workerFullId
     */
    0: string,
    /**
     * action
     */
    1: DbWorkerAction,
    /**
     * data
     */
    2?: any
}

/**
 * Cud package that the worker can send to other workers.
 * In case of an insert, update, or delete of data.
 */
export interface DbWorkerCudPackage extends DbWorkerPackage{
    /**
     * action
     */
    1: DbWorkerAction.cud,
    /**
     * data
     */
    2: CudPackage,
}

/**
 * Signal package that the worker can send to other workers.
 */
export interface DbWorkerSignalPackage extends DbWorkerPackage{
    /**
     * action
     */
    1: DbWorkerAction.signal,
    /**
     * data
     */
    2: DbClientOutputSignalPackage,
}

/**
 * Close package that the worker can send to other workers.
 */
export interface DbWorkerClosePackage extends DbWorkerPackage{
    /**
     * action
     */
    1: DbWorkerAction.close,
    /**
     * The client close package.
     */
    2: DbClientOutputClosePackage
}

/**
 * Broadcast package that the worker can send to other workers.
 */
export interface DbWorkerBroadcastPackage extends DbWorkerPackage{
    /**
     * action
     */
    1: DbWorkerAction.broadcast,
    /**
     * data
     */
    2: DbClientOutputPackage
}

/**
 * Current cud data request package that the worker can send to other workers.
 */
export interface DbWorkerCudDataRequestPackage extends DbWorkerPackage{
    /**
     * action
     */
    1: DbWorkerAction.cudDataRequest
}

/**
 * Current cud data response package that the worker can send to other workers.
 */
export interface DbWorkerCudDataResponsePackage extends DbWorkerPackage{
    /**
     * action
     */
    1: DbWorkerAction.cudDataResponse,
    /**
     * last cud timestamp
     */
    2: number,
    /**
     * last cud id
     */
    3: string
}

/**
 * Recheck member access request package that the worker can send to other workers.
 */
export interface DbWorkerRecheckMemberAccessPackage extends DbWorkerPackage{
    /**
     * action
     */
    1: DbWorkerAction.recheckMemberAccess
}

/**
 * The Databox token.
 */
export interface DbToken {
    /**
     * The raw options.
     */
    rawOptions: any;
    /**
     * The Databox sessions.
     */
    sessions: DbSessions,
}

/**
 * All session data of a client.
 */
export interface DbSessions {
    /**
     * mainSession
     */
    main: DbSession,
    /**
     * reloadSession
     */
    reload: DbSession
}

/**
 * One session that can be used to call the get data method.
 */
export interface DbSession {
    /**
     * counter
     */
    c: number,
    /**
     * data
     */
    d: DbSessionData
}

export type DbSessionData = Record<string, any>;

export interface InfoOption {
    /**
     * With the code, you can pass information about the reason of this cud operation.
     * That can be a string (e.g. 'NewMessage') or a number (e.g. 200,304).
     */
    code?: string | number;
    /**
     * With the data option, you can pass extra data to the
     * cud event that gets triggered on the client.
     */
    data?: any,
}

export interface TimestampOption {
    /**
     * With the timestamp option, you can change the sequence of data.
     * The client, for example, will only update data that is older as incoming data.
     * Use this option only if you know what you are doing.
     */
    timestamp?: number
}

export const enum IfQueryType {
    search,
    full
}

export type IfQuery = IfFullQuery | IfSearchQuery;

export interface IfFullQuery {
    //not
    n?: boolean;
    //type
    t: IfQueryType.full,
    //query
    q: ForintQuery<any>;
}

export interface IfSearchQuery {
    //not
    n?: boolean;
    //type
    t: IfQueryType.search,
    //query
    q: ForintSearchQuery;
}

export type IfOptionValue = IfQuery | (IfQuery[]);
export type IfOptionProcessedValue = IfQuery[];

export interface IfOptionProcessed {
    if?: IfOptionProcessedValue
}

export interface IfOption {
    /**
     * @description
     * The if option gives you the possibility to
     * define conditions for the cud operation.
     * All conditions must be evaluated to true;
     * otherwise, the client will ignore the operation.
     * You can define multiple conditions with an array or only one condition.
     * If you have an operation that has a selector that has multiple key targets,
     * the if conditions will only be evaluated once for every component.
     * There are two helper functions to build a condition the $contains and $matches helper.
     * In both helper functions, you pass in forint queries.
     * The contains helper function will execute the queries multiple times
     * for each key or value.
     * If at least one pair, key, or value matches, the condition is evaluated to true.
     * It's possible to invert the result using the $not function.
     * That gives you the possibility to check that a specific key, value,
     * or pair must exist or not.
     * In the case of a head selector (with selector [] or ''), the key always is: '' and
     * the value references to the complete data structure (if the value is not undefined).)
     * With the $any constant, which refers to an empty query ({}),
     * you can check if any pair exists or not.
     * Some useful example would be to reinsert old data,
     * but only to the clients that already loaded this old data section.
     * Or to build a set where each element value should be unique.
     * The matches helper function will execute the query once for the
     * complete object (all key-value pairs).
     * It's also possible to invert the result using the $not function.
     * In the case of a head selector (with selector [] or ''), the value
     * of the head (complete data structure) will be used.
     * It helps to check multiple pairs in one query and makes it more readable.
     * @example
     * if: $not($contains($any))
     * if: $contains($key('20'))
     * if: [$contains($value({name: 'luca'})),$not(contains($key('30')))]
     * if: $contains($pair('name','luca'))
     * if: $matches({name: 'luca', age: {gte: 18}, email: 'test1@test.de'})
     * if: $not($matches({email: 'test1@test.de'}))
     */
    if?: IfOptionValue;
}

export interface PotentialUpdateOption {
    /**
     * With the potentialUpdate option, you indicate that the insert is potential an update.
     * For example, when the key already exists,
     * the client will update the value instead of insert.
     */
    potentialUpdate?: boolean
}

export interface PotentialInsertOption {
    /**
     * With the potentialInsert option, you indicate that the update is potential an insert.
     * For example, when the key does not exist,
     * the client will insert the value instead of update.
     * Notice that the potentialInsert only works when the path selector ends on a specific key.
     */
    potentialInsert?: boolean
}

/**
 * The memory that Databoxes stores internally for last cud data.
 */
export interface DbLastCudDataMemory {
    id: string,
    timestamp: number,
    fetchResolve?: () => void,
    fetchPromise?: Promise<void>
}

/**
 * The memory that Databoxes stores internally for each socket.
 */
export interface DbSocketMemory {
    unregisterSocket: UnregisterSocketFunction,
    inputChIds: Set<string>
}

/**
 * The memory that DataboxFamilies stores internally for each member.
 */
export interface DbMemberMemory {
    sockets: Map<Socket,DbSocketMemory>,
    lastCudData: DbLastCudDataMemory
}


/**
 * The Databox register result.
 */
export interface DbRegisterResult {
    inputCh: string,
    outputCh: string
}

/**
 * Function for the cud middleware to change the value.
 */
export type ChangeValue = (newData: any) => void;

/**
 * The Databox info object.
 */
export interface DataboxInfo {
    identifier: string,
    /**
     * Notice that the member is deep readonly and only given in Family components.
     */
    member?: any
}

/**
 * Internal member wrapper interface.
 */
export interface DbMember<M> {
    memberStr: string,
    member: DeepReadonly<M>
}

/**
 * Forint search query.
 */
export type ForintSearchQuery<TK = any,TV = any> = {
    //key
    k?: ForintQuery<TK>,
    //value
    v?: ForintQuery<TV>
};

/**
 * Selector types.
 */
export type DbProcessedSelector = (string | ForintSearchQuery)[];

type DbSelectorItem = string | number | ForintSearchQuery;
export type DbSelector = DbSelectorItem | DbSelectorItem[];