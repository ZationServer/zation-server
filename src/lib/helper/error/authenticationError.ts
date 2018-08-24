/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import TaskError       = require('./../../api/TaskError');
import MainTaskErrors  = require('./../zationTaskErrors/mainTaskErrors');

class AuthenticationError extends TaskError
{
    private readonly reason : string;

    constructor(reason : string)
    {
        super(MainTaskErrors.authenticationError,{reason});
        this.reason = reason;
    }

    getReason(): string {
        return this.reason;
    }
}

export = AuthenticationError;