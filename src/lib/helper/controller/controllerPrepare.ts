/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import ZationConfig     = require("../../main/zationConfig");
import Const            = require('../constants/constWrapper');
import TaskError        = require('../../api/TaskError');
import MainErrors       = require('../zationTaskErrors/mainTaskErrors');
import systemController = require('../systemController/systemControler.config');
import ControllerTools  = require('./controllerTools');
import ZationWorker     = require("../../main/zationWorker");
import Controller       = require("../../api/Controller");

class ControllerPrepare
{
    private readonly zc : ZationConfig;
    private readonly worker : ZationWorker;

    private readonly systemController : object;
    private readonly appController : object;
    
    constructor(zc,worker)
    {
        this.zc = zc;
        this.worker = worker;

        this.systemController = {};
        this.appController = {};
    }

    getControllerInstance(name : string) : Controller
    {
        return this.getController(name).instance;
    }


    getControllerConfig(name : string) : object
    {
        return this.getController(name).config;
    }

    private getController(name : string) : any
    {
        if(this.appController.hasOwnProperty(name))
        {
            return this.appController[name];
        }
        else if(this.systemController.hasOwnProperty(name))
        {
            return this.systemController[name];
        }
        else
        {
            return {};
        }
    }

    isControllerExist(name : string) : boolean
    {
        return this.appController.hasOwnProperty(name) || this.systemController.hasOwnProperty(name);
    }

    checkControllerExist(name : string) : void
    {
        if(!this.isControllerExist(name))
        {
            throw new TaskError(MainErrors.controllerNotFound, {controllerName: name});
        }
    }

    async prepare() : Promise<void>
    {
        let uController = this.zc.getApp(Const.App.KEYS.CONTROLLER);

        let promises : Promise<void>[] = [];

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

    async addController(name : string,config : object) : Promise<void>
    {
        let isSystemC    = ControllerTools.isSystemController(config);
        let cClass : any = ControllerTools.getControllerClass(config,this.zc);
        let cInstance    = new cClass();

        await cInstance.initialize(this.worker.getPreparedSmallBag());
        if(!isSystemC)
        {
            this.appController[name] = {config : config,controller : cInstance};
        }
        else
        {
            this.systemController[name] = {config : config,controller : cInstance};
        }
    }
}

export = ControllerPrepare;