/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import ZationMaster from "../../main/zationMaster";
import ZationConfig from "../configManager/zationConfig";
import TimeUtils    from "../utils/timeUtils";
import Logger       from "../logger/logger";

export default class BackgroundTasksSender
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
            const set = () => {
                let {tillMs,tillFormat} = TimeUtils.
                processTaskTriggerTime(time,TimeUtils.getMoment(this.zc.mainConfig.timeZone));

                if(tillMs && tillMs > 0) {
                    Logger.printDebugInfo(`Every Background Task: ${name} is planed to -> ${tillFormat}`);
                    setTimeout(() => {
                        this.runUserBackgroundTask(name);
                        set();
                    },tillMs);
                }
                else {
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
            const {tillFormat,tillMs} = TimeUtils.
            processTaskTriggerTime(time,TimeUtils.getMoment(this.zc.mainConfig.timeZone));

            if(tillMs && tillMs > 0) {
                Logger.printDebugInfo(`At Background Task: ${name} is planed to -> ${tillFormat}`);
                setTimeout(() => {
                    this.runUserBackgroundTask(name);
                },tillMs);
            }
            else {
                throw Error(`Planed at background task with name ${name} goes wrong.`);
            }
        }
    }
}