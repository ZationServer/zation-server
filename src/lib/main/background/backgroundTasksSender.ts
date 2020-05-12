/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import ZationMaster from '../../core/zationMaster';
import ZationConfig from '../config/manager/zationConfig';
import Logger                               from '../log/logger';
import {getMoment, processTaskTriggerTime}  from '../utils/timeUtils';
import {MasterMessageAction}                from '../constants/masterMessage';

export default class BackgroundTasksSender
{
    private readonly master: ZationMaster;
    private readonly zc: ZationConfig;

    constructor(master: ZationMaster, zc: ZationConfig)
    {
        this.zc = zc;
        this.master = master;
    }

    public setEveryBackgroundTask(name: string,time: any,clusterSafe: boolean)
    {
        if(Number.isInteger(time))
        {
            setInterval(() => {
                this.runUserBackgroundTask(name,clusterSafe);
            },time);
        }
        else if(typeof time === 'object')
        {
            const set = () => {
                let {tillMs,tillFormat} = processTaskTriggerTime(time,getMoment(this.zc.mainConfig.timeZone));

                if(tillMs && tillMs > 0) {
                    Logger.log.debug(`Every Background Task: ${name} is planed to -> ${tillFormat}`);
                    setTimeout(() => {
                        this.runUserBackgroundTask(name,clusterSafe);
                        set();
                    },tillMs);
                }
                else {
                    throw Error(`Planning of every background task with name ${name} goes wrong.`);
                }
            };
            set();
        }
    }

    private runUserBackgroundTask(name: string,clusterSafe: boolean) {
        if(!clusterSafe || (clusterSafe && this.master.isClusterLeader())){
            this.master.sendToRandomWorker([MasterMessageAction.backgroundTask,name]);
        }
    }

    public setAtBackgroundTask(name: string,time: any,clusterSafe: boolean)
    {
        if(Number.isInteger(time))
        {
            setTimeout(() => {
                this.runUserBackgroundTask(name,clusterSafe);
            },time);
        }
        else if(typeof time === 'object')
        {
            const {tillFormat,tillMs} = processTaskTriggerTime(time,getMoment(this.zc.mainConfig.timeZone));

            if(tillMs && tillMs > 0) {
                Logger.log.debug(`At Background Task: ${name} is planed to -> ${tillFormat}`);
                setTimeout(() => {
                    this.runUserBackgroundTask(name,clusterSafe);
                },tillMs);
            }
            else {
                throw Error(`Planning of at background task with name ${name} goes wrong.`);
            }
        }
    }
}