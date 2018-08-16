/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

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

   get(path ?: string | string[]) : any
   {
       if(path !== undefined)
       {
           let paths;

           if(typeof path === 'string')
           {
               paths =path.split(this.splitSign);
           }
           else
           {
               paths = path;
           }

           let objTemp = this.obj;

           for(let i = 0; i < paths.length; i++)
           {
               if(objTemp[paths[i]] !== undefined)
               {
                   objTemp = objTemp[paths[i]];
               }
               else
               {
                   return undefined;
               }
           }

           return objTemp;
       }
       else
       {
           return this.obj;
       }
   }

   static getPath(obj : object,path : any,splitSign ?: string) : any
   {
       let objectPath = new ObjectPath(obj,splitSign);
       return objectPath.get(path);
   }
}

export = ObjectPath;