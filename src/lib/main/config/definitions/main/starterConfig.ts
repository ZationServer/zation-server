/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {MainConfig}    from "./mainConfig";

export type StarterConfig = StarterConfigMain & MainConfig;

export interface StarterConfigMain
{
    /**
     * The root path to the running directory.
     * This path is used for loading the configs.
     * @default Try to find the root path automatically.
     */
    rootPath?: string;

    /**
     * The path to the configs.
     * This path is relative to the root path.
     * @default 'configs'
     */
    configs?: string;

    /**
     * The path to the main config.
     * This path is relative to the root and configs path.
     * @default 'main.config'
     */
    mainConfig?: string;

    /**
     * The path to the app config.
     * This path is relative to the root and configs path.
     * @default 'app.config'
     */
    appConfig?: string;

    /**
     * The path to the service config.
     * This path is relative to the root and configs path.
     * @default 'service.config'
     */
    serviceConfig?: string;

    /**
     * With this option, you can deactivate the check of the configurations on server start.
     * It's not recommended to deactived it, but if the process takes a lot of time, you can do it.
     * Notice that you check the configurations with the npm check command after every change.
     * @default true
     */
    checkConfigs?: boolean;
}

