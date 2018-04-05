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

class ZationStarter
{
    constructor(options,debug = false)
    {
        this._zc = new ZationConfig(options,debug);
        this._workerIds = new HashSet();

        if(this._zc.isDebug())
        {
            console.log('Zation is running in debug Mode!');
        }

        this._startSocketCluster();
        this._createMasterStorage();
        this._startBackgroundTasks();
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
            port   : this._zc.getMain(Const.Main.PORT),
            protocol : this._zc.getMain(Const.Main.SECURE) ? 'https' : 'http',
            protocolOptions: this._zc.getMain(Const.Main.HTTPS_CONFIG),
            authKey: this._zc.getMain(Const.Main.AUTH_KEY),
            authAlgorithm: this._zc.getMain(Const.Main.AUTH_ALGORITHM),
            authPublicKey: this._zc.getMain(Const.Main.AUTH_PUBLIC_KEY),
            authPrivateKey: this._zc.getMain(Const.Main.AUTH_PRIVATE_KEY),
            zationConfigWorkerTransport : this._zc.getWorkerTransport()
        });

        this._zc.loadOtherConfigs();

        // noinspection JSUnresolvedFunction
        this._master.on('ready',() =>
        {
            this._zc.emitEvent(Const.Event.ZATION_IS_STARTED, (f) =>
            {
                f(this._zc.getSomeInformation());
            });
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
            f((refreshRate) =>
            {
                this._startUserBackgroundTask(refreshRate,id);
                id++;
            });
        });

        //systemBackgroundTask
        this._startBackgroundTask(
            this._zc.getMain(Const.Main.SYSTEM_BACKGROUND_TASK_REFRESH_RATE),
            {systemBackgroundTasks : true}
        );
    }

    _startUserBackgroundTask(refreshRate,id)
    {
        this._startBackgroundTask(refreshRate,{userBackgroundTask : id});
    }

    _startBackgroundTask(refreshRate,obj)
    {
        setTimeout(() =>
            {
                this._master.sendToWorker(this._getRandomWorkerId(),obj)
            }
            ,refreshRate);
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
        })
    }
}
module.exports = ZationStarter;