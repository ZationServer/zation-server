/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import CChInfo = require("./cChInfo");

class CIdChInfo extends  CChInfo
{
    private readonly _channelId : string | undefined;

    constructor(chName : string,chId ?: string)
    {
        super(chName);
        this._channelId = chId;
    }

    get channelId(): string | undefined {
        return this._channelId;
    }

}

export =  CIdChInfo;