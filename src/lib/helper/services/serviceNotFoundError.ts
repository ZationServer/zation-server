/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import MainTaskErrors  = require('./../zationTaskErrors/mainTaskErrors');
import CodeError       = require("../error/codeError");

class ServiceNotFoundError extends CodeError
{
    private readonly serviceName : string;
    private readonly serviceKey : string;

    constructor(serviceName : string,serviceKey : string)
    {
        super(MainTaskErrors.serviceNotFound,{serviceKey,serviceName});
    }

    getServiceName(): string {
        return this.serviceName;
    }

    getServiceKey(): string {
        return this.serviceKey;
    }
}

export = ServiceNotFoundError;