/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import ZationConfig                from "./zationConfig";
import ZcTransport                 from "./zcTransport";
import {PrecompiledEventConfig, PreprocessedEvents} from "../definitions/eventConfig";
import {PrecompiledAppConfig}      from "../definitions/appConfig";
import {PrecompiledServiceConfig}  from "../definitions/serviceConfig";
import {OtherPrecompiledConfigSet} from "./configSets";

/**
 * Zation config for active process (worker,broker).
 */
export default class ZationConfigFull extends ZationConfig {

    protected _appConfig: PrecompiledAppConfig;
    protected _eventConfig: PrecompiledEventConfig;
    protected _serviceConfig: PrecompiledServiceConfig;
    protected _preprocessedEvents: PreprocessedEvents;

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
        this._eventConfig = precompiledOtherConfigSet.eventConfig;
        this._serviceConfig = precompiledOtherConfigSet.serviceConfig;
    }

    setPreprocessedEvents(events: PreprocessedEvents) {
        this._preprocessedEvents = events;
    }

    get eventConfig(): PrecompiledEventConfig {
        return this._eventConfig;
    }

    get appConfig(): PrecompiledAppConfig {
        return this._appConfig;
    }

    get serviceConfig(): PrecompiledServiceConfig {
        return this._serviceConfig;
    }

    /**
     * Returns the preprocessed events.
     * Warning! It is undefined before events are preprocessed.
     */
    get event(): PreprocessedEvents {
        return this._preprocessedEvents;
    }
}