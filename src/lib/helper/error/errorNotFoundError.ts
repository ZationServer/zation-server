/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import MainTaskErrors  = require('./../zationTaskErrors/mainTaskErrors');
import CodeError       = require("./codeError");

class ErrorNotFoundError extends CodeError
{
    private readonly errorName : string;

    constructor(errorName : string)
    {
        super(MainTaskErrors.errorNotFound,{errorName});
        this.errorName = errorName;
    }

    // noinspection JSUnusedGlobalSymbols
    getErrorName(): string {
        return this.errorName;
    }
}

export = ErrorNotFoundError;