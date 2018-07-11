/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

const Logger = require('../logger/logger');

class SystemBackgroundTasks
{
    static async checkTokenInfoTempDb(tempDbUp)
    {
        Logger.printDebugInfo('Server is start to checking token info temp database!');
        let count = await tempDbUp.checkTokenInfoDb();
        Logger.printDebugInfo(`Server has checked the token info temp database! ${count} token are removed!`);
    }

    static async checkErrorInfoTempDb(tempDbUp)
    {
        Logger.printDebugInfo('Server is start to checking error info temp database!');
        let count = await tempDbUp.checkErrorInfoDb();
        Logger.printDebugInfo(`Server has checked the error info temp database! ${count} errors are removed!`);
    }
}

export = SystemBackgroundTasks;