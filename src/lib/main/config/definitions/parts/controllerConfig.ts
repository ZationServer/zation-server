/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {AccessConfig}                                              from "./accessConfigs";
import {InputConfig}                                               from "./inputConfig";
import {CompHandleMiddlewareConfig}                                from './compHandleMiddlewareConfig';

export interface ControllerConfig extends InputConfig, AccessConfig, CompHandleMiddlewareConfig {}