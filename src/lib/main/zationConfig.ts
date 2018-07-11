/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

const Const             = require('../helper/constants/constWrapper');
const ObjectTools       = require('../helper/tools/objectTools');

const path              = require('path');
const fs                = require('fs');
const crypto            = require('crypto');

class ZationConfig
{
    private eventConfig : object = {};
    private appConfig : object = {};
    private channelConfig : object = {};
    private errorConfig : object = {};
    private mainConfig : object = {};
    private serviceConfig : object = {};

    constructor(starterConfig : object,workerTransport : boolean = false)
    {

        if(!workerTransport)
        {
            //Create Defaults
            this.mainConfig[Const.Main.KEYS.DEBUG] = false;
            this.mainConfig[Const.Main.KEYS.START_DEBUG] = false;
            this.mainConfig[Const.Main.KEYS.SHOW_CONFIG_WARNINGS] = true;
            this.mainConfig[Const.Main.KEYS.PORT] = process.env.PORT || 3000;
            this.mainConfig[Const.Main.KEYS.HOSTNAME] = 'localhost';
            this.mainConfig[Const.Main.KEYS.ENVIRONMENT] = 'dev';
            this.mainConfig[Const.Main.KEYS.POST_KEY_WORD] = 'zation';
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

            //TEMP
            this.mainConfig[Const.Main.KEYS.USE_TEMP_DB_TOKEN_INFO] = true;
            this.mainConfig[Const.Main.KEYS.USE_TEMP_DB_ERROR_INFO] = true;
            this.mainConfig[Const.Main.KEYS.TEMP_DB_ERROR_INFO_LIVE_TIME] = 3600000;
            this.mainConfig[Const.Main.KEYS.TEMP_DB_ENGINE] = Const.Main.TEMP_DB_ENGINE.MASTER_MEMORY;
            this.mainConfig[Const.Main.KEYS.EXTRA_SECURE_AUTH] = true;
            this.mainConfig[Const.Main.KEYS.TEMP_DB_Name] = 'zationTempDb';

            this.addToMainConfig(starterConfig,true);
            this.loadUserDataLocations();
            this.loadMainConfig();
            this.processMainConfig();
        }
        else
        {
            this.mainConfig = starterConfig;
        }
    }

    getWorkerTransport() : object
    {
        return {mainConfig : this.mainConfig};
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

    addToMainConfig(toAdd : object,overwrite : boolean) : void
    {
        ObjectTools.addObToOb(this.mainConfig,toAdd,overwrite);
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

    getSomeInformation() : object
    {
        let obj = {};
        obj['port'] = this.getMain(Const.Main.KEYS.PORT);
        obj['appName'] = this.getMain(Const.Main.KEYS.APP_NAME);
        return obj;
    }

    loadOtherConfigs() : void
    {
        //Add Other Configs
        this.eventConfig = ZationConfig.loadZationConfig
        (
            'event.config',
            this.getMain(Const.Main.KEYS.EVENT_CONFIG),
        );

        this.channelConfig = ZationConfig.loadZationConfig
        (
            'channel.config',
            this.getMain(Const.Main.KEYS.CHANNEL_CONFIG),
        );

        this.appConfig = ZationConfig.loadZationConfig
        (
            'app.config',
            this.getMain(Const.Main.KEYS.APP_CONFIG),
            false
        );

        this.errorConfig = ZationConfig.loadZationConfig
        (
            'error.config',
            this.getMain(Const.Main.KEYS.ERROR_CONFIG),
        );

        this.serviceConfig = ZationConfig.loadZationConfig
        (
            'service.config',
            this.getMain(Const.Main.KEYS.SERVICE_CONFIG),
        );
    }

    static _getRootPath() : any
    {
        // noinspection JSUnresolvedVariable
        //@ts-ignore
        return path.dirname(require.main.filename || process.mainModule.filename);
    }

    static loadZationConfig(name : string,path : string,optional : boolean = true) : object
    {
        if(fs.existsSync(path+'.js'))
        {
            return require(path);
        }
        else if(optional)
        {
            return {};
        }
        else
        {
            throw new Error(`Config ${name} not found in path ${path}`);
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

    static emitEvent(func : Function | Function[],howToEmit : Function = (f) => {f();}) : void
    {
        if(func !== undefined && typeof func === 'function')
        {
            howToEmit(func);
        }
        else if(Array.isArray(func))
        {
            for(let i = 0; i < func.length; i++)
            {
                ZationConfig.emitEvent(func[i],howToEmit);
            }
        }
    }

    static checkMiddlewareFunc(func : Function,req : object,next : Function) : boolean
    {
        if(func !== undefined && typeof func === 'function')
        {
            let res  = func(req);
            if(res !== undefined && typeof res === "boolean" && res)
            {
                return true;
            }
            else
            {
                if(typeof res === 'object')
                {
                    next(res);
                    return false;
                }
                else
                {
                    let err : any = new Error('Access is in middleware from cation event blocked!');
                    err.code = 4650;
                    next(err);
                    return false;
                }
            }
        }
        else
        {
            return true;
        }
    }

    checkMiddlewareEvent(event : string,req : object,next : Function) : boolean
    {
        let func = this.getEvent(event);
        return ZationConfig.checkMiddlewareFunc(func,req,next);
    }

    emitEvent(event : string,howToEmit : Function) : void
    {
        ZationConfig.emitEvent(this.getEvent(event),howToEmit);
    }

    private loadUserDataLocations() : void
    {
        this.loadZationConfigLocation(Const.Main.KEYS.MAIN_CONFIG,'main.config');
        this.loadZationConfigLocation(Const.Main.KEYS.APP_CONFIG,'app.config');
        this.loadZationConfigLocation(Const.Main.KEYS.CHANNEL_CONFIG,'channel.config');
        this.loadZationConfigLocation(Const.Main.KEYS.ERROR_CONFIG,'error.config');
        this.loadZationConfigLocation(Const.Main.KEYS.EVENT_CONFIG,'event.config');
        this.loadZationConfigLocation(Const.Main.KEYS.SERVICE_CONFIG,'service.config');

        if(!this.mainConfig.hasOwnProperty(Const.Main.KEYS.CONTROLLER))
        {
            this.mainConfig[Const.Main.KEYS.CONTROLLER] = ZationConfig._getRootPath() + '/controller';
        }
    }

    private loadZationConfigLocation(key : string,defaultName : string) : void
    {
        if(!this.mainConfig.hasOwnProperty(key))
        {
            if(this.mainConfig.hasOwnProperty(Const.Main.KEYS.CONFIG))
            {
                this.mainConfig[key] =  this.mainConfig[Const.Main.KEYS.CONFIG] + '/' + defaultName;
            }
            else
            {
                this.mainConfig[key] = ZationConfig._getRootPath() + '/config/' + defaultName;
            }
        }
    }

    private loadMainConfig() : void
    {
        let mainConfig = ZationConfig.loadZationConfig
        (
            'main.config',
            this.mainConfig[Const.Main.KEYS.MAIN_CONFIG]
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