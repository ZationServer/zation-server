/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */
import SmallBag              = require("./SmallBag");
import Bag                   = require("./Bag");
import ExpressCore           = require("express-serve-static-core");
import TaskError             = require("./TaskError");
import TaskErrorBag          = require("./TaskErrorBag");
import Result                = require("./Result");
import {Controller}            from "./Controller";
import {ConnectionConfig}      from "pg";
import {PoolConfig}            from "mysql";

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
    SocketConnectionFunction,
    SocketErrorFunction,
    SocketFunction,
    SocketMessageFunction,
    SocketObjFunction,
    SocketAuthenticateFunction,
    WorkerIsStartedFunction,
    WsServerIsStartedFunction,
    SocketDeauthenticateFunction,
    ScMiddlewareFunction,
    MiddlewareAuthenticationFunction,
    ScServerFunction, ZationSocketFunction, ZationSocketDisconnectionFunction, ZationWorkerMessageFunction
} from "../helper/configs/eventConfig";

import
{
    MainCustomService, MongoDbConfig,
    NodeMailerConfig,
    ServiceConfig
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
    ConvertArrayFunction, BackgroundTask
} from "../helper/configs/appConfig";
import
{
    ErrorConfig,
    ErrorConstruct
} from "../helper/configs/errorConfig";
import {
    AuthUserGroupChannel, AuthUserGroupChOnBagPubFunction, AuthUserGroupChOnSubFunction, AuthUserGroupChOnUnsubFunction,
    CChannelClientPubAccessFunction,
    CChannelDefault,
    CChannelOnBagPubFunction,
    CChannelOnClientPubFunction,
    CChannelOnSubFunction,
    CChannelSubAccessFunction,
    ChannelConfig,
    ChannelSettings,
    CIdChannelClientPubAccessFunction,
    CIdChannelDefault,
    CIdChannelOnBagPubFunction,
    CIdChannelOnClientPubFunction,
    CIdChannelOnSubFunction,
    CIdChannelSubAccessFunction,
    CustomCh,
    CustomIdCh, NormalChannel, NormalChOnBagPubFunction, NormalChOnSubFunction, NormalChOnUnsubFunction,
    UserChannel,
    UserChOnBagPubFunction,
    UserChOnSubFunction,
    UserChOnUnsubFunction
} from "../helper/configs/channelConfig";
import ObjectTools = require("../helper/tools/objectTools");
import {StarterConfig} from "../helper/configs/starterConfig";
import {MainConfig} from "../helper/configs/mainConfig";

class Config
{

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

    //Part main configs
    // noinspection JSUnusedGlobalSymbols
    static appConfig(config : AppConfig) : AppConfig {return config;}
    // noinspection JSUnusedGlobalSymbols
    static eventConfig(config : EventConfig) : EventConfig {return config;}
    // noinspection JSUnusedGlobalSymbols
    static serviceConfig(config : ServiceConfig) : ServiceConfig {return config;}
    // noinspection JSUnusedGlobalSymbols
    static mainConfig(config : MainConfig) : MainConfig {return config;}
    // noinspection JSUnusedGlobalSymbols
    static channelConfig(config : ChannelConfig) : ChannelConfig {return config;}
    // noinspection JSUnusedGlobalSymbols
    static errorConfig(config : ErrorConfig) : ErrorConfig {return config;}
    // noinspection JSUnusedGlobalSymbols
    static starterConfig(config : StarterConfig) : StarterConfig {return config;}

    //Object
    // noinspection JSUnusedGlobalSymbols
    static objectProperty(c : ObjectPropertyConfig) :  ObjectPropertyConfig {return c;}
    // noinspection JSUnusedGlobalSymbols
    static object(c : ObjectPropertyConfig) :  ObjectPropertyConfig {return c;}
    // noinspection JSUnusedGlobalSymbols
    static construct(func : ConstructObjectFunction) : ConstructObjectFunction {return func;}
    // noinspection JSUnusedGlobalSymbols
    static objectProperties(c : ObjectProperties) :  ObjectProperties {return c;}
    // noinspection JSUnusedGlobalSymbols
    static convertObject(c : ConvertObjectFunction) :  ConvertObjectFunction {return c;}

    //Value
    // noinspection JSUnusedGlobalSymbols
    static valueProperty(c : ValuePropertyConfig) :  ValuePropertyConfig {return c;}
    // noinspection JSUnusedGlobalSymbols
    static value(c : ValuePropertyConfig) :  ValuePropertyConfig {return c;}
    // noinspection JSUnusedGlobalSymbols
    static convertValue(c : ConvertValueFunction) :  ConvertValueFunction {return c;}
    // noinspection JSUnusedGlobalSymbols
    static validate(func : ValidatorFunction) : ValidatorFunction {return func;}

    //Array
    // noinspection JSUnusedGlobalSymbols
    static arrayProperty(c : ArrayPropertyConfig) :  ArrayPropertyConfig {return c;}
    // noinspection JSUnusedGlobalSymbols
    static array(c : ArrayPropertyConfig) :  ArrayPropertyConfig {return c;}
    // noinspection JSUnusedGlobalSymbols
    static convertArray(c : ConvertArrayFunction) :  ConvertArrayFunction {return c;}

    //Controller
    // noinspection JSUnusedGlobalSymbols
    static controller(c : ControllerConfig) :  ControllerConfig {return c;}
    // noinspection JSUnusedGlobalSymbols
    static controllerInput(c : ControllerInput) :  ControllerInput {return c;}
    // noinspection JSUnusedGlobalSymbols
    static beforeHandle(func : BeforeHandleFunction) : BeforeHandleFunction {return func;}
    // noinspection JSUnusedGlobalSymbols
    static controllerAccess(func : ControllerAccessFunction) : ControllerAccessFunction {return func;}

    //Part Background tasks
    // noinspection JSUnusedGlobalSymbols
    static backgroundTask(c : BackgroundTask) :  BackgroundTask {return c;}
    // noinspection JSUnusedGlobalSymbols
    static task(func : TaskFunction) :  TaskFunction {return func;}

    //Part Properties
    // noinspection JSUnusedGlobalSymbols
    static property(c : Property) :  Property {return c;}


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
    static cChOnUnsub(func : CChannelOnSubFunction) : CChannelOnSubFunction {return func;}
    // noinspection JSUnusedGlobalSymbols
    static cIdChOnUnsub(func : CIdChannelOnSubFunction) : CIdChannelOnSubFunction {return func;}

    // noinspection JSUnusedGlobalSymbols
    static customCh(c :  Record<string,(ChannelSettings | CustomIdCh)> | CChannelDefault) :
        Record<string,(ChannelSettings | CustomIdCh)> | CChannelDefault  {return c;}

    // noinspection JSUnusedGlobalSymbols
    static customIdCh(c : Record<string,(ChannelSettings | CustomCh)> | CIdChannelDefault) :
        Record<string,(ChannelSettings | CustomCh)> | CIdChannelDefault{return c;}

    // noinspection JSUnusedGlobalSymbols
    static userCh(c : ChannelSettings | UserChannel) : ChannelSettings | UserChannel {return c;}
    // noinspection JSUnusedGlobalSymbols
    static userChOnSub(func : UserChOnSubFunction) : UserChOnSubFunction {return func;}
    // noinspection JSUnusedGlobalSymbols
    static userChOnUnsub(func : UserChOnUnsubFunction) : UserChOnUnsubFunction {return func;}
    // noinspection JSUnusedGlobalSymbols
    static userChOnBagPub(func : UserChOnBagPubFunction) : UserChOnBagPubFunction {return func;}

    // noinspection JSUnusedGlobalSymbols
    static authUserGroupCh(c : ChannelSettings | AuthUserGroupChannel) : ChannelSettings | AuthUserGroupChannel {return c;}
    // noinspection JSUnusedGlobalSymbols
    static authUserGroupChOnSub(func : AuthUserGroupChOnSubFunction) : AuthUserGroupChOnSubFunction {return func;}
    // noinspection JSUnusedGlobalSymbols
    static authUserGroupChOnUnsub(func : AuthUserGroupChOnUnsubFunction) : AuthUserGroupChOnUnsubFunction {return func;}
    // noinspection JSUnusedGlobalSymbols
    static authUserGroupChOnBagPub(func : AuthUserGroupChOnBagPubFunction) : AuthUserGroupChOnBagPubFunction {return func;}

    // noinspection JSUnusedGlobalSymbols
    static normalCh(c : ChannelSettings | NormalChannel) : ChannelSettings | NormalChannel {return c;}
    // noinspection JSUnusedGlobalSymbols
    static normalChOnSub(func : NormalChOnSubFunction) : NormalChOnSubFunction {return func;}
    // noinspection JSUnusedGlobalSymbols
    static normalChOnUnsub(func : NormalChOnUnsubFunction) : NormalChOnUnsubFunction {return func;}
    // noinspection JSUnusedGlobalSymbols
    static normalChOnBagPub(func : NormalChOnBagPubFunction) : NormalChOnBagPubFunction {return func;}

    //Part Service Config
    // noinspection JSUnusedGlobalSymbols
    static customService(c : MainCustomService) : MainCustomService {return c;}

    //Part Error Config
    // noinspection JSUnusedGlobalSymbols
    static taskError(c : ErrorConstruct) : ErrorConstruct {return c;}

    //Part Event Config events

    //Part Zation Events
    static workerIsStarted(func : WorkerIsStartedFunction) : WorkerIsStartedFunction {return func;}
    // noinspection JSUnusedGlobalSymbols
    static workerLeaderIsStarted(func : WorkerIsStartedFunction) : WorkerIsStartedFunction {return func;}
    // noinspection JSUnusedGlobalSymbols
    static express(func : ExpressFunction) : ExpressFunction {return func;}
    // noinspection JSUnusedGlobalSymbols
    static scServer(func : ScServerFunction) : ScServerFunction {return func;}
    // noinspection JSUnusedGlobalSymbols
    static socketConnection(func : ZationSocketFunction) : ZationSocketFunction {return func;}
    // noinspection JSUnusedGlobalSymbols
    static beforeError(func : BeforeErrorFunction) : BeforeErrorFunction {return func;}
    // noinspection JSUnusedGlobalSymbols
    static beforeTaskError(func : BeforeTaskErrorFunction) : BeforeTaskErrorFunction {return func;}
    // noinspection JSUnusedGlobalSymbols
    static beforeTaskErrorBag(func : BeforeTaskErrorBagFunction) : BeforeTaskErrorBagFunction {return func;}
    // noinspection JSUnusedGlobalSymbols
    static httpServerStarted(func : HttpServerIsStartedFunction) : HttpServerIsStartedFunction {return func;}
    // noinspection JSUnusedGlobalSymbols
    static wsServerIsStarted(func : WsServerIsStartedFunction) : WsServerIsStartedFunction{return func;}
    // noinspection JSUnusedGlobalSymbols
    static isStarted(func : IsStartedFunction) : IsStartedFunction{return func;}
    // noinspection JSUnusedGlobalSymbols
    static socketDisconnection(func : ZationSocketDisconnectionFunction) : ZationSocketDisconnectionFunction {return func;}
    // noinspection JSUnusedGlobalSymbols
    static workerMessage(func : ZationWorkerMessageFunction) : ZationWorkerMessageFunction {return func;}

    //Zation Middleware
    static middlewareAuthenticate(func : MiddlewareAuthenticationFunction) : MiddlewareAuthenticationFunction {return func;}

    //Part Socket Events (SC)
    static socketError(func : SocketErrorFunction) : SocketErrorFunction {return func;}
    static socketRaw(func : SocketFunction) : SocketFunction {return func;}
    static socketConnect(func : SocketConnectionFunction) : SocketConnectionFunction {return func;}
    static socketDisconnect(func : SocketFunction) : SocketFunction {return func;}
    static socketConnectAbort(func : SocketFunction) : SocketFunction {return func;}
    static socketClose(func : SocketFunction) : SocketFunction {return func;}
    static socketSubscribe(func : SocketFunction) : SocketFunction {return func;}
    static socketUnsubscribe(func : SocketFunction) : SocketFunction{return func;}
    static socketBadAuthToken(func : SocketObjFunction) : SocketObjFunction{return func;}
    static socketAuthenticate(func : SocketAuthenticateFunction) : SocketAuthenticateFunction{return func;}
    static socketDeauthenticate(func : SocketDeauthenticateFunction) : SocketDeauthenticateFunction{return func;}
    static socketAuthStateChange(func : SocketFunction) : SocketFunction{return func;}
    static socketMessage(func : SocketMessageFunction) : SocketMessageFunction{return func;}

    //Part ScServer Events (SC)
    static scServerError(func : ScServerErrorFunction) : ScServerErrorFunction {return func;}
    static scServerNotice(func : ScServerNoticeFunction) : ScServerNoticeFunction {return func;}
    static scServerHandshake(func : ScServerSocketFunction) : ScServerSocketFunction {return func;}
    static scServerConnectionAbort(func : ScServerSocketFunction) : ScServerSocketFunction {return func;}
    static scServerConnection(func : ScServerConnectionFunction) : ScServerConnectionFunction {return func;}
    static scServerDisconnection(func : ScServerSocketFunction) : ScServerSocketFunction {return func;}
    static scServerClosure(func : ScServerSocketFunction) : ScServerSocketFunction {return func;}
    static scServerSubscription(func : ScServerSubscriptionFunction) : ScServerSubscriptionFunction {return func;}
    static scServerUnsubscription(func : ScServerUnsubscriptionFunction) : ScServerUnsubscriptionFunction {return func;}
    static scServerAuthentication(func : ScServerAuthenticationFunction) : ScServerAuthenticationFunction {return func;}
    static scServerDeauthentication(func : ScServerDeauthenticationFunction) : ScServerDeauthenticationFunction {return func;}
    static scServerBadSocketAuthToken(func : ScServerBadSocketAuthTokenFunction) : ScServerBadSocketAuthTokenFunction {return func;}
    static scServerReady(func : ScServerReadyFunction) : ScServerReadyFunction {return func;}

    //Part Middleware Events (SC)
    static scMiddlewareAuthenticate(func : ScMiddlewareFunction) : ScMiddlewareFunction {return func;}
    static scMiddlewareHandshakeWs(func : ScMiddlewareFunction) : ScMiddlewareFunction {return func;}
    static scMiddlewareHandshakeSc(func : ScMiddlewareFunction) : ScMiddlewareFunction {return func;}
    static scMiddlewareSubscribe(func : ScMiddlewareFunction) : ScMiddlewareFunction {return func;}
    static scMiddlewarePublishIn(func : ScMiddlewareFunction) : ScMiddlewareFunction {return func;}
    static scMiddlewarePublishOut(func : ScMiddlewareFunction) : ScMiddlewareFunction {return func;}
    static scMiddlewareEmit(func : ScMiddlewareFunction) : ScMiddlewareFunction {return func;}

    //Part Type
    // noinspection JSUnusedGlobalSymbols
    static typeSmallBag(smallBag : SmallBag) : SmallBag {return smallBag;}
    // noinspection JSUnusedGlobalSymbols
    static typeBag(bag : Bag) : Bag {return bag;}
    // noinspection JSUnusedGlobalSymbols
    static typeResult(result : Result) : Result {return result;}
    // noinspection JSUnusedGlobalSymbols
    static typeTaskError(taskError : TaskError) : TaskError {return taskError;}
    // noinspection JSUnusedGlobalSymbols
    static typeTaskErrorBag(taskErrorBag : TaskErrorBag) : TaskErrorBag {return taskErrorBag;}
    // noinspection JSUnusedGlobalSymbols
    static typeController(controller : Controller) : Controller {return controller;}
    // noinspection JSUnusedGlobalSymbols
    static typeExpress(express : ExpressCore.Express) : ExpressCore.Express {return express;}

    //Part Create easy service configs
    // noinspection JSUnusedGlobalSymbols
    static mySql(config : PoolConfig) : PoolConfig {return config;}
    // noinspection JSUnusedGlobalSymbols
    static postgreSql(config : ConnectionConfig) : ConnectionConfig {return config;}
    // noinspection JSUnusedGlobalSymbols
    static nodeMailer(config : NodeMailerConfig) : NodeMailerConfig {return config;}
    // noinspection JSUnusedGlobalSymbols
    static mongoDb(config : MongoDbConfig) : MongoDbConfig {return config;}
}

export = Config;
