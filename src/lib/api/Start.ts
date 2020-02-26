/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {StarterConfig} from '../main/config/definitions/main/starterConfig';
// noinspection TypeScriptPreferShortImport
import {StartMode}     from "../../lib/core/startMode";
import ZationMaster    from '../core/zationMaster';

/**
 * @description
 * This function is used for starting the server.
 * It returns a promise that will be resolved when the server is started.
 * @param options the starter config
 * @param startMode
 * The mode for starting
 * 0 => normal
 * 1 => test
 * 2 => check
 * @throws Error with the property: name of type StartErrorName.
 */
export function start(options: StarterConfig,startMode: number | string | StartMode = 0) {
    return new Promise((resolve,reject) => {
        new ZationMaster(options,resolve,reject,startMode);
    });
};