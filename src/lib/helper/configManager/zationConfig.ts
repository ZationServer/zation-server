/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import {InternalMainConfig}                         from "../configDefinitions/mainConfig";
import {StarterConfig}                              from "../configDefinitions/starterConfig";
import InternalData        from "../constants/internalData";
// noinspection TypeScriptPreferShortImport
import {StartMode}         from "../constants/startMode";
import ZationInfo          from "../infoObjects/zationInfo";
import ZcTransport         from "./zcTransport";
import ConfigLocations     from "./configLocations";
import JwtSignOptions      from "../constants/jwt";

export default abstract class ZationConfig {

    protected _starterConfig : StarterConfig;
    protected _mainConfig : InternalMainConfig;
    protected _preLoadJwtOptions : JwtSignOptions = {};

    protected _configLocations : ConfigLocations;

    protected _internalData: InternalData;

    protected _rootPath : string;
    protected _startMode : number;

    private readonly _preparedZationInfo : ZationInfo = new ZationInfo(this);

    inTestMode() : boolean {
        return this._startMode == StartMode.TEST;
    }

    inNormalMode() : boolean {
        return this._startMode == StartMode.NORMAL;
    }

    getStartMode() : StartMode {
        return this._startMode;
    }

    getZcTransport(): ZcTransport {
        return {
            mainConfig : this._mainConfig,
            starterConfig : this._starterConfig,
            startMode : this._startMode,
            rootPath : this._rootPath,
            internalData : this._internalData,
            configLocations : this._configLocations,
            preLoadJwtOptions : this._preLoadJwtOptions
        };
    }

    isDebug(): boolean {
        return this._mainConfig.debug;
    }

    isStartDebug(): boolean {
        return this._mainConfig.startDebug;
    }

    isShowConfigWarning(): boolean {
        return this._mainConfig.showConfigWarnings;
    }

    // noinspection JSUnusedGlobalSymbols
    isUsePanel(): boolean {
        return this._mainConfig.usePanel
    }

    getVerifyKey(): any {
        return this._mainConfig.authPublicKey || this._mainConfig.authKey;
    }

    getSignKey(): any {
        return this._mainConfig.authPrivateKey || this._mainConfig.authKey;
    }

    getZationInfo(): ZationInfo {
        return this._preparedZationInfo;
    }

    get mainConfig(): InternalMainConfig {
        return this._mainConfig;
    }

    get internalData(): InternalData {
        return this._internalData;
    }

    get starterConfig(): StarterConfig {
        return this._starterConfig;
    }

    get rootPath(): string {
        return this._rootPath;
    }

    get configLocations(): ConfigLocations {
        return this._configLocations;
    }

    getJwtOptions() : JwtSignOptions {
        //return cloned options
        return {...this._preLoadJwtOptions};
    }
}