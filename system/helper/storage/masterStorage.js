/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

const AbstractStorage = require('./abstractStorage');

class MasterStorage extends AbstractStorage
{
    constructor(key,worker)
    {
        super();
        this._key = key;
        this._worker = worker;
    }

    async init()
    {
        await this._createMainStructure();
    }

    async _createMainStructure()
    {
        let csMain = await this.send({command : 'canDo' , key : this._key},false);
        if(!csMain)
        {
            await this.send({command : 'set', key : this._key},false);
        }
    }

    _getCommandInKey(command)
    {
        return {
                storage : {
                    command : 'do',
                    key : this._key,
                    value : command
                }
            };
    }

    static _getCommand(command)
    {
        return {
            storage : command
        };
    }

    buildSet(key,value)
    {
        return {
                command : 'set',
                key : key,
                value : value
            };
    }

    buildGet(key)
    {
        return{
                command : 'get',
                key : key
            };
    }

    buildRemove(key)
    {
        return{
                command : 'remove',
                key : key
            };
    }

    buildCanDo(key)
    {
        return{
                command : 'canDo',
                key : key
            };
    }

    buildDo(key,req)
    {
        return{
                command : 'do',
                key : key,
                value : req
            };
    }


    async send(obj,inStorage = true)
    {
        return new Promise((resolve, reject) =>
        {
            let sendObj = inStorage ?  this._getCommandInKey(obj) : MasterStorage._getCommand(obj);
            this._worker.sendToMaster( sendObj ,
                (err,data) =>
                {
                    if(err)
                    {
                        reject(err);
                    }
                    else
                    {
                        resolve(data);
                    }
                });
        });
    }

}

module.exports = MasterStorage;