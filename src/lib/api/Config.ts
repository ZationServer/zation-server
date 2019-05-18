/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */
import Bag                   from './Bag';
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
    ScServerAuthenticationFunction,
    ScServerBadSocketAuthTokenFunction,
    ScServerConnectionFunction,
    ScServerDeauthenticationFunction,
    ScServerErrorFunction,
    ScServerNoticeFunction,
    ScServerReadyFunction,
    ScServerSocketFunction,
    ScServerSubscriptionFunction,
    ScServerUnsubscriptionFunction,
    SocketErrorFunction,
    SocketMessageFunction,
    SocketAuthenticateFunction,
    WorkerStartedFunction,
    WsServerStartedFunction,
    SocketDeauthenticateFunction,
    MiddlewareAuthenticationFunction,
    ScServerFunction,
    SocketConnectionFunction,
    SocketDisconnectionFunction,
    WorkerMessageFunction,
    ScServerAuthenticationStateChangeFunction,
    SocketRawFunction,
    SocketConnectFunction,
    SocketCodeDataFunction,
    SocketSubscribeFunction,
    SocketUnsubscribeFunction,
    SocketBadAuthTokenFunction,
    SocketAuthStateChangeFunction,
    ScServerSocketCodeDataFunction
} from "../helper/configDefinitions/eventConfig";

import
{
    MainService, ServiceConfig
} from "../helper/configDefinitions/serviceConfig";

import
{
    AppConfig,
    ConstructObjectFunction,
    ControllerAccessFunction,
    ControllerConfig,
    ObjectProperties,
    TaskFunction,
    ValidatorFunction,
    ConvertObjectFunction,
    ConvertValueFunction,
    ConvertArrayFunction,
    BackgroundTask,
    GetDateFunction,
    ObjectModelConfig,
    ValueModelConfig,
    ArrayModelConfig, ArrayModelShortSyntax, Model, PrepareHandleFunction, Input, SingleModelInput
} from "../helper/configDefinitions/appConfig";
import BackErrorConstruct from "../helper/constants/backErrorConstruct";
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
    ChannelConfig,
    CIdChannelClientPubAccessFunction,
    CIdChannelOnBagPubFunction,
    CIdChannelOnClientPubFunction,
    CIdChannelOnSubFunction,
    CIdChannelOnUnsubFunction,
    CIdChannelSubAccessFunction,
    CustomCh,
    CustomIdCh,
    NormalChannel,
    NormalChOnBagPubFunction, NormalChOnClientPubFunction,
    NormalChOnSubFunction,
    NormalChOnUnsubFunction,
    UserChannel,
    UserChOnBagPubFunction,
    UserChOnClientPubFunction,
    UserChOnSubFunction,
    UserChOnUnsubFunction
} from "../helper/configDefinitions/channelConfig";
import {StarterConfig}  from "../helper/configDefinitions/starterConfig";
import {MainConfig}     from "../helper/configDefinitions/mainConfig";
import SocketInfo       from "../helper/infoObjects/socketInfo";
import ZationTokenInfo  from "../helper/infoObjects/zationTokenInfo";
import BackError        from "./BackError";
import BackErrorBag     from "./BackErrorBag";
import ObjectUtils      from "../helper/utils/objectUtils";
import Controller, {ControllerClass} from "./Controller";
import CChInfo          from "../helper/infoObjects/cChInfo";
import Result           from "./Result";
import SmallBag         from "./SmallBag";
import CIdChInfo        from "../helper/infoObjects/cIdChInfo";
import PubData          from "../helper/infoObjects/pubData";
import ZationInfo       from "../helper/infoObjects/zationInfo";
import {ApiLevelSwitch} from "../helper/apiLevel/apiLevelUtils";

export default class Config
{

    private static tmpModels : Record<string,Model> = {};
    private static tmpController : Record<string,ControllerClass | ApiLevelSwitch<ControllerClass>> = {};

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
            throw new Error(`The model name: ${name} is already defined.`);
        }
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
     * Watch out that you don't use a id that is already defined in the controllers of the app config.
     * If you use this method in another file as the app config,
     * make sure that you import this file in app config.
     * Also, notice that if you want to register more controllers with the same id and different API levels,
     * make sure that all register methods with that id provided an API level.
     * @example
     * //without API level
     * Config.registerController('myController',MyController);
     * //with API level
     * Config.registerController('myController2',MyController2Version1,1);
     * Config.registerController('myController2',MyController2Version2,2);
     * @param id
     * @param controllerClass
     * @param apiLevel
     */
    static registerController(id : string, controllerClass : ControllerClass, apiLevel ?: number) {
        if(typeof apiLevel === 'number'){
            if(typeof Config.tmpController[id] === 'function'){
                throw new Error(`The controller id: ${id} is already defined.`+
                    ` To define more controllers with the same id every register should provide an API level.`);
            }
            else {
                if(!Config.tmpController.hasOwnProperty(id)){
                    Config.tmpController[id] = {};
                }

                if(Config.tmpController[id].hasOwnProperty(apiLevel)){
                    throw new Error(`The controller id: ${id} with the API level ${apiLevel} is already defined.`);
                }
                else {
                    Config.tmpController[id][apiLevel] = controllerClass;
                }
            }
        }
        else {
            if(Config.tmpController.hasOwnProperty(id)){
                throw new Error(`The controller id: ${id} is already defined.`+
                    ` To define more controllers with the same id every register should provide an API level.`);
            }
            else {
                Config.tmpController[id] = controllerClass;
            }
        }

    }

    static single(model : Model) : SingleModelInput {
        return [model];
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
            //create models object if not created
            if(config.models === undefined){
                config.models = {};
            }
            //create controller object if not created
            if(config.controllers === undefined){
                config.controllers = {};
            }
            //add registered models
            for(let name in Config.tmpModels){
                if(Config.tmpModels.hasOwnProperty(name)){
                    if(config.models.hasOwnProperty(name)){
                        throw new Error
                        (`Conflict with model name: ${name}, the model name is defined in the app config and with the method defineModel or defineModels.`);
                    }
                    else {
                        config.models[name] = Config.tmpModels[name];
                    }
                }
            }
            //add registered controllers
            for(let name in Config.tmpController){
                if(Config.tmpController.hasOwnProperty(name)){
                    if(config.controllers.hasOwnProperty(name)){
                        throw new Error
                        (`Conflict with controller id: ${name}, the controller id is defined in the app config and with the config utils.`);
                    }
                    else {
                        config.controllers[name] = Config.tmpController[name];
                    }
                }
            }

        }
        return config;
    }

    // noinspection JSUnusedGlobalSymbols
    static eventConfig(config : EventConfig) : EventConfig {return config;}
    // noinspection JSUnusedGlobalSymbols
    static serviceConfig(config : ServiceConfig) : ServiceConfig {return config;}
    // noinspection JSUnusedGlobalSymbols
    static mainConfig(config : MainConfig) : MainConfig {return config;}
    // noinspection JSUnusedGlobalSymbols
    static channelConfig(config : ChannelConfig) : ChannelConfig {return config;}
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
    static validate(func : ValidatorFunction) : ValidatorFunction {return func;}
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
    static prepareHandle(func : PrepareHandleFunction) : PrepareHandleFunction {return func;}
    // noinspection JSUnusedGlobalSymbols
    static controllerAccess(func : ControllerAccessFunction) : ControllerAccessFunction {return func;}

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

    //Part Channel Config functions
    // noinspection JSUnusedGlobalSymbols
    static cIdChClientPubAccess(func : CIdChannelClientPubAccessFunction) : CIdChannelClientPubAccessFunction {return func;}
    // noinspection JSUnusedGlobalSymbols
    static cChClientPubAccess(func : CChannelClientPubAccessFunction) : CChannelClientPubAccessFunction  {return func;}

    // noinspection JSUnusedGlobalSymbols
    static cIdChSubAccess(func : CIdChannelSubAccessFunction) : CIdChannelSubAccessFunction {return func;}
    // noinspection JSUnusedGlobalSymbols
    static cChSubAccess(func : CChannelSubAccessFunction) : CChannelSubAccessFunction {return func;}

    // noinspection JSUnusedGlobalSymbols
    static cChOnClientPub(func : CChannelOnClientPubFunction) : CChannelOnClientPubFunction {return func;}
    // noinspection JSUnusedGlobalSymbols
    static cIdChOnClientPub(func : CIdChannelOnClientPubFunction) : CIdChannelOnClientPubFunction {return func;}

    // noinspection JSUnusedGlobalSymbols
    static cChOnBagPub(func : CChannelOnBagPubFunction) : CChannelOnBagPubFunction {return func;}
    // noinspection JSUnusedGlobalSymbols
    static cIdChOnBagPub(func : CIdChannelOnBagPubFunction) : CIdChannelOnBagPubFunction {return func;}

    // noinspection JSUnusedGlobalSymbols
    static cChOnSub(func : CChannelOnSubFunction) : CChannelOnSubFunction {return func;}
    // noinspection JSUnusedGlobalSymbols
    static cIdChOnSub(func : CIdChannelOnSubFunction) : CIdChannelOnSubFunction {return func;}

    // noinspection JSUnusedGlobalSymbols
    static cChOnUnsub(func : CChannelOnUnsubFunction) : CChannelOnUnsubFunction {return func;}
    // noinspection JSUnusedGlobalSymbols
    static cIdChOnUnsub(func : CIdChannelOnUnsubFunction) : CIdChannelOnUnsubFunction {return func;}

    // noinspection JSUnusedGlobalSymbols
    static customCh(c : CustomCh) : CustomCh {return c;}

    // noinspection JSUnusedGlobalSymbols
    static customIdCh(c : CustomIdCh) : CustomIdCh {return c;}

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
    static workerStarted(func : WorkerStartedFunction) : WorkerStartedFunction {return func;}
    // noinspection JSUnusedGlobalSymbols
    static workerLeaderStarted(func : WorkerStartedFunction) : WorkerStartedFunction {return func;}
    // noinspection JSUnusedGlobalSymbols
    static express(func : ExpressFunction) : ExpressFunction {return func;}
    // noinspection JSUnusedGlobalSymbols
    static scServer(func : ScServerFunction) : ScServerFunction {return func;}
    // noinspection JSUnusedGlobalSymbols
    static socketConnection(func : SocketConnectionFunction) : SocketConnectionFunction {return func;}
    // noinspection JSUnusedGlobalSymbols
    static beforeError(func : BeforeErrorFunction) : BeforeErrorFunction {return func;}
    // noinspection JSUnusedGlobalSymbols
    static beforeBackError(func : BeforeBackErrorFunction) : BeforeBackErrorFunction {return func;}
    // noinspection JSUnusedGlobalSymbols
    static beforeBackErrorBag(func : BeforeBackErrorBagFunction) : BeforeBackErrorBagFunction {return func;}
    // noinspection JSUnusedGlobalSymbols
    static httpServerStarted(func : HttpServerStartedFunction) : HttpServerStartedFunction {return func;}
    // noinspection JSUnusedGlobalSymbols
    static wsServerStarted(func : WsServerStartedFunction) : WsServerStartedFunction{return func;}
    // noinspection JSUnusedGlobalSymbols
    static started(func : StartedFunction) : StartedFunction{return func;}
    // noinspection JSUnusedGlobalSymbols
    static socketDisconnection(func : SocketDisconnectionFunction) : SocketDisconnectionFunction {return func;}
    // noinspection JSUnusedGlobalSymbols
    static workerMessage(func : WorkerMessageFunction) : WorkerMessageFunction {return func;}

    //Zation Middleware
    // noinspection JSUnusedGlobalSymbols
    static middlewareAuthenticate(func : MiddlewareAuthenticationFunction) : MiddlewareAuthenticationFunction {return func;}

    //Part Socket Events (SC)
    // noinspection JSUnusedGlobalSymbols
    static socketError(func : SocketErrorFunction) : SocketErrorFunction {return func;}
    // noinspection JSUnusedGlobalSymbols
    static socketRaw(func : SocketRawFunction) : SocketRawFunction {return func;}
    // noinspection JSUnusedGlobalSymbols
    static socketConnect(func : SocketConnectFunction) : SocketConnectFunction {return func;}
    // noinspection JSUnusedGlobalSymbols
    static socketDisconnect(func : SocketCodeDataFunction) : SocketCodeDataFunction {return func;}
    // noinspection JSUnusedGlobalSymbols
    static socketConnectAbort(func : SocketCodeDataFunction) : SocketCodeDataFunction {return func;}
    // noinspection JSUnusedGlobalSymbols
    static socketClose(func : SocketCodeDataFunction) : SocketCodeDataFunction {return func;}
    // noinspection JSUnusedGlobalSymbols
    static socketSubscribe(func : SocketSubscribeFunction) : SocketSubscribeFunction {return func;}
    // noinspection JSUnusedGlobalSymbols
    static socketUnsubscribe(func : SocketUnsubscribeFunction) : SocketUnsubscribeFunction{return func;}
    // noinspection JSUnusedGlobalSymbols
    static socketBadAuthToken(func : SocketBadAuthTokenFunction) : SocketBadAuthTokenFunction{return func;}
    // noinspection JSUnusedGlobalSymbols
    static socketAuthenticate(func : SocketAuthenticateFunction) : SocketAuthenticateFunction{return func;}
    // noinspection JSUnusedGlobalSymbols
    static socketDeauthenticate(func : SocketDeauthenticateFunction) : SocketDeauthenticateFunction{return func;}
    // noinspection JSUnusedGlobalSymbols
    static socketAuthStateChange(func : SocketAuthStateChangeFunction) : SocketAuthStateChangeFunction{return func;}
    // noinspection JSUnusedGlobalSymbols
    static socketMessage(func : SocketMessageFunction) : SocketMessageFunction{return func;}

    //Part ScServer Events (SC)
    // noinspection JSUnusedGlobalSymbols
    static scServerError(func : ScServerErrorFunction) : ScServerErrorFunction {return func;}
    // noinspection JSUnusedGlobalSymbols
    static scServerNotice(func : ScServerNoticeFunction) : ScServerNoticeFunction {return func;}
    // noinspection JSUnusedGlobalSymbols
    static scServerHandshake(func : ScServerSocketFunction) : ScServerSocketFunction {return func;}
    // noinspection JSUnusedGlobalSymbols
    static scServerConnectionAbort(func : ScServerSocketCodeDataFunction) : ScServerSocketCodeDataFunction {return func;}
    // noinspection JSUnusedGlobalSymbols
    static scServerDisconnection(func : ScServerSocketCodeDataFunction) : ScServerSocketCodeDataFunction {return func;}
    // noinspection JSUnusedGlobalSymbols
    static scServerClosure(func : ScServerSocketCodeDataFunction) : ScServerSocketCodeDataFunction {return func;}
    // noinspection JSUnusedGlobalSymbols
    static scServerConnection(func : ScServerConnectionFunction) : ScServerConnectionFunction {return func;}
    // noinspection JSUnusedGlobalSymbols
    static scServerSubscription(func : ScServerSubscriptionFunction) : ScServerSubscriptionFunction {return func;}
    // noinspection JSUnusedGlobalSymbols
    static scServerUnsubscription(func : ScServerUnsubscriptionFunction) : ScServerUnsubscriptionFunction {return func;}
    // noinspection JSUnusedGlobalSymbols
    static scServerAuthentication(func : ScServerAuthenticationFunction) : ScServerAuthenticationFunction {return func;}
    // noinspection JSUnusedGlobalSymbols
    static scServerDeauthentication(func : ScServerDeauthenticationFunction) : ScServerDeauthenticationFunction {return func;}
    // noinspection JSUnusedGlobalSymbols
    static scServerAuthenticationStateChange(func : ScServerAuthenticationStateChangeFunction) : ScServerAuthenticationStateChangeFunction {return func;}
    // noinspection JSUnusedGlobalSymbols
    static scServerBadSocketAuthToken(func : ScServerBadSocketAuthTokenFunction) : ScServerBadSocketAuthTokenFunction {return func;}
    // noinspection JSUnusedGlobalSymbols
    static scServerReady(func : ScServerReadyFunction) : ScServerReadyFunction {return func;}

    //Part Types
    // noinspection JSUnusedGlobalSymbols
    static typeSmallBag(smallBag : SmallBag) : SmallBag {return smallBag;}
    // noinspection JSUnusedGlobalSymbols
    static typeBag(bag : Bag) : Bag {return bag;}
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
    static customIdChInfo(cIdChInfo : CIdChInfo) : CIdChInfo {return cIdChInfo;}
    // noinspection JSUnusedGlobalSymbols
    static pubDataInfo(pubDataInfo : PubData) : PubData {return pubDataInfo;}
    // noinspection JSUnusedGlobalSymbols
    static socketInfo(socketInfo : SocketInfo) : SocketInfo {return socketInfo;}
    // noinspection JSUnusedGlobalSymbols
    static zationInfo(zationInfo : ZationInfo) : ZationInfo {return zationInfo;}
    // noinspection JSUnusedGlobalSymbols
    static zationTokenInfo(zationTokenInfo : ZationTokenInfo) : ZationTokenInfo {return zationTokenInfo;}
}

export const single = Config.single;