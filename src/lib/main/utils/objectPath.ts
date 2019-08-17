/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import objPath = require("object-path");

export default class ObjectPath
{
   static get(obj : object,path ?: string | string[]) : any {
       return objPath.get(obj,path);
   }

   static has(obj : object,path ?: string | string[]) : boolean {
       return objPath.has(obj,path);
   }

   static set(obj : object,path : string | string[],value : any) : void {
       objPath.set(obj,path,value);
   }

   static del(obj : object,path : string | string[]) : void {
       objPath.del(obj,path);
   }


}