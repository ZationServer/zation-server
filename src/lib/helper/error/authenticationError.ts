/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import MainTaskErrors  = require('./../zationTaskErrors/mainTaskErrors');
import CodeError       = require("./codeError");

class AuthenticationError extends CodeError
{
    private readonly reason : string;

    constructor(reason : string)
    {
        super(MainTaskErrors.authenticationError,{reason});
        this.reason = reason;
    }

    // noinspection JSUnusedGlobalSymbols
    getReason(): string {
        return this.reason;
    }
}

export = AuthenticationError;