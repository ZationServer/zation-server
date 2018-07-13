/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import ZationConfig     = require("../../main/zationConfig");
import Const            = require("../constants/constWrapper");
import {BackgroundTask} from "../configEditTool/appConfigStructure";

type SetTask = (name : string,time : any,task : any) => void;

class BackgroundTasksSetter
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
           BackgroundTasksSetter.timeSetter
           (this.setEvery,Const.App.BACKGROUND_TASKS.EVERY,task,name,bkTask);

           BackgroundTasksSetter.timeSetter
           (this.setAt,Const.App.BACKGROUND_TASKS.AT,task,name,bkTask);
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

export = BackgroundTasksSetter;