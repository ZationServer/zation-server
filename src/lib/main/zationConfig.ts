/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import path              = require('path');
import fs                = require('fs');
import crypto            = require('crypto');
const  uuidV4            = require('uuid/v4');
import moment            = require('moment-timezone');
import nodeEval          = require('node-eval');
import {EventConfig} from "../helper/configs/eventConfig";
import {AppConfig}         from "../helper/configs/appConfig";
import {ChannelConfig}     from "../helper/configs/channelConfig";
import {InternMainConfig, OPTION_AUTO, OPTION_HALF_AUTO} from "../helper/configs/mainConfig";
import {ServiceConfig}     from "../helper/configs/serviceConfig";
import {StarterConfig, StarterConfigMain} from "../helper/configs/starterConfig";
import InternalData       from "../helper/constants/internalData";
import {ConfigScriptSave} from "../helper/constants/internal";
// noinspection TypeScriptPreferShortImport
import {StartMode}         from "./../helper/constants/startMode";
import ZationTokenInfo     from "../helper/infoObjects/zationTokenInfo";
import ObjectTools         from "../helper/tools/objectTools";
import ZationInfo          from "../helper/infoObjects/zationInfo";
import SmallBag            from "../api/SmallBag";
import FuncTools           from "../helper/tools/funcTools";
import {Structures}        from "../helper/config/structures";

export default class ZationConfig {
    private _eventConfig: EventConfig = {};
    private _appConfig: AppConfig = {};
    private _channelConfig: ChannelConfig = {};
    private _mainConfig: InternMainConfig;
    private _serviceConfig: ServiceConfig = {};
    private _configScriptSaver : ConfigScriptSave;
    private readonly _starterConfig: StarterConfig = {
        checkConfigs : true,
        mainConfig : 'main.config',
        appConfig : 'app.config',
        channelConfig : 'channel.config',
        errorConfig : 'error.config',
        eventConfig : 'event.config',
        serviceConfig : 'service.config'
    };
    private readonly _internalData: InternalData = {};

    private readonly _loadedConfigs: string[] = [];
    private readonly _workerProcess: boolean;

    private _preLoadJwtOptions = {};

    private readonly rootPath : string;
    private startMode : number;

    private readonly preparedZationInfo : ZationInfo = new ZationInfo(this);

    constructor(starterData: object = {}, workerTransport: boolean = false) {
        if (!workerTransport) {
            ObjectTools.addObToOb(this._starterConfig,starterData,true);
            this._workerProcess = false;
            this.rootPath = ZationConfig._getRootPath(starterData);
        } else {
            this._starterConfig = starterData['starterConfig'];
            this._mainConfig = starterData['mainConfig'];
            this._internalData = starterData['internalData'];
            this.rootPath = starterData['rootPath'];
            this.startMode = starterData['startMode'];
            this._workerProcess = true;
            this._loadJwtOptions();
        }
    }

    async masterInit(startMode : number)
    {
        this.startMode = startMode;
        this.loadMainDefaults();
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

        this._loadJwtOptions();
    }

    _loadJwtOptions()
    {
        this._preLoadJwtOptions =
            this.mainConfig.authAlgorithm ? {algorithm : this.mainConfig.authAlgorithm} : {};
    }

    getJwtOptions() {
        return this._preLoadJwtOptions;
    }

    inTestMode() : boolean {
        return this.startMode == StartMode.TEST;
    }

    inNormalMode() : boolean {
        return this.startMode == StartMode.NORMAL;
    }

    getStartMode() : number {
        return this.startMode;
    }

    loadMainDefaults() {
        //Create Defaults
        this._mainConfig = {
            debug: false,
            startDebug: false,
            showConfigWarnings: true,
            port: 3000,
            hostname: 'localhost',
            environment: 'prod',
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
            validationCheckLimit : 50,
            timeZone: moment.tz.guess() || 'Europe/Berlin',
            authStart: false,
            authStartDuration: 20000,
            workers: OPTION_AUTO,
            brokers: OPTION_HALF_AUTO,
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
            origins: null,
            scOrigins : null,
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
            logToFile: false,
            logPath : '',
            logDownloadable : true,
            logAccessKey : '',
            logRequests : false,
            logServerErrors : true,
            logCodeErrors : true,
            logStarted : true,
            variables : {}
        };
    }

    getWorkerTransport(): object {

        //only send important starter config settings
        //other is merged with main config
        const starterConfigMain : StarterConfigMain = {
            configs : this._starterConfig.configs,

            appConfig : this._starterConfig.appConfig,
            channelConfig : this._starterConfig.channelConfig,
            mainConfig : this._starterConfig.mainConfig,
            errorConfig : this._starterConfig.errorConfig,
            eventConfig : this._starterConfig.eventConfig,
            serviceConfig : this._starterConfig.serviceConfig
        };

        return {
            mainConfig: this._mainConfig,
            starterConfig : starterConfigMain,
            internalData: this._internalData,
            rootPath : this.rootPath,
            startMode : this.startMode
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

    addToMainConfig(toAdd: object, overwrite: boolean, onlyAddKeys: object | undefined): void {
        if (onlyAddKeys === undefined) {
            ObjectTools.addObToOb(this._mainConfig, toAdd, overwrite);
        } else {
            ObjectTools.onlyAddObToOb(this._mainConfig, toAdd, overwrite, onlyAddKeys);
        }
    }

    getVerifyKey(): any {
        return this._mainConfig.authPublicKey || this._mainConfig.authKey;
    }

    getSignKey(): any {
        return this._mainConfig.authPrivateKey || this._mainConfig.authKey;
    }

    getZationInfo(): ZationInfo {
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
        this._serviceConfig = ZationConfig.loadScript(this._configScriptSaver.serviceConfig,this.starterConfig.serviceConfig);
    }

    async loadOtherConfigScripts(): Promise<void> {
        this._configScriptSaver = {};
        let promises: Promise<void>[] = [];
        //Add Other Configs
        promises.push((async () => {
            try {
                this._configScriptSaver.eventConfig = await ZationConfig.loadZationConfig(
                    'event.config',
                    this._starterConfig.eventConfig,
                );
                if(!this._workerProcess){
                    this._loadedConfigs.push(nameof<StarterConfig>(s => s.eventConfig));
                }
            }
            catch (e) {}
        })());
        promises.push((async () => {
            try {
                this._configScriptSaver.channelConfig = await ZationConfig.loadZationConfig(
                    'channel.config',
                    this._starterConfig.channelConfig,
                );
                if(!this._workerProcess){
                    this._loadedConfigs.push(nameof<StarterConfig>(s => s.channelConfig));
                }
            }
            catch (e) {}
        })());
        promises.push((async () => {
            try {
                this._configScriptSaver.appConfig = await ZationConfig.loadZationConfig(
                    'app.config',
                    this._starterConfig.appConfig,
                );
                if(!this._workerProcess){
                    this._loadedConfigs.push(nameof<StarterConfig>(s => s.appConfig));
                }

            }
            catch (e) {}
        })());
        promises.push((async () => {
            try {
                this._configScriptSaver.errorConfig = await ZationConfig.loadZationConfig(
                    'error.config',
                    this._starterConfig.errorConfig,
                );
                if(!this._workerProcess){
                    this._loadedConfigs.push(nameof<StarterConfig>(s => s.errorConfig));
                }
            }
            catch (e) {}
        })());
        promises.push((async () => {
            try {
                this._configScriptSaver.serviceConfig = await ZationConfig.loadZationConfig(
                    'service.config',
                    this._starterConfig.serviceConfig,
                );
                if(!this._workerProcess){
                    this._loadedConfigs.push(nameof<StarterConfig>(s => s.serviceConfig));
                }

            }
            catch (e) {}
        })());
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

    private static _getRootPath(starterConfig : StarterConfig) : any
    {
        if(starterConfig.rootPath){
            return starterConfig.rootPath;
        }

        //@ts-ignore
        let tmpPath = path.dirname(require.main.filename || process.mainModule.filename);

        if(tmpPath.indexOf(path.sep+'node_modules'+path.sep) === -1) {
            //typescript/javascript project normal start
            return tmpPath;
        }
        else {
            //test start
            tmpPath = tmpPath.split(path.sep+'node_modules')[0];
            if(!fs.existsSync(tmpPath+path.sep+'package.json')) {
                throw new Error('Root path can not be resolved');
            }
            if(fs.existsSync(tmpPath+path.sep+'dist')){
                tmpPath = tmpPath+path.sep+'dist';
            }
        }
        return tmpPath;
    }

    getRootPath() : string {
        return this.rootPath;
    }

    static async loadZationConfig(name : string,value : any) : Promise<string | object>
    {
        return await new Promise<string | object>(((resolve, reject) => {
            if(typeof value === 'string') {
                if(value.lastIndexOf('.js') === -1) {
                    value += '.js';
                }
                fs.stat(value,async (err) =>
                {
                    if(err) {
                        reject(new Error(`Config ${name} not found in path ${value}`));
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
                reject(new Error(`Error to load Config ${name}`));
            }
        }));
    }

    static createValueWithOsAuto(checkValue : any)
    {
        let result = 1;
        if(checkValue === OPTION_AUTO || checkValue === OPTION_HALF_AUTO) {
            result = require('os').cpus().length;
            if(checkValue === OPTION_HALF_AUTO){
                result/=2;
            }
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

    async checkAuthenticationMiddlewareEvent(event : Function | undefined,next : Function,smallBag : SmallBag,zationTokenInfo : ZationTokenInfo) : Promise<boolean> {
        return await this.checkMiddlewareEvent(event,next,smallBag,zationTokenInfo);
    }

    // noinspection JSMethodCanBeStatic
    async emitEvent(event : Function | Function[] | undefined,...params : any[]) : Promise<void> {
        await FuncTools.emitEvent(event,...params);
    }

    private loadUserDataLocations() : void {
        this.loadZationConfigLocation(nameof<StarterConfig>(s => s.mainConfig));
        this.loadZationConfigLocation(nameof<StarterConfig>(s => s.appConfig));
        this.loadZationConfigLocation(nameof<StarterConfig>(s => s.channelConfig));
        this.loadZationConfigLocation(nameof<StarterConfig>(s => s.errorConfig));
        this.loadZationConfigLocation(nameof<StarterConfig>(s => s.eventConfig));
        this.loadZationConfigLocation(nameof<StarterConfig>(s => s.serviceConfig));
    }

    private loadZationConfigLocation(key : string) : void
    {
        const cPath = this.rootPath + path.sep +
            (this._starterConfig.configs ? this._starterConfig.configs : 'configs') + path.sep;
        this._starterConfig[key] =  cPath + this._starterConfig[key];
    }

    private async loadMainConfig() : Promise<void>
    {
        try {
            const mainConfig = ZationConfig.loadScript(await ZationConfig.loadZationConfig(
                'main.config',
                this._starterConfig.mainConfig
            ),this._starterConfig.mainConfig);
            ObjectTools.addObToOb(this._mainConfig,mainConfig,true);
            this._loadedConfigs.push(nameof<StarterConfig>(s => s.mainConfig));
        }
        catch (e) {}
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
        const pathTmp : any = this._mainConfig.path;
        if(typeof pathTmp === 'string' && (pathTmp.charAt(0) !== '/' && pathTmp.charAt(0) !== '\\')) {
            this._mainConfig.path = path.sep + pathTmp;
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

    get loadedConfigs(): string[] {
        return this._loadedConfigs;
    }
}