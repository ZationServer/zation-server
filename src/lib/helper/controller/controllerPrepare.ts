/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import ZationWorker     = require("../../main/zationWorker");
// noinspection TypeScriptPreferShortImport
import {ControllerConfig} from "../configs/appConfig";
import BackError          from "../../api/BackError";
import SystemVersionChecker, {VersionSystemAccessCheckFunction} from "../version/systemVersionChecker";
import AuthAccessChecker, {AuthAccessCheckFunction} from "../auth/authAccessChecker";
import Controller, {ControllerClass} from "../../api/Controller";
import ZationConfig                  from "../../main/zationConfig";
import {MainBackErrors}              from "../zationBackErrors/mainBackErrors";
import ControllerUtils, {PrepareHandleInvokeFunction} from "./controllerUtils";
import {SystemController}            from "../systemController/systemControler.config";

interface ControllerPrepareData {
    controllerConfig : ControllerConfig,
    controllerInstance : Controller,
    versionAccessCheck : VersionSystemAccessCheckFunction,
    systemAccessCheck : VersionSystemAccessCheckFunction,
    authAccessCheck : AuthAccessCheckFunction,
    prepareHandleInvoke : PrepareHandleInvokeFunction
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
                throw new BackError(MainBackErrors.systemControllerNotFound, {controllerName: name});
            }
            else {
                throw new BackError(MainBackErrors.controllerNotFound, {controllerName: name});
            }
        }
    }

    async prepare() : Promise<void>
    {
        const uController : Record<string,ControllerClass> = this.zc.appConfig.controllers || {};

        let promises : Promise<void>[] = [];

        for(let cName in uController) {
            if(uController.hasOwnProperty(cName)) {
                promises.push(this.addController(cName,uController[cName]));
            }
        }

        for(let cName in SystemController) {
            if(SystemController.hasOwnProperty(cName)) {
                promises.push(this.addController(cName,SystemController[cName]));
            }
        }

        await Promise.all(promises);
    }

    async addController(name : string,controllerClass : ControllerClass) : Promise<void>
    {
        const config : ControllerConfig = controllerClass.config;

        const isSystemC = ControllerUtils.isSystemController(config);
        const cInstance : Controller = new controllerClass(name,this.worker.getPreparedSmallBag());

        await cInstance.initialize(this.worker.getPreparedSmallBag());

        const controllerPrepareData : ControllerPrepareData = {
            controllerConfig : config,
            controllerInstance: cInstance,
            versionAccessCheck : SystemVersionChecker.createVersionChecker(config),
            systemAccessCheck : SystemVersionChecker.createSystemChecker(config),
            authAccessCheck : AuthAccessChecker.createControllerAccessChecker(config),
            prepareHandleInvoke : ControllerUtils.createPrepareHandleInvoker(config)
        };

        if(!isSystemC) {
            this.appController[name] = controllerPrepareData;
        }
        else {
            this.systemController[name] = controllerPrepareData;
        }
    }
}

