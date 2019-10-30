/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {ForintQuery} from "forint";

export interface DataboxConnectReq {
    /**
     * databox (name)
     */
    d ?: string,
    /**
     * id
     */
    i ?: string,
    /**
     * apiLevel
     */
    al ?: number,
    /**
     * token
     */
    t ?: string,
    /**
     * initInput
     */
    ii ?: any
}

export interface DataboxConnectRes {
    /**
     * Last cud id
     */
    ci : string,
    /**
     * Used the token
     */
    ut : boolean,
    /**
     * Input key
     */
    i : string,
    /**
     * Output key
     */
    o : string,
    /**
     * Parallel fetching
     */
    pf : boolean
}

export type UnregisterSocketFunction = (inputChannelId ?: string) => void;

export const DATABOX_START_INDICATOR = '>D';

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
    t : number,
}

/**
 * A pre-defined cud package.
 */
export interface PreCudPackage {
    /**
     * cudId
     */
    ci : string,
    /**
     * timestamp
     */
    t ?: number,
    /**
     * operations
     */
    o : CudOperation[]
}

/**
 * A cud action.
 */
export interface CudOperation {
    /**
     * type
     */
    t : CudType,
    /**
     * selector
     */
    s : DbCudProcessedSelector,
    /**
     * value
     */
    v ?: any;
    /**
     * code
     */
    c ?: any;
    /**
     * data
     */
    d ?: any;
    /**
     * ifContains
     */
    i ?: DbForintQuery;
    /**
     * potential Insert/Update
     */
    p ?: 0 | 1;
}

/**
 * The package that the client can send to the server to invoke an action.
 */
export interface DbClientInputPackage {
    /**
     * Action
     */
    a : DbClientInputAction,
    /**
     * Session Target
     */
    t ?: DBClientInputSessionTarget
}

/**
 * The package that the client can send to the server to fetch data.
 */
export interface DbClientInputFetchPackage extends DbClientInputPackage{
    a : DbClientInputAction.fetch,
    /**
     * input
     */
    i : any
}

export interface DbClientInputFetchResponse {
    /**
     * counter
     */
    c : number,
    /**
     * token
     */
    t : string,
    /**
     * data
     */
    d : any
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
    a : DbClientOutputEvent,
    /**
     * data
     */
    d ?: any,
    /**
     * code
     */
    c ?: number | string,
}

/**
 * Cud package that the server can send to the clients.
 * In case of an insert, update, or delete of data.
 */
export interface DbClientOutputCudPackage extends DbClientOutputPackage{
    /**
     * action
     */
    a : DbClientOutputEvent.cud,
    /**
     * data
     */
    d : CudPackage
}

/**
 * Reload package that the server can send to the clients.
 */
export interface DbClientOutputReloadPackage extends DbClientOutputPackage{
    /**
     * action
     */
    a : DbClientOutputEvent.reload,
    /**
     * data
     */
    d ?: any
}

/**
 * Close package that the server can send to the clients.
 */
export interface DbClientOutputClosePackage extends DbClientOutputPackage{
    /**
     * action
     */
    a : DbClientOutputEvent.close,
    /**
     * data
     */
    d ?: any
}

/**
 * Kick out package that the server can send to the clients.
 */
export interface DbClientOutputKickOutPackage extends DbClientOutputPackage{
    /**
     * action
     */
    a : DbClientOutputEvent.kickOut,
    /**
     * data
     */
    d ?: any
}

/**
 * Signal package that the server can send to the clients.
 */
export interface DbClientOutputSignalPackage extends DbClientOutputPackage{
    /**
     * action
     */
    a : DbClientOutputEvent.signal,
    /**
     * signal
     */
    s : string
    /**
     * data
     */
    d ?: any
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
    getLastCudId
}

/**
 * Actions that aa worker can send to another worker.
 */
export const enum DbWorkerAction {
    /**
     * New create,update delete operation.
     */
    cud,
    /**
     * Close the Databox
     */
    close,
    /**
     * Broadcast a client package.
     */
    broadcast
}

/**
 * A package that a worker can send to the other workers.
 */
export interface DbWorkerPackage {
    /**
     * action
     */
    a : DbWorkerAction,
    /**
     * data
     */
    d ?: any
    /**
     * workerFullId
     */
    w : string
}

/**
 * Cud package that the worker can send to other workers.
 * In case of an insert, update, or delete of data.
 */
export interface DbWorkerCudPackage extends DbWorkerPackage{
    /**
     * action
     */
    a : DbWorkerAction.cud,
    /**
     * data
     */
    d : CudPackage,
}

/**
 * Close package that the worker can send to other workers.
 */
export interface DbWorkerClosePackage extends DbWorkerPackage{
    /**
     * action
     */
    a : DbWorkerAction.close,
    /**
     * The client close package.
     */
    d : DbClientOutputClosePackage
}

/**
 * Broadcast package that the worker can send to other workers.
 */
export interface DbWorkerBroadcastPackage extends DbWorkerPackage{
    /**
     * action
     */
    a : DbWorkerAction.broadcast,
    /**
     * data
     */
    d : DbClientOutputPackage
}

/**
 * The Databox token.
 */
export interface DbToken {
    /**
     * The raw init data.
     */
    rawInitData : any;
    /**
     * The Databox sessions.
     */
    sessions : DbSessionData,
}

/**
 * All session data of a client.
 */
export interface DbSessionData {
    /**
     * mainSession
     */
    main : DbSession,
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
    c : number,
    /**
     * data
     */
    d : object
}

export interface InfoOption {
    /**
     * With the code, you can pass information about the reason of this cud operation.
     * That can be a string (e.g. 'NewMessage') or a number (e.g. 200,304).
     */
    code ?: string | number;
    /**
     * With the data option, you can pass extra data to the
     * cud event that gets triggered on the client.
     */
    data ?: any,
}

export interface TimestampOption {
    /**
     * With the timestamp option, you can change the sequence of data.
     * The client, for example, will only update data that is older as incoming data.
     * Use this option only if you know what you are doing.
     */
    timestamp ?: number
}

export interface IfContainsOption {
    /**
     * The ifContains option gives you the possibility to define a condition
     * that the client only does the action when it has data that matches with a specific query.
     * For example, it can be useful if you want to reinsert old data,
     * but only to the clients that are already loaded this old data section.
     * Notice also that in some cases the insertion sequence is changed.
     */
    ifContains ?: DbForintQuery
}

export interface PotentialUpdateOption {
    /**
     * With the potentialUpdate option, you indicate that the insert is potential an update.
     * For example, when the key already exists,
     * the client will update the value instead of insert.
     */
    potentialUpdate ?: boolean
}

export interface PotentialInsertOption {
    /**
     * With the potentialInsert option, you indicate that the update is potential an insert.
     * For example, when the key does not exist,
     * the client will insert the value instead of update.
     * Notice that the potentialInsert only works when the path selector ends on a specific key.
     */
    potentialInsert ?: boolean
}

/**
 * The memory that Databoxes stores internally for each socket.
 */
export interface DbSocketMemory {
    unregisterSocket : UnregisterSocketFunction,
    inputChIds : Set<string>
}

/**
 * The Databox register result.
 */
export interface DbRegisterResult {
    inputCh : string,
    outputCh : string
}

/**
 * Function for the cud middleware to change the value.
 */
export type ChangeValue = (newData : any) => void;

/**
 * The Databox info object.
 */
export interface DataboxInfo {
    name : string,
    id : any
}

/**
 * Forint queries with the databox.
 */
export type DbForintQuery = {key ?: ForintQuery,value ?: ForintQuery};

/**
 * Selector types for cud operations.
 */
export type DbCudProcessedSelector = (string | DbForintQuery)[];

type DbCudSelectorItem = string | number | DbForintQuery;
export type DbCudSelector = DbCudSelectorItem | DbCudSelectorItem[];