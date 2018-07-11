/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import TaskError       = require('../../api/TaskError');
import MainErrors      = require('../zationTaskErrors/mainTaskErrors');

class ServiceBox
{
    private readonly services : object;
    private readonly serviceName : string;
    private readonly config : object;
    private readonly howToCreate : Function;
    private readonly howToGet : Function;
    
    constructor(serviceName : string,config : object,howToCreate: Function,howToGet : Function = (s) =>{return s;})
    {
        this.services = {};
        this.serviceName = serviceName;
        this.config = config;
        this.howToCreate = howToCreate;
        this.howToGet = howToGet;
    }

    async init() : Promise<void>
    {
        await this.initService(this.config,this.howToCreate);
    }

    private async initService(config,howToCreate)
    {
        if(config !== undefined && typeof config === 'object')
        {
            for(let k in config)
            {
                if(config.hasOwnProperty(k))
                {
                    this.services[k] = await howToCreate(config[k]);
                }
            }
        }
    }

    getService(key = 'default')
    {
        if(this.services.hasOwnProperty(key))
        {
            return this.howToGet(this.services[key]);
        }
        else
        {
            throw new
            TaskError(MainErrors.tryToUseNotConfiguredService, {service : this.serviceName, key : key});
        }
    }
}

export = ServiceBox;