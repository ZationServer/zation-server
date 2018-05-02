/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

class MemoryMasterBridge
{
    constructor(worker)
    {
        this._worker = worker;
    }

    _sendToMaster(req)
    {
        return new Promise((resolve, reject)=>
        {
            this._worker.sendToMaster(req, (e,r) =>
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


    async find(dbName,arg1)
    {
        let req = MemoryMasterBridge._buildMemoryDbReq(dbName,'find',[arg1]);
        return await this._sendToMaster(req);
    }

    async count(dbName,arg1)
    {
        let req = MemoryMasterBridge._buildMemoryDbReq(dbName,'count',[arg1]);
        return await this._sendToMaster(req);
    }

    async findOne(dbName,arg1)
    {
        let req = MemoryMasterBridge._buildMemoryDbReq(dbName,'findOne',[arg1]);
        return await this._sendToMaster(req);
    }

    async insert(dbName,arg1)
    {
        let req = MemoryMasterBridge._buildMemoryDbReq(dbName,'insert',[arg1]);
        return await this._sendToMaster(req);
    }

    async update(dbName,arg1,arg2,arg3)
    {
        let req = MemoryMasterBridge._buildMemoryDbReq(dbName,'update',[arg1,arg2,arg3]);
        return await this._sendToMaster(req);
    }

    async remove(dbName,arg1,arg2)
    {
        let req = MemoryMasterBridge._buildMemoryDbReq(dbName,'remove',[arg1,arg2]);
        return await this._sendToMaster(req);
    }




    static _buildMemoryDbMainReq(data)
    {
        return {

            memoryDbRequest : true,
            memoryDbRequestData : data
        };
    }

    static _buildMemoryDbReq(dbName,command,args)
    {
        return MemoryMasterBridge._buildMemoryDbMainReq(
            {
                dbName : dbName,
                command : command,
                args : args
            }
        );
    }
}

module.exports = MemoryMasterBridge;