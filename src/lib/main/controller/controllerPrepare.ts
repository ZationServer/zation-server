/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import ZationWorker     = require("../../core/zationWorker");
// noinspection TypeScriptPreferShortImport,ES6PreferShortImport
import {ControllerConfig} from "../config/definitions/parts/controllerConfig";
import BackError          from "../../api/BackError";
import SystemVersionChecker, {VersionSystemAccessCheckFunction} from "../systemVersion/systemVersionChecker";
import ControllerAccessHelper, {TokenStateAccessCheckFunction}  from "./controllerAccessHelper";
import Controller, {ControllerClass} from "../../api/Controller";
import {MainBackErrors}              from "../zationBackErrors/mainBackErrors";
import ControllerUtils, {MiddlewareInvokeFunction} from "./controllerUtils";
import {SystemController}            from "./systemController/systemControler.config";
import Bag                           from "../../api/Bag";
import ZationConfigFull              from "../config/manager/zationConfigFull";
import InputClosureCreator, {InputConsumeFunction, InputValidationCheckFunction} from "../input/inputClosureCreator";
import ApiLevelUtils, {ApiLevelSwitch, ApiLevelSwitchFunction}                   from "../apiLevel/apiLevelUtils";
import FuncUtils                                                                 from '../utils/funcUtils';
import {ErrorEventSingleton}                                                     from '../error/errorEventSingleton';
import AuthController                                                            from '../../api/AuthController';

interface ControllerPreparedData {
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

    private _authControllerIdentifier: string;
    private readonly systemController: Record<string,ControllerPreparedData>;
    private readonly appController: Record<string,ApiLevelSwitchFunction<ControllerPreparedData>>;

    constructor(zc: ZationConfigFull,worker: ZationWorker,bag: Bag)
    {
        this.zc = zc;
        this.worker = worker;
        this.bag = bag;

        this.systemController = {};
        this.appController = {};
    }

    /**
     * Returns the AuthController identifier.
     */
    get authControllerIdentifier() {
        return this._authControllerIdentifier;
    }

    /**
     * It will return the controller prepared data.
     * If no controller with the API level is found, it will thrown an API level incompatible back error.
     * @param identifier
     * @param apiLevel
     * @param isSystemController
     */
    getControllerPreparedData(identifier: string, apiLevel: number, isSystemController: boolean): ControllerPreparedData
    {
        if(!isSystemController) {
            const controller = this.appController[identifier](apiLevel);
            if(controller !== undefined){
                return controller;
            }
            else {
                throw new BackError(MainBackErrors.apiLevelIncompatible,
                    {controller: identifier, apiLevel: apiLevel});
            }
        }
        else {
            return this.systemController[identifier];
        }
    }

    /**
     * Returns a boolean that indicates if the controller exists.
     * @param identifier
     * @param isSystemController
     */
    isControllerExist(identifier: string,isSystemController: boolean): boolean {
        return !isSystemController ? this.appController.hasOwnProperty(identifier) :
            this.systemController.hasOwnProperty(identifier);
    }

    /**
     * Checks if the controller exists.
     * It will throw a back error if the controller is not found.
     * @param identifier
     * @param isSystemController
     */
    checkControllerExist(identifier: string,isSystemController: boolean): void
    {
        if(!this.isControllerExist(identifier,isSystemController)) {
            if(isSystemController) {
                throw new BackError(MainBackErrors.systemControllerNotFound, {controller: identifier});
            }
            else {
                throw new BackError(MainBackErrors.controllerNotFound, {controller: identifier});
            }
        }
    }

    /**
     * Prepare all system and user controllers.
     */
    async prepare(): Promise<void> {
        const uController = this.zc.appConfig.controllers || {};

        const promises: Promise<void>[] = [];

        for(const cIdentifier in uController) {
            if(uController.hasOwnProperty(cIdentifier)) {
                promises.push(this.addController(cIdentifier,false,uController[cIdentifier]));
            }
        }

        for(const cIdentifier in SystemController) {
            if(SystemController.hasOwnProperty(cIdentifier)) {
                promises.push(this.addController(cIdentifier,true,SystemController[cIdentifier]));
            }
        }

        await Promise.all(promises);
    }

    /**
     * Add a controller to the prepare process.
     * @param identifier
     * @param systemController
     * @param definition
     */
    private async addController(identifier: string,systemController: boolean,definition: ControllerClass | ApiLevelSwitch<ControllerClass>): Promise<void>
    {
        let authController = false;
        if(typeof definition === 'function') {
            const preparedControllerData = await this.processController(definition,identifier);
            if(systemController){
                this.systemController[identifier] = preparedControllerData;
            }
            else {
                this.appController[identifier] = () => preparedControllerData;
            }
            authController = definition.prototype instanceof AuthController;
        }
        else {
            const promises: Promise<void>[] = [];
            const preparedDataMapper: Record<any,ControllerPreparedData> = {};
            for(const k in definition){
                if(definition.hasOwnProperty(k)) {
                    authController = authController || definition[k].prototype instanceof AuthController;
                    promises.push((async () => {
                        preparedDataMapper[k] = await this.processController(definition[k],identifier,parseInt(k));
                    })());
                }
            }
            await Promise.all(promises);
            this.appController[identifier] = ApiLevelUtils.createApiLevelSwitcher<ControllerPreparedData>(preparedDataMapper);
        }
        if(authController){
            this._authControllerIdentifier = identifier;
        }
    }

    /**
     * Process a controller and create the prepared data.
     * @param controller
     * @param identifier
     * @param apiLevel
     */
    private async processController(controller: ControllerClass,identifier: string,apiLevel?: number): Promise<ControllerPreparedData>
    {
        const config: ControllerConfig = controller.config;
        const cInstance: Controller = new controller(identifier,this.worker.getPreparedBag(),apiLevel);
        await cInstance.initialize(this.worker.getPreparedBag());

        return {
            controllerConfig: config,
            controllerInstance: cInstance,
            versionAccessCheck: SystemVersionChecker.createVersionChecker(config),
            systemAccessCheck: SystemVersionChecker.createSystemChecker(config),
            tokenStateCheck: ControllerAccessHelper.createAuthAccessChecker(config.access,this.bag,identifier),
            middlewareInvoke: ControllerUtils.createMiddlewareInvoker(config),
            inputConsume: InputClosureCreator.createInputConsumer(config,this.bag),
            inputValidationCheck: InputClosureCreator.createValidationChecker(config,this.bag),
            finallyHandle: FuncUtils.createSafeCaller((reqBag,input) => cInstance.finallyHandle(reqBag,input),
                `An error was thrown on the: 'Controller ${identifier}', ${nameof<Controller>(s => s.finallyHandle)}:`,
                ErrorEventSingleton.get())
        };
    }
}