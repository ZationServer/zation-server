/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import {AppConfig, PreCompiledAppConfig}         from "../configDefinitions/appConfig";
import {ChannelConfig, PreCompiledChannelConfig} from "../configDefinitions/channelConfig";
import {EventConfig, PreCompiledEventConfig}     from "../configDefinitions/eventConfig";
import {PreCompiledServiceConfig, ServiceConfig} from "../configDefinitions/serviceConfig";
import {StarterConfig}                           from "../configDefinitions/starterConfig";
import {InternalMainConfig}                      from "../configDefinitions/mainConfig";

export interface OtherPreCompiledConfigSet {
    appConfig : PreCompiledAppConfig,
    channelConfig : PreCompiledChannelConfig,
    eventConfig : PreCompiledEventConfig,
    serviceConfig : PreCompiledServiceConfig
}

export interface OtherLoadedConfigSet {
    appConfig : AppConfig,
    channelConfig : ChannelConfig,
    eventConfig : EventConfig,
    serviceConfig : ServiceConfig
}

export interface FullLoadedConfigSet extends OtherLoadedConfigSet {
    starterConfig : StarterConfig,
    mainConfig : InternalMainConfig
}