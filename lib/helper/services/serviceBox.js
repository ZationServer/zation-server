/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

const TaskError       = require('../../api/TaskError');
const MainErrors        = require('../zationTaskErrors/mainTaskErrors');

class ServiceBox
{
    constructor(serviceName,config,howToCreate,howToGet = (s) =>{return s;})
    {
        this._services = {};
        this._serviceName = serviceName;
        this._config = config;
        this._howToCreate = howToCreate;
        this._howToGet = howToGet;
    }

    async init()
    {
        await this._initService(this._config,this._howToCreate);
    }

    async _initService(config,howToCreate)
    {
        if(config !== undefined && typeof config === 'object')
        {
            for(let k in config)
            {
                if(config.hasOwnProperty(k))
                {
                    this._services[k] = await howToCreate(config[k]);
                }
            }
        }
    }

    getService(key = 'default')
    {
        if(this._services.hasOwnProperty(key))
        {
            return this._howToGet(this._services[key]);
        }
        else
        {
            throw new
            TaskError(MainErrors.tryToUseNotConfiguredService, {service : this._serviceName, key : key});
        }
    }
}

module.exports = ServiceBox;