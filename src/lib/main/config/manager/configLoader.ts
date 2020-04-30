/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {StarterConfig}     from "../definitions/main/starterConfig";
import ObjectUtils         from "../../utils/objectUtils";
import fs                = require('fs');
import path              = require('path');
import {InternalMainConfig, OPTION_AUTO, OPTION_HALF_AUTO} from "../definitions/main/mainConfig";
import ConfigLocations     from "./configLocations";
import crypto            = require('crypto');
const  uuidV4            = require('uuid/v4');
const  os                = require('os');
import moment            = require('moment-timezone');
import {AppConfig}        from "../definitions/main/appConfig";
import {ServiceConfig}    from "../definitions/main/serviceConfig";
import {OtherLoadedConfigSet} from "./configSets";
import ConfigBuildError       from "./configBuildError";
import FuncUtils              from '../../utils/funcUtils';
import { keys }               from 'ts-transformer-keys';

export default class ConfigLoader {

    //defaults...
    private readonly _starterConfig: StarterConfig = {
        checkConfigs: true,
        mainConfig: 'main.config',
        appConfig: 'app.config',
        serviceConfig: 'service.config'
    };

    private _mainConfig: InternalMainConfig = {
        debug: false,
        startDebug: false,
        killOnStartFailure: true,
        showConfigWarnings: true,
        port: 3000,
        hostname: 'localhost',
        environment: 'prod',
        path: '/zation',
        useTokenStateCheck: true,
        appName: 'AppWithoutName',
        secure: false,
        sendErrorDescription: false,
        authSecretKey: crypto.randomBytes(32).toString('hex'),
        authPublicKey: null,
        authPrivateKey: null,
        authDefaultExpiry: 86400,
        validationCheckLimit: 50,
        socketDataboxLimit: 30,
        timeZone: moment.tz.guess() || 'Europe/Berlin',
        authStart: false,
        authStartDuration: 20000,
        workers: OPTION_AUTO,
        brokers: OPTION_HALF_AUTO,
        wsEngine: 'z-uws',
        defaultClientApiLevel: 1,
        clusterAuthKey: null,
        stateServerHost: null,
        stateServerPort: null,
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
        scOrigins: null,
        pingInterval: 8000,
        pingTimeout: 20000,
        processTermTimeout: 10000,
        propagateErrors: true,
        propagateWarnings: true,
        middlewareEmitWarnings: false,
        rebootOnSignal: true,
        downgradeToUser: false,
        allowClientPublish: true,
        workerStatusInterval: 10000,
        clusterShareTokenAuth: true,
        instanceId: uuidV4(),
        useTokenClusterKeyCheck: true,
        provideClientJs: true,
        usePanel: false,
        killServerOnServicesCreateError: false,
        log: {
            console: {
                active: true,
                logLevel: 6,
            },
            file: {
                active: false,
                logLevel: 5,
                filePath: '',
                download: {
                    active: true,
                    accessKey: ''
                }
            },
            core: {
                active: false,
                logLevel: 2
            }
        },
        showPrecompiledConfigs: false,
        variables: {}
    };

    private _appConfig: AppConfig = {};
    private _serviceConfig: ServiceConfig = {};

    private readonly rootPath: string;
    private readonly _configLocations: ConfigLocations;

    private readonly _loadedConfigs: string[] = [];

    constructor(starterConfig: StarterConfig) {
        ObjectUtils.deepMergeTwoObjects(this._starterConfig,starterConfig,true);
        this.rootPath = ConfigLoader._getRootPath(this._starterConfig);

        this._configLocations = this.loadUserDataLocations();
    }

    private static _getRootPath(starterConfig: StarterConfig): any
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

    private loadUserDataLocations(): ConfigLocations {
        return {
            mainConfig: this.loadZationConfigLocation(nameof<StarterConfig>(s => s.mainConfig)),
            appConfig: this.loadZationConfigLocation(nameof<StarterConfig>(s => s.appConfig)),
            serviceConfig: this.loadZationConfigLocation(nameof<StarterConfig>(s => s.serviceConfig))
        };
    }

    private loadZationConfigLocation(key: string): string {
        const cPath = this.rootPath + path.sep +
            (this._starterConfig.configs ? this._starterConfig.configs: 'configs') + path.sep;
        return cPath + this._starterConfig[key];
    }

    /**
     * Function for loading other configs on a worker.
     * @param configLocations
     */
    static loadOtherConfigsSafe(configLocations: ConfigLocations): OtherLoadedConfigSet {
        return {
            appConfig: FuncUtils.callSafe(ConfigLoader.loadConfig,[configLocations.appConfig],{}),
            serviceConfig: FuncUtils.callSafe(ConfigLoader.loadConfig,[configLocations.serviceConfig],{})
        };
    }

    async loadMainConfig(): Promise<void>
    {
        try {
            const mainConfig = ConfigLoader.loadConfig(this._configLocations.mainConfig);
            ObjectUtils.deepMergeTwoObjects(this._mainConfig,mainConfig,true);
            this._loadedConfigs.push(nameof<StarterConfig>(s => s.mainConfig));
        }
        catch (e) {}

        //load starter config to main.
        ObjectUtils.deepMergeTwoObjects(this._mainConfig,
            ObjectUtils.filterObjectProps(this._starterConfig,keys<InternalMainConfig>()),true);

        this.readMainConfigEnvVariables();

        this.processMainConfig();
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

    /**
     * Function for loading other configs on the master.
     */
    async loadOtherConfigs() {
        try {
            this._appConfig = ConfigLoader.loadConfig(this._configLocations.appConfig);
            this._loadedConfigs.push(nameof<StarterConfig>(s => s.appConfig));
        }
        catch (e) {ConfigLoader.throwErrIfConfigFail(e)}
        try {
            this._serviceConfig = ConfigLoader.loadConfig(this._configLocations.serviceConfig);
            this._loadedConfigs.push(nameof<StarterConfig>(s => s.serviceConfig));
        }
        catch (e) {ConfigLoader.throwErrIfConfigFail(e)}
    }

    /**
     * This function is used to load a configuration.
     * It will consider the export style and undefined export.
     * @param path
     */
    private static loadConfig(path: string): any {
        const value = require(path);
        if(typeof value === 'object') {
            return typeof value['default'] === 'object' ? value['default']: value;
        }
        throw new Error(`The configuration: ${path} does not export an object.`);
    }

    static throwErrIfConfigFail(err) {
        if(err instanceof ConfigBuildError || err.code !== 'MODULE_NOT_FOUND'){
            throw err;
        }
    }

    getRootPath(): string {
        return this.rootPath;
    }

    private processMainConfig(): void
    {
        //Workers Default
        this._mainConfig.workers =
            ConfigLoader.createValueWithOsAuto(this._mainConfig.workers);

        //Brokers Default
        this._mainConfig.brokers =
            ConfigLoader.createValueWithOsAuto(this._mainConfig.brokers);

        //path slash check
        const pathTmp: any = this._mainConfig.path;
        if(typeof pathTmp === 'string' && (pathTmp.charAt(0) !== '/' && pathTmp.charAt(0) !== '\\')) {
            this._mainConfig.path = path.sep + pathTmp;
        }
    }

    private static createValueWithOsAuto(checkValue: any) {
        let result = 1;
        if(checkValue === OPTION_AUTO || checkValue === OPTION_HALF_AUTO) {
            result = os.cpus().length;
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

    get serviceConfig(): ServiceConfig {
        return this._serviceConfig;
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