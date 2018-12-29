/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import {MainConfig}    from "./mainConfig";

export type StarterConfig = StarterConfigMain & MainConfig;

export interface StarterConfigMain
{
    configs  ?: string;

    appConfig  ?: string;
    channelConfig  ?: string;
    mainConfig  ?: string;
    errorConfig  ?: string;
    eventConfig  ?: string;
    serviceConfig  ?: string;
}
