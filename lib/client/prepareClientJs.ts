/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

const fs           = require('fs');
const path         = require('path');
const Const        = require('../helper/constants/constWrapper');

//todo use module path later!!
const ZationClient = require('./../../../zation-js-client/index');

const serverSettingsFile           = __dirname + '/serverSettings.js';

class PrepareClientJs
{
    static buildClientJs()
    {
        let res = '';
        // noinspection JSUnresolvedVariable,JSUnresolvedFunction
        res += ZationClient.ZationReader.getZationMinifyClient();
        res += fs.readFileSync(path.resolve(serverSettingsFile), "utf8");
        return res;
    }

    static createServerSettingsFile(zc)
    {
        let res = '';
        res += 'var ZATION_SERVER_SETTINGS = {';
        res += `HOSTNAME : '${zc.getMain(Const.Main.KEYS.HOSTNAME)}',`;
        res += `PORT : ${zc.getMain(Const.Main.KEYS.PORT)},`;
        res += `SECURE : ${zc.getMain(Const.Main.KEYS.SECURE)}, `;
        res += `POST_KEY_WORD : '${zc.getMain(Const.Main.KEYS.POST_KEY_WORD)}'`;
        res += '}; \n';
        fs.writeFileSync(serverSettingsFile,res,'utf8');
    }

}

module.exports = PrepareClientJs;