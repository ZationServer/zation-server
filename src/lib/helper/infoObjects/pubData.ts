/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

class PubData
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

    static getFromBuild(data : object) : PubData {
        return new PubData(data['e'],data['d'],data['ssi']);
    }

    get event(): string {
        return this._event;
    }

    get data(): any {
        return this._data;
    }

    get srcSocketSid() : string | undefined {
        return this._srcSocketSid;
    }
}

export = PubData;