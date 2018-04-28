/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

const fs             = require('fs');

class FsTools
{
    static deletedAllInDirectory(path)
    {
        return new Promise(async (resolve, reject) =>
        {
            let promises = [];

            if(fs.existsSync(path))
            {
                fs.readdir(path, (err, list) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        list.forEach((file) => {
                            let curPath = path + "/" + file;
                            if (fs.lstatSync(curPath).isDirectory()) {
                                promises.push(FsTools.deletedDirectory(curPath));
                            }
                            else
                            {
                                promises.push(FsTools.deletedFile(curPath));
                            }
                        });
                    }
                });
            }
            else {
                reject(new Error(`Cant find folder ${path}`));
            }
            await Promise.all(promises);
            resolve();
        });
    }

    static deletedDirectory(path)
    {
        return new Promise(async (resolve, reject) =>
        {
            await FsTools.deletedAllInDirectory(path);
            fs.rmdir(path,(err) =>
            {
                if(err)
                {
                    reject(err);
                }
                else
                {
                    resolve();
                }
            })
        });
    }

    static deletedFile(path)
    {
        return new Promise((resolve, reject) => {
            fs.unlink(path, (err) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve();
                }
            });
        });
    }
}

module.exports = FsTools;