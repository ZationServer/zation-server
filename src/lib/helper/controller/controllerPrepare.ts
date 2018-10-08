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
import {Controller}       from'../../api/Controller';

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

    getControllerInstance(name : string,isSystemController : boolean) : Controller
    {
        return this.getController(name,isSystemController).instance;
    }

    getControllerConfig(name : string,isSystemController : boolean) : object
    {
        return this.getController(name,isSystemController).config;
    }

    private getController(name : string,isSystemController : boolean) : any
    {
        if(!isSystemController)
        {
            return this.appController[name];
        }
        else if(isSystemController)
        {
            return this.systemController[name];
        }
        else
        {
            return {};
        }
    }

    isControllerExist(name : string,isSystemController : boolean) : boolean
    {
        if(!isSystemController) {
            return this.appController.hasOwnProperty(name)
        }
        else {
            return this.systemController.hasOwnProperty(name);
        }
    }

    checkControllerExist(name : string,isSystemController : boolean) : void
    {
        if(!this.isControllerExist(name,isSystemController))
        {
            if(isSystemController) {
                throw new TaskError(MainErrors.systemControllerNotFound, {controllerName: name});
            }
            else {
                throw new TaskError(MainErrors.controllerNotFound, {controllerName: name});
            }
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
        let cInstance : Controller = new cClass();
        this.addControllerConfigAccessKey(config);

        await cInstance.initialize(this.worker.getPreparedSmallBag());
        if(!isSystemC)
        {
            this.appController[name] = {config : config,instance : cInstance};
        }
        else
        {
            this.systemController[name] = {config : config,instance : cInstance};
        }
    }

    // noinspection JSMethodCanBeStatic
    addControllerConfigAccessKey(config : object) : void
    {
        let notAccess = config[Const.App.CONTROLLER.NOT_ACCESS];
        let access    = config[Const.App.CONTROLLER.ACCESS];
        let keyWord = '';

        //double keyword is checked in the starter checkConfig
        //search One
        if(notAccess !== undefined && access === undefined) {
            keyWord = Const.App.CONTROLLER.NOT_ACCESS;
        }
        else if(notAccess === undefined && access !== undefined) {
            keyWord = Const.App.CONTROLLER.ACCESS;
        }
        config['speedAccessKey'] = keyWord;
    }
}

export = ControllerPrepare;