/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import Const          = require('../constants/constWrapper');
import Logger         = require('../logger/logger');
import ZationConfig   = require("../../main/zationConfig");
let MongoClient : any = require('mongodb').MongoClient;

class MasterTempDbEngine
{
    private readonly zc : ZationConfig;

    private memoryTokenInfoDb : any;
    private memoryErrorInfoDb : any;

    constructor(zc)
    {
        this.zc = zc;
    }

    async init() : Promise<void>
    {
        if(this.zc.isUseErrorInfoTempDb() || this.zc.isUseTokenInfoTempDb())
        {
            if(this.zc.getMain(Const.Main.KEYS.TEMP_DB_ENGINE) === Const.Main.TEMP_DB_ENGINE.MONGO)
            {
                const mongoClient = await MongoClient.connect(this.zc.getMain(Const.Main.KEYS.TEMP_DB_CONFIG).url);

                Logger.printStartDebugInfo('Clear mongo temp db');
                await (MasterTempDbEngine.clearTempDbMongo(mongoClient,this.zc));

                Logger.printStartDebugInfo('Create temp db structure');
                await MasterTempDbEngine.prepareTempDbStructureMongo(mongoClient,this.zc);

                // noinspection JSCheckFunctionSignatures
                await mongoClient.close();
            }
            else if(this.zc.getMain(Const.Main.KEYS.TEMP_DB_ENGINE) === Const.Main.TEMP_DB_ENGINE.MASTER_MEMORY)
            {
                Logger.printStartDebugInfo('Create master memory temp db');
                const NeDb = require('nedb');
                // noinspection JSCheckFunctionSignatures
                this.memoryTokenInfoDb = new NeDb({inMemoryOnly : true});
                // noinspection JSCheckFunctionSignatures
                this.memoryErrorInfoDb = new NeDb({inMemoryOnly : true});
            }
            else
            {
                throw new Error(`Invalid tempDb Engine -> ${this.zc.getMain(Const.Main.KEYS.TEMP_DB_ENGINE)}`);
            }
        }
    }

    async processMemoryDbReq(data,resp)
    {
        let dbName = data['dbName'];

        switch (dbName)
        {
            case Const.Settings.TEMP_DB.TOKEN_INFO_NAME :
                await MasterTempDbEngine.processMemoryDbCommand(this.memoryTokenInfoDb,data,resp);
                break;
            case Const.Settings.TEMP_DB.ERROR_INFO_NAME :
                await MasterTempDbEngine.processMemoryDbCommand(this.memoryErrorInfoDb,data,resp);
                break;
            default :
                resp(new Error('Unknown db name!'));
        }
    }

    private static async processMemoryDbCommand(db,data,resp)
    {
        let command = data['command'];
        let args    = data['args'];

        switch(command)
        {
            case 'findOne' :
                // noinspection JSIgnoredPromiseFromCall
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

    private static async clearTempDbMongo(client,zc)
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

    private static async prepareTempDbStructureMongo(client,zc)
    {
        const dbName = zc.getMain(Const.Main.KEYS.TEMP_DB_Name);
        const db = client.db(dbName);
        await db.createCollection(Const.Settings.TEMP_DB.TOKEN_INFO_NAME);
        await db.createCollection(Const.Settings.TEMP_DB.ERROR_INFO_NAME);
    }

}

export = MasterTempDbEngine;