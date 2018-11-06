/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import ZationStarter         = require('./lib/main/zationMaster');
import Bag                   = require('./lib/api/Bag');
import SmallBag              = require('./lib/api/SmallBag');
import {Controller}            from'./lib/api/Controller';
import Result                = require('./lib/api/Result');
import TaskError             = require('./lib/api/TaskError');
import TaskErrorBag          = require('./lib/api/TaskErrorBag');
import ErrorType             = require('./lib/helper/constants/errorType');
import ServiceNotFoundError  = require('./lib/helper/services/serviceNotFoundError');
import Config                = require('./lib/api/Config');
import ValidationTypes       = require('./lib/helper/constants/validationTypes');
import AuthenticationError   = require("./lib/helper/error/authenticationError");
import ErrorNotFoundError    = require("./lib/helper/error/errorNotFoundError");
import CodeError             = require("./lib/helper/error/codeError");
import MethodIsNotCompatible = require("./lib/helper/error/methodIsNotCompatible");
const  FsUtil : any          = require('socketcluster/fsutil');

//starter
const start = (options) => {
    new ZationStarter(options);
};

export =
    {
        start,
        Bag,
        SmallBag,
        Controller,
        Result,
        TaskError,
        TaskErrorBag,
        ErrorType,
        Config,
        ServiceNotFoundError,
        ValidationTypes,
        AuthenticationError,
        ErrorNotFoundError,
        CodeError,
        MethodIsNotCompatible,
        FsUtil
    };