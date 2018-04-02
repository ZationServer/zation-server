const ConfigTools       = require('../helper/tools/configTools');
const SocketCluster     = require('socketcluster');
const ConstMainConfig   = require('../helper/constante/mainConfig');
const ConstStartOptions = require('../helper/constante/startOptions');

const Path          = require('path');
const Fs            = require('fs');

class ZationStarter
{
    constructor(options,debug = false)
    {
        this._config = {};
        this._debug = debug;

        this._readStarterOptions(options);
        this._loadUserDataLocations();
        this._loadMainConfig();
        this._checkMainConfig();

        if(this._debug)
        {
            console.log('Zation is running in debug Mode!');
            ZationStarter.checkConfigs();
        }

        this.startSocketCluster();

    }

    _readStarterOptions(options)
    {
        if(typeof options === 'object')
        {
            this._config = options;
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
       return Path.dirname(require.main.filename || process.mainModule.filename);
   }

   _loadMainConfig()
   {
       let mainConfig = ZationStarter._loadZationConfig
       (
           'main.config',
           this._config[ConstStartOptions.MAIN_CONFIG]
       );

       ZationStarter._addConfigs(this._config,mainConfig);
   }

   static _loadZationConfig(name,path,optional = true)
   {
       if(Fs.existsSync(path))
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

   static _addConfigs(config,toAdd)
   {
       for(let key in toAdd)
       {
           if(toAdd.hasOwnProperty(key))
           {
               if(!config.hasOwnProperty(key))
               {
                   config[key] = toAdd[key];
               }
           }
       }
   }

    _checkMainConfig()
    {

        //Check Port
        this._config[ConstMainConfig.PORT] =
        ConfigTools.getDefault(this._config[ConstMainConfig.PORT],process.env.PORT || 3000);

        //Check Post Key Word
        this._config[ConstMainConfig.POST_KEY_WORD] =
        ConfigTools.getDefault(this._config[ConstMainConfig.POST_KEY_WORD],'zation');

        //Check Use Auth
        this._config[ConstMainConfig.USE_AUTH] =
        ConfigTools.getDefault(this._config[ConstMainConfig.USE_AUTH],true);

        //Check Session Config
        if(this._config[ConstMainConfig.SESSION_CONFIG] === undefined)
        {
            //Create Default
            this._config[ConstMainConfig.SESSION_CONFIG] =
                {
                    key       : 'ConstMainConfigTION_ID',
                    resave    : false,
                    saveUninitialized : true,
                };
        }

        //Check For Session SecretKey
        let secret = '';
        if(this._config[ConstMainConfig.SESSION_SECRET_KEY] === undefined)
        {
            if (this._config[ConstMainConfig.SESSION_CONFIG]['secret'] === undefined)
            {
                if (process.env.SESSION_SECRET !== undefined)
                {
                    secret = process.env.SESSION_SECRET;
                }
                else
                {
                    secret = 'aRandomSecretKey';
                    if (debug)
                    {
                        console.log('ZATION WARNING : SessionSecretKey not set! Use default!')
                    }
                }
            }
        }
        else
        {
            secret = this._config[ConstMainConfig.SESSION_SECRET_KEY];
        }
        this._config[ConstMainConfig.SESSION_CONFIG]['secret'] = secret;

        //Workers Default
        this._config[ConstMainConfig.WORKERS] =
            ZationStarter.createValueWithOsAuto(this._config[ConstMainConfig.WORKERS]);

        //Brokers Default
        this._config[ConstMainConfig.BROKERS] =
            ZationStarter.createValueWithOsAuto(this._config[ConstMainConfig.BROKERS]);

        //AppName
        this._config[ConstMainConfig.APP_NAME] =
        ConfigTools.getDefault(this._config[ConstMainConfig.APP_NAME],'AppWithoutName');

        //UseCluster
        this._config[ConstMainConfig.SECURE] =
        ConfigTools.getDefault(this._config[ConstMainConfig.SECURE],false);

        //UseSocket
        this._config[ConstMainConfig.USE_SOCKET_SERVER] =
        ConfigTools.getDefault(this._config[ConstMainConfig.USE_SOCKET_SERVER],true);

        //UseHttpServer
        this._config[ConstMainConfig.USE_HTTP_SERVER] =
        ConfigTools.getDefault(this._config[ConstMainConfig.USE_HTTP_SERVER],true);

        //UseProtocolCheck
        this._config[ConstMainConfig.USE_PROTOCOL_CHECK] =
            ConfigTools.getDefault(this._config[ConstMainConfig.USE_PROTOCOL_CHECK],true);

        //UseProtocolCheck
        this._config[ConstMainConfig.SEND_ERRORS_DESC] =
            ConfigTools.getDefault(this._config[ConstMainConfig.SEND_ERRORS_DESC],false);

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
        this.socketCluster = new SocketCluster({
            workers : this._config[ConstMainConfig.WORKERS],
            brokers : this._config[ConstMainConfig.BROKERS],
            rebootWorkerOnCrash: true,
            appName: this._config[ConstMainConfig.APP_NAME],
            workerController:__dirname + '/zationWorker.js',
            brokerController:__dirname  + '/zationBroker.js',
            port   : this._config[ConstMainConfig.PORT],
            protocol : this._config[ConstMainConfig.SECURE] ? 'https' : 'http',
            protocolOptions: this._config[ConstMainConfig.HTTPS_CONFIG],
            cationInformation :
                {
                config : this._config,
                debug  : this._debug,
                }
        });
    }

    static checkConfigs()
    {
        //TODO
       //Implemented later!
    }


}
module.exports = ZationStarter;