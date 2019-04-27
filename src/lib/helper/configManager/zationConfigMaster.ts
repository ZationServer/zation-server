/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import {StarterConfig}      from "../configDefinitions/starterConfig";
import {InternalMainConfig} from "../configDefinitions/mainConfig";
import ZationConfig         from "./zationConfig";
import crypto             = require('crypto');
import ConfigLocations      from "./configLocations";

export default class ZationConfigMaster extends ZationConfig {

    constructor(starterConfig : StarterConfig,mainConfig : InternalMainConfig,configLocations : ConfigLocations,rootPath : string,startMode : number) {
        super();

        this._starterConfig = starterConfig;
        this._mainConfig = mainConfig;
        this._configLocations = configLocations;
        this._rootPath = rootPath;
        this._startMode = startMode;

        this._internalData = {
            tokenCheckKey : crypto.randomBytes(32).toString('hex')
        };

        this._loadJwtOptions();
    }

    protected _loadJwtOptions() {
        this._preLoadJwtOptions = this.mainConfig.authAlgorithm ?
            {
                algorithm : this._mainConfig.authAlgorithm,
                expiresIn : this._mainConfig.authDefaultExpiry
            } :
            {
                expiresIn : this._mainConfig.authDefaultExpiry
            };
    }

}