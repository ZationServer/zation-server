/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

export default class CChInfo
{
    private readonly _channelName : string;

    constructor(chName : string)
    {
        this._channelName = chName;
    }

    // noinspection JSUnusedGlobalSymbols
    get channelName(): string {
        return this._channelName;
    }
}