/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import ZationConfig = require("../../main/zationConfig");
import Const        = require('./../constants/constWrapper');

class ZationToken
{
    private readonly _port : number;
    private readonly _appName : string;
    private readonly _hostname : string;
    private readonly _timeZone : string;
    private readonly _zationConfig : ZationConfig;

    constructor(zc : ZationConfig)
    {
        this._port     = zc.getMain(Const.Main.KEYS.PORT);
        this._appName  = zc.getMain(Const.Main.KEYS.APP_NAME);
        this._hostname = zc.getMain(Const.Main.KEYS.HOSTNAME);
        this._timeZone = zc.getMain(Const.Main.KEYS.TIME_ZONE);
        this._zationConfig = zc;
    }

    get port(): number {
        return this._port;
    }

    get appName(): string {
        return this._appName;
    }

    get hostname(): string {
        return this._hostname;
    }

    get timeZone(): string {
        return this._timeZone;
    }

    get zationConfig(): ZationConfig {
        return this._zationConfig;
    }
}

export = ZationToken;