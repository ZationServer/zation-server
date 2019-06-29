/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import {StarterConfig}      from "../definitions/starterConfig";
import {InternalMainConfig} from "../definitions/mainConfig";
import ZationConfig         from "./zationConfig";
import crypto             = require('crypto');
import ConfigLocations      from "./configLocations";
import InternalData from "../../constants/internalData";

export default class ZationConfigMaster extends ZationConfig {

    constructor(starterConfig : StarterConfig,mainConfig : InternalMainConfig,configLocations : ConfigLocations,rootPath : string,startMode : number) {
        super();

        this._starterConfig = starterConfig;
        this._mainConfig = mainConfig;
        this._configLocations = configLocations;
        this._rootPath = rootPath;
        this._startMode = startMode;

        this._internalData = this.createInternalData();

        this._loadJwtOptions();
    }

    private createInternalData() : InternalData {

        const privateAndPublicSet = typeof this.mainConfig.authPublicKey === 'string' &&
            typeof this.mainConfig.authPrivateKey === 'string';

        return {
            tokenClusterKey : crypto.randomBytes(32).toString('hex'),
            // @ts-ignore
            verifyKey : privateAndPublicSet ? this.mainConfig.authPublicKey : this.mainConfig.authSecretKey,
            // @ts-ignore
            signKey : privateAndPublicSet ? this.mainConfig.authPrivateKey : this.mainConfig.authSecretKey
        }
    }

    protected _loadJwtOptions() {
        this._preLoadJwtSignOptions = this.mainConfig.authAlgorithm ?
            {
                algorithm : this._mainConfig.authAlgorithm,
                expiresIn : this._mainConfig.authDefaultExpiry
            } :
            {
                expiresIn : this._mainConfig.authDefaultExpiry
            };
    }

}