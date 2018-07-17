/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import Const = require("../helper/constants/constWrapper");

class Result
{

    private keyValuePairs : object;
    private values : any[];
    
    constructor(data : any)
    {
        this.keyValuePairs = {};
        this.values = [];

        if(data !== undefined)
        {
            if(data !== null && typeof data === 'object')
            {
                this.keyValuePairs = data;
            }
            else if(Array.isArray(data))
            {
                this.values = data;
            }
            else
            {
                this.addValue(data);
            }
        }
    }

    _getJsonObj() : object
    {
        let obj = {};
        obj[Const.Settings.RESPONSE.RESULT_PAIRS] = this.keyValuePairs;
        obj[Const.Settings.RESPONSE.RESULT_VALUES] = this.values;

        return obj;
    }

    // noinspection JSUnusedGlobalSymbols
    removePair(key : string) : void
    {
        delete this.keyValuePairs[key];
    }

    // noinspection JSUnusedGlobalSymbols
    removeValue(index : number) : void
    {
        delete this.values[index];
    }

    // noinspection JSUnusedGlobalSymbols
    addPair(key : string,value : any,overwrite : boolean = false) : boolean
    {
        if(overwrite || !this.keyValuePairs.hasOwnProperty(key))
        {
            this.keyValuePairs[key] = value;
            return true;
        }
        else
        {
            return false;
        }
    }

    addValue(value : any) : void
    {
        this.values.push(value);
    }

    // noinspection JSUnusedGlobalSymbols
    clearResult() : void
    {
        this.keyValuePairs = {};
        this.values = [];
    }

    // noinspection JSUnusedGlobalSymbols
    getValueFromKey(key : string) : any
    {
        return this.keyValuePairs[key];
    }

    // noinspection JSUnusedGlobalSymbols
    getValueFromIndex(index : number) : any
    {
        return this.values[index];
    }
}

export = Result;