/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {InternalMainConfig}                         from "../definitions/main/mainConfig";
import {StarterConfig}                              from "../definitions/main/starterConfig";
import InternalData        from "../../definitions/internalData";
// noinspection ES6PreferShortImport
import {StartMode}         from "../../../core/startMode";
import ServerInfo          from "../../internalApi/serverInfo";
import ZcTransport         from "./zcTransport";
import ConfigLocations     from "./configLocations";
import {JwtSignOptions}    from "../../definitions/jwt";

export default abstract class ZationConfig {

    protected _starterConfig: StarterConfig;
    protected _mainConfig: InternalMainConfig;
    protected _preLoadJwtSignOptions: JwtSignOptions = {};

    protected _configLocations: ConfigLocations;

    protected _internalData: InternalData;

    protected _rootPath: string;

    protected _startMode: StartMode;

    private readonly _preparedServerInfo: ServerInfo = new ServerInfo(this);

    inTestMode(): boolean {
        return this._startMode == StartMode.Test;
    }

    inProductionMode(): boolean {
        return this._startMode == StartMode.Production;
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
    isPanelActive(): boolean {
        return this._mainConfig.panel.active === true;
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

    getServerInfo(): ServerInfo {
        return this._preparedServerInfo;
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

    getJwtSignOptions(): JwtSignOptions {
        //return cloned options
        return {...this._preLoadJwtSignOptions};
    }
}