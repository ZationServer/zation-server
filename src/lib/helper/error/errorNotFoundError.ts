/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import TaskError       = require('./../../api/TaskError');
import MainTaskErrors  = require('./../zationTaskErrors/mainTaskErrors');

class ErrorNotFoundError extends TaskError
{
    private readonly errorName : string;

    constructor(errorName : string)
    {
        super(MainTaskErrors.errorNotFound,{errorName});
        this.errorName = errorName;
    }

    getErrorName(): string {
        return this.errorName;
    }
}

export = ErrorNotFoundError;