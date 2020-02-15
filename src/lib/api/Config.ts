/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */
import RequestBag              from './RequestBag';
import ExpressCore           = require("express-serve-static-core");
import
{
    BeforeErrorFunction,
    BeforeBackErrorBagFunction,
    BeforeBackErrorFunction,
    EventConfig,
    ExpressFunction,
    HttpServerStartedFunction,
    StartedFunction,
    SocketErrorFunction,
    WorkerStartedFunction,
    WsServerStartedFunction,
    MiddlewareAuthenticationFunction,
    SocketServerFunction,
    SocketConnectionFunction,
    SocketDisconnectionFunction,
    WorkerMessageFunction,
    SocketRawFunction,
    SocketSubscriptionFunction,
    SocketUnsubscriptionFunction,
    SocketBadAuthTokenFunction,
    SocketAuthStateChangeFunction,
    WorkerInitFunction,
    MasterInitFunction,
    BeforeCodeErrorFunction,
    SocketAuthenticationFunction,
    SocketDeauthenticationFunction,
    SocketConnectionAbortFunction,
    MiddlewareSocketFunction,
    SocketInitFunction,
    EventInit,
    EventInitFunction,
} from "../main/config/definitions/eventConfig";

import
{
    MainService, ServiceConfig
} from "../main/config/definitions/serviceConfig";

import {AppConfig} from "../main/config/definitions/appConfig";
import BackErrorConstruct from "../main/constants/backErrorConstruct";
import {
    AuthUserGroupChannel,
    AuthUserGroupChOnBagPubFunction,
    AuthUserGroupChOnClientPubFunction,
    AuthUserGroupChOnSubFunction,
    AuthUserGroupChOnUnsubFunction,
    CChannelClientPubAccessFunction,
    CChannelOnBagPubFunction,
    CChannelOnClientPubFunction,
    CChannelOnSubFunction,
    CChannelOnUnsubFunction,
    CChannelSubAccessFunction,
    CChannelFamilyClientPubAccessFunction,
    CChannelFamilyOnBagPubFunction,
    CChannelFamilyOnClientPubFunction,
    CChannelFamilyOnSubFunction,
    CChannelFamilyOnUnsubFunction,
    CChannelFamilySubAccessFunction,
    NormalChannel,
    NormalChOnBagPubFunction, NormalChOnClientPubFunction,
    NormalChOnSubFunction,
    NormalChOnUnsubFunction,
    UserChannel,
    UserChOnBagPubFunction,
    UserChOnClientPubFunction,
    UserChOnSubFunction,
    UserChOnUnsubFunction, ZationChannelsConfig, CustomChannelConfig
} from "../main/config/definitions/channelsConfig";
import {StarterConfig}  from "../main/config/definitions/starterConfig";
import {MainConfig}     from "../main/config/definitions/mainConfig";
import ZSocket          from "../main/internalApi/zSocket";
import BackError        from "./BackError";
import BackErrorBag     from "./BackErrorBag";
import ObjectUtils      from "../main/utils/objectUtils";
import Controller, {ControllerClass} from "./Controller";
import CChInfo          from "../main/internalApi/cChInfo";
import Result           from "./Result";
import Bag              from "./Bag";
import CChFamilyInfo    from "../main/internalApi/cChFamilyInfo";
import PubData          from "../main/internalApi/pubData";
import ZationInfo       from "../main/internalApi/zationInfo";
import {ApiLevelSwitch} from "../main/apiLevel/apiLevelUtils";
import ConfigBuildError from "../main/config/manager/configBuildError";
import {
    ArrayModelConfig, ArrayModelShortSyntax,
    ConstructObjectFunction, ConvertArrayFunction, ConvertObjectFunction, ConvertValueFunction, GetDateFunction, Input,
    Model,
    ObjectModelConfig, ObjectProperties,
    SingleModelInput, ValidateFunction, ValueModelConfig
} from "../main/config/definitions/inputConfig";
import {
    ControllerConfig,
    ControllerMiddlewareFunction
} from "../main/config/definitions/controllerConfig";
import {BackgroundTask, TaskFunction}       from "../main/config/definitions/backgroundTaskConfig";
import ZationTokenWrapper                   from "../main/internalApi/zationTokenWrapper";
import {DataboxClassDef, DataboxConfig, DbAccessFunction} from "../main/config/definitions/databoxConfig";
import {createTokenCheckFunction, TokenCheckFunction}     from "../main/access/accessOptions";
import DataboxFamily                        from "./databox/DataboxFamily";
import Databox                              from "./databox/Databox";
import {Component}                          from "../main/config/definitions/component";
import {NormalAuthAccessCustomFunction}     from "../main/config/definitions/configComponents";
import {ZationToken}                        from "../main/constants/internal";
import {registerBagExtension,BagExtension}  from 'zation-bag-extension';

export const eventInitSymbol              = Symbol();

export default class Config
{

    private static tmpModels : Record<string,Model> = {};
    private static tmpControllers : Record<string,ControllerClass | ApiLevelSwitch<ControllerClass>> = {};
    private static tmpDataboxes : Record<string,DataboxClassDef | ApiLevelSwitch<DataboxClassDef>> = {};
    private static tmpCustomChs : Record<string,CustomChannelConfig> = {};
    private static tmpZationChannels : ZationChannelsConfig[] = [];
    private static tmpAuthController : string | undefined;

    //Part main helper methods

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Merge configs together.
     * If config has name conflicts the first one will be taken.
     * @example
     * merge(appConfig1,appConfig2,appConfig3);
     * @param configs
     */
    static merge(...configs : object[]) : object {
        return ObjectUtils.mergeObjects(configs);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Changes the configuration of a controller.
     * Can be used for setting the configuration in the app config.
     * @example
     * buildController(LoginController,{httpAccess : false});
     * @param controller
     * The controller that should be updated.
     * @param config
     * The new configuration.
     * @param overrideControllerConfig
     * If the new configuration properties override the controller properties.
     * Default value is false.
     */
    static buildController(controller : ControllerClass,config : ControllerConfig,overrideControllerConfig : boolean = false) : ControllerClass {
        ObjectUtils.addObToOb(controller.config,config,overrideControllerConfig);
        return controller;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * This method defines a new model in the app config.
     * Watch out that you don't use a name that is already defined in the models of the app config.
     * If you use this method in another file as the app config,
     * make sure that you import this file in app config.
     * @example
     * Config.defineModel('user',{
     *     properties : {
     *         name : {type : 'string'},
     *         age : {type : 'number'}
     *     }
     * });
     * @param name
     * @param model
     */
    static defineModel(name : string, model : Model) {
        if(!Config.tmpModels.hasOwnProperty(name)){
            Config.tmpModels[name] = model;
        }
        else {
            throw new ConfigBuildError(`The model name: ${name} is already defined.`);
        }
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * This method defines a new custom channel in the app config.
     * Watch out that you don't use a name that is already defined in the custom channels of the app config.
     * If you use this method in another file as the app config,
     * make sure that you import this file in app config.
     * @example
     * Config.defineCustomCh('myCustomCh',{
     *    subscribeAccess : 'allAuth',
     * });
     * @param name
     * @param customCh
     */
    static defineCustomCh(name : string,customCh : CustomChannelConfig) {
        if(!Config.tmpCustomChs.hasOwnProperty(name)){
            Config.tmpCustomChs[name] = customCh;
        }
        else {
            throw new ConfigBuildError(`The custom channel: ${name} is already defined.`);
        }
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Merge zation channel configs to the app config.
     * If you use this method in another file as the app config,
     * make sure that you import this file in app config.
     * @example
     * Config.defineChannels({
     *    userCh : {
     *       clientPublishAccess : false
     *    },
     * });
     * @param config
     */
    static defineZationChannels(config : ZationChannelsConfig) {
        Config.tmpZationChannels.push(config);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * This method defines new models in the app config.
     * Watch out that you don't use a name that is already defined in the models of the app config.
     * If you use this method in another file as the app config,
     * make sure that you import this file in app config.
     * @example
     * Config.defineModels({
     *    user : {
     *        properties : {
     *          name : 'user_name',
     *          age : {type : 'number'}
     *        }
     *    },
     *    user_name : {
     *        type : 'string',
     *        maxLength : 10
     *    }
     * });
     * @param models
     */
    static defineModels(models : Record<string,Model>) {
        for(let name in models){
            if(models.hasOwnProperty(name)){
                Config.defineModel(name,models[name]);
            }
        }
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * This method registers a new controller in the app config.
     * Watch out that you don't use a name that is already defined in the controllers of the app config.
     * If you use this method in another file as the app config,
     * make sure that you import this file in app config.
     * Also, notice that if you want to register more controllers with the same name and different API levels,
     * make sure that all register methods with that name provided an API level.
     * @example
     * //without API level
     * Config.registerController('myController',MyController);
     * //with API level
     * Config.registerController('myController2',MyController2Version1,1);
     * Config.registerController('myController2',MyController2Version2,2);
     * @param name
     * @param controllerClass
     * @param apiLevel
     */
    static registerController(name : string, controllerClass : ControllerClass, apiLevel ?: number) {
        Config.registerComponent(name,controllerClass,apiLevel);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * This method registers a new Databox or DataboxFamily in the app config.
     * Watch out that you don't use a name that is already defined in the Databoxes of the app config.
     * If you use this method in another file as the app config,
     * make sure that you import this file in app config.
     * Also, notice that if you want to register more Databoxes with the same name and different API levels,
     * make sure that all register methods with that name provided an API level.
     * @example
     * //without API level
     * Config.registerDatabox('myDatabox',MyDatabox);
     * //with API level
     * Config.registerDatabox('myDatabox2',MyDatabox2Version1,1);
     * Config.registerDatabox('myDatabox2',MyDatabox2Version2,2);
     * @param name
     * @param databoxClass
     * @param apiLevel
     */
    static registerDatabox(name : string, databoxClass : DataboxClassDef, apiLevel ?: number) {
        Config.registerComponent(name,databoxClass,apiLevel);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * This method registers a new component (Controller or Databox) in the app config.
     * Watch out that you don't use a name that is already defined in the app config.
     * If you use this method in another file as the app config,
     * make sure that you import this file in app config.
     * Also, notice that if you want to register more components with the same name and different API levels,
     * make sure that all register methods with that name provided an API level.
     * @example
     * //without API level
     * Config.registerComponent('myDatabox',MyDatabox);
     * //with API level
     * Config.registerComponent('myController',MyControllerVersion1,1);
     * Config.registerComponent('myController',MyControllerVersion2,2);
     * @param name
     * @param componentClass
     * @param apiLevel
     */
    static registerComponent(name : string, componentClass : Component, apiLevel ?: number)
    {
        let type;
        let pName;
        let container;

        if(componentClass.prototype instanceof Controller){
            type = 'controller';
            pName = 'controllers';
            container = this.tmpControllers;
        }
        else if(componentClass.prototype instanceof  DataboxFamily || componentClass.prototype instanceof Databox){
            type = 'databox';
            pName = 'databoxes';
            container = this.tmpDataboxes;
        }
        else {
            throw new ConfigBuildError(`Register component can only register classes that extend the Databox, DataboxFamily, or Controller class.`);
        }

        if(typeof apiLevel === 'number'){
            if(typeof container[name] === 'function'){
                throw new ConfigBuildError(`The ${type} name: ${name} is already defined.`+
                    ` To define more ${pName} with the same name every register should provide an API level.`);
            }
            else {
                if(!container.hasOwnProperty(name)){
                    container[name] = {};
                }

                if(container[name].hasOwnProperty(apiLevel)){
                    throw new ConfigBuildError(`The ${type} name: ${name} with the API level ${apiLevel} is already defined.`);
                }
                else {
                    container[name][apiLevel] = componentClass;
                }
            }
        }
        else {
            if(container.hasOwnProperty(name)){
                throw new ConfigBuildError(`The ${type} name: ${name} is already defined.`+
                    ` To define more ${pName} with the same name every register should provide an API level.`);
            }
            else {
                container[name] = componentClass;
            }
        }
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Registers a BagExtension.
     * @param extension
     */
    static registerBagExtension(extension: BagExtension) {
        registerBagExtension(extension);
    }

    static single(model : Model) : SingleModelInput {
        return [model];
    }

    /**
     * With this function, you can set the auth controller.
     * Notice that you can set only one auth controller.
     * @param name
     */
    static setAuthController(name : string) {
        if(this.tmpAuthController !== undefined && name !== this.tmpAuthController){
            throw new ConfigBuildError(`The authController: '${this.tmpAuthController}' is already set, you can not override it.`);
        }
        else {
            this.tmpAuthController = name;
        }
    }

    /**
     * With this function,
     * you can initialize and prepare variables for an event.
     * @example
     * eventInit((bag) => {
     *    //prepare stuff
     *    const db = bag.databox(ProfileDataboxFamilyV1);
     *    return (bag,socket) => {
     *        //the real event
     *    }
     * })
     * @param init
     */
    static eventInit<T>(init : EventInitFunction<T>) : EventInit<T> {
        init[eventInitSymbol] = true;
        return init as EventInit<T>;
    }

    //Part main configs
    // noinspection JSUnusedGlobalSymbols
    /**
     * Function to create the app configuration for the server.
     * @param config
     * @param isPrimaryAppConfig
     * Indicates if this is your primary app config.
     * If you have more app configs and you want to merge
     * them than only one of them should be the primary app config.
     */
    static appConfig(config : AppConfig,isPrimaryAppConfig : boolean = true) : AppConfig {
        if(isPrimaryAppConfig){
            config.models = config.models || {};
            config.controllers = config.controllers || {};
            config.databoxes = config.databoxes || {};
            config.customChannels = config.customChannels || {};
            config.zationChannels = config.zationChannels || {};

            Config.configAdd(Config.tmpModels,config.models,'model name');
            Config.configAdd(Config.tmpControllers,config.controllers,'controller name');
            Config.configAdd(Config.tmpDataboxes,config.databoxes,'databox name');
            Config.configAdd(Config.tmpCustomChs,config.customChannels as object,'custom channel');
            Config.merge(config.zationChannels,...Config.tmpZationChannels);

            if(this.tmpAuthController !== undefined){
                if(config.authController !== undefined){
                    throw new ConfigBuildError(
                        `Conflict with the auth controller, the authController is defined in the app config and the config utils.`);
                }
                else {
                    config.authController = this.tmpAuthController;
                }
            }
        }
        return config;
    }

    private static configAdd(tmpConfig : object,config : object,target : string)
    {
        for(let name in tmpConfig){
            if(tmpConfig.hasOwnProperty(name)){
                if(config.hasOwnProperty(name)){
                    throw new ConfigBuildError
                    (`Conflict with ${target}: ${name}, the ${target} is defined in the app config and with the config utils.`);
                }
                else {
                    config[name] = tmpConfig[name];
                }
            }
        }
    }

    // noinspection JSUnusedGlobalSymbols
    static eventConfig(config : EventConfig) : EventConfig {return config;}
    // noinspection JSUnusedGlobalSymbols
    static serviceConfig(config : ServiceConfig) : ServiceConfig {return config;}
    // noinspection JSUnusedGlobalSymbols
    static mainConfig(config : MainConfig) : MainConfig {return config;}
    // noinspection JSUnusedGlobalSymbols
    static starterConfig(config : StarterConfig) : StarterConfig {return config;}

    //Object
    // noinspection JSUnusedGlobalSymbols
    static objectModel(c : ObjectModelConfig) :  ObjectModelConfig {return c;}
    // noinspection JSUnusedGlobalSymbols
    static object(c : ObjectModelConfig) : ObjectModelConfig {return c;}
    // noinspection JSUnusedGlobalSymbols
    static construct(func : ConstructObjectFunction) : ConstructObjectFunction {return func;}
    // noinspection JSUnusedGlobalSymbols
    static objectProperties(c : ObjectProperties) :  ObjectProperties {return c;}
    // noinspection JSUnusedGlobalSymbols
    static convertObject(c : ConvertObjectFunction) :  ConvertObjectFunction {return c;}

    //Value
    // noinspection JSUnusedGlobalSymbols
    static valueModel(c : ValueModelConfig) : ValueModelConfig {return c;}
    // noinspection JSUnusedGlobalSymbols
    static value(c : ValueModelConfig) : ValueModelConfig {return c;}
    // noinspection JSUnusedGlobalSymbols
    static convertValue(c : ConvertValueFunction) :  ConvertValueFunction {return c;}
    // noinspection JSUnusedGlobalSymbols
    static validate(func : ValidateFunction) : ValidateFunction {return func;}
    // noinspection JSUnusedGlobalSymbols
    static getDate(func : GetDateFunction) : GetDateFunction {return func;}

    //Array
    // noinspection JSUnusedGlobalSymbols
    static arrayModel(c : ArrayModelConfig | ArrayModelShortSyntax) :  ArrayModelConfig | ArrayModelShortSyntax {return c;}
    // noinspection JSUnusedGlobalSymbols
    static array(c : ArrayModelConfig | ArrayModelShortSyntax) :  ArrayModelConfig | ArrayModelShortSyntax {return c;}
    // noinspection JSUnusedGlobalSymbols
    static convertArray(c : ConvertArrayFunction) :  ConvertArrayFunction {return c;}

    //Controller
    // noinspection JSUnusedGlobalSymbols
    static controllerConfig(c : ControllerConfig) :  ControllerConfig {return c;}
    // noinspection JSUnusedGlobalSymbols
    static input(c : Input) : Input {return c;}
    // noinspection JSUnusedGlobalSymbols
    static controllerMiddleware(func : ControllerMiddlewareFunction) : ControllerMiddlewareFunction {return func;}
    // noinspection JSUnusedGlobalSymbols
    static controllerAccess(func : NormalAuthAccessCustomFunction) : NormalAuthAccessCustomFunction {return func;}

    //Part Background tasks
    // noinspection JSUnusedGlobalSymbols
    static backgroundTask(c : BackgroundTask) :  BackgroundTask {return c;}
    // noinspection JSUnusedGlobalSymbols
    static task(func : TaskFunction) :  TaskFunction {return func;}

    //Part Properties
    // noinspection JSUnusedGlobalSymbols
    static model(m : Model) : Model {return m;}

    // noinspection JSUnusedGlobalSymbols
    static models(m : Record<string,Model>) : Record<string,Model> {return m;}

    //Databox
    // noinspection JSUnusedGlobalSymbols
    static databoxConfig(c : DataboxConfig) :  DataboxConfig {return c;}
    // noinspection JSUnusedGlobalSymbols
    static databoxAccess(func : DbAccessFunction) : DbAccessFunction {return func;}

    //Part Channels
    // noinspection JSUnusedGlobalSymbols
    static zationChannels(config : ZationChannelsConfig) : ZationChannelsConfig {return config;}

    // noinspection JSUnusedGlobalSymbols
    static cChFamilyClientPubAccess(func : CChannelFamilyClientPubAccessFunction) : CChannelFamilyClientPubAccessFunction {return func;}
    // noinspection JSUnusedGlobalSymbols
    static cChClientPubAccess(func : CChannelClientPubAccessFunction) : CChannelClientPubAccessFunction  {return func;}

    // noinspection JSUnusedGlobalSymbols
    static cChFamilySubAccess(func : CChannelFamilySubAccessFunction) : CChannelFamilySubAccessFunction {return func;}
    // noinspection JSUnusedGlobalSymbols
    static cChSubAccess(func : CChannelSubAccessFunction) : CChannelSubAccessFunction {return func;}

    // noinspection JSUnusedGlobalSymbols
    static cChFamilyOnClientPub(func : CChannelFamilyOnClientPubFunction) : CChannelFamilyOnClientPubFunction {return func;}
    // noinspection JSUnusedGlobalSymbols
    static cChOnClientPub(func : CChannelOnClientPubFunction) : CChannelOnClientPubFunction {return func;}

    // noinspection JSUnusedGlobalSymbols
    static cChFamilyOnBagPub(func : CChannelFamilyOnBagPubFunction) : CChannelFamilyOnBagPubFunction {return func;}
    // noinspection JSUnusedGlobalSymbols
    static cChOnBagPub(func : CChannelOnBagPubFunction) : CChannelOnBagPubFunction {return func;}

    // noinspection JSUnusedGlobalSymbols
    static cChFamilyOnSub(func : CChannelFamilyOnSubFunction) : CChannelFamilyOnSubFunction {return func;}
    // noinspection JSUnusedGlobalSymbols
    static cChOnSub(func : CChannelOnSubFunction) : CChannelOnSubFunction {return func;}

    // noinspection JSUnusedGlobalSymbols
    static cChFamilyOnUnsub(func : CChannelFamilyOnUnsubFunction) : CChannelFamilyOnUnsubFunction {return func;}
    // noinspection JSUnusedGlobalSymbols
    static cChOnUnsub(func : CChannelOnUnsubFunction) : CChannelOnUnsubFunction {return func;}

    // noinspection JSUnusedGlobalSymbols
    static customCh(c : CustomChannelConfig) : CustomChannelConfig {return c;}

    // noinspection JSUnusedGlobalSymbols
    static userCh(c : UserChannel) : UserChannel {return c;}
    // noinspection JSUnusedGlobalSymbols
    static userChOnClientPub(func : UserChOnClientPubFunction) : UserChOnClientPubFunction {return func;}
    // noinspection JSUnusedGlobalSymbols
    static userChOnBagPub(func : UserChOnBagPubFunction) : UserChOnBagPubFunction {return func;}
    // noinspection JSUnusedGlobalSymbols
    static userChOnSub(func : UserChOnSubFunction) : UserChOnSubFunction {return func;}
    // noinspection JSUnusedGlobalSymbols
    static userChOnUnsub(func : UserChOnUnsubFunction) : UserChOnUnsubFunction {return func;}

    // noinspection JSUnusedGlobalSymbols
    static authUserGroupCh(c : AuthUserGroupChannel) : AuthUserGroupChannel {return c;}
    // noinspection JSUnusedGlobalSymbols
    static authUserGroupChOnClientPub(func : AuthUserGroupChOnClientPubFunction) : AuthUserGroupChOnClientPubFunction {return func;}
    // noinspection JSUnusedGlobalSymbols
    static authUserGroupChOnBagPub(func : AuthUserGroupChOnBagPubFunction) : AuthUserGroupChOnBagPubFunction {return func;}
    // noinspection JSUnusedGlobalSymbols
    static authUserGroupChOnSub(func : AuthUserGroupChOnSubFunction) : AuthUserGroupChOnSubFunction {return func;}
    // noinspection JSUnusedGlobalSymbols
    static authUserGroupChOnUnsub(func : AuthUserGroupChOnUnsubFunction) : AuthUserGroupChOnUnsubFunction {return func;}

    // noinspection JSUnusedGlobalSymbols
    static defaultUserGroupCh(c : NormalChannel) : NormalChannel {return c;}
    // noinspection JSUnusedGlobalSymbols
    static defaultUserGroupChOnClientPub(func : NormalChOnClientPubFunction) : NormalChOnClientPubFunction {return func;}
    // noinspection JSUnusedGlobalSymbols
    static defaultUserGroupChOnBagPub(func : NormalChOnBagPubFunction) : NormalChOnBagPubFunction {return func;}
    // noinspection JSUnusedGlobalSymbols
    static defaultUserGroupChOnSub(func : NormalChOnSubFunction) : NormalChOnSubFunction {return func;}
    // noinspection JSUnusedGlobalSymbols
    static defaultUserGroupChOnUnsub(func : NormalChOnUnsubFunction) : NormalChOnUnsubFunction {return func;}

    // noinspection JSUnusedGlobalSymbols
    static allCh(c : NormalChannel) : NormalChannel {return c;}
    // noinspection JSUnusedGlobalSymbols
    static allChOnClientPub(func : NormalChOnClientPubFunction) : NormalChOnClientPubFunction {return func;}
    // noinspection JSUnusedGlobalSymbols
    static allChOnBagPub(func : NormalChOnBagPubFunction) : NormalChOnBagPubFunction {return func;}
    // noinspection JSUnusedGlobalSymbols
    static allChOnSub(func : NormalChOnSubFunction) : NormalChOnSubFunction {return func;}
    // noinspection JSUnusedGlobalSymbols
    static allChOnUnsub(func : NormalChOnUnsubFunction) : NormalChOnUnsubFunction {return func;}

    //Part Service Config
    // noinspection JSUnusedGlobalSymbols
    static service<Config,Created,Get>(c : MainService<Config,Created,Get>) : MainService<Config,Created,Get> {return c;}

    //Part Error Config
    // noinspection JSUnusedGlobalSymbols
    static backErrorConstruct(c : BackErrorConstruct) : BackErrorConstruct {return c;}

    //Part Event Config events

    //Part Zation Events
    // noinspection JSUnusedGlobalSymbols
    static express(func : ExpressFunction) : ExpressFunction {return func;}
    // noinspection JSUnusedGlobalSymbols
    static scServer(func : SocketServerFunction) : SocketServerFunction {return func;}
    // noinspection JSUnusedGlobalSymbols
    static workerInit(func : WorkerInitFunction) : WorkerInitFunction {return func;}
    // noinspection JSUnusedGlobalSymbols
    static masterInit(func : MasterInitFunction) : MasterInitFunction {return func;}
    // noinspection JSUnusedGlobalSymbols
    static workerStarted(func : WorkerStartedFunction) : WorkerStartedFunction {return func;}
    // noinspection JSUnusedGlobalSymbols
    static workerLeaderStarted(func : WorkerStartedFunction) : WorkerStartedFunction {return func;}
    // noinspection JSUnusedGlobalSymbols
    // noinspection JSUnusedGlobalSymbols
    static httpServerStarted(func : HttpServerStartedFunction) : HttpServerStartedFunction {return func;}
    // noinspection JSUnusedGlobalSymbols
    static wsServerStarted(func : WsServerStartedFunction) : WsServerStartedFunction{return func;}
    // noinspection JSUnusedGlobalSymbols
    static started(func : StartedFunction) : StartedFunction{return func;}
    // noinspection JSUnusedGlobalSymbols
    static beforeError(func : BeforeErrorFunction) : BeforeErrorFunction {return func;}
    // noinspection JSUnusedGlobalSymbols
    static beforeBackError(func : BeforeBackErrorFunction) : BeforeBackErrorFunction {return func;}
    // noinspection JSUnusedGlobalSymbols
    static beforeBackErrorBag(func : BeforeBackErrorBagFunction) : BeforeBackErrorBagFunction {return func;}
    // noinspection JSUnusedGlobalSymbols
    static beforeCodeError(func : BeforeCodeErrorFunction) : BeforeCodeErrorFunction {return func;}
    // noinspection JSUnusedGlobalSymbols
    static workerMessage(func : WorkerMessageFunction) : WorkerMessageFunction {return func;}

    // noinspection JSUnusedGlobalSymbols
    static socketInit(func : SocketInitFunction) : SocketInitFunction {return func;}
    // noinspection JSUnusedGlobalSymbols
    static socketConnection(func : SocketConnectionFunction) : SocketConnectionFunction {return func;}
    // noinspection JSUnusedGlobalSymbols
    static socketDisconnection(func : SocketDisconnectionFunction) : SocketDisconnectionFunction {return func;}
    // noinspection JSUnusedGlobalSymbols
    static socketAuthentication(func : SocketAuthenticationFunction) : SocketAuthenticationFunction {return func;}
    // noinspection JSUnusedGlobalSymbols
    static socketDeauthentication(func : SocketDeauthenticationFunction) : SocketDeauthenticationFunction {return func;}
    // noinspection JSUnusedGlobalSymbols
    static socketAuthStateChange(func : SocketAuthStateChangeFunction) : SocketAuthStateChangeFunction {return func;}
    // noinspection JSUnusedGlobalSymbols
    static socketSubscription(func : SocketSubscriptionFunction) : SocketSubscriptionFunction {return func;}
    // noinspection JSUnusedGlobalSymbols
    static socketUnsubscription(func : SocketUnsubscriptionFunction) : SocketUnsubscriptionFunction {return func;}
    // noinspection JSUnusedGlobalSymbols
    static socketError(func : SocketErrorFunction) : SocketErrorFunction {return func;}
    // noinspection JSUnusedGlobalSymbols
    static socketRaw(func : SocketRawFunction) : SocketRawFunction {return func;}
    // noinspection JSUnusedGlobalSymbols
    static socketConnectionAbort(func : SocketConnectionAbortFunction) : SocketConnectionAbortFunction {return func;}
    // noinspection JSUnusedGlobalSymbols
    static socketBadAuthToken(func : SocketBadAuthTokenFunction) : SocketBadAuthTokenFunction {return func;}

    //Zation Middleware
    // noinspection JSUnusedGlobalSymbols
    static middlewareAuthenticate(func : MiddlewareAuthenticationFunction) : MiddlewareAuthenticationFunction {return func;}
    // noinspection JSUnusedGlobalSymbols
    static middlewareSocket(func : MiddlewareSocketFunction) : MiddlewareSocketFunction {return func;}

    //Part Types
    // noinspection JSUnusedGlobalSymbols
    static typeBag(bag : Bag) : Bag {return bag;}
    // noinspection JSUnusedGlobalSymbols
    static typeRequestBag(reqBag : RequestBag) : RequestBag {return reqBag;}
    // noinspection JSUnusedGlobalSymbols
    static typeResult(result : Result) : Result {return result;}
    // noinspection JSUnusedGlobalSymbols
    static typeBackError(resError : BackError) : BackError {return resError;}
    // noinspection JSUnusedGlobalSymbols
    static typeBackErrorBag(resErrorBag : BackErrorBag) : BackErrorBag {return resErrorBag;}
    // noinspection JSUnusedGlobalSymbols
    static typeController(controller : Controller) : Controller {return controller;}
    // noinspection JSUnusedGlobalSymbols
    static typeExpress(express : ExpressCore.Express) : ExpressCore.Express {return express;}

    //Info Types
    // noinspection JSUnusedGlobalSymbols
    static customChInfo(cChInfo : CChInfo) : CChInfo {return cChInfo;}
    // noinspection JSUnusedGlobalSymbols
    static customIdChInfo(cIdChInfo : CChFamilyInfo) : CChFamilyInfo {return cIdChInfo;}
    // noinspection JSUnusedGlobalSymbols
    static pubDataInfo(pubDataInfo : PubData) : PubData {return pubDataInfo;}
    // noinspection JSUnusedGlobalSymbols
    static socketInfo(socketInfo : ZSocket) : ZSocket {return socketInfo;}
    // noinspection JSUnusedGlobalSymbols
    static zationInfo(zationInfo : ZationInfo) : ZationInfo {return zationInfo;}
    // noinspection JSUnusedGlobalSymbols
    static zationTokenWrapper(zationTokenWrapper : ZationTokenWrapper) : ZationTokenWrapper {return zationTokenWrapper;}

    //Advanced utils

    // noinspection JSUnusedGlobalSymbols
    /**
     * Creates a token check function.
     * It can be used for more advanced use cases.
     * With the token check-function, you can check the access with the token of a client.
     * You can use it in the access check properties,
     * for example, in the controller, databox, or custom channel config.
     * @example
     * access: Config.createTokenCheckFunction((token) => token !== null)
     * @param checkFunction
     */
    static createTokenCheckFunction(checkFunction : (token : ZationToken | null) => boolean) : TokenCheckFunction {
        return createTokenCheckFunction(checkFunction);
    }

}

export const single = Config.single;
export const eventInit = Config.eventInit;