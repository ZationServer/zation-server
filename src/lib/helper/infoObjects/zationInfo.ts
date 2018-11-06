/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import ZationConfig = require("../../main/zationConfig");

class ZationInfo
{
    private readonly _port : number;
    private readonly _appName : string;
    private readonly _hostname : string;
    private readonly _timeZone : string;
    private readonly _zationConfig : ZationConfig;

    constructor(zc : ZationConfig)
    {
        this._port     = zc.mainConfig.port;
        this._appName  = zc.mainConfig.appName;
        this._hostname = zc.mainConfig.hostname;
        this._timeZone = zc.mainConfig.timeZone;
        this._zationConfig = zc;
    }

    // noinspection JSUnusedGlobalSymbols
    get port(): number {
        return this._port;
    }

    // noinspection JSUnusedGlobalSymbols
    get appName(): string {
        return this._appName;
    }

    // noinspection JSUnusedGlobalSymbols
    get hostname(): string {
        return this._hostname;
    }

    // noinspection JSUnusedGlobalSymbols
    get timeZone(): string {
        return this._timeZone;
    }

    // noinspection JSUnusedGlobalSymbols
    get zationConfig(): ZationConfig {
        return this._zationConfig;
    }
}

export = ZationInfo;