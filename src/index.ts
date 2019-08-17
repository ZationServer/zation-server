/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import BackError                    from "./lib/api/BackError";
import BackErrorBag                 from "./lib/api/BackErrorBag";
import Bag                          from './lib/api/Bag';
import RequestBag                   from './lib/api/RequestBag';
import Result                       from './lib/api/Result';
import Controller                   from './lib/api/Controller';
import Config, {single}             from './lib/api/Config';
import BackErrorBuilder             from "./lib/main/builder/backErrorBuilder";
import ServiceNotFoundError         from './lib/main/services/serviceNotFoundError';
import AuthenticationError          from './lib/main/error/authenticationError';
import MethodIsNotCompatibleError   from './lib/main/error/methodIsNotCompatibleError';
import InputIsNotCompatibleError    from './lib/main/error/inputIsNotCompatibleError';
import CodeError                    from './lib/main/error/codeError';
import {ErrorType}                  from "./lib/main/constants/errorType";
import {ValidationTypes}            from './lib/main/constants/validationTypes';
import {ControllerConfig}           from "./lib/main/config/definitions/controllerConfig";
import {StarterConfig}              from "./lib/main/config/definitions/starterConfig";
import {StartMode}                  from "./lib/main/constants/startMode";
import ZationMaster                 from "./lib/core/zationMaster";
import Router                       from "./lib/api/Router";
import {Register}                   from "./lib/api/decorator/component/Register";
import {AttachToRouter}             from "./lib/api/decorator/component/AttachToRouter";
import {ModelConfigTranslatable,InputConfigTranslatable} from "./lib/api/ConfigTranslatable";
import {Model}                      from "./lib/api/decorator/input/Model";
import {ObjectModel}                from "./lib/api/decorator/input/ObjectModel";
import {ParamInput}                 from "./lib/api/decorator/input/ParamInput";
import {Extends}                    from "./lib/api/decorator/input/Extends";
import {Constructor}                from "./lib/api/decorator/input/Constructor";
import NoMoreDataAvailableError     from "./lib/main/dataBox/noMoreDataAvailable";
import DataBoxFamily                from "./lib/api/dataBox/DataBoxFamily";
import DataBox                      from "./lib/api/dataBox/DataBox";
import {DataBoxConfig}              from "./lib/main/config/definitions/dataBoxConfig";
import DataBoxContainer             from "./lib/main/dataBox/container/dataBoxContainer";
import DataBoxFamilyContainer       from "./lib/main/dataBox/container/dataBoxFamilyContainer";
import {buildKeyArray}              from "./lib/main/dataBox/dbKeyArrayUtils";
import ZSocket                      from "./lib/main/internalApi/zSocket";
import ZationTokenWrapper           from "./lib/main/internalApi/zationTokenWrapper";
import ZationInfo                   from "./lib/main/internalApi/zationInfo";
import PubData                      from "./lib/main/internalApi/pubData";
import CChInfo                      from "./lib/main/internalApi/cChInfo";
import CChFamilyInfo                from "./lib/main/internalApi/cChFamilyInfo";
import AsymmetricKeyPairs           from "./lib/main/internalApi/asymmetricKeyPairs";
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
        RequestBag,
        Bag,
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
        buildKeyArray,
        ZSocket,
        ZationTokenWrapper,
        ZationInfo,
        PubData,
        CChInfo,
        CChFamilyInfo,
        AsymmetricKeyPairs
    };