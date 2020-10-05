/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import ZationWorker     = require("../../core/zationWorker");
// noinspection TypeScriptPreferShortImport,ES6PreferShortImport
import {ControllerConfig} from "../config/definitions/parts/controllerConfig";
import BackError          from "../../api/BackError";
import SystemVersionChecker   from "../systemVersion/systemVersionChecker";
import ControllerAccessHelper from "./controllerAccessHelper";
import {MainBackErrors}              from "../systemBackErrors/mainBackErrors";
import Bag                           from "../../api/Bag";
import ZationConfigFull              from "../config/manager/zationConfigFull";
import InputClosureCreator           from "../input/inputClosureCreator";
import Controller, {ControllerClass, ControllerPreparedData}                     from '../../api/Controller';
import ApiLevelUtils, {ApiLevelSwitch}                                           from "../apiLevel/apiLevelUtils";
import AuthController                                                            from '../../api/AuthController';
import ComponentPrepare                                                          from '../component/componentPrepare';
import DynamicSingleton                                                          from '../utils/dynamicSingleton';
import CompHandleMiddlewareUtils                                                 from '../compHandleMiddleware/compHandleMiddlewareUtils';
import ObjectUtils                                                               from '../utils/objectUtils';
import {Writable}                                                                from '../utils/typeUtils';
import {systemControllers}                                                       from './systemControllers/systemControllers.config';

export default class ControllerPrepare extends ComponentPrepare<Controller,ControllerConfig>
{
    private _authControllerIdentifier: string;

    constructor(zc: ZationConfigFull,worker: ZationWorker,bag: Bag) {
        super(zc,worker,bag,'Controller',
            Object.assign(systemControllers,zc.appConfig.controllers || {}),
            zc.appConfig.controllerDefaults);
    }

    /**
     * Returns the AuthController identifier.
     */
    get authControllerIdentifier() {
        return this._authControllerIdentifier;
    }

    protected createIncompatibleAPILevelError(identifier: string, apiLevel: number): Error {
        return new BackError(MainBackErrors.apiLevelIncompatible,
            {controller: identifier, apiLevel: apiLevel});
    }

    protected createComponentNotExistsError(identifier: string): Error {
        return new BackError(MainBackErrors.unknownController, {identifier});
    }

    /**
     * Prepare a Controller.
     * @param identifier
     * @param definition
     */
    protected _prepare(identifier: string, definition: ControllerClass | ApiLevelSwitch<ControllerClass>): void
    {
        let authController = false;
        if(typeof definition === 'function') {
            const controllerInstance = this.processController(definition,identifier);
            this.components[identifier] = () => controllerInstance;
            authController = definition.prototype instanceof AuthController;
        }
        else {
            const controllerInstanceMapper: Record<any,Controller> = {};
            for(const k in definition){
                if(definition.hasOwnProperty(k)) {
                    authController = authController || definition[k].prototype instanceof AuthController;
                    controllerInstanceMapper[k] = this.processController(definition[k],identifier,parseInt(k));
                }
            }
            this.components[identifier] = ApiLevelUtils.createApiLevelSwitcher<Controller>(controllerInstanceMapper);
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
    private processController(controller: ControllerClass,identifier: string,apiLevel?: number): Controller
    {
        const config: ControllerConfig = controller.config || {};
        ObjectUtils.mergeTwoObjects(config, this.componentDefaultConfig, false);
        (controller as Writable<ControllerClass>).config = config;

        const preparedData: ControllerPreparedData = {
            controllerConfig: config,
            versionAccessCheck: SystemVersionChecker.createVersionChecker(config),
            systemAccessCheck: SystemVersionChecker.createSystemChecker(config),
            tokenStateCheck: ControllerAccessHelper.createAuthAccessChecker(config.access,identifier),
            handleMiddlewareInvoke: CompHandleMiddlewareUtils.createInvoker(config),
            inputConsume: InputClosureCreator.createInputConsumer(config.input),
            inputValidationCheck: InputClosureCreator.createValidationChecker(config.input)
        };

        const cInstance: Controller = DynamicSingleton.create<ControllerClass,Controller>
            (controller,identifier,preparedData,apiLevel);

        this.addInit(cInstance);

        return cInstance;
    }
}