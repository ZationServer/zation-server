/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import ZationWorker     = require("../../core/zationWorker");
// noinspection TypeScriptPreferShortImport,ES6PreferShortImport
import {ControllerConfig} from "../config/definitions/parts/controllerConfig";
import BackError          from "../../api/BackError";
import SystemVersionChecker from "../systemVersion/systemVersionChecker";
import ControllerAccessHelper from "./controllerAccessHelper";
import Controller, {ControllerClass, ControllerPreparedData} from '../../api/Controller';
import {MainBackErrors}              from "../zationBackErrors/mainBackErrors";
import Bag                           from "../../api/Bag";
import ZationConfigFull              from "../config/manager/zationConfigFull";
import InputClosureCreator           from "../input/inputClosureCreator";
import ApiLevelUtils, {ApiLevelSwitch}                                           from "../apiLevel/apiLevelUtils";
import FuncUtils                                                                 from '../utils/funcUtils';
import {ErrorEventSingleton}                                                     from '../error/errorEventSingleton';
import AuthController                                                            from '../../api/AuthController';
import ComponentPrepare                                                          from '../component/componentPrepare';
import DynamicSingleton                                                          from '../utils/dynamicSingleton';
import CompHandleMiddlewareUtils                                                 from '../compHandleMiddleware/compHandleMiddlewareUtils';

export default class ControllerPrepare extends ComponentPrepare<Controller>
{
    private _authControllerIdentifier: string;

    constructor(zc: ZationConfigFull,worker: ZationWorker,bag: Bag) {
        super(zc,worker,bag);
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

    prepare(): void {
        const controllers = this.zc.appConfig.controllers || {};
        for(const cIdentifier in controllers) {
            if(controllers.hasOwnProperty(cIdentifier)) {
                this.addController(cIdentifier,controllers[cIdentifier])
            }
        }
    }

    /**
     * Adds a controller.
     * @param identifier
     * @param definition
     */
    private addController(identifier: string,definition: ControllerClass | ApiLevelSwitch<ControllerClass>): void
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

        const preparedData: ControllerPreparedData = {
            controllerConfig: config,
            versionAccessCheck: SystemVersionChecker.createVersionChecker(config),
            systemAccessCheck: SystemVersionChecker.createSystemChecker(config),
            tokenStateCheck: ControllerAccessHelper.createAuthAccessChecker(config.access,this.bag,identifier),
            handleMiddlewareInvoke: CompHandleMiddlewareUtils.createInvoker(config),
            inputConsume: InputClosureCreator.createInputConsumer(config,this.bag),
            inputValidationCheck: InputClosureCreator.createValidationChecker(config,this.bag),
            finallyHandle: FuncUtils.createSafeCaller((reqBag,input) => cInstance.finallyHandle(reqBag,input),
                `An error was thrown on the: 'Controller ${identifier}', ${nameof<Controller>(s => s.finallyHandle)}:`,
                ErrorEventSingleton.get())
        };

        const cInstance: Controller = DynamicSingleton.create<ControllerClass,Controller>
            (controller,identifier,this.bag,preparedData,apiLevel);

        this.addInit(cInstance);

        return cInstance;
    }
}