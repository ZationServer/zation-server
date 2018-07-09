/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

const Const       = require('../constants/constWrapper');
const Logger      = require('../logger/logger');
const MongoClient = require('mongodb').MongoClient;

class MasterTempDbEngine
{
    constructor(zc)
    {
        this._zc = zc;
    }

    async init()
    {
        if(this._zc.isUseErrorInfoTempDb() || this._zc.isUseTokenInfoTempDb())
        {
            if(this._zc.getMain(Const.Main.KEYS.TEMP_DB_ENGINE) === Const.Main.TEMP_DB_ENGINE.MONGO)
            {
                const mongoClient = await MongoClient.connect(this._zc.getMain(Const.Main.KEYS.TEMP_DB_CONFIG).url);

                Logger.printStartDebugInfo('Clear mongo temp db');
                await (MasterTempDbEngine._clearTempDbMongo(mongoClient,this._zc));

                Logger.printStartDebugInfo('Create temp db structure');
                await MasterTempDbEngine._prepareTempDbStructureMongo(mongoClient,this._zc);

                // noinspection JSCheckFunctionSignatures
                await mongoClient.close();
            }
            else if(this._zc.getMain(Const.Main.KEYS.TEMP_DB_ENGINE) === Const.Main.TEMP_DB_ENGINE.MASTER_MEMORY)
            {
                Logger.printStartDebugInfo('Create master memory temp db');
                const NeDb = require('nedb');
                // noinspection JSCheckFunctionSignatures
                this._memoryTokenInfoDb = new NeDb({inMemoryOnly : true});
                // noinspection JSCheckFunctionSignatures
                this._memoryErrorInfoDb = new NeDb({inMemoryOnly : true});
            }
            else
            {
                throw new Error(`Invalid tempDb Engine -> ${this._zc.getMain(Const.Main.KEYS.TEMP_DB_ENGINE)}`);
            }
        }
    }

    async processMemoryDbReq(data,resp)
    {
        let dbName = data['dbName'];

        switch (dbName)
        {
            case Const.Settings.TEMP_DB.TOKEN_INFO_NAME :
                await MasterTempDbEngine._processMemoryDbCommand(this._memoryTokenInfoDb,data,resp);
                break;
            case Const.Settings.TEMP_DB.ERROR_INFO_NAME :
                await MasterTempDbEngine._processMemoryDbCommand(this._memoryErrorInfoDb,data,resp);
                break;
            default :
                resp(new Error('Unknown db name!'));
        }
    }

    static async _processMemoryDbCommand(db,data,resp)
    {
        let command = data['command'];
        let args    = data['args'];

        switch(command)
        {
            case 'findOne' :
                db.findOne(args[0],(e,d)=> {resp(e,d);});
                break;
            case 'insert' :
                db.insert(args[0],(e,r)=>{resp(e,r);});
                break;
            case 'update' :
                db.update(args[0],args[1],args[2],(e,r)=>{resp(e,r);});
                break;
            case 'remove' :
                db.remove(args[0],args[1],(e,r)=>{resp(e,r);});
                break;
            case 'find' :
                db.find(args[0],(e,r)=>{resp(e,r);});
                break;
            case 'count' :
                db.count(args[0],(e,r)=>{resp(e,r);});
                break;
            default:
                resp(new Error('Unknown command!'));
        }
    }

    static async _clearTempDbMongo(client,zc)
    {
        const dbName = zc.getMain(Const.Main.KEYS.TEMP_DB_Name);
        const db = client.db(dbName);
        await new Promise((resolve, reject) =>
        {
            db.dropDatabase((err) =>
            {
                if(err) {reject(err);}

                else
                {
                    db.close();
                }
            });
        });
    }

    static async _prepareTempDbStructureMongo(client,zc)
    {
        const dbName = zc.getMain(Const.Main.KEYS.TEMP_DB_Name);
        const db = client.db(dbName);
        await db.createCollection(Const.Settings.TEMP_DB.TOKEN_INFO_NAME);
        await db.createCollection(Const.Settings.TEMP_DB.ERROR_INFO_NAME);
    }

}

module.exports = MasterTempDbEngine;