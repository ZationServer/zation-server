/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {InternalMainConfig}                         from "../definitions/mainConfig";
import {StarterConfig}                              from "../definitions/starterConfig";
import InternalData        from "../../constants/internalData";
// noinspection TypeScriptPreferShortImport
import {StartMode}         from "../../constants/startMode";
import ZationInfo          from "../../internalApi/zationInfo";
import ZcTransport         from "./zcTransport";
import ConfigLocations     from "./configLocations";
import {JwtSignOptions}    from "../../constants/jwt";

export default abstract class ZationConfig {

    protected _starterConfig: StarterConfig;
    protected _mainConfig: InternalMainConfig;
    protected _preLoadJwtSignOptions: JwtSignOptions = {};

    protected _configLocations: ConfigLocations;

    protected _internalData: InternalData;

    protected _rootPath: string;
    protected _startMode: number;

    private readonly _preparedZationInfo: ZationInfo = new ZationInfo(this);

    inTestMode(): boolean {
        return this._startMode == StartMode.TEST;
    }

    inNormalMode(): boolean {
        return this._startMode == StartMode.NORMAL;
    }

    getStartMode(): StartMode {
        return this._startMode;
    }

    getZcTransport(): ZcTransport {
        return {
            mainConfig: this._mainConfig,
            starterConfig: this._starterConfig,
            startMode: this._startMode,
            rootPath: this._rootPath,
            internalData: this._internalData,
            configLocations: this._configLocations,
            preLoadJwtSignOptions: this._preLoadJwtSignOptions
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
        return this._internalData.verifyKey;
    }

    getSignKey(): any {
        return this._internalData.signKey;
    }

    getDataboxKey(): string {
        return this.internalData.databoxKey;
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

    getJwtSignOptions() : JwtSignOptions {
        //return cloned options
        return {...this._preLoadJwtSignOptions};
    }
}