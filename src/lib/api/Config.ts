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
import BagExtension from "../helper/bagExtension/bagExtension";

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
    static buildController<E extends BagExtension = {smallBag:{},bag:{}}>(controller : ControllerClass<E>,config : ControllerConfig<E>,overrideControllerConfig : boolean = false) : ControllerClass<E> {
        ObjectTools.addObToOb(controller.config,config,overrideControllerConfig);
        return controller;
    }

    //Part main configs
    // noinspection JSUnusedGlobalSymbols
    static appConfig<E extends BagExtension = {smallBag:{},bag:{}}>(config : AppConfig<E>) : AppConfig<E> {return config;}
    // noinspection JSUnusedGlobalSymbols
    static eventConfig<E extends BagExtension = {smallBag:{},bag:{}}>(config : EventConfig<E>) : EventConfig<E> {return config;}
    // noinspection JSUnusedGlobalSymbols
    static serviceConfig(config : ServiceConfig) : ServiceConfig {return config;}
    // noinspection JSUnusedGlobalSymbols
    static mainConfig(config : MainConfig) : MainConfig {return config;}
    // noinspection JSUnusedGlobalSymbols
    static channelConfig<E extends BagExtension = {smallBag:{},bag:{}}>(config : ChannelConfig<E>) : ChannelConfig<E> {return config;}
    // noinspection JSUnusedGlobalSymbols
    static errorConfig(config : ErrorConfig) : ErrorConfig {return config;}
    // noinspection JSUnusedGlobalSymbols
    static starterConfig(config : StarterConfig) : StarterConfig {return config;}

    //Object
    // noinspection JSUnusedGlobalSymbols
    static objectProperty<E extends BagExtension = {smallBag:{},bag:{}}>(c : ObjectPropertyConfig<E>) :  ObjectPropertyConfig<E> {return c;}
    // noinspection JSUnusedGlobalSymbols
    static object<E extends BagExtension = {smallBag:{},bag:{}}>(c : ObjectPropertyConfig<E>) :  ObjectPropertyConfig<E> {return c;}
    // noinspection JSUnusedGlobalSymbols
    static construct<E extends BagExtension = {smallBag:{},bag:{}}>(func : ConstructObjectFunction<E>) : ConstructObjectFunction<E> {return func;}
    // noinspection JSUnusedGlobalSymbols
    static objectProperties<E extends BagExtension = {smallBag:{},bag:{}}>(c : ObjectProperties<E>) :  ObjectProperties<E> {return c;}
    // noinspection JSUnusedGlobalSymbols
    static convertObject<E extends BagExtension = {smallBag:{},bag:{}}>(c : ConvertObjectFunction<E>) :  ConvertObjectFunction<E> {return c;}

    //Value
    // noinspection JSUnusedGlobalSymbols
    static valueProperty<E extends BagExtension = {smallBag:{},bag:{}}>(c : ValuePropertyConfig<E>) :  ValuePropertyConfig<E> {return c;}
    // noinspection JSUnusedGlobalSymbols
    static value<E extends BagExtension = {smallBag:{},bag:{}}>(c : ValuePropertyConfig<E>) :  ValuePropertyConfig<E> {return c;}
    // noinspection JSUnusedGlobalSymbols
    static convertValue<E extends BagExtension = {smallBag:{},bag:{}}>(c : ConvertValueFunction<E>) :  ConvertValueFunction<E> {return c;}
    // noinspection JSUnusedGlobalSymbols
    static validate<E extends BagExtension = {smallBag:{},bag:{}}>(func : ValidatorFunction<E>) : ValidatorFunction<E> {return func;}
    // noinspection JSUnusedGlobalSymbols
    static getDate<E extends BagExtension = {smallBag:{},bag:{}}>(func : GetDateFunction<E>) : GetDateFunction<E> {return func;}

    //Array
    // noinspection JSUnusedGlobalSymbols
    static arrayProperty<E extends BagExtension = {smallBag:{},bag:{}}>(c : ArrayPropertyConfig<E>) :  ArrayPropertyConfig<E> {return c;}
    // noinspection JSUnusedGlobalSymbols
    static array<E extends BagExtension = {smallBag:{},bag:{}}>(c : ArrayPropertyConfig<E>) :  ArrayPropertyConfig<E> {return c;}
    // noinspection JSUnusedGlobalSymbols
    static convertArray<E extends BagExtension = {smallBag:{},bag:{}}>(c : ConvertArrayFunction<E>) :  ConvertArrayFunction<E> {return c;}

    //Controller
    // noinspection JSUnusedGlobalSymbols
    static controllerConfig<E extends BagExtension = {smallBag:{},bag:{}}>(c : ControllerConfig<E>) :  ControllerConfig<E> {return c;}
    // noinspection JSUnusedGlobalSymbols
    static controllerInput<E extends BagExtension = {smallBag:{},bag:{}}>(c : ControllerInput<E>) :  ControllerInput<E> {return c;}
    // noinspection JSUnusedGlobalSymbols
    static beforeHandle<E extends BagExtension = {smallBag:{},bag:{}}>(func : BeforeHandleFunction<E>) : BeforeHandleFunction<E> {return func;}
    // noinspection JSUnusedGlobalSymbols
    static controllerAccess<E extends BagExtension = {smallBag:{},bag:{}}>(func : ControllerAccessFunction<E>) : ControllerAccessFunction<E> {return func;}

    //Part Background tasks
    // noinspection JSUnusedGlobalSymbols
    static backgroundTask<E extends BagExtension = {smallBag:{},bag:{}}>(c : BackgroundTask<E>) :  BackgroundTask<E> {return c;}
    // noinspection JSUnusedGlobalSymbols
    static task<E extends BagExtension = {smallBag:{},bag:{}}>(func : TaskFunction<E>) :  TaskFunction<E> {return func;}

    //Part Properties
    // noinspection JSUnusedGlobalSymbols
    static property<E extends BagExtension = {smallBag:{},bag:{}}>(c : Property<E>) :  Property<E> {return c;}


    //Part Channel Config functions
    // noinspection JSUnusedGlobalSymbols
    static cIdChClientPubAccess<E extends BagExtension = {smallBag:{},bag:{}}>(func : CIdChannelClientPubAccessFunction<E>) : CIdChannelClientPubAccessFunction<E> {return func;}
    // noinspection JSUnusedGlobalSymbols
    static cChClientPubAccess<E extends BagExtension = {smallBag:{},bag:{}}>(func : CChannelClientPubAccessFunction<E>) : CChannelClientPubAccessFunction<E>  {return func;}

    // noinspection JSUnusedGlobalSymbols
    static cIdChSubAccess<E extends BagExtension = {smallBag:{},bag:{}}>(func : CIdChannelSubAccessFunction<E>) : CIdChannelSubAccessFunction<E> {return func;}
    // noinspection JSUnusedGlobalSymbols
    static cChSubAccess<E extends BagExtension = {smallBag:{},bag:{}}>(func : CChannelSubAccessFunction<E>) : CChannelSubAccessFunction<E> {return func;}

    // noinspection JSUnusedGlobalSymbols
    static cChOnClientPub<E extends BagExtension = {smallBag:{},bag:{}}>(func : CChannelOnClientPubFunction<E>) : CChannelOnClientPubFunction<E> {return func;}
    // noinspection JSUnusedGlobalSymbols
    static cIdChOnClientPub<E extends BagExtension = {smallBag:{},bag:{}}>(func : CIdChannelOnClientPubFunction<E>) : CIdChannelOnClientPubFunction<E> {return func;}

    // noinspection JSUnusedGlobalSymbols
    static cChOnBagPub<E extends BagExtension = {smallBag:{},bag:{}}>(func : CChannelOnBagPubFunction<E>) : CChannelOnBagPubFunction<E> {return func;}
    // noinspection JSUnusedGlobalSymbols
    static cIdChOnBagPub<E extends BagExtension = {smallBag:{},bag:{}}>(func : CIdChannelOnBagPubFunction<E>) : CIdChannelOnBagPubFunction<E> {return func;}

    // noinspection JSUnusedGlobalSymbols
    static cChOnSub<E extends BagExtension = {smallBag:{},bag:{}}>(func : CChannelOnSubFunction<E>) : CChannelOnSubFunction<E> {return func;}
    // noinspection JSUnusedGlobalSymbols
    static cIdChOnSub<E extends BagExtension = {smallBag:{},bag:{}}>(func : CIdChannelOnSubFunction<E>) : CIdChannelOnSubFunction<E> {return func;}

    // noinspection JSUnusedGlobalSymbols
    static cChOnUnsub<E extends BagExtension = {smallBag:{},bag:{}}>(func : CChannelOnUnsubFunction<E>) : CChannelOnUnsubFunction<E> {return func;}
    // noinspection JSUnusedGlobalSymbols
    static cIdChOnUnsub<E extends BagExtension = {smallBag:{},bag:{}}>(func : CIdChannelOnUnsubFunction<E>) : CIdChannelOnUnsubFunction<E> {return func;}

    // noinspection JSUnusedGlobalSymbols
    static customCh<E extends BagExtension = {smallBag:{},bag:{}}>(c : CustomCh<E>) : CustomCh<E> {return c;}

    // noinspection JSUnusedGlobalSymbols
    static customIdCh<E extends BagExtension = {smallBag:{},bag:{}}>(c : CustomIdCh<E>) : CustomIdCh<E> {return c;}

    // noinspection JSUnusedGlobalSymbols
    static userCh<E extends BagExtension = {smallBag:{},bag:{}}>(c : UserChannel<E>) : UserChannel<E> {return c;}
    // noinspection JSUnusedGlobalSymbols
    static userChOnClientPub<E extends BagExtension = {smallBag:{},bag:{}}>(func : UserChOnClientPubFunction<E>) : UserChOnClientPubFunction<E> {return func;}
    // noinspection JSUnusedGlobalSymbols
    static userChOnBagPub<E extends BagExtension = {smallBag:{},bag:{}}>(func : UserChOnBagPubFunction<E>) : UserChOnBagPubFunction<E> {return func;}
    // noinspection JSUnusedGlobalSymbols
    static userChOnSub<E extends BagExtension = {smallBag:{},bag:{}}>(func : UserChOnSubFunction<E>) : UserChOnSubFunction<E> {return func;}
    // noinspection JSUnusedGlobalSymbols
    static userChOnUnsub<E extends BagExtension = {smallBag:{},bag:{}}>(func : UserChOnUnsubFunction<E>) : UserChOnUnsubFunction<E> {return func;}

    // noinspection JSUnusedGlobalSymbols
    static authUserGroupCh<E extends BagExtension = {smallBag:{},bag:{}}>(c : AuthUserGroupChannel<E>) : AuthUserGroupChannel<E> {return c;}
    // noinspection JSUnusedGlobalSymbols
    static authUserGroupChOnClientPub<E extends BagExtension = {smallBag:{},bag:{}}>(func : AuthUserGroupChOnClientPubFunction<E>) : AuthUserGroupChOnClientPubFunction<E> {return func;}
    // noinspection JSUnusedGlobalSymbols
    static authUserGroupChOnBagPub<E extends BagExtension = {smallBag:{},bag:{}}>(func : AuthUserGroupChOnBagPubFunction<E>) : AuthUserGroupChOnBagPubFunction<E> {return func;}
    // noinspection JSUnusedGlobalSymbols
    static authUserGroupChOnSub<E extends BagExtension = {smallBag:{},bag:{}}>(func : AuthUserGroupChOnSubFunction<E>) : AuthUserGroupChOnSubFunction<E> {return func;}
    // noinspection JSUnusedGlobalSymbols
    static authUserGroupChOnUnsub<E extends BagExtension = {smallBag:{},bag:{}}>(func : AuthUserGroupChOnUnsubFunction<E>) : AuthUserGroupChOnUnsubFunction<E> {return func;}

    // noinspection JSUnusedGlobalSymbols
    static defaultUserGroupCh<E extends BagExtension = {smallBag:{},bag:{}}>(c : NormalChannel<E>) : NormalChannel<E> {return c;}
    // noinspection JSUnusedGlobalSymbols
    static defaultUserGroupChOnClientPub<E extends BagExtension = {smallBag:{},bag:{}}>(func : NormalChOnClientPubFunction<E>) : NormalChOnClientPubFunction<E> {return func;}
    // noinspection JSUnusedGlobalSymbols
    static defaultUserGroupChOnBagPub<E extends BagExtension = {smallBag:{},bag:{}}>(func : NormalChOnBagPubFunction<E>) : NormalChOnBagPubFunction<E> {return func;}
    // noinspection JSUnusedGlobalSymbols
    static defaultUserGroupChOnSub<E extends BagExtension = {smallBag:{},bag:{}}>(func : NormalChOnSubFunction<E>) : NormalChOnSubFunction<E> {return func;}
    // noinspection JSUnusedGlobalSymbols
    static defaultUserGroupChOnUnsub<E extends BagExtension = {smallBag:{},bag:{}}>(func : NormalChOnUnsubFunction<E>) : NormalChOnUnsubFunction<E> {return func;}

    // noinspection JSUnusedGlobalSymbols
    static allCh<E extends BagExtension = {smallBag:{},bag:{}}>(c : NormalChannel<E>) : NormalChannel<E> {return c;}
    // noinspection JSUnusedGlobalSymbols
    static allChOnClientPub<E extends BagExtension = {smallBag:{},bag:{}}>(func : NormalChOnClientPubFunction<E>) : NormalChOnClientPubFunction<E> {return func;}
    // noinspection JSUnusedGlobalSymbols
    static allChOnBagPub<E extends BagExtension = {smallBag:{},bag:{}}>(func : NormalChOnBagPubFunction<E>) : NormalChOnBagPubFunction<E> {return func;}
    // noinspection JSUnusedGlobalSymbols
    static allChOnSub<E extends BagExtension = {smallBag:{},bag:{}}>(func : NormalChOnSubFunction<E>) : NormalChOnSubFunction<E> {return func;}
    // noinspection JSUnusedGlobalSymbols
    static allChOnUnsub<E extends BagExtension = {smallBag:{},bag:{}}>(func : NormalChOnUnsubFunction<E>) : NormalChOnUnsubFunction<E> {return func;}

    //Part Service Config
    // noinspection JSUnusedGlobalSymbols
    static service<Config,Created,Get>(c : MainService<Config,Created,Get>) : MainService<Config,Created,Get> {return c;}

    //Part Error Config
    // noinspection JSUnusedGlobalSymbols
    static taskError(c : ErrorConstruct) : ErrorConstruct {return c;}

    //Part Event Config events

    //Part Zation Events
    static workerIsStarted<E extends BagExtension = {smallBag:{},bag:{}}>(func : WorkerIsStartedFunction<E>) : WorkerIsStartedFunction<E> {return func;}
    // noinspection JSUnusedGlobalSymbols
    static workerLeaderIsStarted<E extends BagExtension = {smallBag:{},bag:{}}>(func : WorkerIsStartedFunction<E>) : WorkerIsStartedFunction<E> {return func;}
    // noinspection JSUnusedGlobalSymbols
    static express<E extends BagExtension = {smallBag:{},bag:{}}>(func : ExpressFunction<E>) : ExpressFunction<E> {return func;}
    // noinspection JSUnusedGlobalSymbols
    static scServer<E extends BagExtension = {smallBag:{},bag:{}}>(func : ScServerFunction<E>) : ScServerFunction<E> {return func;}
    // noinspection JSUnusedGlobalSymbols
    static socketConnection<E extends BagExtension = {smallBag:{},bag:{}}>(func : ZationSocketFunction<E>) : ZationSocketFunction<E> {return func;}
    // noinspection JSUnusedGlobalSymbols
    static beforeError<E extends BagExtension = {smallBag:{},bag:{}}>(func : BeforeErrorFunction<E>) : BeforeErrorFunction<E> {return func;}
    // noinspection JSUnusedGlobalSymbols
    static beforeTaskError<E extends BagExtension = {smallBag:{},bag:{}}>(func : BeforeTaskErrorFunction<E>) : BeforeTaskErrorFunction<E> {return func;}
    // noinspection JSUnusedGlobalSymbols
    static beforeTaskErrorBag<E extends BagExtension = {smallBag:{},bag:{}}>(func : BeforeTaskErrorBagFunction<E>) : BeforeTaskErrorBagFunction<E> {return func;}
    // noinspection JSUnusedGlobalSymbols
    static httpServerStarted<E extends BagExtension = {smallBag:{},bag:{}}>(func : HttpServerIsStartedFunction<E>) : HttpServerIsStartedFunction<E> {return func;}
    // noinspection JSUnusedGlobalSymbols
    static wsServerIsStarted<E extends BagExtension = {smallBag:{},bag:{}}>(func : WsServerIsStartedFunction<E>) : WsServerIsStartedFunction<E>{return func;}
    // noinspection JSUnusedGlobalSymbols
    static isStarted<E extends BagExtension = {smallBag:{},bag:{}}>(func : IsStartedFunction<E>) : IsStartedFunction<E>{return func;}
    // noinspection JSUnusedGlobalSymbols
    static socketDisconnection<E extends BagExtension = {smallBag:{},bag:{}}>(func : ZationSocketDisconnectionFunction<E>) : ZationSocketDisconnectionFunction<E> {return func;}
    // noinspection JSUnusedGlobalSymbols
    static workerMessage<E extends BagExtension = {smallBag:{},bag:{}}>(func : ZationWorkerMessageFunction<E>) : ZationWorkerMessageFunction<E> {return func;}

    //Zation Middleware
    // noinspection JSUnusedGlobalSymbols
    static middlewareAuthenticate<E extends BagExtension = {smallBag:{},bag:{}}>(func : MiddlewareAuthenticationFunction<E>) : MiddlewareAuthenticationFunction<E> {return func;}

    //Part Socket Events (SC)
    // noinspection JSUnusedGlobalSymbols
    static socketError<E extends BagExtension = {smallBag:{},bag:{}}>(func : SocketErrorFunction<E>) : SocketErrorFunction<E> {return func;}
    // noinspection JSUnusedGlobalSymbols
    static socketRaw<E extends BagExtension = {smallBag:{},bag:{}}>(func : SocketRawFunction<E>) : SocketRawFunction<E> {return func;}
    // noinspection JSUnusedGlobalSymbols
    static socketConnect<E extends BagExtension = {smallBag:{},bag:{}}>(func : SocketConnectFunction<E>) : SocketConnectFunction<E> {return func;}
    // noinspection JSUnusedGlobalSymbols
    static socketDisconnect<E extends BagExtension = {smallBag:{},bag:{}}>(func : SocketCodeDataFunction<E>) : SocketCodeDataFunction<E> {return func;}
    // noinspection JSUnusedGlobalSymbols
    static socketConnectAbort<E extends BagExtension = {smallBag:{},bag:{}}>(func : SocketCodeDataFunction<E>) : SocketCodeDataFunction<E> {return func;}
    // noinspection JSUnusedGlobalSymbols
    static socketClose<E extends BagExtension = {smallBag:{},bag:{}}>(func : SocketCodeDataFunction<E>) : SocketCodeDataFunction<E> {return func;}
    // noinspection JSUnusedGlobalSymbols
    static socketSubscribe<E extends BagExtension = {smallBag:{},bag:{}}>(func : SocketSubscribeFunction<E>) : SocketSubscribeFunction<E> {return func;}
    // noinspection JSUnusedGlobalSymbols
    static socketUnsubscribe<E extends BagExtension = {smallBag:{},bag:{}}>(func : SocketUnsubscribeFunction<E>) : SocketUnsubscribeFunction<E>{return func;}
    // noinspection JSUnusedGlobalSymbols
    static socketBadAuthToken<E extends BagExtension = {smallBag:{},bag:{}}>(func : SocketBadAuthTokenFunction<E>) : SocketBadAuthTokenFunction<E>{return func;}
    // noinspection JSUnusedGlobalSymbols
    static socketAuthenticate<E extends BagExtension = {smallBag:{},bag:{}}>(func : SocketAuthenticateFunction<E>) : SocketAuthenticateFunction<E>{return func;}
    // noinspection JSUnusedGlobalSymbols
    static socketDeauthenticate<E extends BagExtension = {smallBag:{},bag:{}}>(func : SocketDeauthenticateFunction<E>) : SocketDeauthenticateFunction<E>{return func;}
    // noinspection JSUnusedGlobalSymbols
    static socketAuthStateChange<E extends BagExtension = {smallBag:{},bag:{}}>(func : SocketAuthStateChangeFunction<E>) : SocketAuthStateChangeFunction<E>{return func;}
    // noinspection JSUnusedGlobalSymbols
    static socketMessage<E extends BagExtension = {smallBag:{},bag:{}}>(func : SocketMessageFunction<E>) : SocketMessageFunction<E>{return func;}

    //Part ScServer Events (SC)
    // noinspection JSUnusedGlobalSymbols
    static scServerError<E extends BagExtension = {smallBag:{},bag:{}}>(func : ScServerErrorFunction<E>) : ScServerErrorFunction<E> {return func;}
    // noinspection JSUnusedGlobalSymbols
    static scServerNotice<E extends BagExtension = {smallBag:{},bag:{}}>(func : ScServerNoticeFunction<E>) : ScServerNoticeFunction<E> {return func;}
    // noinspection JSUnusedGlobalSymbols
    static scServerHandshake<E extends BagExtension = {smallBag:{},bag:{}}>(func : ScServerSocketFunction<E>) : ScServerSocketFunction<E> {return func;}
    // noinspection JSUnusedGlobalSymbols
    static scServerConnectionAbort<E extends BagExtension = {smallBag:{},bag:{}}>(func : ScServerSocketCodeDataFunction<E>) : ScServerSocketCodeDataFunction<E> {return func;}
    // noinspection JSUnusedGlobalSymbols
    static scServerDisconnection<E extends BagExtension = {smallBag:{},bag:{}}>(func : ScServerSocketCodeDataFunction<E>) : ScServerSocketCodeDataFunction<E> {return func;}
    // noinspection JSUnusedGlobalSymbols
    static scServerClosure<E extends BagExtension = {smallBag:{},bag:{}}>(func : ScServerSocketCodeDataFunction<E>) : ScServerSocketCodeDataFunction<E> {return func;}
    // noinspection JSUnusedGlobalSymbols
    static scServerConnection<E extends BagExtension = {smallBag:{},bag:{}}>(func : ScServerConnectionFunction<E>) : ScServerConnectionFunction<E> {return func;}
    // noinspection JSUnusedGlobalSymbols
    static scServerSubscription<E extends BagExtension = {smallBag:{},bag:{}}>(func : ScServerSubscriptionFunction<E>) : ScServerSubscriptionFunction<E> {return func;}
    // noinspection JSUnusedGlobalSymbols
    static scServerUnsubscription<E extends BagExtension = {smallBag:{},bag:{}}>(func : ScServerUnsubscriptionFunction<E>) : ScServerUnsubscriptionFunction<E> {return func;}
    // noinspection JSUnusedGlobalSymbols
    static scServerAuthentication<E extends BagExtension = {smallBag:{},bag:{}}>(func : ScServerAuthenticationFunction<E>) : ScServerAuthenticationFunction<E> {return func;}
    // noinspection JSUnusedGlobalSymbols
    static scServerDeauthentication<E extends BagExtension = {smallBag:{},bag:{}}>(func : ScServerDeauthenticationFunction<E>) : ScServerDeauthenticationFunction<E> {return func;}
    // noinspection JSUnusedGlobalSymbols
    static scServerAuthenticationStateChange<E extends BagExtension = {smallBag:{},bag:{}}>(func : ScServerAuthenticationStateChangeFunction<E>) : ScServerAuthenticationStateChangeFunction<E> {return func;}
    // noinspection JSUnusedGlobalSymbols
    static scServerBadSocketAuthToken<E extends BagExtension = {smallBag:{},bag:{}}>(func : ScServerBadSocketAuthTokenFunction<E>) : ScServerBadSocketAuthTokenFunction<E> {return func;}
    // noinspection JSUnusedGlobalSymbols
    static scServerReady<E extends BagExtension = {smallBag:{},bag:{}}>(func : ScServerReadyFunction<E>) : ScServerReadyFunction<E> {return func;}

    //Part Middleware Events (SC)
    // noinspection JSUnusedGlobalSymbols
    static scMiddlewareAuthenticate<E extends BagExtension = {smallBag:{},bag:{}}>(func : ScMiddlewareFunction<E>) : ScMiddlewareFunction<E> {return func;}
    // noinspection JSUnusedGlobalSymbols
    static scMiddlewareHandshakeWs<E extends BagExtension = {smallBag:{},bag:{}}>(func : ScMiddlewareFunction<E>) : ScMiddlewareFunction<E> {return func;}
    // noinspection JSUnusedGlobalSymbols
    static scMiddlewareHandshakeSc<E extends BagExtension = {smallBag:{},bag:{}}>(func : ScMiddlewareFunction<E>) : ScMiddlewareFunction<E> {return func;}
    // noinspection JSUnusedGlobalSymbols
    static scMiddlewareSubscribe<E extends BagExtension = {smallBag:{},bag:{}}>(func : ScMiddlewareFunction<E>) : ScMiddlewareFunction<E> {return func;}
    // noinspection JSUnusedGlobalSymbols
    static scMiddlewarePublishIn<E extends BagExtension = {smallBag:{},bag:{}}>(func : ScMiddlewareFunction<E>) : ScMiddlewareFunction<E> {return func;}
    // noinspection JSUnusedGlobalSymbols
    static scMiddlewarePublishOut<E extends BagExtension = {smallBag:{},bag:{}}>(func : ScMiddlewareFunction<E>) : ScMiddlewareFunction<E> {return func;}
    // noinspection JSUnusedGlobalSymbols
    static scMiddlewareEmit<E extends BagExtension = {smallBag:{},bag:{}}>(func : ScMiddlewareFunction<E>) : ScMiddlewareFunction<E> {return func;}

    //Part Types
    // noinspection JSUnusedGlobalSymbols
    static typeSmallBag<E extends BagExtension = {smallBag:{},bag:{}}>(smallBag : (SmallBag & E["smallBag"])) : (SmallBag & E["smallBag"]) {return smallBag;}
    // noinspection JSUnusedGlobalSymbols
    static typeBag<E extends BagExtension = {smallBag:{},bag:{}}>(bag : (Bag & E["smallBag"] & E["bag"])) : (Bag & E["smallBag"] & E["bag"]) {return bag;}
    // noinspection JSUnusedGlobalSymbols
    static typeResult(result : Result) : Result {return result;}
    // noinspection JSUnusedGlobalSymbols
    static typeTaskError(taskError : TaskError) : TaskError {return taskError;}
    // noinspection JSUnusedGlobalSymbols
    static typeTaskErrorBag(taskErrorBag : TaskErrorBag) : TaskErrorBag {return taskErrorBag;}
    // noinspection JSUnusedGlobalSymbols
    static typeController<E extends BagExtension = {smallBag:{},bag:{}}>(controller : Controller<E>) : Controller<E> {return controller;}
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
