/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {AuthAccessConfig, SystemAccessConfig, VersionAccessConfig} from "./accessConfigs";
import {InputConfig}                                               from "./inputConfig";
import {CompHandleMiddlewareConfig}                                from './compHandleMiddlewareConfig';

export interface ControllerConfig extends InputConfig, VersionAccessConfig,
    SystemAccessConfig, AuthAccessConfig, CompHandleMiddlewareConfig {}