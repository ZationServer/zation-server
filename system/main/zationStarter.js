/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

const SocketCluster     = require('socketcluster');
const Const             = require('../helper/constante/constWrapper');
const ZationConfig      = require('./zationConfig');
const HashSet           = require('hashset');
const CommandStorage    = require('command-storage');
const TimeTools         = require('./../helper/tools/timeTools');

class ZationStarter
{
    constructor(options)
    {
        this._version = "0.6.0";
        this._zc = new ZationConfig(options);
        this._workerIds = new HashSet();

        console.log('\x1b[33m%s\x1b[0m', '   [BUSY]','Launching Zation');

        this._zc.printDebugInfo('Zation is launching in debug Mode!');

        this._zc.printStartDebugInfo('Start socket cluster');
        this._startSocketCluster();
        this._zc.printStartDebugInfo('Create master storage');
        this._createMasterStorage();
    }

    _startSocketCluster()
    {
        this._master = new SocketCluster({
            workers : this._zc.getMain(Const.Main.WORKERS),
            brokers : this._zc.getMain(Const.Main.BROKERS),
            rebootWorkerOnCrash: true,
            appName: this._zc.getMain(Const.Main.APP_NAME),
            workerController:__dirname + '/zationWorker.js',
            brokerController:__dirname  + '/zationBroker.js',
            environment : this._zc.getMain(Const.Main.ENVIRONMENT),
            port   : this._zc.getMain(Const.Main.PORT),
            protocol : this._zc.getMain(Const.Main.SECURE) ? 'https' : 'http',
            protocolOptions: this._zc.getMain(Const.Main.HTTPS_CONFIG),
            authKey: this._zc.getMain(Const.Main.AUTH_KEY),
            authAlgorithm: this._zc.getMain(Const.Main.AUTH_ALGORITHM),
            authPublicKey: this._zc.getMain(Const.Main.AUTH_PUBLIC_KEY),
            authPrivateKey: this._zc.getMain(Const.Main.AUTH_PRIVATE_KEY),
            authDefaultExpiry: this._zc.getMain(Const.Main.AUTH_DEFAULT_EXPIRY),
            zationConfigWorkerTransport : this._zc.getWorkerTransport()
        });

        this._zc.loadOtherConfigs();

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
        console.log('\x1b[32m%s\x1b[0m', '   [ACTIVE]','Zation started');
        console.log(`            Version: ${this._version}`);
        console.log(`            Port: ${this._zc.getMain(Const.Main.PORT)}`);
        console.log(`            Your app: ${this._zc.getMain(Const.Main.APP_NAME)}`);
        console.log(`            Time: ${TimeTools.getMoment(this._zc)}`);
        console.log(`            Time zone: ${this._zc.getMain(Const.Main.TIME_ZONE)}`);
        console.log(`            Worker count: ${this._master.options.workers}`);
        console.log(`            Broker count: ${this._master.options.brokers}`);
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
        ,this._zc.getMain(Const.Main.SYSTEM_BACKGROUND_TASK_REFRESH_RATE));
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
                this._zc.printDebugInfo
                (`Worker with id: ${workerId}, start to invoke background task number: ${obj.userBackgroundTask}`);
            }
            else if(obj.systemBackgroundTasks !== undefined && obj.systemBackgroundTasks)
            {
                this._zc.printDebugInfo
                (`Worker with id: ${workerId}, start to invoke system background tasks`);
            }

            this._master.sendToWorker(workerId,obj)
        }
    }

    //PART MasterStorage
    _createMasterStorage()
    {
        this._masterStorage = new CommandStorage();
        // noinspection JSUnresolvedFunction
        this._master.on('workerMessage',(id,data,cb) =>
        {
            if(data.storage !== undefined)
            {
                cb(null,this._masterStorage.do(data['storage']));
            }
            else
            {
                cb(false);
            }
        });
    }
}
module.exports = ZationStarter;