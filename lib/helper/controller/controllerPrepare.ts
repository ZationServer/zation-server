/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

const Const            = require('../constants/constWrapper');
const TaskError        = require('../../api/TaskError');
const MainErrors       = require('../zationTaskErrors/mainTaskErrors');

const systemController       = require('../systemController/systemControler.config');

const ControllerTools  = require('./controllerTools');

class ControllerPrepare
{
    constructor(zc,worker)
    {
        this._zc = zc;
        this._worker = worker;

        this._systemController = {};
        this._appController = {};
    }

    getControllerInstance(name)
    {
        return this._getController(name).instance;
    }


    getControllerConfig(name)
    {
        return this._getController(name).config;
    }

    _getController(name)
    {
        if(this._appController.hasOwnProperty(name))
        {
            return this._appController[name];
        }
        else if(this._systemController.hasOwnProperty(name))
        {
            return this._systemController[name];
        }
        else
        {
            return {};
        }
    }

    isControllerExist(name)
    {
        return this._appController.hasOwnProperty(name) || this._systemController.hasOwnProperty(name);
    }

    checkControllerExist(name)
    {
        if(!this.isControllerExist(name))
        {
            throw new TaskError(MainErrors.controllerNotFound, {controllerName: name});
        }
    }

    async prepare()
    {
        let uController = this._zc.getApp(Const.App.KEYS.CONTROLLER);

        let promises = [];

        for(let cName in uController)
        {
            if(uController.hasOwnProperty(cName))
            {
                promises.push(this.addController(cName,uController[cName]));
            }
        }

        for(let cName in systemController)
        {
            if(systemController.hasOwnProperty(cName))
            {
                promises.push(this.addController(cName,systemController[cName]));
            }
        }

        await Promise.all(promises);
    }

    async addController(name,config)
    {
        let isSystemC = ControllerTools.isSystemController(config);
        let cClass = ControllerTools.getControllerClass(config,this._zc);
        let cInstance = new cClass();
        await cInstance.initialize(this._worker.getPreparedSmallBag());
        if(!isSystemC)
        {
            this._appController[name] = {config : config,controller : cInstance};
        }
        else
        {
            this._systemController[name] = {config : config,controller : cInstance};
        }
    }
}

module.exports = ControllerPrepare;