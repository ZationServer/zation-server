/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import ZationConfig     = require("../../main/zationConfig");
import MainErrors       = require('../zationTaskErrors/mainTaskErrors');
import systemController = require('../systemController/systemControler.config');
import ControllerTools  = require('./controllerTools');
import ZationWorker     = require("../../main/zationWorker");
// noinspection TypeScriptPreferShortImport
import {Controller, ControllerClass} from '../../api/Controller';
// noinspection TypeScriptPreferShortImport
import {ControllerConfig} from "../configs/appConfig";
import BackError          from "../../api/BackError";
import {BaseSHBridge} from "../bridges/baseSHBridge";
import SystemVersionChecker, {VersionSystemAccessCheckFunction} from "../version/systemVersionChecker";

interface ControllerPrepareData {
    controllerConfig : ControllerConfig,
    controllerInstance : Controller,
    versionAccessCheck : VersionSystemAccessCheckFunction,
    systemAccessCheck : VersionSystemAccessCheckFunction
}

export default class ControllerPrepare
{
    private readonly zc : ZationConfig;
    private readonly worker : ZationWorker;

    private readonly systemController : Record<string,ControllerPrepareData>;
    private readonly appController : Record<string,ControllerPrepareData>;

    constructor(zc,worker)
    {
        this.zc = zc;
        this.worker = worker;

        this.systemController = {};
        this.appController = {};
    }

    // noinspection JSUnusedGlobalSymbols
    getControllerInstance(name : string,isSystemController : boolean) : Controller
    {
        return this.getControllerPrepareData(name,isSystemController).controllerInstance;
    }

    getControllerConfig(name : string,isSystemController : boolean) : ControllerConfig
    {
        return this.getControllerPrepareData(name,isSystemController).controllerConfig;
    }

    getControllerPrepareData(name : string, isSystemController : boolean) : ControllerPrepareData
    {
        if(!isSystemController) {
            return this.appController[name];
        }
        else {
            return this.systemController[name];
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
                throw new BackError(MainErrors.systemControllerNotFound, {controllerName: name});
            }
            else {
                throw new BackError(MainErrors.controllerNotFound, {controllerName: name});
            }
        }
    }

    async prepare() : Promise<void>
    {
        // @ts-ignore
        const uController : Record<string,InternControllerConfig> = this.zc.appConfig.controllers;

        let promises : Promise<void>[] = [];

        for(let cName in uController) {
            if(uController.hasOwnProperty(cName)) {
                promises.push(this.addController(cName,uController[cName]));
            }
        }

        for(let cName in systemController) {
            if(systemController.hasOwnProperty(cName)) {
                promises.push(this.addController(cName,systemController[cName]));
            }
        }

        await Promise.all(promises);
    }

    async addController(name : string,controllerClass : ControllerClass) : Promise<void>
    {
        const config : ControllerConfig = controllerClass.config;

        const isSystemC = ControllerTools.isSystemController(config);
        const cInstance : Controller = new controllerClass(name,this.worker.getPreparedSmallBag());

        this.addControllerConfigAccessKey(config);

        await cInstance.initialize(this.worker.getPreparedSmallBag());

        this.bindPrepareHandleFunctions(cInstance,config.prepareHandle);


        const controllerPrepareData : ControllerPrepareData = {
            controllerConfig : config,
            controllerInstance: cInstance,
            versionAccessCheck : SystemVersionChecker.createVersionChecker(config),
            systemAccessCheck : SystemVersionChecker.createSystemChecker(config)
        };

        if(!isSystemC) {
            this.appController[name] = controllerPrepareData;
        }
        else {
            this.systemController[name] = controllerPrepareData;
        }
    }

    bindPrepareHandleFunctions(cInstance : Controller,preparedHandleValue) {
        if(Array.isArray(preparedHandleValue)) {
            preparedHandleValue.forEach((f) => {
                f.bind(cInstance);
            });
        }
        else if(typeof preparedHandleValue === 'function'){
            preparedHandleValue.bind(cInstance);
        }
    }

    // noinspection JSMethodCanBeStatic
    addControllerConfigAccessKey(config : ControllerConfig) : void
    {
        let notAccess = config.notAccess;
        let access    = config.access;
        let keyWord : string | undefined = undefined;

        //double keyword is checked in the starter checkConfig
        //search One
        if(notAccess !== undefined && access === undefined) {
            keyWord = nameof<ControllerConfig>(s => s.notAccess);
        }
        else if(notAccess === undefined && access !== undefined) {
            keyWord = nameof<ControllerConfig>(s => s.access);
        }
        config['speedAccessKey'] = keyWord;
    }
}

