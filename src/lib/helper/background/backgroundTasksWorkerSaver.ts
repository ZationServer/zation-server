/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import {BackgroundTask}   from "../configDefinitions/backgroundTaskConfig";
import ZationConfigFull   from "../configManager/zationConfigFull";
import FuncUtils          from "../utils/funcUtils";

type SaveTask = (name : string, task : ((...any : any[])=> void)) => void;

export default class BackgroundTasksWorkerSaver
{
    private readonly saveTask : SaveTask;

    constructor(saveTask : SaveTask) {
        this.saveTask = saveTask;
    }

    saveUserBackgroundTasks (zc : ZationConfigFull)
    {
        const bkt = zc.appConfig.backgroundTasks;
        if(typeof bkt === 'object') {
            for(let name in bkt) {
                if(bkt.hasOwnProperty(name)) {
                    this.setTask(name,bkt[name]);
                }
            }
        }
    }

    private setTask(name : string,bkTask : BackgroundTask)
    {
        const task = bkTask.task;
        if(task !== undefined) {
            if(Array.isArray(task)){
                this.saveTask(name,FuncUtils.createFuncArrayAsyncInvoker(task));
            }
            else {
                this.saveTask(name,task);
            }
        }
    }

}