/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import {AppConfig, PreCompiledAppConfig}         from "../definitions/appConfig";
import {ChannelConfig, PreCompiledChannelConfig} from "../definitions/channelConfig";
import {EventConfig, PreCompiledEventConfig}     from "../definitions/eventConfig";
import {PreCompiledServiceConfig, ServiceConfig} from "../definitions/serviceConfig";
import {StarterConfig}                           from "../definitions/starterConfig";
import {InternalMainConfig}                      from "../definitions/mainConfig";

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