/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {EditTokenPayloadDescription} from './editTokenPayloadDescription';

export const enum WorkerChTaskType
{
    MapTask,
    SpecialTask
}

//MapTask

export const enum WorkerChMapTaskAction
{
    Disconnect,
    Deauthenticate,
    Emit
}

export const enum WorkerChMapTarget
{
    UserIds,
    TokenIds,
    AllSockets,
    SocketSids,
    AuthUserGroups,
    DefaultUserGroup
}

export interface WorkerChAbstractMapTask {
    taskType: WorkerChTaskType.MapTask,
    ids: (string | number)[],
    action: WorkerChMapTaskAction,
    target: WorkerChMapTarget,
    exceptSocketSids: string[],
    data: Record<string,any>
}

export interface WorkerChMapTaskEmit extends WorkerChAbstractMapTask {
    action: WorkerChMapTaskAction.Emit,
    data: {
        event: string,
        data: any,
        all?: boolean,
    }
}

export interface WorkerChMapTaskDisconnect extends WorkerChAbstractMapTask {
    action: WorkerChMapTaskAction.Disconnect
}

export interface WorkerChMapTaskDeauthenticate extends WorkerChAbstractMapTask{
    action: WorkerChMapTaskAction.Deauthenticate
}

export type WorkerChMapTask = WorkerChMapTaskEmit |
    WorkerChMapTaskDisconnect | WorkerChMapTaskDeauthenticate;


//SpecialTask

export const enum WorkerChSpecialTaskAction
{
    UpdateUserTokens,
    UpdateGroupTokens,
    Message
}

interface WorkerChSpecialTaskMark {
    taskType: WorkerChTaskType.SpecialTask
}

export interface WorkerChSpecialTaskToken extends WorkerChSpecialTaskMark {
    action: WorkerChSpecialTaskAction.UpdateUserTokens | WorkerChSpecialTaskAction.UpdateGroupTokens,
    data: EditTokenPayloadDescription
}

export interface WorkerChSpecialTaskMessage extends WorkerChSpecialTaskMark {
    action: WorkerChSpecialTaskAction.Message,
    data: any
}

export type WorkerChSpecialTask = WorkerChSpecialTaskToken | WorkerChSpecialTaskMessage;

export type WorkerTaskPackage = WorkerChSpecialTask | WorkerChMapTask;

