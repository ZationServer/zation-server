/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import CodeError        from "../error/codeError";
import {MainBackErrors} from "../zationBackErrors/mainBackErrors";

export default class ServiceInstanceNotFoundError extends CodeError
{
    private readonly serviceName: string;
    private readonly instanceName: string;

    constructor(serviceName: string, instanceName: string) {
        super(MainBackErrors.serviceInstanceNotFound,{serviceName: serviceName,instanceName: instanceName});
    }

    // noinspection JSUnusedGlobalSymbols
    getServiceName(): string {
        return this.serviceName;
    }

    // noinspection JSUnusedGlobalSymbols
    getInstanceName(): string {
        return this.instanceName;
    }
}