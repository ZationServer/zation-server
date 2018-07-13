/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import SmallBag              = require("./SmallBag");
import Bag                   = require("./Bag");
import ZationWorker          = require("../main/zationWorker");
import ExpressCore           = require("express-serve-static-core");
import TaskError             = require("./TaskError");
import TaskErrorBag          = require("./TaskErrorBag");
import Result                = require("./Result");
import Controller            = require("./Controller");
import BackgroundTasksSetter = require("../helper/background/backgroundTasksSetter");
import {ConnectionConfig}      from "pg";
import {PoolConfig}            from "mysql";
import * as SMTPTransport      from "nodemailer/lib/smtp-transport";
import * as SMTPPool           from "nodemailer/lib/smtp-pool";
import * as SendmailTransport  from "nodemailer/lib/sendmail-transport";
import * as StreamTransport    from "nodemailer/lib/stream-transport";
import * as JSONTransport      from "nodemailer/lib/json-transport";
import * as SESTransport       from "nodemailer/lib/ses-transport";
import {Transport, TransportOptions} from "nodemailer";
import {MongoClientOptions}    from "mongodb";

type CompileAsFunction = (obj: object,smallBag : SmallBag) => any;

type GetUserCountFunction = (smallBag : SmallBag) => any;

type WorkerIsStartedFunction = (smallBag : SmallBag,info : object,worker : ZationWorker) => any;
type ExpressFunction = (smallBag : SmallBag, express : ExpressCore.Express) => any;
type BeforeErrorFunction = (smallBag : SmallBag, error : object) => any;
type BeforeTaskErrorFunction = (smallBag : SmallBag, error : TaskError) => any;
type BeforeTaskErrorBagFunction = (smallBag : SmallBag, error : TaskErrorBag) => any;

type BackgroundTasksFunction = (bkTS : BackgroundTasksSetter) => void;

interface AppConfig
{
    controller ?: Record<string,ControllerConfig>;



}

interface ControllerConfig
{
    path ?: string;
    access ?: Function | string | string[] | number[];
    name ?: string;
}


class Config
{
    static appConfig(config : AppConfig) : AppConfig
    {
        return config;

        let a : AppConfig = {



            controller :
                {

                    a : {




                    }
                }
        }

    }



    //Part anonymous functions types

    static compileAs(func : CompileAsFunction) : Function {
        return func;
    }

    static backgroundTasks(func : BackgroundTasksFunction) : Function {
        return func;
    }

    static workerIsStarted(func : WorkerIsStartedFunction) : Function {
        return func;
    }

    static express(func : ExpressFunction) : Function {
        return func;
    }

    static beforeError(func : BeforeErrorFunction) : Function {
        return func;
    }

    static beforeTaskError(func : BeforeTaskErrorFunction) : Function {
        return func;
    }

    static beforeTaskErrorBag(func : BeforeTaskErrorBagFunction) : Function {
        return func;
    }

    static getUserCount(func : GetUserCountFunction) : Function {
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
    static mySqlConfig(config : PoolConfig) : object {
        return config;
    }

    // noinspection JSUnusedGlobalSymbols
    static postgreSql(config : ConnectionConfig) : object {
        return config;
    }

    // noinspection JSUnusedGlobalSymbols
    static nodeMailer(config ?:
        SMTPTransport | SMTPTransport.Options |
        SMTPPool | SMTPPool.Options |
        SendmailTransport | SendmailTransport.Options |
        StreamTransport | StreamTransport.Options |
        JSONTransport | JSONTransport.Options |
        SESTransport | SESTransport.Options |
        Transport | TransportOptions
    ) : any {
        return config;
    }

    // noinspection JSUnusedGlobalSymbols
    static mongoDb(config : MongoClientOptions) : object {
        return config;
    }
}

export = Config;
