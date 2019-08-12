/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

export type ProcessTask = () => Promise<void>;

export default class ProcessTaskEngine
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

