/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

const rimraf = require('rimraf');

class FsTools
{
    static deletedAllInDirectory(path)
    {
        return new Promise(async (resolve) =>
        {
            rimraf(`${path}/*`, () => { resolve(); });
        });
    }
}

module.exports = FsTools;