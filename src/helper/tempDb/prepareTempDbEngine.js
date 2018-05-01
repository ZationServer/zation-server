/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

const FsTool      = require('./../tools/fsTools');
const Const       = require('../constants/constWrapper');
const fs          = require('fs');
const MongoClient = require('mongodb').MongoClient;

const tempFolder  = __dirname + '/../../temp';

class PrepareTempDbEngine
{
    static async prepareTempDb(zc)
    {
        if (!fs.existsSync(tempFolder))
        {
            zc.printStartDebugInfo('Create temp folder');
            fs.mkdirSync(tempFolder);
        }
        else
        {
            zc.printStartDebugInfo('Clear temp folder');
            await PrepareTempDbEngine.clearTempFolder();
        }

        if(zc.isUseErrorInfoTempDb() || zc.isUseTokenInfoTempDb())
        {
            if(zc.getMain(Const.Main.TEMP_DB_ENGINE) === Const.Main.TEMP_DB_ENGINE_MONGO)
            {
                const mongoClient = await MongoClient.connect(zc.getMain(Const.Main.TEMP_DB_CONFIG).url);

                zc.printStartDebugInfo('Clear mongo temp db');
                await (PrepareTempDbEngine.clearTempDbMongo(mongoClient,zc));

                zc.printStartDebugInfo('Create temp db structure');
                await PrepareTempDbEngine.prepareTempDbStructureMongo(mongoClient,zc);

                await mongoClient.close();
            }
        }
    }

    static async clearTempFolder()
    {
        await FsTool.deletedAllInDirectory(tempFolder);
    }

    static async clearTempDbMongo(client,zc)
    {
        const dbName = zc.getMain(Const.Main.TEMP_DB_Name);
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

    static async prepareTempDbStructureMongo(client,zc)
    {
        const dbName = zc.getMain(Const.Main.TEMP_DB_Name);
        const db = client.db(dbName);
        await db.createCollection(Const.Settings.TEMP_DB_TOKEN_INFO_NAME);
        await db.createCollection(Const.Settings.TEMP_DB_ERROR_INFO_NAME);
    }

}

module.exports = PrepareTempDbEngine;