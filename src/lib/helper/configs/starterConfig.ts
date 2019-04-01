/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import {MainConfig}    from "./mainConfig";

export type StarterConfig = StarterConfigMain & MainConfig;

export interface StarterConfigMain
{
    /**
     * The root path to the running directory.
     * This path is used for loading the configs.
     * @default Zation is try to find the root path automatically.
     */
    rootPath ?: string;

    /**
     * The path to the configs.
     * This path is relative to the root path.
     * @default 'configs'
     */
    configs  ?: string;

    /**
     * The path to the app config.
     * This path is relative to the root and configs path.
     * @default 'app.config'
     */
    appConfig  ?: string;

    /**
     * The path to the channel config.
     * This path is relative to the root and configs path.
     * @default 'channel.config'
     */
    channelConfig  ?: string;

    /**
     * The path to the main config.
     * This path is relative to the root and configs path.
     * @default 'main.config'
     */
    mainConfig  ?: string;

    /**
     * The path to the error config.
     * This path is relative to the root and configs path.
     * @default 'error.config'
     */
    errorConfig  ?: string;

    /**
     * The path to the event config.
     * This path is relative to the root and configs path.
     * @default 'event.config'
     */
    eventConfig  ?: string;

    /**
     * The path to the service config.
     * This path is relative to the root and configs path.
     * @default 'service.config'
     */
    serviceConfig  ?: string;
}

