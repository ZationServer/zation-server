/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

class SystemBackgroundTasks
{
    static async checkTokenInfoStorage(tokenInfoStorage,zc)
    {
        zc.printDebugInfo('Server is start to checking the tokenInfoStorage!');
        let count = await tokenInfoStorage.checkTokenInfoStorage();
        zc.printDebugInfo(`Server has checked the tokenInfoStorage! ${count} token are removed!`);
    }
}

module.exports = SystemBackgroundTasks;