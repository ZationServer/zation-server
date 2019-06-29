/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */


import {Service}              from "../config/definitions/serviceConfig";
import ZationWorker         = require("../../main/zationWorker");
import ServiceBox             from "./serviceBox";
import ZationConfig           from "../config/manager/zationConfig";
import ServiceNotFoundError   from "./serviceNotFoundError";
import Logger                 from "../logger/logger";

export default class ServiceEngine
{
    private readonly sc : object;

    private readonly services : Record<string,ServiceBox>;

    private readonly worker : ZationWorker;
    private readonly zc : ZationConfig;

    constructor(zc : ZationConfig,worker : ZationWorker)
    {
        this.worker = worker;
        this.zc = zc;

        // @ts-ignore
        this.sc = zc.serviceConfig.services || {};

        this.services = {};
    }

    async init() : Promise<void>
    {
        let promises : Promise<void>[] = [];
        const errorBox : string[] = [];

        //Services
        for(let k in this.sc)
        {
            if(this.sc.hasOwnProperty(k))
            {
                const howToCreate = this.sc[k][nameof<Service>(s => s.create)];
                const howToGet    = this.sc[k][nameof<Service>(s => s.get)];
                //remove
                delete this.sc[k][nameof<Service>(s => s.create)];
                delete this.sc[k][nameof<Service>(s => s.get)];

                this.services[k] = new ServiceBox(k,this.sc[k],howToCreate,howToGet);
                promises.push(this.services[k].init(errorBox));
            }
        }
        await Promise.all(promises);

        if(errorBox.length > 0){
            const whiteSpace = this.zc.mainConfig.killServerOnServicesCreateError ? '          ' : '             ';
            const info =
                `Worker with id ${this.worker.id} has errors while creating the services -> \n${whiteSpace}${errorBox.join('\n'+whiteSpace)}`;
            if(this.zc.mainConfig.killServerOnServicesCreateError){
                await this.worker.killServer(info);
            }
            else{
                Logger.printDebugWarning(info);
            }
        }
    }

    // noinspection JSUnusedGlobalSymbols
    isService(serviceName : string,configName : string = 'default') : boolean
    {
        if(this.services[serviceName] instanceof ServiceBox) {
            return this.services[serviceName].isServiceExists(configName);
        }
        else {
            return false;
        }
    }

    async getService<S>(serviceName : string,configName : string = 'default') : Promise<S>
    {
        if(this.services[serviceName] instanceof ServiceBox) {
            return this.services[serviceName].getService(configName);
        }
        else {
            throw new ServiceNotFoundError(serviceName,configName);
        }
    }

}