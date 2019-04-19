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
import {StartMode}             from "./lib/helper/constants/startMode";
import BackError               from "./lib/api/BackError";
import BackErrorBag            from "./lib/api/BackErrorBag";
import BackErrorBuilder        from "./lib/helper/builder/backErrorBuilder";
const  FsUtil : any           = require('socketcluster/fsutil');

//starter

/**
 * @description
 * This method is for starting the server.
 * It returns a promise that will be resolved when the server is started.
 * @param options the starter config
 * @param startMode
 * The mode for starting
 * 0 => normal
 * 1 => test
 * 2 => onlyCheck
 */
const start = (options : StarterConfig,startMode : number | string | StartMode = 0) => {
    return new Promise((resolve) => {
        new ZationMaster(options,() => {resolve();},startMode);
    });
};

export {
        start,
        StartMode,
        Bag,
        SmallBag,
        Controller,
        ControllerConfig,
        Result,
        BackError,
        BackErrorBuilder,
        BackErrorBag,
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