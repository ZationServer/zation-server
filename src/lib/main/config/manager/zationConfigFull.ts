/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import ZationConfig                from "./zationConfig";
import ZcTransport                 from "./zcTransport";
import {PreparedEvents}            from "../definitions/parts/events";
import {OtherLoadedConfigSet}      from './configSets';
import {PreparedMiddleware}        from '../definitions/parts/middleware';
import {AppConfig}                 from '../definitions/main/appConfig';
import {ServiceConfig}             from '../definitions/main/serviceConfig';
import EventPreparer               from '../../events/eventPreparer';
import MiddlewaresPreparer         from '../../middlewares/middlewaresPreparer';

/**
 * Zation config for active process (worker,broker).
 */
export default class ZationConfigFull extends ZationConfig {

    protected _appConfig: AppConfig;
    protected _serviceConfig: ServiceConfig;

    protected _events: PreparedEvents;
    protected _middleware: PreparedMiddleware;

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

    setOtherConfigs(otherConfigSet: OtherLoadedConfigSet) {
        this._appConfig = otherConfigSet.appConfig;
        this._serviceConfig = otherConfigSet.serviceConfig;

        this._events = EventPreparer.prepare(this.appConfig.events);
        this._middleware = MiddlewaresPreparer.prepare(this.appConfig.middleware);
    }

    get appConfig(): AppConfig {
        return this._appConfig;
    }

    get serviceConfig(): ServiceConfig {
        return this._serviceConfig;
    }

    /**
     * This getter is used to access an event.
     */
    get event(): PreparedEvents {
        return this._events;
    }

    /**
     * This getter is used to access an middleware.
     */
    get middleware(): PreparedMiddleware {
        return this._middleware;
    }
}