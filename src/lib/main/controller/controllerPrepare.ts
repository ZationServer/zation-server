/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import ZationWorker     = require("../../core/zationWorker");
// noinspection TypeScriptPreferShortImport
import {ControllerConfig} from "../config/definitions/controllerConfig";
import BackError          from "../../api/BackError";
import SystemVersionChecker, {VersionSystemAccessCheckFunction} from "../systemVersion/systemVersionChecker";
import AuthAccessChecker, {TokenStateAccessCheckFunction} from "../auth/authAccessChecker";
import Controller, {ControllerClass} from "../../api/Controller";
import {MainBackErrors}              from "../zationBackErrors/mainBackErrors";
import ControllerUtils, {MiddlewareInvokeFunction} from "./controllerUtils";
import {SystemController}            from "../systemController/systemControler.config";
import Bag                           from "../../api/Bag";
import ZationConfigFull              from "../config/manager/zationConfigFull";
import InputClosureCreator, {InputConsumeFunction, InputValidationCheckFunction} from "../input/inputClosureCreator";
import ApiLevelUtils, {ApiLevelSwitch, ApiLevelSwitchFunction}                   from "../apiLevel/apiLevelUtils";

interface ControllerPrepareData {
    controllerConfig : ControllerConfig,
    controllerInstance : Controller,
    versionAccessCheck : VersionSystemAccessCheckFunction,
    systemAccessCheck : VersionSystemAccessCheckFunction,
    tokenStateCheck : TokenStateAccessCheckFunction,
    middlewareInvoke : MiddlewareInvokeFunction,
    inputConsume : InputConsumeFunction,
    inputValidationCheck : InputValidationCheckFunction
}

export default class ControllerPrepare
{
    private readonly zc : ZationConfigFull;
    private readonly worker : ZationWorker;
    private readonly bag : Bag;

    private readonly systemController : Record<string,ControllerPrepareData>;
    private readonly appController : Record<string,ApiLevelSwitchFunction<ControllerPrepareData>>;

    constructor(zc : ZationConfigFull,worker : ZationWorker,bag : Bag)
    {
        this.zc = zc;
        this.worker = worker;
        this.bag = bag;

        this.systemController = {};
        this.appController = {};
    }

    /**
     * It will return the controller prepared data.
     * If no controller with the API level is found, it will thrown an API level not compatible back error.
     * @param id
     * @param apiLevel
     * @param isSystemController
     */
    getControllerPrepareData(id : string,apiLevel : number,isSystemController : boolean) : ControllerPrepareData
    {
        if(!isSystemController) {
            const controller = this.appController[id](apiLevel);
            if(controller !== undefined){
                return controller;
            }
            else {
                throw new BackError(MainBackErrors.apiLevelNotCompatible,
                    {controller: id, apiLevel : apiLevel});
            }
        }
        else {
            return this.systemController[id];
        }
    }

    /**
     * Returns a boolean that indicates if the controller exists.
     * @param id
     * @param isSystemController
     */
    isControllerExist(id : string,isSystemController : boolean) : boolean {
        return !isSystemController ? this.appController.hasOwnProperty(id) :
            this.systemController.hasOwnProperty(id);
    }

    /**
     * Checks if the controller exists.
     * It will throw a back error if the controller is not found.
     * @param id
     * @param isSystemController
     */
    checkControllerExist(id : string,isSystemController : boolean) : void
    {
        if(!this.isControllerExist(id,isSystemController)) {
            if(isSystemController) {
                throw new BackError(MainBackErrors.systemControllerNotFound, {controller: id});
            }
            else {
                throw new BackError(MainBackErrors.controllerNotFound, {controller: id});
            }
        }
    }

    /**
     * Prepare all system and user controllers.
     */
    async prepare() : Promise<void> {
        const uController = this.zc.appConfig.controllers || {};

        const promises : Promise<void>[] = [];

        for(let cName in uController) {
            if(uController.hasOwnProperty(cName)) {
                promises.push(this.addController(cName,false,uController[cName]));
            }
        }

        for(let cName in SystemController) {
            if(SystemController.hasOwnProperty(cName)) {
                promises.push(this.addController(cName,true,SystemController[cName]));
            }
        }

        await Promise.all(promises);
    }

    /**
     * Add a controller to the prepare process.
     * @param name
     * @param systemController
     * @param definition
     */
    private async addController(name : string,systemController : boolean,definition : ControllerClass | ApiLevelSwitch<ControllerClass>) : Promise<void>
    {
        if(typeof definition === 'function') {
            const preparedControllerData = await this.processController(definition,name);
            if(systemController){
                this.systemController[name] = preparedControllerData;
            }
            else {
                this.appController[name] = () => {
                    return preparedControllerData
                };
            }
        }
        else {
            const promises : Promise<void>[] = [];
            const preparedDataMapper : Record<any,ControllerPrepareData> = {};
            for(let k in definition){
                if(definition.hasOwnProperty(k)) {
                    promises.push((async () => {
                        preparedDataMapper[k] = await this.processController(definition[k],name,parseInt(k));
                    })());
                }
            }
            await Promise.all(promises);
            this.appController[name] = ApiLevelUtils.createApiLevelSwitcher<ControllerPrepareData>(preparedDataMapper);
        }
    }

    /**
     * Process a controller and create the prepared data.
     * @param controller
     * @param name
     * @param apiLevel
     */
    private async processController(controller : ControllerClass,name : string,apiLevel ?: number) : Promise<ControllerPrepareData>
    {
        const config : ControllerConfig = controller.config;
        const cInstance : Controller = new controller(name,this.worker.getPreparedBag(),apiLevel);
        await cInstance.initialize(this.worker.getPreparedBag());

        return  {
            controllerConfig : config,
            controllerInstance: cInstance,
            versionAccessCheck : SystemVersionChecker.createVersionChecker(config),
            systemAccessCheck : SystemVersionChecker.createSystemChecker(config),
            tokenStateCheck : AuthAccessChecker.createAuthAccessChecker(config,this.bag),
            middlewareInvoke : ControllerUtils.createMiddlewareInvoker(config),
            inputConsume : InputClosureCreator.createInputConsumer(config,this.bag),
            inputValidationCheck : InputClosureCreator.createValidationChecker(config,this.bag)
        };
    }
}