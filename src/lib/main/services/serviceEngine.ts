/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import ZationWorker         = require("../../core/zationWorker");
import ServiceBox             from "./serviceBox";
import ZationConfig           from "../config/manager/zationConfig";
import ServiceNotFoundError   from "./serviceNotFoundError";
import Logger                 from "../logger/logger";
import ZationConfigFull       from '../config/manager/zationConfigFull';
import {ServiceConfig}        from '../config/definitions/main/serviceConfig';

export default class ServiceEngine
{
    private readonly sc: ServiceConfig;

    private readonly services: Record<string,ServiceBox>;

    private readonly worker: ZationWorker;
    private readonly zc: ZationConfig;

    constructor(zc: ZationConfigFull,worker: ZationWorker)
    {
        this.worker = worker;
        this.zc = zc;

        this.sc = zc.serviceConfig || {};

        this.services = {};
    }

    async init(): Promise<void>
    {
        let promises: Promise<void>[] = [];
        const errorBox: string[] = [];

        //Services
        for(let k in this.sc) {
            if(this.sc.hasOwnProperty(k)) {
                const service = this.sc[k];
                this.services[k] = new ServiceBox(k,service.instances,service.create,service.get);
                promises.push(this.services[k].init(errorBox));
            }
        }
        await Promise.all(promises);

        if(errorBox.length > 0){
            const whiteSpace = this.zc.mainConfig.killServerOnServicesCreateError ? '          ': '             ';
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

    hasService(serviceName: string, instanceName: string = 'default'): boolean {
        if(this.services[serviceName]) {
            return this.services[serviceName].existsInstance(instanceName);
        }
        return false;
    }

    async getService<S>(serviceName: string, instanceName: string = 'default'): Promise<S> {
        if(this.services[serviceName]) {
            return this.services[serviceName].getService(instanceName);
        }
        throw new ServiceNotFoundError(serviceName,instanceName);
    }

}