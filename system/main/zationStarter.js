const SocketCluster     = require('socketcluster');
const Const             = require('../helper/constante/constWrapper');
const ZationConfig      = require('./zationConfig');

const path          = require('path');
const fs            = require('fs');
const crypto        = require('crypto');

class ZationStarter
{
    constructor(options,debug = false)
    {
        this._config = new ZationConfig(options,debug);
        this._readStarterOptions(options);
        this._loadUserDataLocations();
        this._loadMainConfig();

        this._processMainConfig();

        if(this._config.isDebug()) {
            console.log('Zation is running in debug Mode!');
        }

        this.startSocketCluster();

    }

    _readStarterOptions(options)
    {
        if(typeof options === 'object')
        {
            ZationStarter._addConfigs(this._config,options,true);
        }
    }

   _loadUserDataLocations()
   {
       this._loadZationConfigLocation(Const.StartOp.MAIN_CONFIG,'main.config');
       this._loadZationConfigLocation(Const.StartOp.APP_CONFIG,'app.config');
       this._loadZationConfigLocation(Const.StartOp.CHANNEL_CONFIG,'channel.config');
       this._loadZationConfigLocation(Const.StartOp.ERROR_CONFIG,'error.config');
       this._loadZationConfigLocation(Const.StartOp.EVENT_CONFIG,'event.config');

       if(!this._config.hasOwnProperty(Const.StartOp.CONTROLLER))
       {
           this._config[Const.StartOp.CONTROLLER] = ZationStarter._getRootPath() + '/controller/';
       }
   }

   _loadZationConfigLocation(key,defaultName)
   {
       if(!this._config.hasOwnProperty(key))
       {
           if(this._config.hasOwnProperty(Const.StartOp.CONFIG))
           {
               this._config[key] =  this._config[Const.StartOp.CONFIG] + '/' + defaultName;
           }
           else
           {
               this._config[key] = ZationStarter._getRootPath() + '/config/' + defaultName;
           }
       }
   }

   static _getRootPath()
   {
       // noinspection JSUnresolvedVariable
       return path.dirname(require.main.filename || process.mainModule.filename);
   }

   _loadMainConfig()
   {
       let mainConfig = ZationStarter.loadZationConfig
       (
           'main.config',
           this._config[Const.StartOp.MAIN_CONFIG]
       );

       ZationStarter._addConfigs(this._config,mainConfig);
   }

   static loadZationConfig(name,path,optional = true)
   {
       if(fs.existsSync(path))
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

    _processMainConfig()
    {
        //Workers Default
        this._config[Const.Main.WORKERS] =
            ZationStarter.createValueWithOsAuto(this._config[Const.Main.WORKERS]);

        //Brokers Default
        this._config[Const.Main.BROKERS] =
            ZationStarter.createValueWithOsAuto(this._config[Const.Main.BROKERS]);
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


    startSocketCluster()
    {
        new SocketCluster({
            workers : this._config[Const.Main.WORKERS],
            brokers : this._config[Const.Main.BROKERS],
            rebootWorkerOnCrash: true,
            appName: this._config[Const.Main.APP_NAME],
            workerController:__dirname + '/zationWorker.js',
            brokerController:__dirname  + '/zationBroker.js',
            port   : this._config[Const.Main.PORT],
            protocol : this._config[Const.Main.SECURE] ? 'https' : 'http',
            protocolOptions: this._config[Const.Main.HTTPS_CONFIG],
            authKey: this._config[Const.Main.AUTH_KEY],
            authAlgorithm: this._config[Const.Main.AUTH_ALGORITHM],
            authPublicKey: this._config[Const.Main.AUTH_PUBLIC_KEY],
            authPrivateKey: this._config[Const.Main.AUTH_PRIVATE_KEY],
            cationInformation :
                {
                config : this._config,
                debug  : this._debug,
                }
        });
    }
}
module.exports = ZationStarter;