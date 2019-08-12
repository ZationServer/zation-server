/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import {ServiceModule} from "zation-service";

export interface ServiceConfig {

    /**
     * With this property, you can use service modules.
     * These are predefined services that also adds new functionality to the small bag and bag.
     * Check the zation server organization in Github to see what services modules are available.
     * @example
     * serviceModules : [
     *   MySqlModule.build({
     *      default : {
     *          port : 3306,
     *          database : 'myDb',
     *          user : process.env.DB_USER,
     *          password : process.env.DB_PASSWORD,
     *          charset : 'utf8mb4_unicode_ci'
     *      }
     *   }),
     * ]
     */
    serviceModules  ?: ServiceModule<any,any,any>[];
    /**
     * In this property, you can specify your custom services by defining how to create this service and how to return it.
     * Then you can create this service type more times with different configurations.
     * @example
     * services : {
     *     myService : {
     *         create : async (config,name) => {
     *             return await createService(config);
     *         },
     *         get : async (service) => {
     *             return await service.getConnection();
     *         },
     *         default : {
     *            database : 'myDb',
     *            user : process.env.DB_USER,
     *            password : process.env.DB_PASSWORD
     *         },
     *         secondDb : {
     *            database : 'secondDb',
     *            user : process.env.DB_USER,
     *            password : process.env.DB_PASSWORD
     *         }
     *     }
     * }
     */
    services  ?: Record<string,MainService<any,any,any>>;
}

export interface PreCompiledServiceConfig extends ServiceConfig{
}

export type MainService<Config,Created,Get> = Service<Config,Created,Get> | Record<string,Config> | DefaultConfig<Config>;

export type ServiceCreateFunction<Config,Created> = (config : Config, configName : string) => Promise<Created> | Created;
export type ServiceGetFunction<Created,Get> = (service : Created) => Promise<Get> | Get;

export interface Service<Config = any,Created = any,Get = any> {
    /**
     * A function that defines how to create the services.
     * @example
     * services : {
     *     myService : {
     *         create : async (config,name) => {
     *             return await createService(config);
     *         }
     *     }
     * }
     */
    create : ServiceCreateFunction<Config,Created>;
    /**
     * A function that defines how the services should be returned when access this service form the bag.
     * This function is optional if you don't specify this function it will return the complete services
     * when you access this service with the bag.
     * A use case for this function could be to return one connection from a pool.
     * @example
     * services : {
     *     myService : {
     *         get : async (service) => {
     *             return await service.getConnection();
     *         }
     *     }
     * }
     */
    get ?: ServiceGetFunction<Created,Get>
}

export interface DefaultConfig<T> {
    /**
     * The default configuration of this service,
     * this configuration will allow you to access the service from the bag without having to specify the name.
     */
    default ?: T;
}

