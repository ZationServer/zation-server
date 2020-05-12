/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import objPath = require("object-path");

export default class ObjectPath {
   static get: (obj: object,path?: string | string[]) => any = objPath.get.bind(objPath);
   static has: (obj: object,path?: string | string[]) => boolean = objPath.has.bind(objPath);
   static set: (obj: object,path: string | string[],value: any) => void = objPath.set.bind(objPath);
   static del: (obj: object,path: string | string[]) => void = objPath.del.bind(objPath);
}