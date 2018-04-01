const CA            = require('../helper/constante/settings');
const MAIN          = require('../../App/Config/main.config');
// noinspection JSUnusedLocalSymbols
const Cation        = require('./zation');
const cationConfig  = require('../../App/Config/cation.config');
// noinspection JSUnusedLocalSymbols
const EventCation   = require('../../App/Config/event.config');
const ConfigTools   = require('../helper/tools/configTools');
const SocketCluster = require('socketcluster');
/*
* @return Cation
*/
class CationStarter
{
    constructor(config,config2)
    {
        this.paramConfig = {};
        this.mainConfig  = MAIN;
        this.debug       = false;
        this.readConfig(config,config2);
        this.createDefaultValues();

        if(this.debug)
        {
            console.log('Cation is running in debug Mode!');
            CationStarter.checkConfigs();
        }

        this.startSocketCluster();

    }

    readConfig(config,config2)
    {
        //Load Params Main Config and Debug
        if((typeof config === "object") && (config !== null))
        {
            this.paramConfig = config;
            if(typeof(config2) === "boolean")
            {
                this.debug = config2;
            }
            else
            {
                //LoadMainConfig
                CationStarter.loadMainConfig(this.paramConfig,this.mainConfig);
                if(this.mainConfig[CA.START_CONFIG_DEBUG_MODE] !== undefined)
                {
                    this.debug = this.mainConfig[CA.START_CONFIG_DEBUG_MODE];
                }
            }
        }
        else if(typeof(config) === "boolean")
        {
            this.debug = config;
            if((typeof config2 === "object") && (config2 !== null))
            {
               this.paramConfig = config2;
            }
            //LoadMainConfig
            CationStarter.loadMainConfig(this.mainConfig,this.mainConfig);
        }
        else if(config !== undefined && config2 !== undefined)
        {
            throw new Error('Wrong Input in cation!');
        }
    }

    static loadMainConfig(paramConfig,mainConfig)
    {
        for(let k in paramConfig)
        {
            if(paramConfig.hasOwnProperty(k))
            {
                mainConfig[k] = paramConfig[k];

            }
        }
    }

    createDefaultValues()
    {
        //Check Port
        this.mainConfig[CA.START_CONFIG_PORT] =
        ConfigTools.getDefault(this.mainConfig[CA.START_CONFIG_PORT],process.env.PORT || 3000);

        //Check ControllerLocation
        this.mainConfig[CA.START_CONFIG_CONTROLLER_LOCATION] =
        ConfigTools.getDefault(this.mainConfig[CA.START_CONFIG_CONTROLLER_LOCATION],'./../../../App/Controller');

        //Check Post Key Word
        this.mainConfig[CA.START_CONFIG_POST_KEY_WORD] =
        ConfigTools.getDefault(this.mainConfig[CA.START_CONFIG_POST_KEY_WORD],'cation');

        //Check Use Auth
        this.mainConfig[CA.START_CONFIG_USE_AUTH] =
        ConfigTools.getDefault(this.mainConfig[CA.START_CONFIG_USE_AUTH],true);

        //Check Session Config
        if(this.mainConfig[CA.START_CONFIG_SESSION_CONFIG] === undefined)
        {
            //Create Default
            this.mainConfig[CA.START_CONFIG_SESSION_CONFIG] =
                {
                    key       : 'CATION_ID',
                    resave    : false,
                    saveUninitialized : true,
                };
        }

        //Check For Session SecretKey
        let secret = '';
        if(this.mainConfig[CA.START_CONFIG_SESSION_SECRET_KEY] === undefined)
        {
            if (this.mainConfig[CA.START_CONFIG_SESSION_CONFIG]['secret'] === undefined)
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
                        console.log('CATION WARNING : SessionSecretKey not set! Use default!')
                    }
                }
            }
        }
        else
        {
            secret = this.mainConfig[CA.START_CONFIG_SESSION_SECRET_KEY];
        }
        this.mainConfig[CA.START_CONFIG_SESSION_CONFIG]['secret'] = secret;

        //Workers Default
        this.mainConfig[CA.START_CONFIG_WORKERS] =
            CationStarter.createValueWithOsAuto(this.mainConfig[CA.START_CONFIG_WORKERS]);

        //Brokers Default
        this.mainConfig[CA.START_CONFIG_BROKERS] =
            CationStarter.createValueWithOsAuto(this.mainConfig[CA.START_CONFIG_BROKERS]);

        //AppName
        this.mainConfig[CA.START_CONFIG_APP_NAME] =
        ConfigTools.getDefault(this.mainConfig[CA.START_CONFIG_APP_NAME],'AppWithoutName');

        //UseCluster
        this.mainConfig[CA.START_CONFIG_SECURE] =
        ConfigTools.getDefault(this.mainConfig[CA.START_CONFIG_SECURE],false);

        //UseSocket
        this.mainConfig[CA.START_CONFIG_USE_SOCKET_SERVER] =
        ConfigTools.getDefault(this.mainConfig[CA.START_CONFIG_USE_SOCKET_SERVER],true);

        //UseHttpServer
        this.mainConfig[CA.START_CONFIG_USE_HTTP_SERVER] =
        ConfigTools.getDefault(this.mainConfig[CA.START_CONFIG_USE_HTTP_SERVER],true);

        //UseProtocolCheck
        this.mainConfig[CA.START_CONFIG_USE_PROTOCOL_CHECK] =
            ConfigTools.getDefault(this.mainConfig[CA.START_CONFIG_USE_PROTOCOL_CHECK],true);

        //UseProtocolCheck
        this.mainConfig[CA.START_CONFIG_SEND_ERRORS_DESC] =
            ConfigTools.getDefault(this.mainConfig[CA.START_CONFIG_SEND_ERRORS_DESC],false);

    }

    static createValueWithOsAuto(checkValue)
    {
        let result = 1;
        if(checkValue !== undefined &&
            checkValue === CA.START_CONFIG_AUTO)
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
            workers : this.mainConfig[CA.START_CONFIG_WORKERS],
            brokers : this.mainConfig[CA.START_CONFIG_BROKERS],
            rebootWorkerOnCrash: true,
            appName: this.mainConfig[CA.START_CONFIG_APP_NAME],
            workerController:__dirname + '/cationWorker.js',
            brokerController:__dirname  + '/cationBroker.js',
            port   : this.mainConfig[CA.START_CONFIG_PORT],
            protocol : this.mainConfig[CA.START_CONFIG_SECURE] ? 'https' : 'http',
            protocolOptions: this.mainConfig[CA.START_CONFIG_HTTPS_CONFIG],
            cationInformation :
                {
                config : this.mainConfig,
                debug  : this.debug,
                }
        });
    }

    static checkConfigs()
    {
        //check AuthConfig
        if(!cationConfig.hasOwnProperty(CA.CATION_AUTH_CONTROLLER))
        {
            throw Error(`Missing ${CA.CATION_AUTH_CONTROLLER} Name in cation.config!`);
        }
        else
        {
            let nameOfAuthController = cationConfig[CA.CATION_AUTH_CONTROLLER];
            if(!cationConfig[CA.CATION_CONTROLLER].hasOwnProperty(nameOfAuthController))
            {
                throw Error(`Missing Controller ${nameOfAuthController} for the authorization control!`);
            }
        }

        //TODO
        //check All Controller propertyies
        //check version sytsem
        //auth Groups etc.. have default!!!
    }








}
module.exports = CationStarter;










