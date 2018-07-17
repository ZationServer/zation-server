/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import Const             = require('../helper/constants/constWrapper');
import ObjectTools       = require('../helper/tools/objectTools');

import path              = require('path');
import fs                = require('fs');
import crypto            = require('crypto');
import ZationInfoObj     = require("../helper/infoObjects/zationInfo");
import Structures        = require('./../helper/config/structures');
import FuncTools         = require("../helper/tools/funcTools");

class ZationConfig
{
    private eventConfig : object = {};
    private appConfig : object = {};
    private channelConfig : object = {};
    private errorConfig : object = {};
    private readonly mainConfig : object = {};
    private serviceConfig : object = {};
    private readonly starterConfig : object = {};

    constructor(data : object = {},workerTransport : boolean = false)
    {

        if(!workerTransport)
        {
            this.starterConfig = data;

            //Create Defaults
            this.mainConfig[Const.Main.KEYS.DEBUG] = false;
            this.mainConfig[Const.Main.KEYS.START_DEBUG] = false;
            this.mainConfig[Const.Main.KEYS.SHOW_CONFIG_WARNINGS] = true;
            this.mainConfig[Const.Main.KEYS.PORT] = process.env.PORT || 3000;
            this.mainConfig[Const.Main.KEYS.HOSTNAME] = 'localhost';
            this.mainConfig[Const.Main.KEYS.ENVIRONMENT] = 'dev';
            this.mainConfig[Const.Main.KEYS.POST_KEY_WORD] = 'zation';
            this.mainConfig[Const.Main.KEYS.PATH] = 'zation';
            this.mainConfig[Const.Main.KEYS.USE_AUTH] = true;
            this.mainConfig[Const.Main.KEYS.APP_NAME] = 'AppWithoutName';
            this.mainConfig[Const.Main.KEYS.SECURE] = false;
            this.mainConfig[Const.Main.KEYS.USE_PROTOCOL_CHECK] = true;
            this.mainConfig[Const.Main.KEYS.SEND_ERRORS_DESC] = false;
            this.mainConfig[Const.Main.KEYS.AUTH_KEY] = crypto.randomBytes(32).toString('hex');
            this.mainConfig[Const.Main.KEYS.AUTH_PUBLIC_KEY] = null;
            this.mainConfig[Const.Main.KEYS.AUTH_PRIVATE_KEY] = null;
            this.mainConfig[Const.Main.KEYS.AUTH_DEFAULT_EXPIRY] = 86400;
            this.mainConfig[Const.Main.KEYS.SYSTEM_BACKGROUND_TASK_REFRESH_RATE] = 1800000;
            this.mainConfig[Const.Main.KEYS.TIME_ZONE] = 'Europe/Berlin';
            this.mainConfig[Const.Main.KEYS.AUTH_START] = false;
            this.mainConfig[Const.Main.KEYS.AUTH_START_DURATION_MS] = 20000;
            this.mainConfig[Const.Main.KEYS.WORKERS] = Const.Main.OPTIONS.AUTO;
            this.mainConfig[Const.Main.KEYS.ZATION_CONSOLE_LOG] = true;
            this.mainConfig[Const.Main.KEYS.SC_CONSOLE_LOG] = false;

            //TEMP
            this.mainConfig[Const.Main.KEYS.USE_TEMP_DB_TOKEN_INFO] = true;
            this.mainConfig[Const.Main.KEYS.USE_TEMP_DB_ERROR_INFO] = true;
            this.mainConfig[Const.Main.KEYS.TEMP_DB_ERROR_INFO_LIVE_TIME] = 3600000;
            this.mainConfig[Const.Main.KEYS.TEMP_DB_ENGINE] = Const.Main.TEMP_DB_ENGINE.MASTER_MEMORY;
            this.mainConfig[Const.Main.KEYS.EXTRA_SECURE_AUTH] = true;
            this.mainConfig[Const.Main.KEYS.TEMP_DB_Name] = 'zationTempDb';

            this.loadUserDataLocations();
            this.loadMainConfig();

            this.addToMainConfig
            (this.starterConfig,true,Structures.Main);

            this.processMainConfig();
        }
        else
        {
            this.starterConfig = data['starterConfig'];
            this.mainConfig = data['mainConfig'];
        }
    }

    getWorkerTransport() : object
    {
        return {mainConfig : this.mainConfig,starterConfig : this.starterConfig};
    }

    isDebug() : boolean
    {
        return this.getMain(Const.Main.KEYS.DEBUG);
    }

    isStartDebug() : boolean
    {
        return this.getMain(Const.Main.KEYS.START_DEBUG);
    }

    isShowConfigWarning() : boolean
    {
        return this.getMain(Const.Main.KEYS.SHOW_CONFIG_WARNINGS);
    }

    isUsePanel() : boolean
    {
        return this.getMain(Const.Main.KEYS.USE_PANEL);
    }

    addToMainConfig(toAdd : object,overwrite : boolean,onlyAddKeys ?: object) : void
    {
        if(onlyAddKeys === undefined) {
            ObjectTools.addObToOb(this.mainConfig,toAdd,overwrite);
        }
        else {
            ObjectTools.onlyAddObToOb(this.mainConfig,toAdd,overwrite,onlyAddKeys);
        }
    }

    getStarter(key : any) : any
    {
        return this.starterConfig[key];
    }

    getStarterConfig() : object
    {
        return this.starterConfig;
    }

    getMain(key : any) : any
    {
        return this.mainConfig[key];
    }

    isMain(key : any) : boolean
    {
        return this.mainConfig[key] !== undefined;
    }

    getMainConfig() : object
    {
        return this.mainConfig;
    }

    getService(key : any) : any
    {
        return this.serviceConfig[key];
    }

    isService(key : any) : boolean
    {
        return this.serviceConfig[key] !== undefined;
    }

    getServiceConfig() : object
    {
        return this.serviceConfig;
    }

    getChannel(key : any) : any
    {
        return this.channelConfig[key];
    }

    isChannel(key : any) : boolean
    {
        return this.channelConfig[key] !== undefined;
    }

    getChannelConfig() : object
    {
        return this.channelConfig;
    }

    getEvent(key : any) : any
    {
        return this.eventConfig[key];
    }

    isEvent(key : any) : boolean
    {
        return this.eventConfig[key] !== undefined;
    }

    getEventConfig() : object
    {
        return this.eventConfig;
    }

    getApp(key : any) : any
    {
        return this.appConfig[key];
    }

    isApp(key : any) : boolean
    {
        return this.appConfig[key] !== undefined;
    }

    getAppConfig() : object
    {
        return this.appConfig;
    }

    getVerifyKey() : any
    {
        if(this.getMain(Const.Main.KEYS.AUTH_PUBLIC_KEY) !== null)
        {
            return this.getMain(Const.Main.KEYS.AUTH_PUBLIC_KEY);
        }
        else
        {
            return this.getMain(Const.Main.KEYS.AUTH_KEY);
        }
    }

    getSignKey() : any
    {
        if(this.getMain(Const.Main.KEYS.AUTH_PRIVATE_KEY) !== null)
        {
            return this.getMain(Const.Main.KEYS.AUTH_PRIVATE_KEY);
        }
        else
        {
            return this.getMain(Const.Main.KEYS.AUTH_KEY);
        }
    }

    isExtraSecureAuth() : boolean
    {
        return this.getMain(Const.Main.KEYS.EXTRA_SECURE_AUTH);
    }

    isUseTokenInfoTempDb() : boolean
    {
        return this.getMain(Const.Main.KEYS.USE_TEMP_DB_TOKEN_INFO);
    }

    isUseErrorInfoTempDb() : boolean
    {
        return this.getMain(Const.Main.KEYS.USE_TEMP_DB_ERROR_INFO);
    }

    getSomeInformation() : ZationInfoObj
    {
        return new ZationInfoObj(this);
    }

    loadOtherConfigs() : void
    {
        //Add Other Configs
        this.eventConfig = ZationConfig.loadZationConfig
        (
            'event.config',
            this.getStarter(Const.Starter.KEYS.EVENT_CONFIG),
        );

        this.channelConfig = ZationConfig.loadZationConfig
        (
            'channel.config',
            this.getStarter(Const.Starter.KEYS.CHANNEL_CONFIG),
        );

        this.appConfig = ZationConfig.loadZationConfig
        (
            'app.config',
            this.getStarter(Const.Starter.KEYS.APP_CONFIG),
            false
        );

        this.errorConfig = ZationConfig.loadZationConfig
        (
            'error.config',
            this.getStarter(Const.Starter.KEYS.ERROR_CONFIG),
        );

        this.serviceConfig = ZationConfig.loadZationConfig
        (
            'service.config',
            this.getStarter(Const.Starter.KEYS.SERVICE_CONFIG),
        );
    }

    static _getRootPath() : any
    {
        // noinspection JSUnresolvedVariable
        //@ts-ignore
        return path.dirname(require.main.filename || process.mainModule.filename);
    }

    static loadZationConfig(name : string,value : any,optional : boolean = true) : object
    {
        if(typeof value === 'string')
        {
            if(value.lastIndexOf('.js') === -1) {
                value += '.js';
            }

            if(fs.existsSync(value)) {
                return require(value);
            }
            else if(optional) {
                return {};
            }
            else {
                throw new Error(`Config ${name} not found in path ${path}`);
            }
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

    }

    static createValueWithOsAuto(checkValue : any)
    {
        let result = 1;
        if(checkValue !== undefined &&
            checkValue === Const.Main.OPTIONS.AUTO)
        {
            result = require('os').cpus().length;
        }
        else if(checkValue !== undefined)
        {
            result = checkValue;
        }
        return result;
    }

    checkMiddlewareEvent(event : string,req : object,next : Function) : boolean
    {
        let func = this.getEvent(event);
        return FuncTools.checkMiddlewareFunc(func,req,next);
    }

    async emitEvent(event : string,...params : any[]) : Promise<void>
    {
        await FuncTools.emitEvent(this.getEvent(event),...params);
    }

    private loadUserDataLocations() : void
    {
        this.loadZationConfigLocation(Const.Starter.KEYS.MAIN_CONFIG,'main.config');
        this.loadZationConfigLocation(Const.Starter.KEYS.APP_CONFIG,'app.config');
        this.loadZationConfigLocation(Const.Starter.KEYS.CHANNEL_CONFIG,'channel.config');
        this.loadZationConfigLocation(Const.Starter.KEYS.ERROR_CONFIG,'error.config');
        this.loadZationConfigLocation(Const.Starter.KEYS.EVENT_CONFIG,'event.config');
        this.loadZationConfigLocation(Const.Starter.KEYS.SERVICE_CONFIG,'service.config');

        if(!this.starterConfig.hasOwnProperty(Const.Starter.KEYS.CONTROLLER))
        {
            this.starterConfig[Const.Starter.KEYS.CONTROLLER] = ZationConfig._getRootPath() + '/controller';
        }
    }

    private loadZationConfigLocation(key : string,defaultName : string) : void
    {
        if(!this.starterConfig.hasOwnProperty(key)) {
            if(this.starterConfig.hasOwnProperty(Const.Starter.KEYS.CONFIG)) {
                this.starterConfig[key] =  this.starterConfig[Const.Starter.KEYS.CONFIG] + '/' + defaultName;
            }
            else {
                this.starterConfig[key] = ZationConfig._getRootPath() + '/config/' + defaultName;
            }
        }
        else
        {
            const value = this.getStarter(key);
            if(typeof value === "string" && this.starterConfig.hasOwnProperty(Const.Starter.KEYS.CONFIG))
            {
                const configLocation = this.starterConfig[key];
                const configPath = this.starterConfig[Const.Starter.KEYS.CONFIG];
                this.starterConfig[key] =  configPath + '/' + configLocation;
            }
        }
    }

    private loadMainConfig() : void
    {
        let mainConfig = ZationConfig.loadZationConfig
        (
            'main.config',
            this.starterConfig[Const.Starter.KEYS.MAIN_CONFIG]
        );

        ObjectTools.addObToOb(this.mainConfig,mainConfig,true);
    }

    private processMainConfig() : void
    {
        //Workers Default
        this.mainConfig[Const.Main.KEYS.WORKERS] =
            ZationConfig.createValueWithOsAuto(this.mainConfig[Const.Main.KEYS.WORKERS]);

        //Brokers Default
        this.mainConfig[Const.Main.KEYS.BROKERS] =
            ZationConfig.createValueWithOsAuto(this.mainConfig[Const.Main.KEYS.BROKERS]);
    }
}

export = ZationConfig;