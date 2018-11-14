/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import ServiceNotFoundError = require("./serviceNotFoundError");

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

    async init(errorBox : string[]) : Promise<void>
    {
        await this.initService(this.config,this.howToCreate,errorBox);
    }

    private async initService(config,howToCreate,errorBox : string[]) : Promise<void>
    {
        if(config !== undefined && typeof config === 'object')
        {
            for(let k in config)
            {
                if(config.hasOwnProperty(k)) {
                    try {
                        this.services[k] = await howToCreate(config[k],k);
                    }
                    catch (e) {
                        errorBox.push(`Service: Name:'${this.serviceName}', Key:'${k}', Error:'${e.toString()}'`);
                    }
                }
            }
        }
    }

    async getService(key : string = 'default') : Promise<any>
    {
        if(this.services.hasOwnProperty(key))
        {
            return await this.howToGet(this.services[key]);
        }
        else
        {
            throw new ServiceNotFoundError(this.serviceName,key);
        }
    }

    isServiceExists(key : string = 'default') : boolean
    {
        return this.services.hasOwnProperty(key);
    }
}

export = ServiceBox;