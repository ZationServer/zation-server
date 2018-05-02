/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

const fs          = require('fs');
const path        = require('path');
const Const       = require('../constants/constWrapper');

const socketClusterClientMinFile   = __dirname + './../../client/socketcluster.min.js';
const zationClientMinFile          = __dirname + './../../client/zation.js';
const serverSettingsFile           = __dirname + './../../client/serverSettings.js';

class PrepareClientJs
{
    static buildClientJs()
    {
        let res = '';
        res += fs.readFileSync(path.resolve(zationClientMinFile), "utf8");
        res += fs.readFileSync(path.resolve(serverSettingsFile), "utf8");
        res += fs.readFileSync(path.resolve(socketClusterClientMinFile), "utf8");
        return res;
    }

    static createServerSettingsFile(zc)
    {
        let res = '';
        res += 'var ZATION_SERVER_SETTINGS = {';
        res += `HOSTNAME : '${zc.getMain(Const.Main.HOSTNAME)}',`;
        res += `PORT : ${zc.getMain(Const.Main.PORT)},`;
        res += `SECURE : ${zc.getMain(Const.Main.SECURE)}, `;
        res += `POST_KEY_WORD : '${zc.getMain(Const.Main.POST_KEY_WORD)}'`;
        res += '}; \n';
        fs.writeFileSync(serverSettingsFile,res,'utf8');
    }

}

module.exports = PrepareClientJs;