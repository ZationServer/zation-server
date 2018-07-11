/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */
const  SocketCluster : any     = require('socketcluster');
import Const                = require('../helper/constants/constWrapper');
import Logger               = require('../helper/logger/logger');
import ZationConfig         = require('./zationConfig');
import ConfigChecker        = require('../helper/config/configChecker');
import ConfigErrorBag       = require('../helper/config/configErrorBag');
import HashSet              = require('hashset');
import TimeTools            = require('../helper/tools/timeTools');
import PrepareClientJs      = require('../client/prepareClientJs');
import MasterTempDbEngine   = require('../helper/tempDb/masterTempDbEngine');

class ZationStarter
{
    private static instance : ZationStarter | null = null;
    private static readonly version : string = '0.6.5';

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
                    Logger.printDebugWarning(`Exception when trying to start server -> ${e.toString()}`);
                    console.log(e);
                }
            })();
        }
        else
        {
            console.log('\x1b[31m%s\x1b[0m','   [WARNING]','You can only start zation once.');
        }
    }

    private async start()
    {
        console.log('\x1b[33m%s\x1b[0m', '   [BUSY]','Launching Zation');
        Logger.printDebugInfo('Zation is launching in debug Mode!');

        this.zc.loadOtherConfigs();

        Logger.printStartDebugInfo(`Zation is checking the config files!`);

        let configErrorBag = new ConfigErrorBag();
        new ConfigChecker(this.zc,configErrorBag);
        if(configErrorBag.hasConfigError())
        {
            Logger.printConfigErrorBag(configErrorBag);
            process.exit();
        }

        Logger.printStartDebugInfo(`Zation has found no errors in the config!`);

        Logger.printStartDebugInfo('Build server settings file');
        PrepareClientJs.createServerSettingsFile(this.zc);

        this.tempDbEngine = new MasterTempDbEngine(this.zc);
        await this.tempDbEngine.init();

        Logger.printStartDebugInfo('Start socket cluster');
        this.startSocketCluster();
    }

    private startSocketCluster()
    {
        this.master = new SocketCluster({
            workers : this.zc.getMain(Const.Main.KEYS.WORKERS),
            brokers : this.zc.getMain(Const.Main.KEYS.BROKERS),
            rebootWorkerOnCrash: true,
            appName: this.zc.getMain(Const.Main.KEYS.APP_NAME),
            workerController:__dirname + '/zationWorker.js',
            brokerController:__dirname  + '/zationBroker.js',
            environment : this.zc.getMain(Const.Main.KEYS.ENVIRONMENT),
            port   : this.zc.getMain(Const.Main.KEYS.PORT),
            protocol : this.zc.getMain(Const.Main.KEYS.SECURE) ? 'https' : 'http',
            protocolOptions: this.zc.getMain(Const.Main.KEYS.HTTPS_CONFIG),
            wsEngine: 'sc-uws',
            authKey: this.zc.getMain(Const.Main.KEYS.AUTH_KEY),
            authAlgorithm: this.zc.getMain(Const.Main.KEYS.AUTH_ALGORITHM),
            authPublicKey: this.zc.getMain(Const.Main.KEYS.AUTH_PUBLIC_KEY),
            authPrivateKey: this.zc.getMain(Const.Main.KEYS.AUTH_PRIVATE_KEY),
            authDefaultExpiry: this.zc.getMain(Const.Main.KEYS.AUTH_DEFAULT_EXPIRY),
            zationConfigWorkerTransport : this.zc.getWorkerTransport(),
            zationServerVersion : ZationStarter.version,
            zationServerStartedTimeStamp : this.serverStartedTimeStamp,
            ipcAckTimeout: 3000,
        });

        // noinspection JSUnresolvedFunction
        this.master.on('ready',() =>
        {
            this.startBackgroundTasks();

            this.zc.emitEvent(Const.Event.ZATION_IS_STARTED, (f) =>
            {
                f(this.zc.getSomeInformation());
            });

           this.printStartedInformation();

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
        let hostName = this.zc.getMain(Const.Main.KEYS.HOSTNAME);
        let port     = this.zc.getMain(Const.Main.KEYS.PORT);
        let protocol = this.zc.getMain(Const.Main.KEYS.SECURE) ? 'https' : 'http';
        let server   = `${protocol}://${hostName}:${port}`;

        console.log('\x1b[32m%s\x1b[0m', '   [ACTIVE]','Zation started');
        console.log(`            Version: ${ZationStarter.version}`);
        console.log(`            Your app: ${this.zc.getMain(Const.Main.KEYS.APP_NAME)}`);
        console.log(`            Hostname: ${hostName}`);
        console.log(`            Port: ${port}`);
        console.log(`            Time: ${TimeTools.getMoment(this.zc)}`);
        console.log(`            Time zone: ${this.zc.getMain(Const.Main.KEYS.TIME_ZONE)}`);
        console.log(`            Worker count: ${this.master.options.workers}`);
        console.log(`            Broker count: ${this.master.options.brokers}`);
        console.log(`            Server: ${server}`);
        console.log('            GitHub: https://github.com/ZationServer');
        console.log(`            StartTime: ${Date.now()-this.serverStartedTimeStamp} ms`);
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
        this.zc.emitEvent(Const.Event.ZATION_BACKGROUND_TASK,(f) =>
        {
            let id = 0;
            f((time) => {
                this.setEveryBackgroundTask(id,time);
                id++;
            }
            ,(time) => {
                this.setAtBackgroundTask(id,time);
                id++;
            });
        });

        //systemBackgroundTask
        setInterval(() =>
        {
            this.sendToRandomWorker({systemBackgroundTasks : true});
        }
        ,this.zc.getMain(Const.Main.KEYS.SYSTEM_BACKGROUND_TASK_REFRESH_RATE));
    }

    private setEveryBackgroundTask(id,time)
    {
        if(Number.isInteger(time))
        {
            setInterval(() => {
                this.startUserBackgroundTask(id);
            },time);
        }
        else if(typeof time === 'object')
        {
            let set = () => {
                let tillTime = TimeTools.processTaskTriggerTime(time,this.zc);
                if(tillTime && tillTime > 0)
                {
                    setTimeout(() => {
                        this.startUserBackgroundTask(id);
                        set();
                    },tillTime);
                }
                else
                {
                    throw Error(`Planed every background task with id ${id} goes wrong.`);
                }
            };
            set();
        }
    }

    private setAtBackgroundTask(id,time)
    {
        if(Number.isInteger(time))
        {
            setTimeout(() => {
                this.startUserBackgroundTask(id);
            },time);
        }
        else if(typeof time === 'object')
        {
            let tillTime = TimeTools.processTaskTriggerTime(time,this.zc);
            if(tillTime && tillTime > 0)
            {
                setTimeout(() => {
                    this.startUserBackgroundTask(id);
                },tillTime);
            }
            else
            {
                throw Error(`Planed at background task with id ${id} goes wrong.`);
            }
        }
    }

    private startUserBackgroundTask(id)
    {
        this.sendToRandomWorker({userBackgroundTask : id});
    }

    private sendToRandomWorker(obj)
    {
        let workerId = this.getRandomWorkerId();

        if(workerId !== undefined)
        {
            if(obj.userBackgroundTask !== undefined)
            {
                Logger.printDebugInfo
                (`Worker with id: ${workerId}, start to invoke background task number: ${obj.userBackgroundTask}`);
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