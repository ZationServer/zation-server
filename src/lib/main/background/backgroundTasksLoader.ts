/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {BackgroundTask}   from "../config/definitions/parts/backgroundTask";

type SetTask = (name: string,time: any,clusterSafe: boolean,task: any) => void;

export default class BackgroundTasksLoader
{
   private readonly setEvery: SetTask;
   private readonly setAt: SetTask;

   constructor(setEvery: SetTask, setAt: SetTask) {
       this.setAt = setAt;
       this.setEvery = setEvery;
   }


   setUserBackgroundTasks (backgroundTasks: Record<string,BackgroundTask> | undefined)
   {
       if(typeof backgroundTasks === 'object') {
           for(let name in backgroundTasks) {
               if(backgroundTasks.hasOwnProperty(name)) {
                   this.setTask(name,backgroundTasks[name]);
               }
           }
       }
   }

   private setTask(name: string,bkTask: BackgroundTask)
   {
       const task = bkTask.task;
       if(task !== undefined) {
           BackgroundTasksLoader.timeSetter
           (this.setEvery,nameof<BackgroundTask>(s => s.every),task,name,bkTask);

           BackgroundTasksLoader.timeSetter
           (this.setAt,nameof<BackgroundTask>(s => s.at),task,name,bkTask);
       }
   }

   private static timeSetter(func: SetTask,key: string,task,name: string,bkt: BackgroundTask)
   {
       const clusterSafe = typeof bkt.clusterSafe === 'boolean' ? bkt.clusterSafe: true;
       if(Array.isArray(bkt[key])) {
           for(let i = 0; i < bkt[key].length; i ++) {
               func(name,bkt[key][i],clusterSafe,task);
           }
       }
       else {
           func(name,bkt[key],clusterSafe,task);
       }
   }

}