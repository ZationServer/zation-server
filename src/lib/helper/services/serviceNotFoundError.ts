/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import TaskError       = require('./../../api/TaskError');
import MainTaskErrors  = require('./../zationTaskErrors/mainTaskErrors');

class ServiceNotFoundError extends TaskError
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