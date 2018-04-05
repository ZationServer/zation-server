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
        let csMain = await this._send({command : 'canDo' , key : this._key});
        if(!csMain)
        {
            await this._send({command : 'set', key : this._key});
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

    // noinspection JSMethodCanBeStatic
    _getCommand(command)
    {
        return {storage : command};
    }

    buildSet(key,value)
    {
        return this._getCommandInKey(
            {
                command : 'set',
                key : key,
                value : value
            }
        )
    }

    buildGet(key)
    {
        return this._getCommandInKey(
            {
                command : 'get',
                key : key
            }
        )
    }

    buildRemove(key)
    {
        return this._getCommandInKey(
            {
                command : 'remove',
                key : key
            }
        )
    }

    buildCanDo(key)
    {
        return this._getCommandInKey(
            {
                command : 'canDo',
                key : key
            }
        )
    }

    buildDo(key,req)
    {
        return this._getCommandInKey(
            {
                command : 'canDo',
                key : key,
                value : req
            }
        )
    }


    async send(obj)
    {
        return new Promise((resolve, reject) =>
        {
            this._worker.sendToMaster(

                this._getCommand(obj)
                ,
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