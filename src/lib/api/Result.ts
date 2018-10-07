/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import Const = require("../helper/constants/constWrapper");

class Result
{

    private result : any = undefined;
    private statusCode : number | string | undefined = undefined;
    
    constructor(result : any,statusCode ?: string | number)
    {
        this.result = result;
        this.statusCode = statusCode;
    }

    _getJsonObj() : object
    {
        let obj = {};
        obj[Const.Settings.RESPONSE.RESULT_MAIN] = this.result;
        obj[Const.Settings.RESPONSE.RESULT_STATUS] = this.statusCode;
        return obj;
    }

    // noinspection JSUnusedGlobalSymbols
    removeResult() : void
    {
        this.result = undefined;
    }

    // noinspection JSUnusedGlobalSymbols
    setResult(result : any) : void
    {
        this.result = result;
    }

    // noinspection JSUnusedGlobalSymbols
    hasResult() : boolean
    {
        return this.result !== undefined;
    }

    // noinspection JSUnusedGlobalSymbols
    setStatusCode(statusCode : string | number) : void
    {
        this.statusCode = statusCode;
    }

    // noinspection JSUnusedGlobalSymbols
    hasStatusCode() : boolean
    {
        return this.statusCode !== undefined;
    }

    // noinspection JSUnusedGlobalSymbols
    removeStatusCode() : void
    {
        this.statusCode = undefined;
    }

    // noinspection JSUnusedGlobalSymbols
    getTypeOfResult() : string
    {
        return typeof this.result;
    }
}

export = Result;