/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import CodeError        from "../error/codeError";
import {MainBackErrors} from "../zationBackErrors/mainBackErrors";

export default class ServiceNotFoundError extends CodeError
{
    private readonly serviceName : string;
    private readonly serviceKey : string;

    constructor(serviceName : string,serviceKey : string)
    {
        super(MainBackErrors.serviceNotFound,{serviceKey,serviceName});
    }

    // noinspection JSUnusedGlobalSymbols
    getServiceName(): string {
        return this.serviceName;
    }

    // noinspection JSUnusedGlobalSymbols
    getServiceKey(): string {
        return this.serviceKey;
    }
}