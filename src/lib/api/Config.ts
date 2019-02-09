/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */
import SmallBag              = require("./SmallBag");
import {Bag}                   from './Bag';
import ExpressCore           = require("express-serve-static-core");
import TaskError             = require("./TaskError");
import TaskErrorBag          = require("./TaskErrorBag");
import Result                = require("./Result");
import {Controller, ControllerClass} from "./Controller";

import
{
    BeforeErrorFunction,
    BeforeTaskErrorBagFunction,
    BeforeTaskErrorFunction,
    EventConfig,
    ExpressFunction,
    HttpServerIsStartedFunction,
    IsStartedFunction,
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
    WorkerIsStartedFunction,
    WsServerIsStartedFunction,
    SocketDeauthenticateFunction,
    ScMiddlewareFunction,
    MiddlewareAuthenticationFunction,
    ScServerFunction,
    ZationSocketFunction,
    ZationSocketDisconnectionFunction,
    ZationWorkerMessageFunction,
    ScServerAuthenticationStateChangeFunction,
    SocketRawFunction,
    SocketConnectFunction,
    SocketCodeDataFunction,
    SocketSubscribeFunction,
    SocketUnsubscribeFunction,
    SocketBadAuthTokenFunction,
    SocketAuthStateChangeFunction,
    ScServerSocketCodeDataFunction
} from "../helper/configs/eventConfig";

import
{
    MainService, ServiceConfig
} from "../helper/configs/serviceConfig";

import
{
    AppConfig,
    BeforeHandleFunction,
    ConstructObjectFunction,
    ControllerAccessFunction,
    ControllerConfig,
    ControllerInput,
    ValuePropertyConfig,
    ObjectPropertyConfig,
    ObjectProperties,
    TaskFunction,
    ValidatorFunction,
    Property,
    ArrayPropertyConfig,
    ConvertObjectFunction,
    ConvertValueFunction,
    ConvertArrayFunction, BackgroundTask, GetDateFunction
} from "../helper/configs/appConfig";
import
{
    ErrorConfig,
    ErrorConstruct
} from "../helper/configs/errorConfig";
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
} from "../helper/configs/channelConfig";
import ObjectTools = require("../helper/tools/objectTools");
import {StarterConfig} from "../helper/configs/starterConfig";
import {MainConfig} from "../helper/configs/mainConfig";
import CChInfo = require("../helper/infoObjects/cChInfo");
import CIdChInfo = require("../helper/infoObjects/cIdChInfo");
import PubDataInfo = require("../helper/infoObjects/pubDataInfo");
import SocketInfo = require("../helper/infoObjects/socketInfo");
import ZationInfo = require("../helper/infoObjects/zationInfo");
import ZationTokenInfo = require("../helper/infoObjects/zationTokenInfo");

class Config
{

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
        return ObjectTools.mergeObjects(configs);
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
    static buildController<SB = {},B = {}>(controller : ControllerClass<SB,B>,config : ControllerConfig<SB,B>,overrideControllerConfig : boolean = false) : ControllerClass<SB,B> {
        ObjectTools.addObToOb(controller.config,config,overrideControllerConfig);
        return controller;
    }

    //Part main configs
    // noinspection JSUnusedGlobalSymbols
    static appConfig<SB = {},B = {}>(config : AppConfig<SB,B>) : AppConfig<SB,B> {return config;}
    // noinspection JSUnusedGlobalSymbols
    static eventConfig<SB = {}>(config : EventConfig<SB>) : EventConfig<SB> {return config;}
    // noinspection JSUnusedGlobalSymbols
    static serviceConfig(config : ServiceConfig) : ServiceConfig {return config;}
    // noinspection JSUnusedGlobalSymbols
    static mainConfig(config : MainConfig) : MainConfig {return config;}
    // noinspection JSUnusedGlobalSymbols
    static channelConfig<SB = {}>(config : ChannelConfig<SB>) : ChannelConfig<SB> {return config;}
    // noinspection JSUnusedGlobalSymbols
    static errorConfig(config : ErrorConfig) : ErrorConfig {return config;}
    // noinspection JSUnusedGlobalSymbols
    static starterConfig(config : StarterConfig) : StarterConfig {return config;}

    //Object
    // noinspection JSUnusedGlobalSymbols
    static objectProperty<SB = {}>(c : ObjectPropertyConfig<SB>) :  ObjectPropertyConfig<SB> {return c;}
    // noinspection JSUnusedGlobalSymbols
    static object<SB = {}>(c : ObjectPropertyConfig<SB>) :  ObjectPropertyConfig<SB> {return c;}
    // noinspection JSUnusedGlobalSymbols
    static construct<SB = {}>(func : ConstructObjectFunction<SB>) : ConstructObjectFunction<SB> {return func;}
    // noinspection JSUnusedGlobalSymbols
    static objectProperties<SB = {}>(c : ObjectProperties<SB>) :  ObjectProperties<SB> {return c;}
    // noinspection JSUnusedGlobalSymbols
    static convertObject<SB = {}>(c : ConvertObjectFunction<SB>) :  ConvertObjectFunction<SB> {return c;}

    //Value
    // noinspection JSUnusedGlobalSymbols
    static valueProperty<SB = {}>(c : ValuePropertyConfig<SB>) :  ValuePropertyConfig<SB> {return c;}
    // noinspection JSUnusedGlobalSymbols
    static value<SB = {}>(c : ValuePropertyConfig<SB>) :  ValuePropertyConfig<SB> {return c;}
    // noinspection JSUnusedGlobalSymbols
    static convertValue<SB = {}>(c : ConvertValueFunction<SB>) :  ConvertValueFunction<SB> {return c;}
    // noinspection JSUnusedGlobalSymbols
    static validate<SB = {}>(func : ValidatorFunction<SB>) : ValidatorFunction<SB> {return func;}
    // noinspection JSUnusedGlobalSymbols
    static getDate<SB = {}>(func : GetDateFunction<SB>) : GetDateFunction<SB> {return func;}

    //Array
    // noinspection JSUnusedGlobalSymbols
    static arrayProperty<SB = {}>(c : ArrayPropertyConfig<SB>) :  ArrayPropertyConfig<SB> {return c;}
    // noinspection JSUnusedGlobalSymbols
    static array<SB = {}>(c : ArrayPropertyConfig<SB>) :  ArrayPropertyConfig<SB> {return c;}
    // noinspection JSUnusedGlobalSymbols
    static convertArray<SB = {}>(c : ConvertArrayFunction<SB>) :  ConvertArrayFunction<SB> {return c;}

    //Controller
    // noinspection JSUnusedGlobalSymbols
    static controllerConfig<SB = {},B = {}>(c : ControllerConfig<SB,B>) :  ControllerConfig<SB,B> {return c;}
    // noinspection JSUnusedGlobalSymbols
    static controllerInput<SB = {}>(c : ControllerInput<SB>) :  ControllerInput<SB> {return c;}
    // noinspection JSUnusedGlobalSymbols
    static beforeHandle<SB = {},B = {}>(func : BeforeHandleFunction<SB,B>) : BeforeHandleFunction<SB,B> {return func;}
    // noinspection JSUnusedGlobalSymbols
    static controllerAccess<SB = {}>(func : ControllerAccessFunction<SB>) : ControllerAccessFunction<SB> {return func;}

    //Part Background tasks
    // noinspection JSUnusedGlobalSymbols
    static backgroundTask<SB = {}>(c : BackgroundTask<SB>) :  BackgroundTask<SB> {return c;}
    // noinspection JSUnusedGlobalSymbols
    static task<SB = {}>(func : TaskFunction<SB>) :  TaskFunction<SB> {return func;}

    //Part Properties
    // noinspection JSUnusedGlobalSymbols
    static property<SB = {}>(c : Property<SB>) :  Property<SB> {return c;}


    //Part Channel Config functions
    // noinspection JSUnusedGlobalSymbols
    static cIdChClientPubAccess<SB = {}>(func : CIdChannelClientPubAccessFunction<SB>) : CIdChannelClientPubAccessFunction<SB> {return func;}
    // noinspection JSUnusedGlobalSymbols
    static cChClientPubAccess<SB = {}>(func : CChannelClientPubAccessFunction<SB>) : CChannelClientPubAccessFunction<SB>  {return func;}

    // noinspection JSUnusedGlobalSymbols
    static cIdChSubAccess<SB = {}>(func : CIdChannelSubAccessFunction<SB>) : CIdChannelSubAccessFunction<SB> {return func;}
    // noinspection JSUnusedGlobalSymbols
    static cChSubAccess<SB = {}>(func : CChannelSubAccessFunction<SB>) : CChannelSubAccessFunction<SB> {return func;}

    // noinspection JSUnusedGlobalSymbols
    static cChOnClientPub<SB = {}>(func : CChannelOnClientPubFunction<SB>) : CChannelOnClientPubFunction<SB> {return func;}
    // noinspection JSUnusedGlobalSymbols
    static cIdChOnClientPub<SB = {}>(func : CIdChannelOnClientPubFunction<SB>) : CIdChannelOnClientPubFunction<SB> {return func;}

    // noinspection JSUnusedGlobalSymbols
    static cChOnBagPub<SB = {}>(func : CChannelOnBagPubFunction<SB>) : CChannelOnBagPubFunction<SB> {return func;}
    // noinspection JSUnusedGlobalSymbols
    static cIdChOnBagPub<SB = {}>(func : CIdChannelOnBagPubFunction<SB>) : CIdChannelOnBagPubFunction<SB> {return func;}

    // noinspection JSUnusedGlobalSymbols
    static cChOnSub<SB = {}>(func : CChannelOnSubFunction<SB>) : CChannelOnSubFunction<SB> {return func;}
    // noinspection JSUnusedGlobalSymbols
    static cIdChOnSub<SB = {}>(func : CIdChannelOnSubFunction<SB>) : CIdChannelOnSubFunction<SB> {return func;}

    // noinspection JSUnusedGlobalSymbols
    static cChOnUnsub<SB = {}>(func : CChannelOnUnsubFunction<SB>) : CChannelOnUnsubFunction<SB> {return func;}
    // noinspection JSUnusedGlobalSymbols
    static cIdChOnUnsub<SB = {}>(func : CIdChannelOnUnsubFunction<SB>) : CIdChannelOnUnsubFunction<SB> {return func;}

    // noinspection JSUnusedGlobalSymbols
    static customCh<SB = {}>(c : CustomCh<SB>) : CustomCh<SB> {return c;}

    // noinspection JSUnusedGlobalSymbols
    static customIdCh<SB = {}>(c : CustomIdCh<SB>) : CustomIdCh<SB> {return c;}

    // noinspection JSUnusedGlobalSymbols
    static userCh<SB = {}>(c : UserChannel<SB>) : UserChannel<SB> {return c;}
    // noinspection JSUnusedGlobalSymbols
    static userChOnClientPub<SB = {}>(func : UserChOnClientPubFunction<SB>) : UserChOnClientPubFunction<SB> {return func;}
    // noinspection JSUnusedGlobalSymbols
    static userChOnBagPub<SB = {}>(func : UserChOnBagPubFunction<SB>) : UserChOnBagPubFunction<SB> {return func;}
    // noinspection JSUnusedGlobalSymbols
    static userChOnSub<SB = {}>(func : UserChOnSubFunction<SB>) : UserChOnSubFunction<SB> {return func;}
    // noinspection JSUnusedGlobalSymbols
    static userChOnUnsub<SB = {}>(func : UserChOnUnsubFunction<SB>) : UserChOnUnsubFunction<SB> {return func;}

    // noinspection JSUnusedGlobalSymbols
    static authUserGroupCh<SB = {}>(c : AuthUserGroupChannel<SB>) : AuthUserGroupChannel<SB> {return c;}
    // noinspection JSUnusedGlobalSymbols
    static authUserGroupChOnClientPub<SB = {}>(func : AuthUserGroupChOnClientPubFunction<SB>) : AuthUserGroupChOnClientPubFunction<SB> {return func;}
    // noinspection JSUnusedGlobalSymbols
    static authUserGroupChOnBagPub<SB = {}>(func : AuthUserGroupChOnBagPubFunction<SB>) : AuthUserGroupChOnBagPubFunction<SB> {return func;}
    // noinspection JSUnusedGlobalSymbols
    static authUserGroupChOnSub<SB = {}>(func : AuthUserGroupChOnSubFunction<SB>) : AuthUserGroupChOnSubFunction<SB> {return func;}
    // noinspection JSUnusedGlobalSymbols
    static authUserGroupChOnUnsub<SB = {}>(func : AuthUserGroupChOnUnsubFunction<SB>) : AuthUserGroupChOnUnsubFunction<SB> {return func;}

    // noinspection JSUnusedGlobalSymbols
    static defaultUserGroupCh<SB = {}>(c : NormalChannel<SB>) : NormalChannel<SB> {return c;}
    // noinspection JSUnusedGlobalSymbols
    static defaultUserGroupChOnClientPub<SB = {}>(func : NormalChOnClientPubFunction<SB>) : NormalChOnClientPubFunction<SB> {return func;}
    // noinspection JSUnusedGlobalSymbols
    static defaultUserGroupChOnBagPub<SB = {}>(func : NormalChOnBagPubFunction<SB>) : NormalChOnBagPubFunction<SB> {return func;}
    // noinspection JSUnusedGlobalSymbols
    static defaultUserGroupChOnSub<SB = {}>(func : NormalChOnSubFunction<SB>) : NormalChOnSubFunction<SB> {return func;}
    // noinspection JSUnusedGlobalSymbols
    static defaultUserGroupChOnUnsub<SB = {}>(func : NormalChOnUnsubFunction<SB>) : NormalChOnUnsubFunction<SB> {return func;}

    // noinspection JSUnusedGlobalSymbols
    static allCh<SB = {}>(c : NormalChannel<SB>) : NormalChannel<SB> {return c;}
    // noinspection JSUnusedGlobalSymbols
    static allChOnClientPub<SB = {}>(func : NormalChOnClientPubFunction<SB>) : NormalChOnClientPubFunction<SB> {return func;}
    // noinspection JSUnusedGlobalSymbols
    static allChOnBagPub<SB = {}>(func : NormalChOnBagPubFunction<SB>) : NormalChOnBagPubFunction<SB> {return func;}
    // noinspection JSUnusedGlobalSymbols
    static allChOnSub<SB = {}>(func : NormalChOnSubFunction<SB>) : NormalChOnSubFunction<SB> {return func;}
    // noinspection JSUnusedGlobalSymbols
    static allChOnUnsub<SB = {}>(func : NormalChOnUnsubFunction<SB>) : NormalChOnUnsubFunction<SB> {return func;}

    //Part Service Config
    // noinspection JSUnusedGlobalSymbols
    static service<Config,Created,Get>(c : MainService<Config,Created,Get>) : MainService<Config,Created,Get> {return c;}

    //Part Error Config
    // noinspection JSUnusedGlobalSymbols
    static taskError(c : ErrorConstruct) : ErrorConstruct {return c;}

    //Part Event Config events

    //Part Zation Events
    static workerIsStarted<SB = {}>(func : WorkerIsStartedFunction<SB>) : WorkerIsStartedFunction<SB> {return func;}
    // noinspection JSUnusedGlobalSymbols
    static workerLeaderIsStarted<SB = {}>(func : WorkerIsStartedFunction<SB>) : WorkerIsStartedFunction<SB> {return func;}
    // noinspection JSUnusedGlobalSymbols
    static express<SB = {}>(func : ExpressFunction<SB>) : ExpressFunction<SB> {return func;}
    // noinspection JSUnusedGlobalSymbols
    static scServer<SB = {}>(func : ScServerFunction<SB>) : ScServerFunction<SB> {return func;}
    // noinspection JSUnusedGlobalSymbols
    static socketConnection<SB = {}>(func : ZationSocketFunction<SB>) : ZationSocketFunction<SB> {return func;}
    // noinspection JSUnusedGlobalSymbols
    static beforeError<SB = {}>(func : BeforeErrorFunction<SB>) : BeforeErrorFunction<SB> {return func;}
    // noinspection JSUnusedGlobalSymbols
    static beforeTaskError<SB = {}>(func : BeforeTaskErrorFunction<SB>) : BeforeTaskErrorFunction<SB> {return func;}
    // noinspection JSUnusedGlobalSymbols
    static beforeTaskErrorBag<SB = {}>(func : BeforeTaskErrorBagFunction<SB>) : BeforeTaskErrorBagFunction<SB> {return func;}
    // noinspection JSUnusedGlobalSymbols
    static httpServerStarted<SB = {}>(func : HttpServerIsStartedFunction<SB>) : HttpServerIsStartedFunction<SB> {return func;}
    // noinspection JSUnusedGlobalSymbols
    static wsServerIsStarted<SB = {}>(func : WsServerIsStartedFunction<SB>) : WsServerIsStartedFunction<SB>{return func;}
    // noinspection JSUnusedGlobalSymbols
    static isStarted<SB = {}>(func : IsStartedFunction<SB>) : IsStartedFunction<SB>{return func;}
    // noinspection JSUnusedGlobalSymbols
    static socketDisconnection<SB = {}>(func : ZationSocketDisconnectionFunction<SB>) : ZationSocketDisconnectionFunction<SB> {return func;}
    // noinspection JSUnusedGlobalSymbols
    static workerMessage<SB = {}>(func : ZationWorkerMessageFunction<SB>) : ZationWorkerMessageFunction<SB> {return func;}

    //Zation Middleware
    // noinspection JSUnusedGlobalSymbols
    static middlewareAuthenticate<SB = {}>(func : MiddlewareAuthenticationFunction<SB>) : MiddlewareAuthenticationFunction<SB> {return func;}

    //Part Socket Events (SC)
    // noinspection JSUnusedGlobalSymbols
    static socketError<SB = {}>(func : SocketErrorFunction<SB>) : SocketErrorFunction<SB> {return func;}
    // noinspection JSUnusedGlobalSymbols
    static socketRaw<SB = {}>(func : SocketRawFunction<SB>) : SocketRawFunction<SB> {return func;}
    // noinspection JSUnusedGlobalSymbols
    static socketConnect<SB = {}>(func : SocketConnectFunction<SB>) : SocketConnectFunction<SB> {return func;}
    // noinspection JSUnusedGlobalSymbols
    static socketDisconnect<SB = {}>(func : SocketCodeDataFunction<SB>) : SocketCodeDataFunction<SB> {return func;}
    // noinspection JSUnusedGlobalSymbols
    static socketConnectAbort<SB = {}>(func : SocketCodeDataFunction<SB>) : SocketCodeDataFunction<SB> {return func;}
    // noinspection JSUnusedGlobalSymbols
    static socketClose<SB = {}>(func : SocketCodeDataFunction<SB>) : SocketCodeDataFunction<SB> {return func;}
    // noinspection JSUnusedGlobalSymbols
    static socketSubscribe<SB = {}>(func : SocketSubscribeFunction<SB>) : SocketSubscribeFunction<SB> {return func;}
    // noinspection JSUnusedGlobalSymbols
    static socketUnsubscribe<SB = {}>(func : SocketUnsubscribeFunction<SB>) : SocketUnsubscribeFunction<SB>{return func;}
    // noinspection JSUnusedGlobalSymbols
    static socketBadAuthToken<SB = {}>(func : SocketBadAuthTokenFunction<SB>) : SocketBadAuthTokenFunction<SB>{return func;}
    // noinspection JSUnusedGlobalSymbols
    static socketAuthenticate<SB = {}>(func : SocketAuthenticateFunction<SB>) : SocketAuthenticateFunction<SB>{return func;}
    // noinspection JSUnusedGlobalSymbols
    static socketDeauthenticate<SB = {}>(func : SocketDeauthenticateFunction<SB>) : SocketDeauthenticateFunction<SB>{return func;}
    // noinspection JSUnusedGlobalSymbols
    static socketAuthStateChange<SB = {}>(func : SocketAuthStateChangeFunction<SB>) : SocketAuthStateChangeFunction<SB>{return func;}
    // noinspection JSUnusedGlobalSymbols
    static socketMessage<SB = {}>(func : SocketMessageFunction<SB>) : SocketMessageFunction<SB>{return func;}

    //Part ScServer Events (SC)
    // noinspection JSUnusedGlobalSymbols
    static scServerError<SB = {}>(func : ScServerErrorFunction<SB>) : ScServerErrorFunction<SB> {return func;}
    // noinspection JSUnusedGlobalSymbols
    static scServerNotice<SB = {}>(func : ScServerNoticeFunction<SB>) : ScServerNoticeFunction<SB> {return func;}
    // noinspection JSUnusedGlobalSymbols
    static scServerHandshake<SB = {}>(func : ScServerSocketFunction<SB>) : ScServerSocketFunction<SB> {return func;}
    // noinspection JSUnusedGlobalSymbols
    static scServerConnectionAbort<SB = {}>(func : ScServerSocketCodeDataFunction<SB>) : ScServerSocketCodeDataFunction<SB> {return func;}
    // noinspection JSUnusedGlobalSymbols
    static scServerDisconnection<SB = {}>(func : ScServerSocketCodeDataFunction<SB>) : ScServerSocketCodeDataFunction<SB> {return func;}
    // noinspection JSUnusedGlobalSymbols
    static scServerClosure<SB = {}>(func : ScServerSocketCodeDataFunction<SB>) : ScServerSocketCodeDataFunction<SB> {return func;}
    // noinspection JSUnusedGlobalSymbols
    static scServerConnection<SB = {}>(func : ScServerConnectionFunction<SB>) : ScServerConnectionFunction<SB> {return func;}
    // noinspection JSUnusedGlobalSymbols
    static scServerSubscription<SB = {}>(func : ScServerSubscriptionFunction<SB>) : ScServerSubscriptionFunction<SB> {return func;}
    // noinspection JSUnusedGlobalSymbols
    static scServerUnsubscription<SB = {}>(func : ScServerUnsubscriptionFunction<SB>) : ScServerUnsubscriptionFunction<SB> {return func;}
    // noinspection JSUnusedGlobalSymbols
    static scServerAuthentication<SB = {}>(func : ScServerAuthenticationFunction<SB>) : ScServerAuthenticationFunction<SB> {return func;}
    // noinspection JSUnusedGlobalSymbols
    static scServerDeauthentication<SB = {}>(func : ScServerDeauthenticationFunction<SB>) : ScServerDeauthenticationFunction<SB> {return func;}
    // noinspection JSUnusedGlobalSymbols
    static scServerAuthenticationStateChange<SB = {}>(func : ScServerAuthenticationStateChangeFunction<SB>) : ScServerAuthenticationStateChangeFunction<SB> {return func;}
    // noinspection JSUnusedGlobalSymbols
    static scServerBadSocketAuthToken<SB = {}>(func : ScServerBadSocketAuthTokenFunction<SB>) : ScServerBadSocketAuthTokenFunction<SB> {return func;}
    // noinspection JSUnusedGlobalSymbols
    static scServerReady<SB = {}>(func : ScServerReadyFunction<SB>) : ScServerReadyFunction<SB> {return func;}

    //Part Middleware Events (SC)
    // noinspection JSUnusedGlobalSymbols
    static scMiddlewareAuthenticate<SB = {}>(func : ScMiddlewareFunction<SB>) : ScMiddlewareFunction<SB> {return func;}
    // noinspection JSUnusedGlobalSymbols
    static scMiddlewareHandshakeWs<SB = {}>(func : ScMiddlewareFunction<SB>) : ScMiddlewareFunction<SB> {return func;}
    // noinspection JSUnusedGlobalSymbols
    static scMiddlewareHandshakeSc<SB = {}>(func : ScMiddlewareFunction<SB>) : ScMiddlewareFunction<SB> {return func;}
    // noinspection JSUnusedGlobalSymbols
    static scMiddlewareSubscribe<SB = {}>(func : ScMiddlewareFunction<SB>) : ScMiddlewareFunction<SB> {return func;}
    // noinspection JSUnusedGlobalSymbols
    static scMiddlewarePublishIn<SB = {}>(func : ScMiddlewareFunction<SB>) : ScMiddlewareFunction<SB> {return func;}
    // noinspection JSUnusedGlobalSymbols
    static scMiddlewarePublishOut<SB = {}>(func : ScMiddlewareFunction<SB>) : ScMiddlewareFunction<SB> {return func;}
    // noinspection JSUnusedGlobalSymbols
    static scMiddlewareEmit<SB = {}>(func : ScMiddlewareFunction<SB>) : ScMiddlewareFunction<SB> {return func;}

    //Part Types
    // noinspection JSUnusedGlobalSymbols
    static typeSmallBag<SB = {}>(smallBag : (SmallBag & SB)) : (SmallBag & SB) {return smallBag;}
    // noinspection JSUnusedGlobalSymbols
    static typeBag<SB = {},B = {}>(bag : (Bag & SB & B)) : (Bag & SB & B) {return bag;}
    // noinspection JSUnusedGlobalSymbols
    static typeResult(result : Result) : Result {return result;}
    // noinspection JSUnusedGlobalSymbols
    static typeTaskError(taskError : TaskError) : TaskError {return taskError;}
    // noinspection JSUnusedGlobalSymbols
    static typeTaskErrorBag(taskErrorBag : TaskErrorBag) : TaskErrorBag {return taskErrorBag;}
    // noinspection JSUnusedGlobalSymbols
    static typeController<SB = {},B = {}>(controller : Controller<SB,B>) : Controller<SB,B> {return controller;}
    // noinspection JSUnusedGlobalSymbols
    static typeExpress(express : ExpressCore.Express) : ExpressCore.Express {return express;}

    //Info Types
    // noinspection JSUnusedGlobalSymbols
    static customChInfo(cChInfo : CChInfo) : CChInfo {return cChInfo;}
    // noinspection JSUnusedGlobalSymbols
    static customIdChInfo(cIdChInfo : CIdChInfo) : CIdChInfo {return cIdChInfo;}
    // noinspection JSUnusedGlobalSymbols
    static pubDataInfo(pubDataInfo : PubDataInfo) : PubDataInfo {return pubDataInfo;}
    // noinspection JSUnusedGlobalSymbols
    static socketInfo(socketInfo : SocketInfo) : SocketInfo {return socketInfo;}
    // noinspection JSUnusedGlobalSymbols
    static zationInfo(zationInfo : ZationInfo) : ZationInfo {return zationInfo;}
    // noinspection JSUnusedGlobalSymbols
    static zationTokenInfo(zationTokenInfo : ZationTokenInfo) : ZationTokenInfo {return zationTokenInfo;}
}

export = Config;
