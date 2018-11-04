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
} from "../helper/configEditTool/eventConfigStructure";

import
{
    MainCustomService, MongoDbConfig,
    NodeMailerConfig,
    ServiceConfig
} from "../helper/configEditTool/serviceConfigStructure";

import
{
    AppConfig,
    BeforeHandleFunction,
    ConstructObjectFunction,
    ControllerAccessFunction,
    ControllerConfig,
    ControllerInput,
    ValuePropertyConfig,
    ObjectPropertyConfig, ObjectProperties,
    TaskFunction, ValidatorFunction
} from "../helper/configEditTool/appConfigStructure";
import
{
    ErrorConfig,
    ErrorConstruct
} from "../helper/configEditTool/errorConfigStructure";
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
} from "../helper/configEditTool/channelConfigStructure";
import ObjectTools = require("../helper/tools/objectTools");
import {StarterConfig} from "../helper/configEditTool/starterConfigStructure";
import {MainConfig} from "../helper/configEditTool/mainConfigStructure";

class Config
{
    //Part config tools
    static merge(...configs : object[]) : object {
        return ObjectTools.mergeObjects(configs);
    }

    //Part main configs
    static appConfig(config : AppConfig) : AppConfig {return config;}
    static eventConfig(config : EventConfig) : EventConfig {return config;}
    static serviceConfig(config : ServiceConfig) : ServiceConfig {return config;}
    static mainConfig(config : MainConfig) : MainConfig {return config;}
    static channelConfig(config : ChannelConfig) : ChannelConfig {return config;}
    static errorConfig(config : ErrorConfig) : ErrorConfig {return config;}
    static starterConfig(config : StarterConfig) : StarterConfig {return config;}

    //Part App Config functions
    static construct(func : ConstructObjectFunction) : ConstructObjectFunction {return func;}
    static beforeHandle(func : BeforeHandleFunction) : BeforeHandleFunction {return func;}
    static validate(func : ValidatorFunction) : ValidatorFunction {return func;}
    static controllerAccess(func : ControllerAccessFunction) : ControllerAccessFunction {return func;}
    static task(func : TaskFunction) :  TaskFunction {return func;}

    static controller(c : ControllerConfig) :  ControllerConfig {return c;}
    static controllerInput(c : ControllerInput) :  ControllerInput {return c;}
    static value(c : ValuePropertyConfig) :  ValuePropertyConfig {return c;}
    static object(c : ObjectPropertyConfig) :  ObjectPropertyConfig {return c;}
    static objectProperties(c : ObjectProperties) :  ObjectProperties {return c;}
    static inputGroup(c : ValuePropertyConfig) : ValuePropertyConfig {return c;}

    //Part Channel Config functions
    static cIdChClientPubAccess(func : CIdChannelClientPubAccessFunction) : CIdChannelClientPubAccessFunction {return func;}
    static cChClientPubAccess(func : CChannelClientPubAccessFunction) : CChannelClientPubAccessFunction  {return func;}

    static cIdChSubAccess(func : CIdChannelSubAccessFunction) : CIdChannelSubAccessFunction {return func;}
    static cChSubAccess(func : CChannelSubAccessFunction) : CChannelSubAccessFunction {return func;}

    static cChOnClientPub(func : CChannelOnClientPubFunction) : CChannelOnClientPubFunction {return func;}
    static cIdChOnClientPub(func : CIdChannelOnClientPubFunction) : CIdChannelOnClientPubFunction {return func;}

    static cChOnBagPub(func : CChannelOnBagPubFunction) : CChannelOnBagPubFunction {return func;}
    static cIdChOnBagPub(func : CIdChannelOnBagPubFunction) : CIdChannelOnBagPubFunction {return func;}

    static cChOnSub(func : CChannelOnSubFunction) : CChannelOnSubFunction {return func;}
    static cIdChOnSub(func : CIdChannelOnSubFunction) : CIdChannelOnSubFunction {return func;}

    static cChOnUnsub(func : CChannelOnSubFunction) : CChannelOnSubFunction {return func;}
    static cIdChOnUnsub(func : CIdChannelOnSubFunction) : CIdChannelOnSubFunction {return func;}

    static customCh(c :  Record<string,(ChannelSettings | CustomIdCh)> | CChannelDefault) :
        Record<string,(ChannelSettings | CustomIdCh)> | CChannelDefault  {return c;}

    static customIdCh(c : Record<string,(ChannelSettings | CustomCh)> | CIdChannelDefault) :
        Record<string,(ChannelSettings | CustomCh)> | CIdChannelDefault{return c;}

    static userCh(c : ChannelSettings | UserChannel) : ChannelSettings | UserChannel {return c;}
    static userChOnSub(func : UserChOnSubFunction) : UserChOnSubFunction {return func;}
    static userChOnUnsub(func : UserChOnUnsubFunction) : UserChOnUnsubFunction {return func;}
    static userChOnBagPub(func : UserChOnBagPubFunction) : UserChOnBagPubFunction {return func;}

    static authUserGroupCh(c : ChannelSettings | AuthUserGroupChannel) : ChannelSettings | AuthUserGroupChannel {return c;}
    static authUserGroupChOnSub(func : AuthUserGroupChOnSubFunction) : AuthUserGroupChOnSubFunction {return func;}
    static authUserGroupChOnUnsub(func : AuthUserGroupChOnUnsubFunction) : AuthUserGroupChOnUnsubFunction {return func;}
    static authUserGroupChOnBagPub(func : AuthUserGroupChOnBagPubFunction) : AuthUserGroupChOnBagPubFunction {return func;}

    static normalCh(c : ChannelSettings | NormalChannel) : ChannelSettings | NormalChannel {return c;}
    static normalChOnSub(func : NormalChOnSubFunction) : NormalChOnSubFunction {return func;}
    static normalChOnUnsub(func : NormalChOnUnsubFunction) : NormalChOnUnsubFunction {return func;}
    static normalChOnBagPub(func : NormalChOnBagPubFunction) : NormalChOnBagPubFunction {return func;}

    //Part Service Config
    static customService(c : MainCustomService) : MainCustomService {return c;}

    //Part Error Config
    static taskError(c : ErrorConstruct) : ErrorConstruct {return c;}

    //Part Event Config events

    //Part Zation Events
    static workerIsStarted(func : WorkerIsStartedFunction) : WorkerIsStartedFunction {return func;}
    static express(func : ExpressFunction) : ExpressFunction {return func;}
    static scServer(func : ScServerFunction) : ScServerFunction {return func;}
    static socketConnection(func : ZationSocketFunction) : ZationSocketFunction {return func;}
    static beforeError(func : BeforeErrorFunction) : BeforeErrorFunction {return func;}
    static beforeTaskError(func : BeforeTaskErrorFunction) : BeforeTaskErrorFunction {return func;}
    static beforeTaskErrorBag(func : BeforeTaskErrorBagFunction) : BeforeTaskErrorBagFunction {return func;}
    static httpServerStarted(func : HttpServerIsStartedFunction) : HttpServerIsStartedFunction {return func;}
    static wsServerIsStarted(func : WsServerIsStartedFunction) : WsServerIsStartedFunction{return func;}
    static isStarted(func : IsStartedFunction) : IsStartedFunction{return func;}
    static socketDisconnection(func : ZationSocketDisconnectionFunction) : ZationSocketDisconnectionFunction {return func;}
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
    static mySqlConfig(config : PoolConfig) : PoolConfig {return config;}
    // noinspection JSUnusedGlobalSymbols
    static postgreSql(config : ConnectionConfig) : ConnectionConfig {return config;}
    // noinspection JSUnusedGlobalSymbols
    static nodeMailer(config : NodeMailerConfig) : NodeMailerConfig {return config;}
    // noinspection JSUnusedGlobalSymbols
    static mongoDb(config : MongoDbConfig) : MongoDbConfig {return config;}
}

export = Config;
