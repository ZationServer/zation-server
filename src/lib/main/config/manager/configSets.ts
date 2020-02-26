/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {AppConfig, PrecompiledAppConfig}         from "../definitions/main/appConfig";
import {PrecompiledServiceConfig, ServiceConfig} from "../definitions/main/serviceConfig";

export interface OtherPrecompiledConfigSet {
    appConfig: PrecompiledAppConfig,
    serviceConfig: PrecompiledServiceConfig
}

export interface OtherLoadedConfigSet {
    appConfig: AppConfig,
    serviceConfig: ServiceConfig
}