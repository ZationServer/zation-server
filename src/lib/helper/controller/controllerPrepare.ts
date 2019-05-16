/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import ZationWorker     = require("../../main/zationWorker");
// noinspection TypeScriptPreferShortImport
import {ControllerConfig} from "../configDefinitions/appConfig";
import BackError          from "../../api/BackError";
import SystemVersionChecker, {VersionSystemAccessCheckFunction} from "../systemVersion/systemVersionChecker";
import AuthAccessChecker, {TokenStateAccessCheckFunction} from "../auth/authAccessChecker";
import Controller, {ControllerClass} from "../../api/Controller";
import {MainBackErrors}              from "../zationBackErrors/mainBackErrors";
import ControllerUtils, {PrepareHandleInvokeFunction} from "./controllerUtils";
import {SystemController}            from "../systemController/systemControler.config";
import SmallBag                      from "../../api/SmallBag";
import ZationConfigFull              from "../configManager/zationConfigFull";
import InputClosureCreator, {InputConsumeFunction, InputValidationCheckFunction} from "../input/inputClosureCreator";
import InputProcessor                    from "../input/inputProcessor";
import ApiLevelUtils, {ApiLevelSwitch, ApiLevelSwitchFunction} from "../apiLevel/apiLevelUtils";

interface ControllerPrepareData {
    controllerConfig : ControllerConfig,
    controllerInstance : Controller,
    versionAccessCheck : VersionSystemAccessCheckFunction,
    systemAccessCheck : VersionSystemAccessCheckFunction,
    tokenStateCheck : TokenStateAccessCheckFunction,
    prepareHandleInvoke : PrepareHandleInvokeFunction,
    inputConsume : InputConsumeFunction,
    inputValidationCheck : InputValidationCheckFunction
}

export default class ControllerPrepare
{
    private readonly zc : ZationConfigFull;
    private readonly worker : ZationWorker;
    private readonly smallBag : SmallBag;
    private readonly inputDataProcessor : InputProcessor;

    private readonly systemController : Record<string,ControllerPrepareData>;
    private readonly appController : Record<string,ApiLevelSwitchFunction<ControllerPrepareData>>;

    constructor(zc : ZationConfigFull,worker : ZationWorker,smallBag : SmallBag,inputDataProcessor : InputProcessor)
    {
        this.zc = zc;
        this.worker = worker;
        this.smallBag = smallBag;
        this.inputDataProcessor = inputDataProcessor;

        this.systemController = {};
        this.appController = {};
    }

    /**
     * It will return the controller prepared data.
     * If no controller with the API level is found, it will thrown an API level not compatible back error.
     * @param name
     * @param apiLevel
     * @param isSystemController
     */
    getControllerPrepareData(name : string,apiLevel : number,isSystemController : boolean) : ControllerPrepareData
    {
        if(!isSystemController) {
            const controller = this.appController[name](apiLevel);
            if(controller !== undefined){
                return controller;
            }
            else {
                throw new BackError(MainBackErrors.apiLevelNotCompatible,
                    {controllerName: name, apiLevel : apiLevel});
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
    isControllerExist(name : string,isSystemController : boolean) : boolean {
        return !isSystemController ? this.appController.hasOwnProperty(name) :
            this.systemController.hasOwnProperty(name);
    }

    /**
     * Checks if the controller exists.
     * It will throw a back error if the controller is not found.
     * @param name
     * @param isSystemController
     */
    checkControllerExist(name : string,isSystemController : boolean) : void
    {
        if(!this.isControllerExist(name,isSystemController)) {
            if(isSystemController) {
                throw new BackError(MainBackErrors.systemControllerNotFound, {controllerName: name});
            }
            else {
                throw new BackError(MainBackErrors.controllerNotFound, {controllerName: name});
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
            const preparedControllerData = await this.processController(definition);
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
                        preparedDataMapper[k] = await this.processController(definition[k]);
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
     */
    private async processController(controller : ControllerClass) : Promise<ControllerPrepareData>
    {
        const config : ControllerConfig = controller.config;
        const cInstance : Controller = new controller(name,this.worker.getPreparedSmallBag());
        await cInstance.initialize(this.worker.getPreparedSmallBag());

        return  {
            controllerConfig : config,
            controllerInstance: cInstance,
            versionAccessCheck : SystemVersionChecker.createVersionChecker(config),
            systemAccessCheck : SystemVersionChecker.createSystemChecker(config),
            tokenStateCheck : AuthAccessChecker.createTokenStateAccessChecker(config,this.smallBag),
            prepareHandleInvoke : ControllerUtils.createPrepareHandleInvoker(config),
            inputConsume : InputClosureCreator.createControllerInputConsumer(config,this.inputDataProcessor),
            inputValidationCheck : InputClosureCreator.createControllerValidationChecker(config,this.inputDataProcessor)
        };
    }
}

