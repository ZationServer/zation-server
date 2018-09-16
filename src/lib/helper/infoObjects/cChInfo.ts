/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

class CChInfo
{
    private readonly _channelName : string;

    constructor(chName : string)
    {
        this._channelName = chName;
    }

    get channelName(): string {
        return this._channelName;
    }
}

export = CChInfo;