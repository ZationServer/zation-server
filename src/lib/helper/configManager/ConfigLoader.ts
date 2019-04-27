/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import {StarterConfig}     from "../configDefinitions/starterConfig";
import ObjectUtils         from "../utils/objectUtils";
import fs                = require('fs');
import path              = require('path');
import {InternalMainConfig, OPTION_AUTO, OPTION_HALF_AUTO} from "../configDefinitions/mainConfig";
import ConfigLocations     from "./configLocations";
import crypto            = require('crypto');
const  uuidV4            = require('uuid/v4');
import nodeEval          = require('node-eval');
import moment            = require('moment-timezone');
import {ConfigScriptSave} from "../constants/internal";
import {EventConfig}      from "../configDefinitions/eventConfig";
import {AppConfig}        from "../configDefinitions/appConfig";
import {ChannelConfig}    from "../configDefinitions/channelConfig";
import {ServiceConfig}    from "../configDefinitions/serviceConfig";
import {Structures}       from "../configDefinitions/structures";
import {FullLoadedConfigSet, OtherLoadedConfigSet} from "./configSets";

export default class ConfigLoader {

    //defaults...
    private readonly _starterConfig: StarterConfig = {
        checkConfigs : true,
        mainConfig : 'main.config',
        appConfig : 'app.config',
        channelConfig : 'channel.config',
        errorConfig : 'error.config',
        eventConfig : 'event.config',
        serviceConfig : 'service.config'
    };

    private _mainConfig : InternalMainConfig = {
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

    private _eventConfig: EventConfig = {};
    private _appConfig: AppConfig = {};
    private _channelConfig: ChannelConfig = {};
    private _serviceConfig: ServiceConfig = {};

    private readonly rootPath : string;
    private readonly _configLocations : ConfigLocations;

    private readonly _loadedConfigs : string[] = [];

    constructor(starterConfig : StarterConfig) {
        ObjectUtils.addObToOb(this._starterConfig,starterConfig,true);
        this.rootPath = ConfigLoader._getRootPath(this._starterConfig);

        this._configLocations = this.loadUserDataLocations();
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

    getFullLoadedConfigs() : FullLoadedConfigSet {
        return {
            starterConfig : this._starterConfig,
            mainConfig : this._mainConfig,
            appConfig : this._appConfig,
            channelConfig : this._channelConfig,
            eventConfig : this._eventConfig,
            serviceConfig : this._serviceConfig
        };
    }

    getOtherLoadedConfigs() : OtherLoadedConfigSet {
        return {
            appConfig : this._appConfig,
            channelConfig : this._channelConfig,
            eventConfig : this._eventConfig,
            serviceConfig : this._serviceConfig
        }
    }

    private loadUserDataLocations() : ConfigLocations {
        return {
            mainConfig : this.loadZationConfigLocation(nameof<StarterConfig>(s => s.mainConfig)),
            appConfig : this.loadZationConfigLocation(nameof<StarterConfig>(s => s.appConfig)),
            channelConfig : this.loadZationConfigLocation(nameof<StarterConfig>(s => s.channelConfig)),
            eventConfig : this.loadZationConfigLocation(nameof<StarterConfig>(s => s.eventConfig)),
            serviceConfig : this.loadZationConfigLocation(nameof<StarterConfig>(s => s.serviceConfig))
        };
    }

    private loadZationConfigLocation(key : string) : string {
        const cPath = this.rootPath + path.sep +
            (this._starterConfig.configs ? this._starterConfig.configs : 'configs') + path.sep;
        return cPath + this._starterConfig[key];
    }

    static async loadOtherConfigs(configLocations : ConfigLocations) : Promise<OtherLoadedConfigSet> {
        const configScriptSave : ConfigScriptSave = {};
        const promises: Promise<void>[] = [];

        promises.push((async () => {
            try {
                configScriptSave.eventConfig = await ConfigLoader.loadZationConfig(
                    'event.config',
                    configLocations.eventConfig,
                );
            }
            catch (e) {}
        })());
        promises.push((async () => {
            try {
                configScriptSave.channelConfig = await ConfigLoader.loadZationConfig(
                    'channel.config',
                    configLocations.channelConfig,
                );
            }
            catch (e) {}
        })());
        promises.push((async () => {
            try {
                configScriptSave.appConfig = await ConfigLoader.loadZationConfig(
                    'app.config',
                    configLocations.appConfig,
                );
            }
            catch (e) {}
        })());
        promises.push((async () => {
            try {
                configScriptSave.serviceConfig = await ConfigLoader.loadZationConfig(
                    'service.config',
                    configLocations.serviceConfig,
                );
            }
            catch (e) {}
        })());
        await Promise.all(promises);

        return {
            eventConfig : ConfigLoader.loadScript(configScriptSave.eventConfig,configLocations.eventConfig),
            channelConfig : ConfigLoader.loadScript(configScriptSave.channelConfig,configLocations.channelConfig),
            appConfig : ConfigLoader.loadScript(configScriptSave.appConfig,configLocations.appConfig),
            serviceConfig : ConfigLoader.loadScript(configScriptSave.serviceConfig,configLocations.serviceConfig)
        };
    }

    async loadMainConfig() : Promise<void>
    {
        try {
            const mainConfig = ConfigLoader.loadScript(await ConfigLoader.loadZationConfig(
                'main.config',
                this._configLocations.mainConfig
            ),this._configLocations.mainConfig);
            ObjectUtils.addObToOb(this._mainConfig,mainConfig,true);
            this._loadedConfigs.push(nameof<StarterConfig>(s => s.mainConfig));

            //load starter config to main.
            ObjectUtils.onlyAddObToOb(this._mainConfig,this._starterConfig,true,Structures.Main);

            this.readMainConfigEnvVariables();

            this.processMainConfig();
        }
        catch (e) {}
    }

    private readMainConfigEnvVariables() {
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
    }

    async loadOtherConfigs() {
        const scriptSaver = await this.loadOtherConfigScripts();
        this._eventConfig = ConfigLoader.loadScript(scriptSaver.eventConfig,this._configLocations.eventConfig);
        this._channelConfig = ConfigLoader.loadScript(scriptSaver.channelConfig,this._configLocations.channelConfig);
        this._appConfig = ConfigLoader.loadScript(scriptSaver.appConfig,this._configLocations.appConfig);
        this._serviceConfig = ConfigLoader.loadScript(scriptSaver.serviceConfig,this._configLocations.serviceConfig);
    }

    private async loadOtherConfigScripts(): Promise<ConfigScriptSave> {
        let configScriptSave : ConfigScriptSave = {};
        let promises: Promise<void>[] = [];
        //Add Other Configs
        promises.push((async () => {
            try {
                configScriptSave.eventConfig = await ConfigLoader.loadZationConfig(
                    'event.config',
                    this._configLocations.eventConfig,
                );
                this._loadedConfigs.push(nameof<StarterConfig>(s => s.eventConfig));
            }
            catch (e) {}
        })());
        promises.push((async () => {
            try {
                configScriptSave.channelConfig = await ConfigLoader.loadZationConfig(
                    'channel.config',
                    this._configLocations.channelConfig,
                );
                this._loadedConfigs.push(nameof<StarterConfig>(s => s.channelConfig));
            }
            catch (e) {}
        })());
        promises.push((async () => {
            try {
                configScriptSave.appConfig = await ConfigLoader.loadZationConfig(
                    'app.config',
                    this._configLocations.appConfig,
                );
                this._loadedConfigs.push(nameof<StarterConfig>(s => s.appConfig));

            }
            catch (e) {}
        })());
        promises.push((async () => {
            try {
                configScriptSave.serviceConfig = await ConfigLoader.loadZationConfig(
                    'service.config',
                    this._configLocations.serviceConfig,
                );
                this._loadedConfigs.push(nameof<StarterConfig>(s => s.serviceConfig));

            }
            catch (e) {}
        })());
        await Promise.all(promises);
        return configScriptSave;
    }

    static loadScript(script : object | string | undefined,relativePath : string | undefined) : any
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

    private processMainConfig() : void
    {
        //Workers Default
        this._mainConfig.workers =
            ConfigLoader.createValueWithOsAuto(this._mainConfig.workers);

        //Brokers Default
        this._mainConfig.brokers =
            ConfigLoader.createValueWithOsAuto(this._mainConfig.brokers);

        //path slash check
        const pathTmp : any = this._mainConfig.path;
        if(typeof pathTmp === 'string' && (pathTmp.charAt(0) !== '/' && pathTmp.charAt(0) !== '\\')) {
            this._mainConfig.path = path.sep + pathTmp;
        }
    }

    private static createValueWithOsAuto(checkValue : any) {
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

    get loadedConfigs(): string[] {
        return this._loadedConfigs;
    }

    get channelConfig(): ChannelConfig {
        return this._channelConfig;
    }

    get serviceConfig(): ServiceConfig {
        return this._serviceConfig;
    }

    get eventConfig(): EventConfig {
        return this._eventConfig;
    }

    get appConfig(): AppConfig {
        return this._appConfig;
    }

    get starterConfig(): StarterConfig {
        return this._starterConfig;
    }

    get mainConfig(): InternalMainConfig {
        return this._mainConfig;
    }

    get configLocations(): ConfigLocations {
        return this._configLocations;
    }
}