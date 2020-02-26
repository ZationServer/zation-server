/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import ZationConfig                from "./zationConfig";
import ZcTransport                 from "./zcTransport";
import {PrecompiledEvents}    from "../definitions/parts/events";
import {PrecompiledAppConfig}      from "../definitions/main/appConfig";
import {PrecompiledServiceConfig}  from "../definitions/main/serviceConfig";
import {OtherPrecompiledConfigSet} from "./configSets";
import {PrecompiledMiddleware} from '../definitions/parts/middleware';

/**
 * Zation config for active process (worker,broker).
 */
export default class ZationConfigFull extends ZationConfig {

    protected _appConfig: PrecompiledAppConfig;
    protected _serviceConfig: PrecompiledServiceConfig;

    protected _events: PrecompiledEvents;
    protected _middleware: PrecompiledMiddleware;

    constructor(zcTransport: ZcTransport) {
        super();

        this._starterConfig = zcTransport.starterConfig;
        this._mainConfig = zcTransport.mainConfig;
        this._rootPath = zcTransport.rootPath;
        this._startMode = zcTransport.startMode;
        this._configLocations = zcTransport. configLocations;
        this._internalData = zcTransport.internalData;
        this._preLoadJwtSignOptions = zcTransport.preLoadJwtSignOptions;
    }

    setOtherConfigs(precompiledOtherConfigSet: OtherPrecompiledConfigSet) {
        this._appConfig = precompiledOtherConfigSet.appConfig;
        this._serviceConfig = precompiledOtherConfigSet.serviceConfig;

        this._events = this.appConfig.events;
        this._middleware = this.appConfig.middleware;
    }

    get appConfig(): PrecompiledAppConfig {
        return this._appConfig;
    }

    get serviceConfig(): PrecompiledServiceConfig {
        return this._serviceConfig;
    }

    /**
     * This getter is used to access an event.
     */
    get event(): PrecompiledEvents {
        return this._events;
    }

    /**
     * This getter is used to access an middleware.
     */
    get middleware(): PrecompiledMiddleware {
        return this._middleware;
    }
}