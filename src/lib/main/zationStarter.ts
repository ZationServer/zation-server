/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */
                               require('cache-require-paths');
import BackgroundTaskSender  = require("../helper/background/backgroundTasksSender");
const  SocketCluster : any   = require('socketcluster');
import Const                 = require('../helper/constants/constWrapper');
import Logger                = require('../helper/logger/logger');
import ZationConfig          = require('./zationConfig');
import ConfigChecker         = require('../helper/config/configChecker');
import ConfigErrorBag        = require('../helper/config/configErrorBag');
import HashSet               = require('hashset');
import TimeTools             = require('../helper/tools/timeTools');
import PrepareClientJs       = require('../helper/client/prepareClientJs');
import MasterTempDbEngine    = require('../helper/tempDb/masterTempDbEngine');
import BackgroundTasksSetter = require("../helper/background/backgroundTasksSetter");
const  isWindows             = require('is-windows');


class ZationStarter
{
    private static instance : ZationStarter | null = null;
    private static readonly version : string = '0.2.3';

    private readonly serverStartedTimeStamp : number;
    private readonly zc : ZationConfig;
    private workerIds : any;
    private tempDbEngine : MasterTempDbEngine;
    private master : any;

    constructor(options)
    {
        if(ZationStarter.instance === null)
        {
            ZationStarter.instance = this;

            this.serverStartedTimeStamp = Date.now();
            this.zc = new ZationConfig(options);

            //setLogger
            Logger.setZationConfig(this.zc);
            this.workerIds = new HashSet();

            (async () =>
            {
                try
                {
                    await this.start();
                }
                catch (e)
                {
                    Logger.printStartFail(`Exception when trying to start server -> ${e.toString()}`);
                    console.log(e);
                }
            })();
        }
        else
        {
            Logger.printWarning('You can only start zation once.');
        }
    }

    private async start()
    {
        Logger.printBusy('Launching Zation');
        Logger.printDebugInfo('Zation is launching in debug Mode.');

        Logger.startStopWatch();
        let configErrorBag = new ConfigErrorBag();
        const configChecker = new ConfigChecker(this.zc,configErrorBag);

        configChecker.checkStarterConfig();
        if(configErrorBag.hasConfigError()) {
            Logger.printConfigErrorBag(configErrorBag);
            process.exit();
        }
        Logger.printStartDebugInfo(`Master has checked the start config.`,true);

        Logger.startStopWatch();
        this.zc.loadOtherConfigs();
        Logger.printStartDebugInfo(`Master has loaded the other config files.`,true);

        Logger.startStopWatch();
        configChecker.checkAllConfigs();
        if(configErrorBag.hasConfigError()) {
            Logger.printConfigErrorBag(configErrorBag);
            process.exit();
        }
        Logger.printStartDebugInfo(`Master has checked the config files.`,true);

        Logger.startStopWatch();
        PrepareClientJs.createServerSettingsFile(this.zc);
        Logger.printStartDebugInfo('Master builds the server settings file.',true);

        if(this.zc.isUseErrorInfoTempDb() || this.zc.isUseTokenInfoTempDb())
        {
            Logger.startStopWatch();
            this.tempDbEngine = new MasterTempDbEngine(this.zc);
            await this.tempDbEngine.init();
            Logger.printStartDebugInfo('Master init the master temp db engine.',true);
        }

        Logger.startStopWatch();
        this.startSocketCluster();
        Logger.printStartDebugInfo('Master starts socket cluster.',true);
    }

    private startSocketCluster()
    {
        try {
            require("sc-uws");
        }
        catch (e) {
            if(this.zc.getMain(Const.Main.KEYS.USE_SC_UWS)) {
                Logger.printStartFail
                (`Failed to load sc-uws! Error -> ${e.toString()}.`);

                if(isWindows()) {
                    Logger.printStartFail(`Try to run command 'npm install --global --production windows-build-tools'`);
                }

                Logger.printStartFail
                (`${isWindows() ? 'Also you' : 'You'} can try to set the property 'useScUws' in Main or Start config to false. But you will lose performance!`);
                process.exit();
            }
        }

        let scOptions = {
            workers : this.zc.getMain(Const.Main.KEYS.WORKERS),
            brokers : this.zc.getMain(Const.Main.KEYS.BROKERS),
            rebootWorkerOnCrash: true,
            appName: this.zc.getMain(Const.Main.KEYS.APP_NAME),
            workerController:__dirname + '/zationWorker.js',
            brokerController:__dirname  + '/zationBroker.js',
            environment : this.zc.getMain(Const.Main.KEYS.ENVIRONMENT),
            port   : this.zc.getMain(Const.Main.KEYS.PORT),
            path   : this.zc.getMain(Const.Main.KEYS.PATH),
            protocol : this.zc.getMain(Const.Main.KEYS.SECURE) ? 'https' : 'http',
            protocolOptions: this.zc.getMain(Const.Main.KEYS.HTTPS_CONFIG),
            authKey: this.zc.getMain(Const.Main.KEYS.AUTH_KEY),
            authAlgorithm: this.zc.getMain(Const.Main.KEYS.AUTH_ALGORITHM),
            authPublicKey: this.zc.getMain(Const.Main.KEYS.AUTH_PUBLIC_KEY),
            authPrivateKey: this.zc.getMain(Const.Main.KEYS.AUTH_PRIVATE_KEY),
            authDefaultExpiry: this.zc.getMain(Const.Main.KEYS.AUTH_DEFAULT_EXPIRY),
            zationConfigWorkerTransport : this.zc.getWorkerTransport(),
            zationServerVersion : ZationStarter.version,
            zationServerStartedTimeStamp : this.serverStartedTimeStamp,
            ipcAckTimeout: 3000,
            logLevel : this.zc.getMain(Const.Main.KEYS.SC_CONSOLE_LOG) ? 100 : 0
        };

        if(this.zc.getMain(Const.Main.KEYS.USE_SC_UWS)) {
            scOptions['wsEngine'] = 'sc-uws';
        }
        else {
            scOptions['wsEngine'] = 'ws';
        }

        this.master = new SocketCluster(scOptions);

        // noinspection JSUnresolvedFunction
        this.master.on('ready',async () =>
        {
           this.printStartedInformation();

           if(this.zc.isLeaderInstance())
           {
               Logger.startStopWatch();
               this.startBackgroundTasks();
               Logger.printStartDebugInfo('Master init the background tasks.',true);
           }

           await this.zc.emitEvent(Const.Event.ZATION_IS_STARTED, this.zc.getSomeInformation());

        });


        // noinspection JSUnresolvedFunction
        this.master.on('workerMessage', async (wId,data,resp) =>
        {
            if(data['memoryDbRequest'])
            {
                await this.tempDbEngine.processMemoryDbReq(data['memoryDbRequestData'],resp);
            }
            else
            {
                resp(new Error('Unknown command!'));
            }
        });

        // noinspection JSUnresolvedFunction
        this.master.on('workerStart', (info) =>
        {
            let id = info.id;
            // noinspection JSUnresolvedFunction
            if(id  !== undefined && !this.workerIds.contains(id))
            {
                // noinspection JSUnresolvedFunction
                this.workerIds.add(id);
            }
        });

        // noinspection JSUnresolvedFunction
        this.master.on('workerExit', (info) =>
        {
            let id = info.id;
            if(id  !== undefined)
            {
                // noinspection JSUnresolvedFunction
                this.workerIds.remove(id);
            }
        });
    }

    private printStartedInformation()
    {
        const hostName = this.zc.getMain(Const.Main.KEYS.HOSTNAME);
        const port     = this.zc.getMain(Const.Main.KEYS.PORT);
        const path     = this.zc.getMain(Const.Main.KEYS.PATH);
        const protocol = this.zc.getMain(Const.Main.KEYS.SECURE) ? 'https' : 'http';
        const server   = `${protocol}://${hostName}:${port}/${path}`;

        Logger.log('\x1b[32m%s\x1b[0m', '   [ACTIVE]','Zation started');
        Logger.log(`            Version: ${ZationStarter.version}`);
        Logger.log(`            Your app: ${this.zc.getMain(Const.Main.KEYS.APP_NAME)}`);
        Logger.log(`            Hostname: ${hostName}`);
        Logger.log(`            Port: ${port}`);
        Logger.log(`            Time: ${TimeTools.getMoment(this.zc)}`);
        Logger.log(`            Time zone: ${this.zc.getMain(Const.Main.KEYS.TIME_ZONE)}`);
        Logger.log(`            Worker count: ${this.master.options.workers}`);
        Logger.log(`            Broker count: ${this.master.options.brokers}`);
        Logger.log(`            Server: ${server}`);
        Logger.log('            GitHub: https://github.com/ZationServer');
        Logger.log(`            StartTime: ${Date.now()-this.serverStartedTimeStamp} ms`);
    }

    private getRandomWorkerId()
    {
        // noinspection JSUnresolvedFunction
        let array = this.workerIds.toArray();
        return array[Math.floor(Math.random()*array.length)];
    }

    //PART BackgroundTasks

    private startBackgroundTasks()
    {
        //userBackgroundTasks
        const bkTsSender = new BackgroundTaskSender(this,this.zc);

        const bkTS = new BackgroundTasksSetter(
            (name,time) => {

            bkTsSender.setEveryBackgroundTask(name,time);
        },
            (name,time) => {
            bkTsSender.setAtBackgroundTask(name,time);
        });

        bkTS.setUserBackgroundTasks(this.zc);

        //systemBackgroundTask
        setInterval(() =>
        {
            this.sendToRandomWorker({systemBackgroundTasks : true});
        }
        ,this.zc.getMain(Const.Main.KEYS.SYSTEM_BACKGROUND_TASK_REFRESH_RATE));
    }

    public sendToRandomWorker(obj)
    {
        let workerId = this.getRandomWorkerId();

        if(workerId !== undefined)
        {
            if(obj.userBackgroundTask !== undefined)
            {
                Logger.printDebugInfo
                (`Worker with id: ${workerId}, start to invoke background task : '${obj.userBackgroundTask}'`);
            }
            else if(obj.systemBackgroundTasks !== undefined && obj.systemBackgroundTasks)
            {
                Logger.printDebugInfo
                (`Worker with id: ${workerId}, start to invoke system background tasks`);
            }

            this.master.sendToWorker(workerId,obj)
        }
    }
}

export = ZationStarter;