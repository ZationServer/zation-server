/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

export const DATA_BOX_START_INDICATOR = '>D';

export enum CudType {
    insert,
    update,
    delete
}

export interface BaseCudAction {
    cudId : string,
    timestamp : number,
}

export interface CudAction extends BaseCudAction{
    type : CudType,
    keyPath : string[],
    value ?: any;
}

export enum DbClientReceiverAction {
    cud,
    close
}

export enum DbClientSenderAction {
    getLastCudId
}

export enum DbWorkerAction {
    cud,
}

export interface DbClientPackage {
    action : DbClientReceiverAction,
    data ?: any
}

export interface DbClientCudPackage {
    action : DbClientReceiverAction,
    data : CudAction[]
}

export interface DbWorkerPackage {
    action : DbWorkerAction,
    data ?: any
}

export interface DbWorkerCudPackage extends DbWorkerPackage{
    data : CudAction[],
    wFullId : string
}