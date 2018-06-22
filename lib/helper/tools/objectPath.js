/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

class ObjectPath
{
   constructor(obj,splitSign = '.')
   {
       this._splitSign = splitSign;
       this._obj = obj;
   }

   getObj()
   {
       return this._obj;
   }

   setObj(obj)
   {
       this._obj = obj;
   }

   get(path)
   {
       if(path !== undefined)
       {
           let paths;

           if(typeof path === 'string')
           {
               paths =path.split(this._splitSign);
           }
           else
           {
               paths = path;
           }

           let objTemp = this._obj;

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
           return this._obj;
       }
   }

   static getPath(obj,path,splitSign)
   {
       let objectPath = new ObjectPath(obj,splitSign);
       return objectPath.get(path);
   }
}

module.exports = ObjectPath;