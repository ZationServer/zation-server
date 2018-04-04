/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

const TaskError       = require('../../api/TaskError');
const SyErrors        = require('../zationTaskErrors/systemTaskErrors');

class ServiceWrapper
{
    constructor(service,serviceName)
    {
        this.service = service;
        this.isThere = service !== undefined;
        this.serviceName = serviceName;
    }

    getService()
    {
        if(this.isThere)
        {
            return this.service;
        }
        else
        {
            throw new TaskError(SyErrors.tryToUseNotConfiguredService, {service : this.serviceName});
        }
    }

}

module.exports = ServiceWrapper;