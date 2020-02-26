/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import Bag from "../../../../api/Bag";

export type TaskFunction = (bag: Bag) => Promise<void> | void;

export interface BackgroundTask
{
    /**
     * Defines when the background task should be invoked.
     * At will invoke the background task only one time.
     * You can use a number to define the milliseconds or a TimeObj to define a Time.
     * @example
     * // Will invoke the background task when the hour is 10.
     * at: {hour: 10}
     * // Will invoke the background task when the hour is 10 or 8.
     * at: [{hour: 10},{hour: 8}]
     * // Will invoke the background task when the hour is 10 and second 30.
     * at: {hour: 10,second: 30}
     * // Will invoke the background task after 30 seconds.
     * at: 30000
     */
    at ?: number | TimeObj | TimeObj[] | number[];
    /**
     * Defines when the background task should be invoked.
     * Every will invoke the background task every time.
     * You can use a number to define the milliseconds or a TimeObj to define a Time.
     * @example
     * // Will invoke the background task whenever the hour is 10.
     * every: {hour: 10}
     * // Will invoke the background task whenever the hour is 10 or 8.
     * every: [{hour: 10},{hour: 8}]
     * // Will invoke the background task whenever the hour is 10 and second 30.
     * every: {hour: 10,second: 30}
     * // Will invoke the background task every 30 seconds.
     * every: 30000
     */
    every ?: number | TimeObj | TimeObj[] | number[];
    /**
     * The task method defines the general task of the background task.
     * Optionally you can pass an array of tasks.
     * @example
     * task: (b: Bag) => {
     *    console.log(`TaskRunning on worker -> ${b.getWorkerId()}`);
     * },
     */
    task ?: TaskFunction | TaskFunction[];
    /**
     * Indicates if this task should be cluster save.
     * That means if you have multiple servers in a cluster,
     * only one of them will executing the task. Otherwise,
     * every server will perform that task.
     * @default true
     */
    clusterSafe?: boolean;
}

export interface TimeObj
{
    /**
     * The specific hour when the background task should be executed.
     */
    hour?: number;
    /**
     * The specific minute when the background task should be executed.
     */
    minute?: number;
    /**
     * The specific second when the background task should be executed.
     */
    second?: number;
    /**
     * The specific millisecond when the background task should be executed.
     */
    millisecond?: number;
}