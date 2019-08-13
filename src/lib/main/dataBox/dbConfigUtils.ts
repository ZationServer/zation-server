/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {InputConfig}   from "../config/definitions/inputConfig";
// noinspection TypeScriptPreferShortImport
import {DataBoxConfig} from "../config/definitions/dataBoxConfig";

export default class DbConfigUtils {

    /**
     * Converts the DataBox fetch input config to an input config.
     * @param config
     */
    static convertDbFetchInput(config : DataBoxConfig) : InputConfig {
        return {
            input : config.fetchInput,
            allowAnyInput : config.allowAnyFetchInput
        };
    }

    /**
     * Converts the DataBox init input config to an input config.
     * @param config
     */
    static convertDbInitInput(config : DataBoxConfig) : InputConfig {
        return {
            input : config.initInput,
            allowAnyInput : config.allowAnyFetchInput
        };
    }
}