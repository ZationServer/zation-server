/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import ZationMaster          = require('./lib/main/zationMaster');
import {Bag}                   from './lib/api/Bag';
import SmallBag              = require('./lib/api/SmallBag');
import {Controller}            from './lib/api/Controller';
import Result                = require('./lib/api/Result');
import TaskError             = require('./lib/api/TaskError');
import TaskErrorBuilder      = require("./lib/helper/builder/taskErrorBuilder");
import TaskErrorBag          = require('./lib/api/TaskErrorBag');
import {ErrorType}             from "./lib/helper/constants/errorType";
import ServiceNotFoundError  = require('./lib/helper/services/serviceNotFoundError');
import Config                = require('./lib/api/Config');
import {ValidationTypes}       from './lib/helper/constants/validationTypes';
import AuthenticationError   = require("./lib/helper/error/authenticationError");
import ErrorNotFoundError    = require("./lib/helper/error/errorNotFoundError");
import CodeError             = require("./lib/helper/error/codeError");
import MethodIsNotCompatible = require("./lib/helper/error/methodIsNotCompatibleError");
import InputIsNotCompatible  = require("./lib/helper/error/inputIsNotCompatibleError");
import {ControllerConfig}      from "./lib/helper/configs/appConfig";
import {StarterConfig}         from "./lib/helper/configs/starterConfig";
const  FsUtil : any           = require('socketcluster/fsutil');

//starter
const start = (options : StarterConfig,onlyCheck : any = false) => {
    new ZationMaster(options,onlyCheck);
};

export {
        start,
        Bag,
        SmallBag,
        Controller,
        ControllerConfig,
        Result,
        TaskError,
        TaskErrorBuilder,
        TaskErrorBag,
        ErrorType,
        Config,
        ServiceNotFoundError,
        ValidationTypes,
        AuthenticationError,
        ErrorNotFoundError,
        CodeError,
        MethodIsNotCompatible,
        InputIsNotCompatible,
        FsUtil,
    };