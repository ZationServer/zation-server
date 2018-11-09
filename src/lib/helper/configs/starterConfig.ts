/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import {MainConfig}    from "./mainConfig";

export type StarterConfig = StarterConfigMain & MainConfig;

export interface StarterConfigMain
{
    controller  ?: string;
    configs  ?: string;

    appConfig  ?: string;
    channelConfig  ?: string;
    mainConfig  ?: string;
    errorConfig  ?: string;
    eventConfig  ?: string;
    serviceConfig  ?: string;
}
