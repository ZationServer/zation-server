/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {AuthAccessConfig}                                          from "./accessConfigs";
import {InputConfig}                                               from "./inputConfig";
import {CompHandleMiddlewareConfig}                                from './compHandleMiddlewareConfig';

export interface ReceiverConfig extends InputConfig, AuthAccessConfig, CompHandleMiddlewareConfig {}