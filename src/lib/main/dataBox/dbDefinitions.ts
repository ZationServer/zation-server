/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

export interface DataBoxRegisterReq {
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
    t ?: string
}

export interface DataBoxRegisterRes {
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

export interface DbFetchDataClientResponse {
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
 * A full-defined cud package that the server can send to the clients.
 */
export interface CudPackage extends PreCudPackage{
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
export interface DbClientSenderPackage {
    /**
     * Action
     */
    a : DbClientSenderAction,
    /**
     * Session Target
     */
    t ?: DBClientSenderSessionTarget
}

/**
 * The package that the client can send to the server to fetch data.
 */
export interface DbClientFetchSenderPackage extends DbClientSenderPackage{
    a : DbClientSenderAction.fetchData,
    /**
     * input
     */
    i : any
}

/**
 * Events that a client can receive from the server.
 */
export enum DbClientReceiverEvent {
    cud,
    close,
    reload,
    kickOut
}

/**
 * Packages that the server can send to the clients.
 */
export interface DbClientPackage {
    /**
     * action
     */
    a : DbClientReceiverEvent,
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
export interface DbClientCudPackage extends DbClientPackage{
    /**
     * action
     */
    a : DbClientReceiverEvent.cud,
    /**
     * data
     */
    d : CudPackage
}

/**
 * Reload package that the server can send to the clients.
 */
export interface DbClientReloadPackage extends DbClientPackage{
    /**
     * action
     */
    a : DbClientReceiverEvent.reload,
    /**
     * data
     */
    d ?: any
}

/**
 * Close package that the server can send to the clients.
 */
export interface DbClientClosePackage extends DbClientPackage{
    /**
     * action
     */
    a : DbClientReceiverEvent.close,
    /**
     * data
     */
    d ?: any
}

/**
 * Kick out package that the server can send to the clients.
 */
export interface DbClientKickOutPackage extends DbClientPackage{
    /**
     * action
     */
    a : DbClientReceiverEvent.kickOut,
    /**
     * data
     */
    d ?: any
}

/**
 * The target session that the server should use to process.
 */
export enum DBClientSenderSessionTarget {
    mainSession,
    restoreSession
}

/**
 * Actions that a client can send to the server.
 */
export enum DbClientSenderAction {
    fetchData,
    resetSession,
    copySession,
    close,
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
    d : DbClientClosePackage
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
    d : DbClientPackage
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