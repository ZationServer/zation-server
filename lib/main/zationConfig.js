/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

const Const             = require('../helper/constants/constWrapper');
const ObjectTools       = require('./../helper/tools/objectTools');

const path              = require('path');
const fs                = require('fs');
const crypto            = require('crypto');

class ZationConfig
{
    constructor(starterConfig,workerTransport = false)
    {
        this._eventConfig   = {};
        this._appConfig     = {};
        this._channelConfig = {};
        this._errorConfig   = {};
        this._mainConfig    = {};

        if(!workerTransport)
        {
            //Create Defaults
            this._mainConfig[Const.Main.KEYS.DEBUG] = false;
            this._mainConfig[Const.Main.KEYS.START_DEBUG] = false;
            this._mainConfig[Const.Main.KEYS.SHOW_CONFIG_WARNINGS] = true;
            this._mainConfig[Const.Main.KEYS.PORT] = process.env.PORT || 3000;
            this._mainConfig[Const.Main.KEYS.HOSTNAME] = 'localhost';
            this._mainConfig[Const.Main.KEYS.ENVIRONMENT] = 'dev';
            this._mainConfig[Const.Main.KEYS.POST_KEY_WORD] = 'zation';
            this._mainConfig[Const.Main.KEYS.USE_AUTH] = true;
            this._mainConfig[Const.Main.KEYS.APP_NAME] = 'AppWithoutName';
            this._mainConfig[Const.Main.KEYS.SECURE] = false;
            this._mainConfig[Const.Main.KEYS.USE_PROTOCOL_CHECK] = true;
            this._mainConfig[Const.Main.KEYS.SEND_ERRORS_DESC] = false;
            this._mainConfig[Const.Main.KEYS.AUTH_KEY] = crypto.randomBytes(32).toString('hex');
            this._mainConfig[Const.Main.KEYS.AUTH_PUBLIC_KEY] = null;
            this._mainConfig[Const.Main.KEYS.AUTH_PRIVATE_KEY] = null;
            this._mainConfig[Const.Main.KEYS.AUTH_DEFAULT_EXPIRY] = 86400;
            this._mainConfig[Const.Main.KEYS.SYSTEM_BACKGROUND_TASK_REFRESH_RATE] = 1800000;
            this._mainConfig[Const.Main.KEYS.TIME_ZONE] = 'Europe/Berlin';
            this._mainConfig[Const.Main.KEYS.AUTH_START] = false;
            this._mainConfig[Const.Main.KEYS.AUTH_START_DURATION_MS] = 20000;

            //TEMP
            this._mainConfig[Const.Main.KEYS.USE_TEMP_DB_TOKEN_INFO] = true;
            this._mainConfig[Const.Main.KEYS.USE_TEMP_DB_ERROR_INFO] = true;
            this._mainConfig[Const.Main.KEYS.TEMP_DB_ERROR_INFO_LIVE_TIME] = 3600000;
            this._mainConfig[Const.Main.KEYS.TEMP_DB_ENGINE] = Const.Main.TEMP_DB_ENGINE.MASTER_MEMORY;
            this._mainConfig[Const.Main.KEYS.EXTRA_SECURE_AUTH] = true;
            this._mainConfig[Const.Main.KEYS.TEMP_DB_Name] = 'zationTempDb';

            this.addToMainConfig(starterConfig,true);
            this._loadUserDataLocations();
            this._loadMainConfig();
            this._processMainConfig();
        }
        else
        {
            this._mainConfig = starterConfig;
        }
    }

    getWorkerTransport()
    {
        return {mainConfig : this._mainConfig};
    }

    isDebug()
    {
        return this.getMain(Const.Main.KEYS.DEBUG);
    }

    isStartDebug()
    {
        return this.getMain(Const.Main.KEYS.START_DEBUG);
    }

    isShowConfigWarning()
    {
        return this.getMain(Const.Main.KEYS.SHOW_CONFIG_WARNINGS);
    }

    isUsePanel()
    {
        return this.getMain(Const.Main.KEYS.USE_PANEL);
    }

    addToMainConfig(toAdd,overwrite)
    {
        ObjectTools.addObToOb(this._mainConfig,toAdd,overwrite);
    }

    getMain(key)
    {
        return this._mainConfig[key];
    }

    getMainConfig()
    {
        return this._mainConfig;
    }

    getChannel(key)
    {
        return this._channelConfig[key];
    }

    isChannel(key)
    {
        return this._channelConfig[key] !== undefined;
    }

    getChannelConfig()
    {
        return this._channelConfig;
    }

    isMain(key)
    {
        return this._mainConfig[key] !== undefined;
    }

    getEvent(key)
    {
        return this._eventConfig[key];
    }

    isApp(key)
    {
        return this._appConfig[key] !== undefined;
    }

    getApp(key)
    {
        return this._appConfig[key];
    }

    getAppConfig()
    {
        return this._appConfig;
    }

    getVerifyKey()
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

    getSignKey()
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

    isExtraSecureAuth()
    {
        return this.getMain(Const.Main.KEYS.EXTRA_SECURE_AUTH);
    }

    isUseTokenInfoTempDb()
    {
        return this.getMain(Const.Main.KEYS.USE_TEMP_DB_TOKEN_INFO);
    }

    isUseErrorInfoTempDb()
    {
        return this.getMain(Const.Main.KEYS.USE_TEMP_DB_ERROR_INFO);
    }

    getSomeInformation()
    {
        let obj = {};
        obj['port'] = this.getMain(Const.Main.KEYS.PORT);
        obj['appName'] = this.getMain(Const.Main.KEYS.APP_NAME);
        return obj;
    }

    loadOtherConfigs()
    {
        //Add Other Configs
        this._eventConfig = ZationConfig.loadZationConfig
        (
            'event.config',
            this.getMain(Const.Main.KEYS.EVENT_CONFIG),
        );

        this._channelConfig = ZationConfig.loadZationConfig
        (
            'channel.config',
            this.getMain(Const.Main.KEYS.CHANNEL_CONFIG),
        );

        this._appConfig = ZationConfig.loadZationConfig
        (
            'app.config',
            this.getMain(Const.Main.KEYS.APP_CONFIG),
            false
        );

        this._errorConfig = ZationConfig.loadZationConfig
        (
            'error.config',
            this.getMain(Const.Main.KEYS.ERROR_CONFIG),
        );
    }

    static _getRootPath()
    {
        // noinspection JSUnresolvedVariable
        return path.dirname(require.main.filename || process.mainModule.filename);
    }

    static loadZationConfig(name,path,optional = true)
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

    static createValueWithOsAuto(checkValue)
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

    static emitEvent(func,howToEmit = (f) => {f();})
    {
        if(func !== undefined && typeof func === 'function')
        {
            howToEmit(func);
        }
    }

    static checkMiddlewareFunc(func,req,next)
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
                    let err = new Error('Access is in middleware from cation event blocked!');
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

    checkMiddlewareEvent(event,req,next)
    {
        let func = this.getEvent(event);
        return ZationConfig.checkMiddlewareFunc(func,req,next);
    }

    emitEvent(event,howToEmit)
    {
        ZationConfig.emitEvent(this.getEvent(event),howToEmit);
    }

    _loadUserDataLocations()
    {
        this._loadZationConfigLocation(Const.Main.KEYS.MAIN_CONFIG,'main.config');
        this._loadZationConfigLocation(Const.Main.KEYS.APP_CONFIG,'app.config');
        this._loadZationConfigLocation(Const.Main.KEYS.CHANNEL_CONFIG,'channel.config');
        this._loadZationConfigLocation(Const.Main.KEYS.ERROR_CONFIG,'error.config');
        this._loadZationConfigLocation(Const.Main.KEYS.EVENT_CONFIG,'event.config');

        if(!this._mainConfig.hasOwnProperty(Const.Main.KEYS.CONTROLLER))
        {
            this._mainConfig[Const.Main.KEYS.CONTROLLER] = ZationConfig._getRootPath() + '/controller';
        }
    }

    _loadZationConfigLocation(key,defaultName)
    {
        if(!this._mainConfig.hasOwnProperty(key))
        {
            if(this._mainConfig.hasOwnProperty(Const.Main.KEYS.CONFIG))
            {
                this._mainConfig[key] =  this._mainConfig[Const.Main.KEYS.CONFIG] + '/' + defaultName;
            }
            else
            {
                this._mainConfig[key] = ZationConfig._getRootPath() + '/config/' + defaultName;
            }
        }
    }

    _loadMainConfig()
    {
        let mainConfig = ZationConfig.loadZationConfig
        (
            'main.config',
            this._mainConfig[Const.Main.KEYS.MAIN_CONFIG]
        );

        ObjectTools.addObToOb(this._mainConfig,mainConfig,true);
    }

    _processMainConfig()
    {
        //Workers Default
        this._mainConfig[Const.Main.KEYS.WORKERS] =
            ZationConfig.createValueWithOsAuto(this._mainConfig[Const.Main.KEYS.WORKERS]);

        //Brokers Default
        this._mainConfig[Const.Main.KEYS.BROKERS] =
            ZationConfig.createValueWithOsAuto(this._mainConfig[Const.Main.KEYS.BROKERS]);
    }

}

module.exports = ZationConfig;