/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import ZationConfig     = require("../../main/zationConfig");
import {BackgroundTask}   from "../configs/appConfig";

type SaveTask = (name : string, task : any) => void;

class BackgroundTasksWorkerSaver
{
    private readonly saveTask : SaveTask;

    constructor(saveTask : SaveTask) {
        this.saveTask = saveTask;
    }

    saveUserBackgroundTasks (zc : ZationConfig)
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
            this.saveTask(name,task);
        }
    }

}

export = BackgroundTasksWorkerSaver;