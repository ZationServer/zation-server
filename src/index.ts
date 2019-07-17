/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import BackError                    from "./lib/api/BackError";
import BackErrorBag                 from "./lib/api/BackErrorBag";
import SmallBag                     from './lib/api/SmallBag';
import Bag                          from './lib/api/Bag';
import Result                       from './lib/api/Result';
import Controller                   from './lib/api/Controller';
import Config, {single}             from './lib/api/Config';
import BackErrorBuilder             from "./lib/helper/builder/backErrorBuilder";
import ServiceNotFoundError         from './lib/helper/services/serviceNotFoundError';
import AuthenticationError          from './lib/helper/error/authenticationError';
import MethodIsNotCompatibleError   from './lib/helper/error/methodIsNotCompatibleError';
import InputIsNotCompatibleError    from './lib/helper/error/inputIsNotCompatibleError';
import CodeError                    from './lib/helper/error/codeError';
import {ErrorType}                  from "./lib/helper/constants/errorType";
import {ValidationTypes}            from './lib/helper/constants/validationTypes';
import {ControllerConfig}           from "./lib/helper/config/definitions/controllerConfig";
import {StarterConfig}              from "./lib/helper/config/definitions/starterConfig";
import {StartMode}                  from "./lib/helper/constants/startMode";
import ZationMaster                 from "./lib/main/zationMaster";
import Router                       from "./lib/api/Router";
import {Register}                   from "./lib/api/decorator/component/Register";
import {AttachToRouter}             from "./lib/api/decorator/component/AttachToRouter";
import {ModelConfigTranslatable,InputConfigTranslatable} from "./lib/api/ConfigTranslatable";
import {Model}                      from "./lib/api/decorator/input/Model";
import {ObjectModel}                from "./lib/api/decorator/input/ObjectModel";
import {ParamInput}                 from "./lib/api/decorator/input/ParamInput";
import {Extends}                    from "./lib/api/decorator/input/Extends";
import {Constructor}                from "./lib/api/decorator/input/Constructor";
import NoMoreDataAvailableError     from "./lib/helper/dataBox/noMoreDataAvailable";
import DataBoxFamily                from "./lib/api/dataBox/DataBoxFamily";
import DataBox                      from "./lib/api/dataBox/DataBox";
import {DataBoxConfig}              from "./lib/helper/config/definitions/dataBoxConfig";
import DataBoxContainer             from "./lib/helper/dataBox/container/dataBoxContainer";
import DataBoxFamilyContainer       from "./lib/helper/dataBox/container/dataBoxFamilyContainer";
import {buildKeyArray}              from "./lib/helper/dataBox/dbKeyArrayUtils";
const  FsUtil : any               = require('socketcluster/fsutil');

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
        Router,
        Register,
        AttachToRouter,
        Model,
        Extends,
        Constructor,
        ObjectModel,
        ParamInput,
        NoMoreDataAvailableError,
        DataBoxFamily,
        DataBoxFamilyContainer,
        DataBox,
        DataBoxContainer,
        DataBoxConfig,
        Controller,
        ControllerConfig,
        Result,
        BackError,
        BackErrorBuilder,
        BackErrorBag,
        ErrorType,
        Config,
        InputConfigTranslatable,
        ModelConfigTranslatable,
        ServiceNotFoundError,
        ValidationTypes,
        AuthenticationError,
        CodeError,
        MethodIsNotCompatibleError,
        InputIsNotCompatibleError,
        FsUtil,
        single,
        buildKeyArray
    };