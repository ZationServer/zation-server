/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import fs           = require('fs');
import path         = require('path');
import Const        = require('../constants/constWrapper');
import ZationConfig = require("../../main/zationConfig");

const pathToMinZation = __dirname + '/../../../../node_modules/zation-client/dist/zation.min.js';

class PrepareClientJs
{
    static buildClientJs(serverSettingsFile : string) : string
    {
        let res = '';
        // noinspection JSUnresolvedVariable,JSUnresolvedFunction
        res += fs.readFileSync(path.resolve(pathToMinZation), 'utf8');
        res += serverSettingsFile;
        return res;
    }

    static createServerSettingsFile(zc : ZationConfig) : string
    {
        let res = '';
        res += 'var ZATION_SERVER_SETTINGS = {';
        res += `HOSTNAME : '${zc.getMain(Const.Main.KEYS.HOSTNAME)}',`;
        res += `PORT : ${zc.getMain(Const.Main.KEYS.PORT)},`;
        res += `SECURE : ${zc.getMain(Const.Main.KEYS.SECURE)},`;
        res += `POST_KEY : '${zc.getMain(Const.Main.KEYS.POST_KEY)}',`;
        res += `PATH : '${zc.getMain(Const.Main.KEYS.PATH)}'`;
        res += '}; \n';
        return res;
    }

}

export = PrepareClientJs;