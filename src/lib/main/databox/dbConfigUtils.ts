/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {InputConfig}   from "../config/definitions/parts/inputConfig";
// noinspection TypeScriptPreferShortImport
import {DataboxConfig} from "../config/definitions/parts/databoxConfig";

export default class DbConfigUtils {

    /**
     * Converts the Databox fetch input config to an input config.
     * @param config
     */
    static convertDbFetchInput(config: DataboxConfig): InputConfig {
        return {
            input: config.fetchInput,
            allowAnyInput: config.allowAnyFetchInput
        };
    }

    /**
     * Converts the Databox init input config to an input config.
     * @param config
     */
    static convertDbInitInput(config: DataboxConfig): InputConfig {
        return {
            input: config.initInput,
            allowAnyInput: config.allowAnyFetchInput
        };
    }
}