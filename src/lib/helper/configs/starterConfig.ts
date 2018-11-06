/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import {ChannelConfig} from "./channelConfig";
import {MainConfig}    from "./mainConfig";
import {ErrorConfig}   from "./errorConfig";
import {EventConfig}   from "./eventConfig";
import {ServiceConfig} from "./serviceConfig";
import {AppConfig}     from "./appConfig";

export type StarterConfig = StarterConfigMain & MainConfig;

export interface StarterConfigMain
{
    controller  ?: string;
    configs  ?: string;

    appConfig  ?: string | AppConfig;
    channelConfig  ?: string | ChannelConfig;
    mainConfig  ?: string | MainConfig;
    errorConfig  ?: string | ErrorConfig;
    eventConfig  ?: string | EventConfig;
    serviceConfig  ?: string | ServiceConfig;
}
