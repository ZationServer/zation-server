/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import fs                   = require('fs');
import ZationConfig           from "../config/manager/zationConfig";

export default class ClientPrepare
{
    static buildClientJs(serverSettingsFile: string): string
    {
        let res = '';
        // noinspection JSUnresolvedVariable,JSUnresolvedFunction
        res += ClientPrepare.loadZationMinifyClient();
        res += serverSettingsFile;
        return res;
    }

    static loadZationMinifyClient(): string
    {
        const filePath = require.resolve('zation-client/dist/zation.min.js');
        return fs.readFileSync(filePath, 'utf8');
    }

    static createServerSettingsFile(zc: ZationConfig): string
    {
        let res = '';
        res += 'const ZATION_SERVER_SETTINGS = {';
        res += `HOSTNAME: '${zc.mainConfig.hostname}',`;
        res += `PORT: ${zc.mainConfig.port},`;
        res += `SECURE: ${zc.mainConfig.secure},`;
        res += `PATH: '${zc.mainConfig.path}'`;
        res += '}; \n';
        return res;
    }
}