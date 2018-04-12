/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

const TaskError       = require('../../api/TaskError');
const MainErrors        = require('../zationTaskErrors/mainTaskErrors');

class ServiceBox
{
    constructor(serviceName,config,howToCreate)
    {
        this._services = {};
        this._serviceName = serviceName;
        this._initService(config,howToCreate);
    }

    _initService(config,howToCreate)
    {
        if(config !== undefined && typeof config === 'object')
        {
            for(let k in config)
            {
                if(config.hasOwnProperty(k))
                {
                    this._services[k] = howToCreate(config[k]);
                }
            }
        }
    }

    getService(key = 'default')
    {
        if(this._services.hasOwnProperty(key))
        {
            return this._services[key];
        }
        else
        {
            throw new
            TaskError(MainErrors.tryToUseNotConfiguredService, {service : this._serviceName, key : key});
        }
    }
}

module.exports = ServiceBox;