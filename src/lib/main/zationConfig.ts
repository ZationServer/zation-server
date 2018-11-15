/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import ObjectTools       = require('../helper/tools/objectTools');
import path              = require('path');
import fs                = require('fs');
import crypto            = require('crypto');
import ZationInfoObj     = require("../helper/infoObjects/zationInfo");
import Structures        = require('./../helper/config/structures');
import FuncTools         = require("../helper/tools/funcTools");
import {ErrorConstruct}    from "../helper/configs/errorConfig";
import ErrorNotFound     = require("../helper/error/errorNotFoundError");
import SmallBag          = require("../api/SmallBag");
const  uuidV4            = require('uuid/v4');
import moment            = require('moment-timezone');
import nodeEval          = require('node-eval');
import ZationToken       = require("../helper/infoObjects/zationTokenInfo");
import {EventConfig}       from "../helper/configs/eventConfig";
import {AppConfig}         from "../helper/configs/appConfig";
import {ChannelConfig}     from "../helper/configs/channelConfig";
import {ErrorConfig}       from "../helper/configs/errorConfig";
import {InternMainConfig, OptionAuto} from "../helper/configs/mainConfig";
import {ServiceConfig}     from "../helper/configs/serviceConfig";
import {StarterConfig}     from "../helper/configs/starterConfig";
import {InternalData}      from "../helper/constants/internalData";
import {ConfigScriptSave}  from "../helper/constants/internal";
import ZationInfo        = require("../helper/infoObjects/zationInfo");

class ZationConfig {
    private _eventConfig: EventConfig = {};
    private _appConfig: AppConfig = {};
    private _channelConfig: ChannelConfig = {};
    private _errorConfig: ErrorConfig = {};
    private _mainConfig: InternMainConfig;
    private _serviceConfig: ServiceConfig = {};
    private _configScriptSaver : ConfigScriptSave;
    private readonly _starterConfig: StarterConfig = {};
    private readonly _internalData: InternalData = {};

    private readonly preparedZationInfo : ZationInfo = new ZationInfo(this);

    constructor(starterData: object = {}, workerTransport: boolean = false) {
        if (!workerTransport) {
            this._starterConfig = starterData;
        } else {
            this._starterConfig = starterData['starterConfig'];
            this._mainConfig = starterData['mainConfig'];
            this._internalData = starterData['internalData'];
            this._configScriptSaver = starterData['configScript'];
        }
    }

    async masterInit()
    {
        this.loadDefaults();
        this.loadUserDataLocations();
        await this.loadMainConfig();

        //override env
        if (Number(process.env.PORT) || Number(process.env.p)) {
            this._mainConfig.port = Number(process.env.PORT) || Number(process.env.p)
        }
        if (process.env.STATE_SERVER_HOST || process.env.ssh) {
            this._mainConfig.stateServerHost =
                process.env.STATE_SERVER_HOST || process.env.ssh;
        }
        if (Number(process.env.STATE_SERVER_PORT) || Number(process.env.ssp)) {
            this._mainConfig.stateServerPort =
                Number(process.env.STATE_SERVER_PORT) || Number(process.env.ssh);
        }

        this.addToMainConfig(this._starterConfig, true, Structures.Main);
        this.processMainConfig();

        this._internalData.tokenCheckKey = crypto.randomBytes(32).toString('hex');
    }

    loadDefaults() {
        //Create Defaults
        this._mainConfig = {
            debug: false,
            startDebug: false,
            showConfigWarnings: true,
            port: 3000,
            hostname: 'localhost',
            environment: 'dev',
            postKey: 'zation',
            path: '/zation',
            useAuth: true,
            appName: 'AppWithoutName',
            secure: false,
            useProtocolCheck: true,
            useHttpMethodCheck: true,
            sendErrorDescription: false,
            authKey: crypto.randomBytes(32).toString('hex'),
            authPublicKey: null,
            authPrivateKey: null,
            authDefaultExpiry: 86400,
            timeZone: moment.tz.guess() || 'Europe/Berlin',
            authStart: false,
            authStartDuration: 20000,
            workers: "auto",
            zationConsoleLog: true,
            scConsoleLog: false,
            useScUws: true,
            clusterAuthKey: null,
            stateServerHost: null,
            stateServerPort: null,
            scLogLevel: 2,
            socketChannelLimit: 1000,
            crashWorkerOnError: true,
            rebootWorkerOnCrash: true,
            killMasterOnSignal: false,
            connectTimeout: 10000,
            handshakeTimeout: 10000,
            ackTimeout: 10000,
            ipcAckTimeout: 3000,
            socketUpgradeTimeout: 1000,
            origins: '*:*',
            pingInterval: 8000,
            pingTimeout: 20000,
            processTermTimeout: 10000,
            propagateErrors: true,
            propagateWarnings: true,
            middlewareEmitWarnings: true,
            rebootOnSignal: true,
            downgradeToUser: false,
            allowClientPublish: true,
            workerStatusInterval: 10000,
            clusterShareTokenAuth: true,
            instanceId: uuidV4(),
            useTokenCheckKey: true,
            clientJsPrepare: true,
            usePanel: false,
            killServerOnServicesCreateError : false,
        };
    }

    getWorkerTransport(): object {
        return {
            mainConfig: this._mainConfig,
            starterConfig: this._starterConfig,
            internalData: this._internalData,
            configScript : this._configScriptSaver
        };
    }

    isDebug(): boolean {
        return !!this._mainConfig.debug;
    }

    isStartDebug(): boolean {
        return !!this._mainConfig.startDebug;
    }

    isShowConfigWarning(): boolean {
        return !!this._mainConfig.showConfigWarnings;
    }

    isUsePanel(): boolean {
        return !!this._mainConfig.usePanel
    }

    addToMainConfig(toAdd: object, overwrite: boolean, onlyAddKeys: object | undefined): void {
        if (onlyAddKeys === undefined) {
            ObjectTools.addObToOb(this._mainConfig, toAdd, overwrite);
        } else {
            ObjectTools.onlyAddObToOb(this._mainConfig, toAdd, overwrite, onlyAddKeys);
        }
    }

    getError(name: string): ErrorConstruct {
        if (this._errorConfig.hasOwnProperty(name)) {
            return this._errorConfig[name];
        } else {
            throw new ErrorNotFound(name);
        }
    }

    isError(name: string): boolean {
        return this._errorConfig.hasOwnProperty(name);
    }

    getVerifyKey(): any {
        return this._mainConfig.authPublicKey || this._mainConfig.authKey;
    }

    getSignKey(): any {
        return this._mainConfig.authPrivateKey || this._mainConfig.authKey;
    }

    getZationInfo(): ZationInfoObj {
        return this.preparedZationInfo;
    }

    async loadOtherConfigs() {
        await this.loadOtherConfigScripts();
        this.loadOtherConfigFromScript();
    }

    loadOtherConfigFromScript() {
        this._eventConfig = ZationConfig.loadScript(this._configScriptSaver.eventConfig,this.starterConfig.eventConfig);
        this._channelConfig = ZationConfig.loadScript(this._configScriptSaver.channelConfig,this.starterConfig.channelConfig);
        this._appConfig = ZationConfig.loadScript(this._configScriptSaver.appConfig,this.starterConfig.appConfig);
        this._errorConfig = ZationConfig.loadScript(this._configScriptSaver.errorConfig,this.starterConfig.errorConfig);
        this._serviceConfig = ZationConfig.loadScript(this._configScriptSaver.serviceConfig,this.starterConfig.serviceConfig);
    }

    async loadOtherConfigScripts(): Promise<void> {
        this._configScriptSaver = {};
        let promises: Promise<void>[] = [];
        //Add Other Configs
        promises.push(new Promise<void>((async (resolve) => {
            this._configScriptSaver.eventConfig = await ZationConfig.loadZationConfig(
                'event.config',
                this._starterConfig.eventConfig,
            );
            resolve();
        })));
        promises.push(new Promise<void>((async (resolve) => {
            this._configScriptSaver.channelConfig = await ZationConfig.loadZationConfig(
                'channel.config',
                this._starterConfig.channelConfig,
            );
            resolve();
        })));
        promises.push(new Promise<void>((async (resolve) => {
            this._configScriptSaver.appConfig = await ZationConfig.loadZationConfig(
                'app.config',
                this._starterConfig.appConfig,
                false
            );
            resolve();
        })));
        promises.push(new Promise<void>((async (resolve) => {
            // @ts-ignore
            this._configScriptSaver.errorConfig = await ZationConfig.loadZationConfig(
                'error.config',
                this._starterConfig.errorConfig,
            );
            resolve();
        })));
        promises.push(new Promise<void>((async (resolve) => {
            // @ts-ignore
            this._configScriptSaver.serviceConfig = await ZationConfig.loadZationConfig(
                'service.config',
                this._starterConfig.serviceConfig,
            );
            resolve();
        })));
        await Promise.all(promises);
    }

    static loadScript(script : object | string | undefined,relativePath : string | undefined)
    {
        if(typeof script === 'string') {
           return nodeEval(script,relativePath);
        }
        else if(typeof script === 'object'){
            return script;
        }
        else{
            return {};
        }
    }

    static _getRootPath() : any
    {
        // noinspection JSUnresolvedVariable
        //@ts-ignore
        return path.dirname(require.main.filename || process.mainModule.filename);
    }

    static async loadZationConfig(name : string,value : any,optional : boolean = true) : Promise<string | object>
    {
        return new Promise<string | object>(((resolve, reject) => {
            if(typeof value === 'string') {
                if(value.lastIndexOf('.js') === -1) {
                    value += '.js';
                }
                fs.stat(value,async (err) =>
                {
                    if(err) {
                        if(optional) {
                            resolve({});
                        }
                        else {
                            reject(new Error(`Config ${name} not found in path ${path}`));
                        }
                    }
                    else {
                        fs.readFile(value,(err,data)=> {
                            if(err){
                                reject(err);
                            }
                            else{
                                resolve(data.toString());
                            }
                        })
                    }
                });
            }
            else if(typeof value === 'object') {
                return value;
            }
            else {

                if(optional) {
                    return {};
                }
                else {
                    throw new Error(`Error to load Config ${name}`);
                }
            }
        }));
    }

    static createValueWithOsAuto(checkValue : any)
    {
        let result = 1;
        if(checkValue !== undefined &&
            checkValue === OptionAuto) {
            result = require('os').cpus().length;
        }
        else if(checkValue !== undefined) {
            result = checkValue;
        }
        return result;
    }

    // noinspection JSMethodCanBeStatic
    async checkMiddlewareEvent(event : Function | undefined,next : Function,...params : any[]) : Promise<boolean> {
        return await FuncTools.checkMiddlewareFunc(event,next,...params);
    }

    async checkScMiddlewareEvent(event : Function | undefined,next : Function,smallBag : SmallBag,req : object) : Promise<boolean> {
        return await this.checkMiddlewareEvent(event,next,smallBag,req);
    }

    async checkAuthenticationMiddlewareEvent(event : Function | undefined,next : Function,smallBag : SmallBag,zationToken : ZationToken) : Promise<boolean> {
        return await this.checkMiddlewareEvent(event,next,smallBag,zationToken);
    }

    // noinspection JSMethodCanBeStatic
    async emitEvent(event : Function | Function[] | undefined,...params : any[]) : Promise<void> {
        await FuncTools.emitEvent(event,...params);
    }

    private loadUserDataLocations() : void
    {
        this.loadZationConfigLocation(nameof<StarterConfig>(s => s.mainConfig),'main.config');
        this.loadZationConfigLocation(nameof<StarterConfig>(s => s.appConfig),'app.config');
        this.loadZationConfigLocation(nameof<StarterConfig>(s => s.channelConfig),'channel.config');
        this.loadZationConfigLocation(nameof<StarterConfig>(s => s.errorConfig),'error.config');
        this.loadZationConfigLocation(nameof<StarterConfig>(s => s.eventConfig),'event.config');
        this.loadZationConfigLocation(nameof<StarterConfig>(s => s.serviceConfig),'service.config');

        if(!this._starterConfig.controller) {
            this._starterConfig.controller = ZationConfig._getRootPath() + '/controller';
        }
    }

    private loadZationConfigLocation(key : string,defaultName : string) : void
    {
        const path = this._starterConfig.configs ? this._starterConfig.configs + '/'
            : ZationConfig._getRootPath() + '/config/';

        if(!(typeof this._starterConfig[key] === 'string')) {
            this._starterConfig[key] =  path + defaultName;
        }
        else {
            this._starterConfig[key] =  path + this._starterConfig[key];
        }
    }

    private async loadMainConfig() : Promise<void>
    {
        const mainConfig = ZationConfig.loadScript(await ZationConfig.loadZationConfig(
            'main.config',
            this._starterConfig.mainConfig
        ),this._starterConfig.mainConfig);
        ObjectTools.addObToOb(this._mainConfig,mainConfig,true);
    }

    private processMainConfig() : void
    {
        //Workers Default
        this._mainConfig.workers =
            ZationConfig.createValueWithOsAuto(this._mainConfig.workers);

        //Brokers Default
        this._mainConfig.brokers =
            ZationConfig.createValueWithOsAuto(this._mainConfig.brokers);

        //path slash check
        const path = this._mainConfig.path;
        if(path && typeof path === 'string' && path.charAt(0) !== '/') {
            this._mainConfig.path = '/' + path;
        }
    }

    get eventConfig() : EventConfig {
        return this._eventConfig;
    }

    get appConfig(): AppConfig {
        return this._appConfig;
    }

    get channelConfig(): ChannelConfig {
        return this._channelConfig;
    }

    get errorConfig(): ErrorConfig {
        return this._errorConfig;
    }

    get mainConfig(): InternMainConfig {
        return this._mainConfig;
    }

    get serviceConfig(): ServiceConfig {
        return this._serviceConfig;
    }

    get internalData(): InternalData {
        return this._internalData;
    }

    get starterConfig(): StarterConfig {
        return this._starterConfig;
    }
}

export = ZationConfig;