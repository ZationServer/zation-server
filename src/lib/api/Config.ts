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
    WorkerIsStartedFunction
} from "../helper/configEditTool/eventConfigStructure";

import
{
    NodeMailerConfig,
    ServiceConfig
} from "../helper/configEditTool/serviceConfigStructure";

import
{
    AppConfig,
    CompileAsFunction
} from "../helper/configEditTool/appConfigStructure";


class Config
{
    //Part main configs

    static appConfig(config : AppConfig) : AppConfig
    {
        return config;
    }

    static eventConfig(config : EventConfig) : EventConfig
    {
        return config;
    }

    static serviceConfig(config : ServiceConfig) : ServiceConfig
    {
        return config;
    }


    //Part App Config functions

    static compileAs(func : CompileAsFunction) : CompileAsFunction {
        return func;
    }

    //Part Event Config events

    static workerIsStarted(func : WorkerIsStartedFunction) : WorkerIsStartedFunction {
        return func;
    }

    static express(func : ExpressFunction) : ExpressFunction {
        return func;
    }

    static beforeError(func : BeforeErrorFunction) : BeforeErrorFunction {
        return func;
    }

    static beforeTaskError(func : BeforeTaskErrorFunction) : BeforeTaskErrorFunction {
        return func;
    }

    static beforeTaskErrorBag(func : BeforeTaskErrorBagFunction) : BeforeTaskErrorBagFunction {
        return func;
    }

    static getUserCount(func : GetUserCountFunction) : GetUserCountFunction {
        return func;
    }

    //Part Type

    // noinspection JSUnusedGlobalSymbols
    static typeSmallBag(smallBag : SmallBag) : SmallBag {
        return smallBag;
    }

    // noinspection JSUnusedGlobalSymbols
    static typeBag(bag : Bag) : Bag {
        return bag;
    }

    // noinspection JSUnusedGlobalSymbols
    static typeResult(result : Result) : Result {
        return result;
    }

    // noinspection JSUnusedGlobalSymbols
    static typeTaskError(taskError : TaskError) : TaskError {
        return taskError;
    }

    // noinspection JSUnusedGlobalSymbols
    static typeTaskErrorBag(taskErrorBag : TaskErrorBag) : TaskErrorBag {
        return taskErrorBag;
    }

    // noinspection JSUnusedGlobalSymbols
    static typeController(controller : Controller) : Controller {
        return controller;
    }

    // noinspection JSUnusedGlobalSymbols
    static typeExpress(express : ExpressCore.Express) : ExpressCore.Express {
        return express;
    }

    //Part Create easy service configs

    // noinspection JSUnusedGlobalSymbols
    static mySqlConfig(config : PoolConfig) : PoolConfig {
        return config;
    }

    // noinspection JSUnusedGlobalSymbols
    static postgreSql(config : ConnectionConfig) : ConnectionConfig {
        return config;
    }

    // noinspection JSUnusedGlobalSymbols
    static nodeMailer(config : NodeMailerConfig) : NodeMailerConfig {
        return config;
    }

    // noinspection JSUnusedGlobalSymbols
    static mongoDb(config : MongoClientOptions) : MongoClientOptions {
        return config;
    }
}

export = Config;
