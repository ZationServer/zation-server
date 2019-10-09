/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {AppConfig, PrecompiledAppConfig}         from "../definitions/appConfig";
import {EventConfig, PrecompiledEventConfig}     from "../definitions/eventConfig";
import {PrecompiledServiceConfig, ServiceConfig} from "../definitions/serviceConfig";
import {StarterConfig}                           from "../definitions/starterConfig";
import {InternalMainConfig}                      from "../definitions/mainConfig";

export interface OtherPrecompiledConfigSet {
    appConfig : PrecompiledAppConfig,
    eventConfig : PrecompiledEventConfig,
    serviceConfig : PrecompiledServiceConfig
}

export interface OtherLoadedConfigSet {
    appConfig : AppConfig,
    eventConfig : EventConfig,
    serviceConfig : ServiceConfig
}

export interface FullLoadedConfigSet extends OtherLoadedConfigSet {
    starterConfig : StarterConfig,
    mainConfig : InternalMainConfig
}