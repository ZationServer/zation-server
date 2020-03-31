/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import ZationWorker     = require("../../core/zationWorker");
// noinspection TypeScriptPreferShortImport
import {ControllerConfig} from "../config/definitions/parts/controllerConfig";
import BackError          from "../../api/BackError";
import SystemVersionChecker, {VersionSystemAccessCheckFunction} from "../systemVersion/systemVersionChecker";
import ControllerAccessHelper, {TokenStateAccessCheckFunction}  from "./controllerAccessHelper";
import Controller, {ControllerClass} from "../../api/Controller";
import {MainBackErrors}              from "../zationBackErrors/mainBackErrors";
import ControllerUtils, {MiddlewareInvokeFunction} from "./controllerUtils";
import {SystemController}            from "../systemController/systemControler.config";
import Bag                           from "../../api/Bag";
import ZationConfigFull              from "../config/manager/zationConfigFull";
import InputClosureCreator, {InputConsumeFunction, InputValidationCheckFunction} from "../input/inputClosureCreator";
import ApiLevelUtils, {ApiLevelSwitch, ApiLevelSwitchFunction}                   from "../apiLevel/apiLevelUtils";
import FuncUtils                                                                 from '../utils/funcUtils';
import {ErrorEventSingleton}                                                     from '../error/errorEventSingleton';

interface ControllerPrepareData {
    controllerConfig: ControllerConfig,
    controllerInstance: Controller,
    versionAccessCheck: VersionSystemAccessCheckFunction,
    systemAccessCheck: VersionSystemAccessCheckFunction,
    tokenStateCheck: TokenStateAccessCheckFunction,
    middlewareInvoke: MiddlewareInvokeFunction,
    inputConsume: InputConsumeFunction,
    inputValidationCheck: InputValidationCheckFunction,
    finallyHandle: Controller['finallyHandle'];
}

export default class ControllerPrepare
{
    private readonly zc: ZationConfigFull;
    private readonly worker: ZationWorker;
    private readonly bag: Bag;

    private readonly systemController: Record<string,ControllerPrepareData>;
    private readonly appController: Record<string,ApiLevelSwitchFunction<ControllerPrepareData>>;

    constructor(zc: ZationConfigFull,worker: ZationWorker,bag: Bag)
    {
        this.zc = zc;
        this.worker = worker;
        this.bag = bag;

        this.systemController = {};
        this.appController = {};
    }

    /**
     * It will return the controller prepared data.
     * If no controller with the API level is found, it will thrown an API level incompatible back error.
     * @param name
     * @param apiLevel
     * @param isSystemController
     */
    getControllerPrepareData(name: string,apiLevel: number,isSystemController: boolean): ControllerPrepareData
    {
        if(!isSystemController) {
            const controller = this.appController[name](apiLevel);
            if(controller !== undefined){
                return controller;
            }
            else {
                throw new BackError(MainBackErrors.apiLevelIncompatible,
                    {controller: name, apiLevel: apiLevel});
            }
        }
        else {
            return this.systemController[name];
        }
    }

    /**
     * Returns a boolean that indicates if the controller exists.
     * @param name
     * @param isSystemController
     */
    isControllerExist(name: string,isSystemController: boolean): boolean {
        return !isSystemController ? this.appController.hasOwnProperty(name) :
            this.systemController.hasOwnProperty(name);
    }

    /**
     * Checks if the controller exists.
     * It will throw a back error if the controller is not found.
     * @param name
     * @param isSystemController
     */
    checkControllerExist(name: string,isSystemController: boolean): void
    {
        if(!this.isControllerExist(name,isSystemController)) {
            if(isSystemController) {
                throw new BackError(MainBackErrors.systemControllerNotFound, {controller: name});
            }
            else {
                throw new BackError(MainBackErrors.controllerNotFound, {controller: name});
            }
        }
    }

    /**
     * Prepare all system and user controllers.
     */
    async prepare(): Promise<void> {
        const uController = this.zc.appConfig.controllers || {};

        const promises: Promise<void>[] = [];

        for(const cName in uController) {
            if(uController.hasOwnProperty(cName)) {
                promises.push(this.addController(cName,false,uController[cName]));
            }
        }

        for(const cName in SystemController) {
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
    private async addController(name: string,systemController: boolean,definition: ControllerClass | ApiLevelSwitch<ControllerClass>): Promise<void>
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
            const promises: Promise<void>[] = [];
            const preparedDataMapper: Record<any,ControllerPrepareData> = {};
            for(const k in definition){
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
    private async processController(controller: ControllerClass,name: string,apiLevel?: number): Promise<ControllerPrepareData>
    {
        const config: ControllerConfig = controller.config;
        const cInstance: Controller = new controller(name,this.worker.getPreparedBag(),apiLevel);
        await cInstance.initialize(this.worker.getPreparedBag());

        return {
            controllerConfig: config,
            controllerInstance: cInstance,
            versionAccessCheck: SystemVersionChecker.createVersionChecker(config),
            systemAccessCheck: SystemVersionChecker.createSystemChecker(config),
            tokenStateCheck: ControllerAccessHelper.createAuthAccessChecker(config.access,this.bag,name),
            middlewareInvoke: ControllerUtils.createMiddlewareInvoker(config),
            inputConsume: InputClosureCreator.createInputConsumer(config,this.bag),
            inputValidationCheck: InputClosureCreator.createValidationChecker(config,this.bag),
            finallyHandle: FuncUtils.createSafeCaller((reqBag,input) => cInstance.finallyHandle(reqBag,input),
                `An error was thrown on the: 'Controller ${name}', ${nameof<Controller>(s => s.finallyHandle)}:`,
                ErrorEventSingleton.get())
        };
    }
}