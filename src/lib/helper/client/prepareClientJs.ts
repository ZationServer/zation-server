/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import fs           = require('fs');
import path         = require('path');
import Const        = require('../constants/constWrapper');
import ZationConfig = require("../../main/zationConfig");
import {ZationReader} from 'zation-client';

const serverSettingsFile = __dirname + '/serverSettings.js';

class PrepareClientJs
{
    static buildClientJs() : string
    {
        let res = '';
        // noinspection JSUnresolvedVariable,JSUnresolvedFunction
        res += ZationReader.getZationMinifyClient();
        res += fs.readFileSync(path.resolve(serverSettingsFile), "utf8");
        return res;
    }

    static createServerSettingsFile(zc : ZationConfig)
    {
        let res = '';
        res += 'var ZATION_SERVER_SETTINGS = {';
        res += `HOSTNAME : '${zc.getMain(Const.Main.KEYS.HOSTNAME)}',`;
        res += `PORT : ${zc.getMain(Const.Main.KEYS.PORT)},`;
        res += `SECURE : ${zc.getMain(Const.Main.KEYS.SECURE)},`;
        res += `POST_KEY : '${zc.getMain(Const.Main.KEYS.POST_KEY)}',`;
        res += `PATH : '${zc.getMain(Const.Main.KEYS.PATH)}'`;
        res += '}; \n';
        fs.writeFileSync(serverSettingsFile,res,'utf8');
    }

}

export = PrepareClientJs;