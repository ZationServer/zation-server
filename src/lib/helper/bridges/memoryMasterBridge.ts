/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import ZationWorker = require("../../main/zationWorker");

class MemoryMasterBridge
{
    private readonly worker : ZationWorker;

    constructor(worker : ZationWorker)
    {
        this.worker = worker;
    }

    private sendToMaster(req)
    {
        return new Promise((resolve, reject)=>
        {
            this.worker.sendToMaster(req, (e,r) =>
            {
                if(e)
                {
                    reject(e);
                }
                else
                {
                    resolve(r);
                }
            })
        });
    }


    // noinspection JSUnusedGlobalSymbols
    async find(dbName,arg1) : Promise<any>
    {
        let req = MemoryMasterBridge.buildMemoryDbReq(dbName,'find',[arg1]);
        return await this.sendToMaster(req);
    }

    async count(dbName,arg1) : Promise<any>
    {
        let req = MemoryMasterBridge.buildMemoryDbReq(dbName,'count',[arg1]);
        return await this.sendToMaster(req);
    }

    async findOne(dbName,arg1) : Promise<any>
    {
        let req = MemoryMasterBridge.buildMemoryDbReq(dbName,'findOne',[arg1]);
        return await this.sendToMaster(req);
    }

    async insert(dbName,arg1) : Promise<any>
    {
        let req = MemoryMasterBridge.buildMemoryDbReq(dbName,'insert',[arg1]);
        return await this.sendToMaster(req);
    }

    async update(dbName,arg1,arg2,arg3) : Promise<any>
    {
        let req = MemoryMasterBridge.buildMemoryDbReq(dbName,'update',[arg1,arg2,arg3]);
        return await this.sendToMaster(req);
    }

    async remove(dbName,arg1,arg2) : Promise<any>
    {
        let req = MemoryMasterBridge.buildMemoryDbReq(dbName,'remove',[arg1,arg2]);
        return await this.sendToMaster(req);
    }


    private static buildMemoryDbMainReq(data : object) : object
    {
        return {

            memoryDbRequest : true,
            memoryDbRequestData : data
        };
    }

    private static buildMemoryDbReq(dbName : string,command : string,args : any) : object
    {
        return MemoryMasterBridge.buildMemoryDbMainReq(
            {
                dbName : dbName,
                command : command,
                args : args
            }
        );
    }
}

export = MemoryMasterBridge;