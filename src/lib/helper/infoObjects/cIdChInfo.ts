/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import CChInfo from "./cChInfo";

export default class CIdChInfo extends  CChInfo
{
    private readonly _channelId : string | undefined;

    constructor(chName : string,chId ?: string)
    {
        super(chName);
        this._channelId = chId;
    }

    // noinspection JSUnusedGlobalSymbols
    get channelId(): string | undefined {
        return this._channelId;
    }

}