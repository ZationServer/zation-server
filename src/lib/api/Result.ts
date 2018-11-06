/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import {ResponseResult} from "../helper/constants/internal";

class Result
{

    private result : any = undefined;
    private statusCode : number | string | undefined = undefined;

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Creates a new result.
     * That you can return to the client.
     * With the result object you have the possibility to add a status code.
     * Rather than just a result.
     * @example
     * return new Result({msg : 'hallo'},2000);
     * @param result
     * @param statusCode
     */
    constructor(result : any,statusCode ?: string | number)
    {
        this.result = result;
        this.statusCode = statusCode;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * This method is used internal!
     */
    _getJsonObj() : ResponseResult
    {
        return {
            r : this.result,
            s : this.statusCode
        };
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Set the result.
     * @param result
     */
    setResult(result : any) : void
    {
        this.result = result;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Removes the result.
     */
    removeResult() : void
    {
        this.result = undefined;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns if a result is set.
     */
    hasResult() : boolean
    {
        return this.result !== undefined;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Set a status code.
     * @param statusCode
     */
    setStatusCode(statusCode : string | number) : void
    {
        this.statusCode = statusCode;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Removes the status code.
     */
    removeStatusCode() : void
    {
        this.statusCode = undefined;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns if a status code is set.
     */
    hasStatusCode() : boolean
    {
        return this.statusCode !== undefined;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the type of the result.
     */
    getTypeOfResult() : string
    {
        return typeof this.result;
    }
}

export = Result;