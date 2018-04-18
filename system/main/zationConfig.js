/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

const Const             = require('../helper/constante/constWrapper');
const MainErrors          = require('../helper/zationTaskErrors/mainTaskErrors');

const path              = require('path');
const fs                = require('fs');
const crypto            = require('crypto');

const systemController  = require('../helper/systemController/systemControler.config');

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
            this._mainConfig[Const.Main.DEBUG] = false;
            this._mainConfig[Const.Main.PORT] = process.env.PORT || 3000;
            this._mainConfig[Const.Main.POST_KEY_WORD] = 'zation';
            this._mainConfig[Const.Main.USE_AUTH] = true;
            this._mainConfig[Const.Main.APP_NAME] = 'AppWithoutName';
            this._mainConfig[Const.Main.SECURE] = false;
            this._mainConfig[Const.Main.USE_SOCKET_SERVER] = true;
            this._mainConfig[Const.Main.USE_HTTP_SERVER] = true;
            this._mainConfig[Const.Main.USE_PROTOCOL_CHECK] = true;
            this._mainConfig[Const.Main.SEND_ERRORS_DESC] = false;
            this._mainConfig[Const.Main.AUTH_KEY] = crypto.randomBytes(32).toString('hex');
            this._mainConfig[Const.Main.AUTH_PUBLIC_KEY] = null;
            this._mainConfig[Const.Main.AUTH_PRIVATE_KEY] = null;
            this._mainConfig[Const.Main.EXTRA_SECURE_AUTH] = true;
            this._mainConfig[Const.Main.SYSTEM_BACKGROUND_TASK_REFRESH_RATE] = 1800000;
            this._mainConfig[Const.Main.TIME_ZONE] = 'Europe/Berlin';

            this.addToMainConfig(starterConfig,true);
            this._loadUserDataLocations();
            this._loadMainConfig();
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
        return this.getMain(Const.Main.DEBUG);
    }

    addToMainConfig(toAdd,overwrite)
    {
        ZationConfig._addConfigs(this._mainConfig,toAdd,overwrite);
    }

    getMain(key)
    {
        return this._mainConfig[key];
    }

    getChannel(key)
    {
        return this._channelConfig[key];
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

    getVerifyKey()
    {
        if(this.getMain(Const.Main.AUTH_PUBLIC_KEY) !== null)
        {
            return this.getMain(Const.Main.AUTH_PUBLIC_KEY);
        }
        else
        {
            return this.getMain(Const.Main.AUTH_KEY);
        }
    }

    getSignKey()
    {
        if(this.getMain(Const.Main.AUTH_PRIVATE_KEY) !== null)
        {
            return this.getMain(Const.Main.AUTH_PRIVATE_KEY);
        }
        else
        {
            return this.getMain(Const.Main.AUTH_KEY);
        }
    }

    isExtraSecureAuth()
    {
        return this.getMain(Const.Main.EXTRA_SECURE_AUTH);
    }

    getSomeInformation()
    {
        let obj = {};
        obj['port'] = this.getMain(Const.Main.PORT);
        obj['appName'] = this.getMain(Const.Main.APP_NAME);
        return obj;
    }

    // noinspection JSUnusedGlobalSymbols
    printDebugWarning(txt,obj)
    {
        if (this.isDebug())
        {
            console.log('\x1b[31m%s\x1b[0m','   [WARNING]',txt);

            if(obj !== undefined)
            {
                console.log(obj);
            }
        }
    }

    printDebugInfo(txt,obj)
    {
        if (this.isDebug())
        {
            console.log('\x1b[34m%s\x1b[0m','   [INFO]',txt);

            if(obj !== undefined)
            {
                console.log(obj);
            }
        }
    }

    loadOtherConfigs()
    {
        //Add Other Configs
        this._eventConfig = ZationConfig.loadZationConfig
        (
            'event.config',
            this.getMain(Const.Main.EVENT_CONFIG),
        );

        this._channelConfig = ZationConfig.loadZationConfig
        (
            'channel.config',
            this.getMain(Const.Main.CHANNEL_CONFIG),
        );

        this._appConfig = ZationConfig.loadZationConfig
        (
            'app.config',
            this.getMain(Const.Main.APP_CONFIG),
            false
        );

        this._errorConfig = ZationConfig.loadZationConfig
        (
            'error.config',
            this.getMain(Const.Main.ERROR_CONFIG),
        );
    }

    static _addConfigs(config,toAdd,overwrite = false)
    {
        for(let key in toAdd)
        {
            if(toAdd.hasOwnProperty(key))
            {
                if(!config.hasOwnProperty(key))
                {
                    config[key] = toAdd[key];
                }
                else if(overwrite)
                {
                    config[key] = toAdd[key];
                }
            }
        }
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
            checkValue === Const.Main.AUTO)
        {
            result = require('os').cpus().length;
        }
        else if(checkValue !== undefined)
        {
            result = parseInt(checkValue);
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
        this._loadZationConfigLocation(Const.Main.MAIN_CONFIG,'main.config');
        this._loadZationConfigLocation(Const.Main.APP_CONFIG,'app.config');
        this._loadZationConfigLocation(Const.Main.CHANNEL_CONFIG,'channel.config');
        this._loadZationConfigLocation(Const.Main.ERROR_CONFIG,'error.config');
        this._loadZationConfigLocation(Const.Main.EVENT_CONFIG,'event.config');

        if(!this._mainConfig.hasOwnProperty(Const.Main.CONTROLLER))
        {
            this._mainConfig[Const.Main.CONTROLLER] = ZationConfig._getRootPath() + '/controller/';
        }
    }

    _loadZationConfigLocation(key,defaultName)
    {
        if(!this._mainConfig.hasOwnProperty(key))
        {
            if(this._mainConfig.hasOwnProperty(Const.Main.CONFIG))
            {
                this._mainConfig[key] =  this._mainConfig[Const.Main.CONFIG] + '/' + defaultName;
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
            this._mainConfig[Const.Main.MAIN_CONFIG]
        );

        ZationConfig._addConfigs(this._mainConfig,mainConfig,true);
        this._processMainConfig();
    }

    _processMainConfig()
    {
        //Workers Default
        this._mainConfig[Const.Main.WORKERS] =
            ZationConfig.createValueWithOsAuto(this._mainConfig[Const.Main.WORKERS]);

        //Brokers Default
        this._mainConfig[Const.Main.BROKERS] =
            ZationConfig.createValueWithOsAuto(this._mainConfig[Const.Main.BROKERS]);
    }


}

module.exports = ZationConfig;