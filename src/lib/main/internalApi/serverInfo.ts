/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import ZationConfig from "../config/manager/zationConfig";

export default class ServerInfo
{
    private readonly _zationConfig: ZationConfig;

    constructor(zc: ZationConfig) {
        this._zationConfig = zc;
    }

    // noinspection JSUnusedGlobalSymbols
    get port(): number {
        return this._zationConfig.mainConfig.port;
    }

    // noinspection JSUnusedGlobalSymbols
    get appName(): string {
        return this._zationConfig.mainConfig.appName;
    }

    // noinspection JSUnusedGlobalSymbols
    get hostname(): string {
        return this._zationConfig.mainConfig.hostname;
    }

    // noinspection JSUnusedGlobalSymbols
    get timeZone(): string {
        return this._zationConfig.mainConfig.timeZone;
    }

    // noinspection JSUnusedGlobalSymbols
    get zationConfig(): ZationConfig {
        return this._zationConfig;
    }
}