/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import ZationConfig     = require("../../main/zationConfig");
import {BackgroundTask}   from "../configs/appConfig";

type SetTask = (name : string,time : any,task : any) => void;

class BackgroundTasksLoader
{
   private readonly setEvery : SetTask;
   private readonly setAt : SetTask;

   constructor(setEvery : SetTask, setAt : SetTask)
   {
       this.setAt = setAt;
       this.setEvery = setEvery;
   }


   setUserBackgroundTasks (zc : ZationConfig)
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
           BackgroundTasksLoader.timeSetter
           (this.setEvery,nameof<BackgroundTask>(s => s.every),task,name,bkTask);

           BackgroundTasksLoader.timeSetter
           (this.setAt,nameof<BackgroundTask>(s => s.at),task,name,bkTask);
       }
   }

   private static timeSetter(func : SetTask,key : string,task,name,bkt)
   {
       if(Array.isArray(bkt[key])) {
           for(let i = 0; i < bkt[key].length; i ++) {
               func(name,bkt[key][i],task);
           }
       }
       else {
           func(name,bkt[key],task);
       }
   }

}

export = BackgroundTasksLoader;