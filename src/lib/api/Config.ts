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
import Controller            = require("./Controller");
import {ConnectionConfig}      from "pg";
import {PoolConfig}            from "mysql";
import {MongoClientOptions}    from "mongodb";

import
{
    BeforeErrorFunction,
    BeforeTaskErrorBagFunction,
    BeforeTaskErrorFunction,
    EventConfig,
    ExpressFunction,
    GetUserCountFunction,
    HttpServerIsStartedFunction,
    IsStartedFunction, ScServerAuthenticationFunction, ScServerBadSocketAuthTokenFunction,
    ScServerConnectionFunction, ScServerDeauthenticationFunction,
    ScServerErrorFunction,
    ScServerNoticeFunction, ScServerReadyFunction,
    ScServerSocketFunction, ScServerSubscriptionFunction, ScServerUnsubscriptionFunction,
    SocketConnectionFunction,
    SocketErrorFunction,
    SocketFunction,
    SocketMessageFunction,
    SocketObjFunction,
    SocketAuthenticateFunction,
    WorkerIsStartedFunction,
    WsServerIsStartedFunction, SocketDeauthenticateFunction, MiddlewareFunction
} from "../helper/configEditTool/eventConfigStructure";

import
{
    MainCustomService,
    NodeMailerConfig,
    ServiceConfig
} from "../helper/configEditTool/serviceConfigStructure";

import
{
    AppConfig,
    BeforeHandleFunction,
    CompileAsFunction,
    ControllerAccessFunction,
    ControllerConfig,
    ControllerInput, InputProperty,
    InputValidationConfig,
    ObjectConfig, ObjectProperties,
    TaskFunction
} from "../helper/configEditTool/appConfigStructure";
import
{
    ErrorConfig,
    TaskErrorOptions
} from "../helper/configEditTool/errorConfigStructure";
import {
    Channel,
    ChannelAccessFunction,
    ChannelConfig,
    ChannelEventFunction
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

    static compileAs(func : CompileAsFunction) : CompileAsFunction {return func;}
    static beforeHandle(func : BeforeHandleFunction) : BeforeHandleFunction {return func;}
    static controllerAccess(func : ControllerAccessFunction) : ControllerAccessFunction {return func;}
    static task(func : TaskFunction) :  TaskFunction {return func;}

    static controller(c : ControllerConfig) :  ControllerConfig {return c;}
    static controllerInput(c : ControllerInput) :  ControllerInput {return c;}
    static inputProperty(c : InputProperty) :  InputProperty {return c;}
    static object(c : ObjectConfig) :  ObjectConfig {return c;}
    static objectProperties(c : ObjectProperties) :  ObjectProperties {return c;}
    static validationGroup(c : InputValidationConfig) :  InputValidationConfig {return c;}

    //Part Channel Config functions

    static channelAccess(func : ChannelAccessFunction) : ChannelAccessFunction {return func;}
    static channelOn(func : ChannelEventFunction) : ChannelEventFunction {return func;}

    static channel(c : Channel) : Channel {return c;}

    //Part Service Config
    static customService(c : MainCustomService) : MainCustomService {return c;}

    //Part Error Config
    static taskError(c : TaskErrorOptions) : TaskErrorOptions {return c;}

    //Part Event Config events

    //Part Zation Events
    static workerIsStarted(func : WorkerIsStartedFunction) : WorkerIsStartedFunction {return func;}
    static express(func : ExpressFunction) : ExpressFunction {return func;}
    static beforeError(func : BeforeErrorFunction) : BeforeErrorFunction {return func;}
    static beforeTaskError(func : BeforeTaskErrorFunction) : BeforeTaskErrorFunction {return func;}
    static beforeTaskErrorBag(func : BeforeTaskErrorBagFunction) : BeforeTaskErrorBagFunction {return func;}
    static getUserCount(func : GetUserCountFunction) : GetUserCountFunction {return func;}
    static httpServerStarted(func : HttpServerIsStartedFunction) : HttpServerIsStartedFunction {return func;}
    static wsServerIsStarted(func : WsServerIsStartedFunction) : WsServerIsStartedFunction{return func;}
    static isStarted(func : IsStartedFunction) : IsStartedFunction{return func;}

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
    static middlewareAuthenticate(func : MiddlewareFunction) : MiddlewareFunction {return func;}
    static middlewareHandshakeWs(func : MiddlewareFunction) : MiddlewareFunction {return func;}
    static middlewareHandshakeSc(func : MiddlewareFunction) : MiddlewareFunction {return func;}
    static middlewareSubscribe(func : MiddlewareFunction) : MiddlewareFunction {return func;}
    static middlewarePublishIn(func : MiddlewareFunction) : MiddlewareFunction {return func;}
    static middlewarePublishOut(func : MiddlewareFunction) : MiddlewareFunction {return func;}
    static middlewareEmit(func : MiddlewareFunction) : MiddlewareFunction {return func;}

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
    static mongoDb(config : MongoClientOptions) : MongoClientOptions {return config;}
}

export = Config;
