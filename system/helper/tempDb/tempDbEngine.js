/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

const tempFolder = __dirname + '/../../temp';
const FsTool     = require('./../tools/fsTools');
const Const      = require('./../constante/constWrapper');

class TempDbEngine
{
    static async clearTemp()
    {
        await FsTool.deletedAllInDirectory(tempFolder);
    }

    static async createTempDbStructure(zc)
    {
        if(zc.getMain(Const.Main.USE_TEMP_DB_TOKEN_INFO))
        {




        }

        if(zc.getMain(Const.Main.USE_TEMP_DB_ERROR_INFO))
        {


        }
    }
}

module.exports = TempDbEngine;