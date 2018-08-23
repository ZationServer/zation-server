/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import ObjectTools = require("./objectTools");

class ObjectPath
{
   private readonly splitSign : string;
   private obj : object;

   constructor(obj,splitSign = '.')
   {
       this.splitSign = splitSign;
       this.obj = obj;
   }

   getObj() : object
   {
       return this.obj;
   }

   setObj(obj : object) : void
   {
       this.obj = obj;
   }

   has(path ?: string | string[]) : boolean
   {
       return this.get(path) !== undefined;
   }

   update(path : string | string[],value : object,override : boolean = true) : boolean
   {
       const paths = this.resolvePath(path);
       let objTemp = this.obj;

       if(paths.length === 0)
       {
           if(this.obj === undefined || override) {
               this.setObj(value);
           }
           else {
               this.setObj(ObjectTools.mergeObjToObj(this.obj,value,override));
               return true;
           }
       }

       for(let i = 0; i < paths.length; i++) {

           if(i === (paths.length-1))
           {
               if(typeof objTemp[paths[i]] === "object") {
                   objTemp[paths[i]] = ObjectTools.mergeObjToObj(objTemp[paths[i]],value,override);
                   return true;
               }
           }
           else
           {
               if(typeof objTemp[paths[i]] === "object")
               {
                   objTemp = objTemp[paths[i]];
               }
               else {
                  break;
               }
           }
       }

       return false;
   }

   set(path : string | string[],value : any,override : boolean = true) : boolean
   {
       const paths = this.resolvePath(path);
       let objTemp = this.obj;
       let suc = false;

       if(paths.length === 0)
       {
           if(this.obj === undefined || override) {
               this.setObj(value);
               return true;
           }
           else {
               return false;
           }
       }

       for(let i = 0; i < paths.length; i++) {

           if(i === (paths.length-1))
           {
               if(objTemp[paths[i]] === undefined || override)
               {
                   objTemp[paths[i]] = value;
                   suc = true;
               }
           }
           else
           {
               if(typeof objTemp[paths[i]] === "object")
               {
                   objTemp = objTemp[paths[i]];
               }
               else {
                   if((objTemp[paths[i]] !== undefined && override) || objTemp[paths[i]] === undefined)
                   {
                       objTemp[paths[i]] = {};
                       objTemp = objTemp[paths[i]];
                   }
                   else {
                       break;
                   }
               }
           }
       }
       return suc;
   }

   get(path ?: string | string[]) : any
   {
       const paths = this.resolvePath(path);
       if(paths.length > 0) {
           let objTemp = this.obj;

           for(let i = 0; i < paths.length; i++) {
               if(objTemp[paths[i]] !== undefined) {
                   objTemp = objTemp[paths[i]];
               }
               else {
                   return undefined;
               }
           }
           return objTemp;
       }
       else {
           return this.obj;
       }
   }

   delete(path ?: string | string[]) : boolean
   {
       const paths = this.resolvePath(path);
       let objTemp = this.obj;

       if(paths.length === 0) {
           this.setObj({});
           return true;
       }

       for(let i = 0; i < paths.length--; i++) {
           if (i === (paths.length - 1)) {
               delete objTemp[paths[i]];
               return true;
           }
           else if (objTemp[paths[i]] !== undefined) {
               objTemp = objTemp[paths[i]];
           }
           else {
               break;
           }
       }

       return false;
   }

   private resolvePath(path ?: string | string[]) : string[]
   {
       if(path === undefined) {
           return [];
       }
       else if(typeof path === 'string') {
           if(path === '') {
               return [];
           }
           return path.split(this.splitSign);
       }
       else {
           return path;
       }
   }

   static getPath(obj : object,path : string | string[],splitSign ?: string) : any
   {
       let objectPath = new ObjectPath(obj,splitSign);
       return objectPath.get(path);
   }

    static setPath(obj : object,path : string | string[],value : any,override : boolean,splitSign ?: string) : any
    {
        let objectPath = new ObjectPath(obj,splitSign);
        objectPath.set(path,value,override);
        return objectPath.getObj();
    }
}

export = ObjectPath;