/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */
import ZationMaster = require("../../main/zationMaster");
import TimeTools     = require("../tools/timeTools");
import ZationConfig  = require("../../main/zationConfig");

class BackgroundTasksSender
{
    private readonly master : ZationMaster;
    private readonly zc : ZationConfig;

    constructor(master : ZationMaster, zc : ZationConfig)
    {
        this.zc = zc;
        this.master = master;
    }

    public setEveryBackgroundTask(name,time)
    {
        if(Number.isInteger(time))
        {
            setInterval(() => {
                this.runUserBackgroundTask(name);
            },time);
        }
        else if(typeof time === 'object')
        {
            let set = () => {
                let tillTime = TimeTools.processTaskTriggerTime(time,this.zc);
                if(tillTime && tillTime > 0)
                {
                    setTimeout(() => {
                        this.runUserBackgroundTask(name);
                        set();
                    },tillTime);
                }
                else
                {
                    throw Error(`Planed every background task with name ${name} goes wrong.`);
                }
            };
            set();
        }
    }

    private runUserBackgroundTask(name) {
        this.master.sendBackgroundTask({userBackgroundTask : name});
    }

    public setAtBackgroundTask(name,time)
    {
        if(Number.isInteger(time))
        {
            setTimeout(() => {
                this.runUserBackgroundTask(name);
            },time);
        }
        else if(typeof time === 'object')
        {
            let tillTime = TimeTools.processTaskTriggerTime(time,this.zc);
            if(tillTime && tillTime > 0)
            {
                setTimeout(() => {
                    this.runUserBackgroundTask(name);
                },tillTime);
            }
            else
            {
                throw Error(`Planed at background task with name ${name} goes wrong.`);
            }
        }
    }
}

export = BackgroundTasksSender;