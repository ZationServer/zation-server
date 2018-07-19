/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import Const           = require('./../constants/constWrapper');
import {ChannelConfig} from "./channelConfigStructure";
import {MainConfig}    from "./mainConfigStructure";
import {ErrorConfig}   from "./errorConfigStructure";
import {EventConfig}   from "./eventConfigStructure";
import {ServiceConfig} from "./serviceConfigStructure";
import {AppConfig}     from "./appConfigStructure";

export type StarterConfig = StarterConfigMain & MainConfig;

export interface StarterConfigMain
{
    [Const.Starter.KEYS.CONTROLLER] ?: string;
    [Const.Starter.KEYS.CONFIG] ?: string;

    [Const.Starter.KEYS.APP_CONFIG] ?: string | AppConfig;
    [Const.Starter.KEYS.CHANNEL_CONFIG] ?: string | ChannelConfig;
    [Const.Starter.KEYS.MAIN_CONFIG] ?: string | MainConfig;
    [Const.Starter.KEYS.ERROR_CONFIG] ?: string | ErrorConfig;
    [Const.Starter.KEYS.EVENT_CONFIG] ?: string | EventConfig;
    [Const.Starter.KEYS.SERVICE_CONFIG] ?: string | ServiceConfig;
}
