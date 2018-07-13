/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import ZationConfig     = require("../../main/zationConfig");
import Const            = require("../constants/constWrapper");
import {BackgroundTask} from "../configEditTool/appConfigStructure";

type SaveTask = (name : string, task : any) => void;

class BackgroundTasksSaver
{
    private readonly saveTask : SaveTask;

    constructor(saveTask : SaveTask)
    {
        this.saveTask = saveTask;
    }

    saveUserBackgroundTasks (zc : ZationConfig)
    {
        const bkt = zc.getApp(Const.App.KEYS.BACKGROUND_TASKS);
        if(typeof bkt === 'object')
        {
            for(let name in bkt)
            {
                if(bkt.hasOwnProperty(name))
                {
                    this.setTask(name,bkt[name]);
                }
            }
        }
    }

    private setTask(name : string,bkTask : BackgroundTask)
    {
        const task = bkTask[Const.App.BACKGROUND_TASKS.TASK];
        if(task !== undefined)
        {
            this.saveTask(name,task);
        }
    }

}

export = BackgroundTasksSaver;