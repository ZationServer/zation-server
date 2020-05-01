/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {CustomChannelConfig} from '../main/config/definitions/parts/channelsConfig';
import Config                from './Config';

export default class CustomChannel {

    private readonly _name: string;
    private readonly _definition: CustomChannelConfig;

    constructor(name: string,definition: CustomChannelConfig) {
        this._name = name;
        this._definition = definition;
    }

    get name(): string {
        return this._name;
    }

    get definition(): CustomChannelConfig {
        return this._definition;
    }

    /**
     * @description
     * Registers the custom channel in the app config.
     * Watch out that you don't use an identifier that is already defined in the custom channels of the app config.
     * If you use this method in another file as the app config,
     * make sure that you import this file in app config.
     */
    register() {
        Config.registerCustomCh(this._name,this._definition);
    }
}