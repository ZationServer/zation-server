/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {UpdateTokenMainData} from "./syncTokenDefinitions";

export const enum WorkerChTaskType
{
    MAP_TASK,
    SPECIAL_TASK
}

//MapTask

export const enum WorkerChMapTaskAction
{
    DISCONNECT,
    DEAUTHENTICATE,
    KICK_OUT,
    EMIT
}

export const enum WorkerChMapTarget
{
    USER_IDS,
    TOKEN_IDS,
    ALL_SOCKETS,
    SOCKETS_SIDS,
    AUTH_USER_GROUPS,
    DEFAULT_USER_GROUP
}

export interface WorkerChAbstractMapTask {
    taskType: WorkerChTaskType.MAP_TASK,
    ids: (string | number)[],
    action: WorkerChMapTaskAction,
    target: WorkerChMapTarget,
    exceptSocketSids: string[],
    data: Record<string,any>
}

export interface WorkerChMapTaskKickOut extends WorkerChAbstractMapTask {
    action: WorkerChMapTaskAction.KICK_OUT,
    data: {
        ch: string,
        all?: boolean,
    }
}

export interface WorkerChMapTaskEmit extends WorkerChAbstractMapTask {
    action: WorkerChMapTaskAction.EMIT,
    data: {
        event: string,
        data: any,
        all?: boolean,
    }
}

export interface WorkerChMapTaskDisconnect extends WorkerChAbstractMapTask {
    action: WorkerChMapTaskAction.DISCONNECT
}

export interface WorkerChMapTaskDeauthenticate extends WorkerChAbstractMapTask{
    action: WorkerChMapTaskAction.DEAUTHENTICATE
}

export type WorkerChMapTask = WorkerChMapTaskKickOut | WorkerChMapTaskEmit |
    WorkerChMapTaskDisconnect | WorkerChMapTaskDeauthenticate;


//SpecialTask

export const enum WorkerChSpecialTaskAction
{
    UPDATE_USER_TOKENS,
    UPDATE_GROUP_TOKENS,
    MESSAGE
}

interface WorkerChSpecialTaskMark {
    taskType: WorkerChTaskType.SPECIAL_TASK
}

export interface WorkerChSpecialTaskToken extends WorkerChSpecialTaskMark {
    action: WorkerChSpecialTaskAction.UPDATE_USER_TOKENS | WorkerChSpecialTaskAction.UPDATE_GROUP_TOKENS,
    data: UpdateTokenMainData
}

export interface WorkerChSpecialTaskMessage extends WorkerChSpecialTaskMark {
    action: WorkerChSpecialTaskAction.MESSAGE,
    data: any
}

export type WorkerChSpecialTask = WorkerChSpecialTaskToken | WorkerChSpecialTaskMessage;

export type WorkerTaskPackage = WorkerChSpecialTask | WorkerChMapTask;

