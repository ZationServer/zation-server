/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import ZationConfig = require("../../main/zationConfig");
import Const        = require('./../constants/constWrapper');

class ZationInfoObj
{
    public readonly port : number;
    public readonly appName : string;
    public readonly hostname : string;
    public readonly timeZone : string;

    constructor(zc : ZationConfig)
    {
        this.port     = zc.getMain(Const.Main.KEYS.PORT);
        this.appName  = zc.getMain(Const.Main.KEYS.APP_NAME);
        this.hostname = zc.getMain(Const.Main.KEYS.HOSTNAME);
        this.timeZone = zc.getMain(Const.Main.KEYS.TIME_ZONE);
    }
}

export = ZationInfoObj;