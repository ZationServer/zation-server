/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

const SocketCluster        = require('socketcluster');
const Const                = require('../helper/constants/constWrapper');
const Logger               = require('./../helper/logger/logger');
const ZationConfig         = require('./zationConfig');
const ConfigChecker        = require('./../helper/config/configChecker');
const ConfigErrorBag       = require('./../helper/config/configErrorBag');
const HashSet              = require('hashset');
const TimeTools            = require('./../helper/tools/timeTools');
const PrepareClientJs      = require('../client/prepareClientJs');
const MasterTempDbEngine   = require('../helper/tempDb/masterTempDbEngine');

class ZationStarter
{
    constructor(options)
    {
        this._version = "0.6.0";
        this._serverStartedTimeStamp = Date.now();

        this._zc = new ZationConfig(options);
        //setLogger
        Logger._zc = this._zc;

        this._workerIds = new HashSet();

        (async () =>
        {
            try
            {
                await this._start();
            }
            catch (e)
            {
                Logger.printDebugWarning(`Exception when trying to start server -> ${e.toString()}`);
                console.log(e);
            }
        })();
    }

    async _start()
    {
        console.log('\x1b[33m%s\x1b[0m', '   [BUSY]','Launching Zation');
        Logger.printDebugInfo('Zation is launching in debug Mode!');

        this._zc.loadOtherConfigs();

        Logger.printStartDebugInfo(`Zation is checking the config files!`);
        let configErrorBag = new ConfigErrorBag();
        new ConfigChecker(this._zc,configErrorBag);
        if(configErrorBag.hasConfigError())
        {
            Logger.printConfigErrorBag(configErrorBag);
            process.exit();
        }

        Logger.printStartDebugInfo(`Zation has found no errors in the config!`);

        Logger.printStartDebugInfo('Build server settings file');
        PrepareClientJs.createServerSettingsFile(this._zc);

        this._tempDbEngine = new MasterTempDbEngine(this._zc);
        await this._tempDbEngine.init();

        Logger.printStartDebugInfo('Start socket cluster');
        this._startSocketCluster();
    }

    _startSocketCluster()
    {
        this._master = new SocketCluster({
            workers : this._zc.getMain(Const.Main.KEYS.WORKERS),
            brokers : this._zc.getMain(Const.Main.KEYS.BROKERS),
            rebootWorkerOnCrash: true,
            appName: this._zc.getMain(Const.Main.KEYS.APP_NAME),
            workerController:__dirname + '/zationWorker.js',
            brokerController:__dirname  + '/zationBroker.js',
            environment : this._zc.getMain(Const.Main.KEYS.ENVIRONMENT),
            port   : this._zc.getMain(Const.Main.KEYS.PORT),
            protocol : this._zc.getMain(Const.Main.KEYS.SECURE) ? 'https' : 'http',
            protocolOptions: this._zc.getMain(Const.Main.KEYS.HTTPS_CONFIG),
            wsEngine: 'sc-uws',
            authKey: this._zc.getMain(Const.Main.KEYS.AUTH_KEY),
            authAlgorithm: this._zc.getMain(Const.Main.KEYS.AUTH_ALGORITHM),
            authPublicKey: this._zc.getMain(Const.Main.KEYS.AUTH_PUBLIC_KEY),
            authPrivateKey: this._zc.getMain(Const.Main.KEYS.AUTH_PRIVATE_KEY),
            authDefaultExpiry: this._zc.getMain(Const.Main.KEYS.AUTH_DEFAULT_EXPIRY),
            zationConfigWorkerTransport : this._zc.getWorkerTransport(),
            zationServerVersion : this._version,
            zationServerStartedTimeStamp : this._serverStartedTimeStamp,
            ipcAckTimeout: 3000,
        });

        // noinspection JSUnresolvedFunction
        this._master.on('ready',() =>
        {
            this._startBackgroundTasks();

            this._zc.emitEvent(Const.Event.ZATION_IS_STARTED, (f) =>
            {
                f(this._zc.getSomeInformation());
            });

           this._printStartedInformation();

        });

        this._count = 0;

        // noinspection JSUnresolvedFunction
        this._master.on('workerMessage', async (wId,data,resp) =>
        {
            this._count++;
            console.log(this._count);

            if(data['memoryDbRequest'])
            {
                await this._tempDbEngine.processMemoryDbReq(data['memoryDbRequestData'],resp);
            }
            else
            {
                resp(new Error('Unknown command!'));
            }
        });

        // noinspection JSUnresolvedFunction
        this._master.on('workerStart', (info) =>
        {
            let id = info.id;
            // noinspection JSUnresolvedFunction
            if(id  !== undefined && !this._workerIds.contains(id))
            {
                // noinspection JSUnresolvedFunction
                this._workerIds.add(id);
            }
        });

        // noinspection JSUnresolvedFunction
        this._master.on('workerExit', (info) =>
        {
            let id = info.id;
            if(id  !== undefined)
            {
                // noinspection JSUnresolvedFunction
                this._workerIds.remove(id);
            }
        });
    }

    _printStartedInformation()
    {
        let hostName = this._zc.getMain(Const.Main.KEYS.HOSTNAME);
        let port     = this._zc.getMain(Const.Main.KEYS.PORT);
        let protocol = this._zc.getMain(Const.Main.KEYS.SECURE) ? 'https' : 'http';
        let server   = `${protocol}://${hostName}:${port}`;

        console.log('\x1b[32m%s\x1b[0m', '   [ACTIVE]','Zation started');
        console.log(`            Version: ${this._version}`);
        console.log(`            Your app: ${this._zc.getMain(Const.Main.KEYS.APP_NAME)}`);
        console.log(`            Hostname: ${hostName}`);
        console.log(`            Port: ${port}`);
        console.log(`            Time: ${TimeTools.getMoment(this._zc)}`);
        console.log(`            Time zone: ${this._zc.getMain(Const.Main.KEYS.TIME_ZONE)}`);
        console.log(`            Worker count: ${this._master.options.workers}`);
        console.log(`            Broker count: ${this._master.options.brokers}`);
        console.log(`            Server: ${server}`);
        console.log('            GitHub: https://github.com/ZationServer');
    }

    _getRandomWorkerId()
    {
        // noinspection JSUnresolvedFunction
        let array = this._workerIds.toArray();
        return array[Math.floor(Math.random()*array.length)];
    }

    //PART BackgroundTasks

    _startBackgroundTasks()
    {
        //userBackgroundTasks
        this._zc.emitEvent(Const.Event.ZATION_BACKGROUND_TASK,(f) =>
        {
            let id = 0;
            f((time) => {
                this._setEveryBackgroundTask(id,time);
                id++;
            }
            ,(time) => {
                this._setAtBackgroundTask(id,time);
                id++;
            });
        });

        //systemBackgroundTask
        setInterval(() =>
        {
            this._sendToRandomWorker({systemBackgroundTasks : true});
        }
        ,this._zc.getMain(Const.Main.KEYS.SYSTEM_BACKGROUND_TASK_REFRESH_RATE));
    }

    _setEveryBackgroundTask(id,time)
    {
        if(Number.isInteger(time))
        {
            setInterval(() => {
                this._startUserBackgroundTask(id);
            },time);
        }
        else if(typeof time === 'object')
        {
            let set = () => {
                let tillTime = TimeTools.processTaskTriggerTime(time,this._zc);
                if(typeof tillTime === 'number' && tillTime > 0)
                {
                    setTimeout(() => {
                        this._startUserBackgroundTask(id);
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

    _setAtBackgroundTask(id,time)
    {
        if(Number.isInteger(time))
        {
            setTimeout(() => {
                this._startUserBackgroundTask(id);
            },time);
        }
        else if(typeof time === 'object')
        {
            let tillTime = TimeTools.processTaskTriggerTime(time,this._zc);
            if(typeof tillTime === 'number' && tillTime > 0)
            {
                setTimeout(() => {
                    this._startUserBackgroundTask(id);
                },tillTime);
            }
            else
            {
                throw Error(`Planed at background task with id ${id} goes wrong.`);
            }
        }
    }

    _startUserBackgroundTask(id)
    {
        this._sendToRandomWorker({userBackgroundTask : id});
    }

    _sendToRandomWorker(obj)
    {
        let workerId = this._getRandomWorkerId();

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

            this._master.sendToWorker(workerId,obj)
        }
    }

}
module.exports = ZationStarter;