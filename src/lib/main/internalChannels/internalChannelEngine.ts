/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

/*
Class Description :
This class is to publish into channels with the scServer.exchange object.
 */

import {
    WorkerChMapTaskAction, WorkerChSpecialTask,
    WorkerChSpecialTaskAction,
    WorkerChMapTarget,
    WorkerChTaskType, WorkerChAbstractMapTask, WorkerChMapTask
} from "../constants/workerChTaskDefinitions";
import ScServer             from "../sc/scServer";
import {SyncTokenDefinitions, UpdateTokenMainData} from "../constants/syncTokenDefinitions";
import Logger               from "../log/logger";

export const INTERNAL_WORKER_CH = 'W>';
export const INTERNAL_PANEL_CH = 'P>';

export default class InternalChannelEngine
{
    private readonly _publish: ScServer['exchange']['publish'];

    constructor(scServer: ScServer) {
        this._publish = scServer.exchange.publish.bind(scServer.exchange);
    }

    /**
     * Publish async in a channel.
     * @param channel
     * @param data
     */
    publishAsync(channel: string, data: any): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this._publish(channel, data, (err) => {
                err ? reject(err) : resolve();
            });
        });
    }

    //Part Worker channel
    /**
     * Publish to all worker.
     * @param data
     */
    private async publishToWorker<T extends any>(data: T): Promise<void> {
        try {
            await this.publishAsync(INTERNAL_WORKER_CH, data);
        } catch (e) {
            Logger.log.warn(`Failed to publish data: '${data.toString()}' in worker channel.`);
            throw e;
        }
    }

    /**
     * Publish map task to workers.
     * @param target
     * @param action
     * @param ids
     * @param exceptSocketSids
     * @param data
     */
    async publishMapTaskToWorker(target: WorkerChMapTarget,
                                 action: WorkerChMapTaskAction,
                                 ids: string | number | (string | number)[],
                                 exceptSocketSids: string[] | string,
                                 data: WorkerChMapTask['data'] = {}): Promise<void>
    {
        await this.publishToWorker<WorkerChAbstractMapTask>({
            taskType: WorkerChTaskType.MapTask,
            ids: Array.isArray(ids) ? ids: [ids],
            action: action,
            target: target,
            data: data,
            exceptSocketSids: Array.isArray(exceptSocketSids) ? exceptSocketSids: [exceptSocketSids]
        });
    }

    async publishSpecialTaskToWorker(action: WorkerChSpecialTaskAction.UpdateGroupTokens, data: UpdateTokenMainData): Promise<void>
    async publishSpecialTaskToWorker(action: WorkerChSpecialTaskAction.UpdateUserTokens, data: UpdateTokenMainData): Promise<void>
    async publishSpecialTaskToWorker(action: WorkerChSpecialTaskAction.Message, data: any): Promise<void>
    /**
     * Publish special task to worker.
     * @param action
     * @param data
     */
    async publishSpecialTaskToWorker(action: WorkerChSpecialTaskAction, data: UpdateTokenMainData | any): Promise<void> {
        await this.publishToWorker<WorkerChSpecialTask>({
            taskType: WorkerChTaskType.SpecialTask,
            action: action,
            data: data
        });
    }

    /**
     * Publish update user token worker task.
     * @param operations
     * @param userId
     * @param exceptSocketSids
     */
    async publishUpdateUserTokenWorkerTask(
            operations: SyncTokenDefinitions[],
            userId,
            exceptSocketSids: string[] | string): Promise<void>
    {
        await this.publishSpecialTaskToWorker(
            WorkerChSpecialTaskAction.UpdateUserTokens, {
                operations: operations,
                target: userId,
                exceptSocketSids: Array.isArray(exceptSocketSids) ? exceptSocketSids: [exceptSocketSids]
            }
        );
    }

    /**
     * Publish update group token worker task.
     * @param operations
     * @param authUserGroup
     * @param exceptSocketSids
     */
    async publishUpdateGroupTokenWorkerTask(
            operations: SyncTokenDefinitions[],
            authUserGroup,
            exceptSocketSids: string[] | string): Promise<void>
    {
        await this.publishSpecialTaskToWorker(
            WorkerChSpecialTaskAction.UpdateGroupTokens, {
                operations: operations,
                target: authUserGroup,
                exceptSocketSids: Array.isArray(exceptSocketSids) ? exceptSocketSids: [exceptSocketSids]
            }
        );
    }
}