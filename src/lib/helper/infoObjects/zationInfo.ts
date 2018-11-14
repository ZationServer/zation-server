/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import ZationConfig = require("../../main/zationConfig");

class ZationInfo
{
    private readonly _zationConfig : ZationConfig;

    constructor(zc : ZationConfig)
    {
        this._zationConfig = zc;
    }

    // noinspection JSUnusedGlobalSymbols
    get port(): number {
        return this.zationConfig.mainConfig.port;
    }

    // noinspection JSUnusedGlobalSymbols
    get appName(): string {
        return this.zationConfig.mainConfig.appName;
    }

    // noinspection JSUnusedGlobalSymbols
    get hostname(): string {
        return this.zationConfig.mainConfig.hostname;
    }

    // noinspection JSUnusedGlobalSymbols
    get timeZone(): string {
        return this.zationConfig.mainConfig.timeZone;
    }

    // noinspection JSUnusedGlobalSymbols
    get zationConfig(): ZationConfig {
        return this.zationConfig;
    }
}

export = ZationInfo;