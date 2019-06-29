/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import ZationConfig                from "./zationConfig";
import ZcTransport                 from "./zcTransport";
import {PreCompiledEventConfig}    from "../definitions/eventConfig";
import {PreCompiledAppConfig}      from "../definitions/appConfig";
import {PreCompiledChannelConfig}  from "../definitions/channelConfig";
import {PreCompiledServiceConfig}  from "../definitions/serviceConfig";
import {OtherPreCompiledConfigSet} from "./configSets";

/**
 * Zation config for active process (worker,broker).
 */
export default class ZationConfigFull extends ZationConfig {

    protected _appConfig : PreCompiledAppConfig;
    protected _channelConfig : PreCompiledChannelConfig;
    protected _eventConfig : PreCompiledEventConfig;
    protected _serviceConfig : PreCompiledServiceConfig;

    constructor(zcTransport : ZcTransport) {
        super();

        this._starterConfig = zcTransport.starterConfig;
        this._mainConfig = zcTransport.mainConfig;
        this._rootPath = zcTransport.rootPath;
        this._startMode = zcTransport.startMode;
        this._configLocations = zcTransport. configLocations;
        this._internalData = zcTransport.internalData;
        this._preLoadJwtSignOptions = zcTransport.preLoadJwtSignOptions;
    }

    setOtherConfigs(preCompiledOtherConfigSet : OtherPreCompiledConfigSet) {
        this._appConfig = preCompiledOtherConfigSet.appConfig;
        this._eventConfig = preCompiledOtherConfigSet.eventConfig;
        this._channelConfig = preCompiledOtherConfigSet.channelConfig;
        this._serviceConfig = preCompiledOtherConfigSet.serviceConfig;
    }

    get eventConfig() : PreCompiledEventConfig {
        return this._eventConfig;
    }

    get appConfig(): PreCompiledAppConfig {
        return this._appConfig;
    }

    get channelConfig(): PreCompiledChannelConfig {
        return this._channelConfig;
    }

    get serviceConfig(): PreCompiledServiceConfig {
        return this._serviceConfig;
    }
}