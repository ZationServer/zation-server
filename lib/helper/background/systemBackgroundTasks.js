/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

class SystemBackgroundTasks
{
    static async checkTokenInfoTempDb(tempDbUp,zc)
    {
        zc.printDebugInfo('Server is start to checking token info temp database!');
        let count = await tempDbUp.checkTokenInfoDb();
        zc.printDebugInfo(`Server has checked the token info temp database! ${count} token are removed!`);
    }

    static async checkErrorInfoTempDb(tempDbUp,zc)
    {
        zc.printDebugInfo('Server is start to checking error info temp database!');
        let count = await tempDbUp.checkErrorInfoDb();
        zc.printDebugInfo(`Server has checked the error info temp database! ${count} errors are removed!`);
    }
}

module.exports = SystemBackgroundTasks;