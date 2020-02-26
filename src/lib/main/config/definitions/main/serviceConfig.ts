/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {Service} from "zation-service";

export interface ServiceConfig {
    /**
     * In this configuration, you can specify all your services.
     * A service represents something that needs to be created
     * before the server is started.
     * This can be for example a connection to an external server.
     * Afterward, the service can be accessed from the bag and used.
     * You can define your own services or use predefined service packages.
     * For example: 'zation-service-nodemailer' or 'zation-service-mysql'.
     * @example
     * {
     *     //ServicePackage
     *     ...MySqlServicePackage.build({
     *         default: {
     *             port: 3306,
     *             database: 'myDb',
     *             user: process.env.DB_USER,
     *             password: process.env.DB_PASSWORD,
     *             charset: 'utf8mb4_unicode_ci'
     *         }
     *     }),
     *     //Own Service
     *     myService: {
     *         create: async (config,instanceName) => {
     *             return await createService(config);
     *         },
     *         get: async (instance) => {
     *             return await instance.getConnection();
     *         },
     *         instances: {
     *             default: {
     *                 database: 'myDb',
     *                 user: process.env.DB_1_USER,
     *                 password: process.env.DB_1_PASSWORD
     *             },
     *             secondDb: {
     *                 database: 'secondDb',
     *                 user: process.env.DB_2_USER,
     *                 password: process.env.DB_2_PASSWORD
     *             }
     *         }
     *     }
     * }
     */
    [serviceName: string]: Service<any,any>;
}

export interface PrecompiledServiceConfig extends ServiceConfig{
}