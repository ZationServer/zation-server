/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

export interface DataBoxConnectReq {
    /**
     * dataBox (name)
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

export interface DataBoxConnectRes {
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

export const DATA_BOX_START_INDICATOR = '>D';

export enum CudType {
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
     * actions
     */
    a : CudAction[]
}

/**
 * A cud action.
 */
export interface CudAction {
    /**
     * type
     */
    t : CudType,
    /**
     * keyPath
     */
    k : string[],
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
    i ?: string;
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
    a : DbClientInputAction.fetchData,
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
    kickOut
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
 * The target session that the server should use to process.
 */
export enum DBClientInputSessionTarget {
    mainSession,
    restoreSession
}

/**
 * Actions that a client can send to the server.
 */
export enum DbClientInputAction {
    fetchData,
    resetSession,
    copySession,
    disconnect,
    getLastCudId
}

/**
 * Actions that aa worker can send to another worker.
 */
export enum DbWorkerAction {
    /**
     * New create,update delete operation.
     */
    cud,
    /**
     * Close the DataBox
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
 * All session data of a client.
 */
export interface DbSessionData {
    /**
     * mainSession
     */
    main : DbSession,
    /**
     * restoreSession
     */
    restore: DbSession
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
     * The if contains option gives you the possibility to define a condition
     * that the client only inserts the value when it has data with that specific key.
     * That can be useful if you want to reinsert old data,
     * but only to the clients that are already loaded this old data section.
     */
    ifContains ?: string
}

/**
 * The memory that DataBoxes stores internally for each socket.
 */
export interface DbSocketMemory {
    unregisterSocket : UnregisterSocketFunction,
    inputChIds : Set<string>
}

/**
 * The DataBox register result.
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
 * The DataBox info object.
 */
export interface DataBoxInfo {
    name : string,
    id : any
}