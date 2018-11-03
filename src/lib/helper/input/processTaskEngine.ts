/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

export type ProcessTask = () => Promise<void>;

export class ProcessTaskEngine
{
    static async processTasks(processTaskList : ProcessTask[])
    {
        const promises : Promise<void>[] = [];
        for(let i = 0; i < processTaskList.length; i++) {
            promises.push(processTaskList[i]());
        }
        await Promise.all(promises);
    }
}

