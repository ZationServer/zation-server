const TaskError       = require('../../api/TaskError');
const SyErrors        = require('../cationTaskErrors/systemTaskErrors');

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