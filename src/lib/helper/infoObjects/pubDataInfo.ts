/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

export default class PubDataInfo
{
    private readonly _event : string;
    private readonly _data : any;
    private readonly _srcSocketSid ?: string;

    constructor(event : string,data : any,srcSocketSid ?: string)
    {
        this._event = event;
        this._data = data;
        this._srcSocketSid = srcSocketSid;
    }

    // noinspection JSUnusedGlobalSymbols
    static getFromBuild(data : object) : PubDataInfo {
        return new PubDataInfo(data['e'],data['d'],data['ssi']);
    }

    // noinspection JSUnusedGlobalSymbols
    get event(): string {
        return this._event;
    }

    // noinspection JSUnusedGlobalSymbols
    get data(): any {
        return this._data;
    }

    // noinspection JSUnusedGlobalSymbols
    get srcSocketSid() : string | undefined {
        return this._srcSocketSid;
    }
}