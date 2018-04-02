const SocketCluster     = require('socketcluster');
const ConstMainConfig   = require('../helper/constante/mainConfig');
const ConstStartOptions = require('../helper/constante/startOptions');

const path          = require('path');
const fs            = require('fs');
const crypto        = require('crypto');

class ZationStarter
{
    constructor(options,debug = false)
    {
        this._config = ZationStarter.generateDefaultConfig();
        this._debug = debug;
        this._readStarterOptions(options);
        this._loadUserDataLocations();
        this._loadMainConfig();

        this._processMainConfig();

        if(this._debug)
        {
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
       this._loadZationConfigLocation(ConstStartOptions.MAIN_CONFIG,'main.config');
       this._loadZationConfigLocation(ConstStartOptions.APP_CONFIG,'app.config');
       this._loadZationConfigLocation(ConstStartOptions.CHANNEL_CONFIG,'channel.config');
       this._loadZationConfigLocation(ConstStartOptions.ERROR_CONFIG,'error.config');
       this._loadZationConfigLocation(ConstStartOptions.EVENT_CONFIG,'event.config');

       if(!this._config.hasOwnProperty(ConstStartOptions.CONTROLLER))
       {
           this._config[ConstStartOptions.CONTROLLER] = ZationStarter._getRootPath() + '/controller/';
       }
   }

   _loadZationConfigLocation(key,defaultName)
   {
       if(!this._config.hasOwnProperty(key))
       {
           if(this._config.hasOwnProperty(ConstStartOptions.CONFIG))
           {
               this._config[key] =  this._config[ConstStartOptions.CONFIG] + '/' + defaultName;
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
           this._config[ConstStartOptions.MAIN_CONFIG]
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

   static generateDefaultConfig()
   {
       let res = {};
       res[ConstMainConfig.PORT] = process.env.PORT || 3000;
       res[ConstMainConfig.POST_KEY_WORD] = 'zation';
       res[ConstMainConfig.USE_AUTH] = true;
       res[ConstMainConfig.APP_NAME] = 'AppWithoutName';
       res[ConstMainConfig.SECURE] = false;
       res[ConstMainConfig.USE_SOCKET_SERVER] = true;
       res[ConstMainConfig.USE_HTTP_SERVER] = true;
       res[ConstMainConfig.USE_PROTOCOL_CHECK] = true;
       res[ConstMainConfig.SEND_ERRORS_DESC] = false;
       res[ConstMainConfig.AUTH_KEY] = crypto.randomBytes(32).toString('hex');
       return res;
   }
    _processMainConfig()
    {
        //Workers Default
        this._config[ConstMainConfig.WORKERS] =
            ZationStarter.createValueWithOsAuto(this._config[ConstMainConfig.WORKERS]);

        //Brokers Default
        this._config[ConstMainConfig.BROKERS] =
            ZationStarter.createValueWithOsAuto(this._config[ConstMainConfig.BROKERS]);
    }

    static createValueWithOsAuto(checkValue)
    {
        let result = 1;
        if(checkValue !== undefined &&
            checkValue === ConstMainConfig.AUTO)
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
            workers : this._config[ConstMainConfig.WORKERS],
            brokers : this._config[ConstMainConfig.BROKERS],
            rebootWorkerOnCrash: true,
            appName: this._config[ConstMainConfig.APP_NAME],
            workerController:__dirname + '/zationWorker.js',
            brokerController:__dirname  + '/zationBroker.js',
            port   : this._config[ConstMainConfig.PORT],
            protocol : this._config[ConstMainConfig.SECURE] ? 'https' : 'http',
            protocolOptions: this._config[ConstMainConfig.HTTPS_CONFIG],
            authKey: this._config[ConstMainConfig.AUTH_KEY],
            authAlgorithm: this._config[ConstMainConfig.AUTH_ALGORITHM],
            authPublicKey: this._config[ConstMainConfig.AUTH_PUBLIC_KEY],
            authPrivateKey: this._config[ConstMainConfig.AUTH_PRIVATE_KEY],
            cationInformation :
                {
                config : this._config,
                debug  : this._debug,
                }
        });
    }
}
module.exports = ZationStarter;