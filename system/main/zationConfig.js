/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

const Const             = require('../helper/constante/constWrapper');
const SyErrors          = require('../helper/zationTaskErrors/systemTaskErrors');

const path              = require('path');
const fs                = require('fs');
const crypto            = require('crypto');

const systemController  = require('../helper/systemController/systemControler.config');

class ZationConfig
{
    constructor(starterConfig,debug,workerTransport = false)
    {
        this._debug = debug;
        this._eventConfig   = {};
        this._appConfig     = {};
        this._channelConfig = {};
        this._errorConfig   = {};
        this._mainConfig    = {};

        if(!workerTransport)
        {
            //Create Defaults
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
            this._mainConfig[Const.Main.AUTH_EXTRA_SECURE] = true;
            this._mainConfig[Const.Main.SYSTEM_BACKGROUND_TASK_REFRESH_RATE] = 600000;

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
        return {mainConfig : this._mainConfig,debug : this._debug};
    }

    isDebug()
    {
        return this._debug;
    }

    addToMainConfig(toAdd,overwrite)
    {
        ZationConfig._addConfigs(this._mainConfig,overwrite);
    }

    getMain(key)
    {
        return this._mainConfig[key];
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

    getSomeInformation()
    {
        let obj = {};
        obj['port'] = this.getMain(Const.Main.PORT);
        obj['appName'] = this.getMain(Const.Main.APP_NAME);
        return obj;
    }

    // noinspection JSUnusedGlobalSymbols
    printWarning(txt)
    {
        if (this._debug) {
            console.log(`CATION WARNING : ${txt}`);
        }
    }

    loadOtherConfigs()
    {
        //Add Other Configs
        this._eventConfig = ZationConfig.loadZationConfig
        (
            'event.config',
            this.getMain(Const.StartOp.EVENT_CONFIG),
        );

        this._channelConfig = ZationConfig.loadZationConfig
        (
            'channel.config',
            this.getMain(Const.StartOp.CHANNEL_CONFIG),
        );

        this._appConfig = ZationConfig.loadZationConfig
        (
            'app.config',
            this.getMain(Const.StartOp.APP_CONFIG),
            false
        );

        this._errorConfig = ZationConfig.loadZationConfig
        (
            'error.config',
            this.getMain(Const.StartOp.ERROR_CONFIG),
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
        this._loadZationConfigLocation(Const.StartOp.MAIN_CONFIG,'main.config');
        this._loadZationConfigLocation(Const.StartOp.APP_CONFIG,'app.config');
        this._loadZationConfigLocation(Const.StartOp.CHANNEL_CONFIG,'channel.config');
        this._loadZationConfigLocation(Const.StartOp.ERROR_CONFIG,'error.config');
        this._loadZationConfigLocation(Const.StartOp.EVENT_CONFIG,'event.config');

        if(!this._mainConfig.hasOwnProperty(Const.StartOp.CONTROLLER))
        {
            this._mainConfig[Const.StartOp.CONTROLLER] = ZationConfig._getRootPath() + '/controller/';
        }
    }

    _loadZationConfigLocation(key,defaultName)
    {
        if(!this._mainConfig.hasOwnProperty(key))
        {
            if(this._mainConfig.hasOwnProperty(Const.StartOp.CONFIG))
            {
                this._mainConfig[key] =  this._mainConfig[Const.StartOp.CONFIG] + '/' + defaultName;
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
            this._mainConfig[Const.StartOp.MAIN_CONFIG]
        );

        ZationConfig._addConfigs(this._mainConfig,mainConfig);
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