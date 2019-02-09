/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import {ServiceModule} from "zation-service";

export interface ServiceConfig {
    serviceModules  ?: ServiceModule<any,any,any>[];
    services  ?: Record<string,MainService<any,any,any>>;
}

export type MainService<Config,Created,Get> = Service<Config,Created,Get> | Record<string,Config> | DefaultConfig<Config>;

export type ServiceCreateFunction<Config,Created> = (config : Config, name : string) => Promise<Created> | Created;
export type ServiceGetFunction<Created,Get> = (service : Created) => Promise<Get> | Get;

export interface Service<Config = any,Created = any,Get = any> {
    create : ServiceCreateFunction<Config,Created>;
    get ?: ServiceGetFunction<Created,Get>
}

export interface DefaultConfig<T> {
    default ?: T;
}

