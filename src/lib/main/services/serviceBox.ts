/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import ServiceNotFoundError from "./serviceNotFoundError";

export default class ServiceBox
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

    async init(errorBox : string[]) : Promise<void> {
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
                        errorBox.push(`Service: Name:'${this.serviceName}', ConfigName:'${k}', Error:'${e.toString()}'`);
                    }
                }
            }
        }
    }

    async getService(configName : string = 'default') : Promise<any>
    {
        if(this.services.hasOwnProperty(configName)) {
            return await this.howToGet(this.services[configName]);
        }
        else {
            throw new ServiceNotFoundError(this.serviceName,configName);
        }
    }

    isServiceExists(configName : string = 'default') : boolean {
        return this.services.hasOwnProperty(configName);
    }
}