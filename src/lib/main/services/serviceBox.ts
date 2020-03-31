/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import ServiceNotFoundError                        from "./serviceNotFoundError";
import {ServiceCreateFunction, ServiceGetFunction} from 'zation-service';

export default class ServiceBox
{
    private readonly serviceName: string;
    private readonly instances: Record<string,any>;
    private readonly instancesConfig: Record<string,any>;
    private readonly create: ServiceCreateFunction<any,any>;
    private readonly get: ServiceGetFunction<any,any>;

    constructor(serviceName: string,
                instances: Record<string,any> | undefined,
                create: ServiceCreateFunction<any,any>,
                get: ServiceGetFunction<any,any> = (instance) => instance
    ) {
        this.serviceName = serviceName;
        this.instances = {};
        this.instancesConfig = instances || {};
        this.create = create;
        this.get = get;
    }

    async init(errorBox: string[]): Promise<void> {
        await this.initInstances(errorBox);
    }

    private async initInstances(errorBox: string[]): Promise<void> {
        for(const instanceName in this.instancesConfig) {
            if(this.instancesConfig.hasOwnProperty(instanceName)) {
                try {
                    this.instances[instanceName] = await this.create(this.instancesConfig[instanceName],instanceName);
                }
                catch (e) {
                    errorBox.push(`Service: Name:'${this.serviceName}', Instance:'${instanceName}', Error:'${e.toString()}'`);
                }
            }
        }
    }

    async getService(instance: string = 'default'): Promise<any> {
        if(this.instances.hasOwnProperty(instance)) {
            return await this.get(this.instances[instance]);
        }
        else {
            throw new ServiceNotFoundError(this.serviceName,instance);
        }
    }

    existsInstance(instance: string = 'default'): boolean {
        return this.instances.hasOwnProperty(instance);
    }
}