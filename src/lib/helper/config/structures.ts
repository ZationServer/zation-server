/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

/// <reference path="../../../../node_modules/ts-nameof/ts-nameof.d.ts" />

import ObjectTools = require('../tools/objectTools');
import {EventConfig} from "../configs/eventConfig";
import {ErrorConstruct} from "../configs/errorConfig";
import {
    AppConfig, ArrayPropertyConfig, ArraySettings,
    AuthUserGroupConfig,
    BackgroundTask,
    ControllerConfig,
    ObjectPropertyConfig, ValuePropertyConfig
} from "../configs/appConfig";
import {MainConfig, OptionAuto, PanelUserConfig} from "../configs/mainConfig";
import {StarterConfig} from "../configs/starterConfig";
import {ValidationTypes} from "../constants/validationTypes";
import {FormatLetters} from "../constants/validation";
import {Service, ServiceConfig} from "../configs/serviceConfig";
import {ChannelConfig, ChannelSettings, CustomChannelConfig, ZationChannelConfig} from "../configs/channelConfig";

const Error = {};
Error[nameof<ErrorConstruct>(s => s.name)]             = {types : ['string'],isOptional : true};
Error[nameof<ErrorConstruct>(s => s.group)]            = {types : ['string'],isOptional : true};
Error[nameof<ErrorConstruct>(s => s.fromZationSystem)] = {types : ['boolean'],isOptional : true};
Error[nameof<ErrorConstruct>(s => s.sendInfo)]         = {types : ['boolean'],isOptional : true};
Error[nameof<ErrorConstruct>(s => s.private)]          = {types : ['boolean'],isOptional : true};
Error[nameof<ErrorConstruct>(s => s.description)]      = {types : ['string'],isOptional : true};
Error[nameof<ErrorConstruct>(s => s.type)]             = {types : ['string'],isOptional : true};
Error[nameof<ErrorConstruct>(s => s.sendInfo)]         = {types : ['object'],isOptional : true};

const App = {};
App[nameof<AppConfig>(s => s.authController)]     = {types : ['string'],isOptional : true};
App[nameof<AppConfig>(s => s.controller)]         = {types : ['object'],isOptional : true};
App[nameof<AppConfig>(s => s.userGroups)]         = {types : ['object'],isOptional : true};
App[nameof<AppConfig>(s => s.controllerDefaults)] = {types : ['object'],isOptional : true};
App[nameof<AppConfig>(s => s.objects)]            = {types : ['object'],isOptional : true};
App[nameof<AppConfig>(s => s.values)]             = {types : ['object'],isOptional : true};
App[nameof<AppConfig>(s => s.arrays)]             = {types : ['object'],isOptional : true};
App[nameof<AppConfig>(s => s.backgroundTasks)]    = {types : ['object'],isOptional : true};

const BackgroundTask = {};
BackgroundTask[nameof<BackgroundTask>(s => s.every)] = {types : ['number','array','object'],isOptional : true};
BackgroundTask[nameof<BackgroundTask>(s => s.at)]    = {types : ['number','array','object'],isOptional : true};
BackgroundTask[nameof<BackgroundTask>(s => s.task)]  = {types : ['function','array'],isOptional : true};

const AppObject = {};
AppObject[nameof<ObjectPropertyConfig>(s => s.properties)] = {types : ['object'],isOptional : false};
AppObject[nameof<ObjectPropertyConfig>(s => s.construct)]  = {types : ['function'],isOptional : true};
AppObject[nameof<ObjectPropertyConfig>(s => s.extends)]    = {types : ['string'],isOptional : true};
AppObject[nameof<ObjectPropertyConfig>(s => s.isOptional)] = {types : ['boolean'],isOptional: true};
AppObject[nameof<ValuePropertyConfig>(s => s.default)]     = {types : ['string','array','number','boolean','object','function'],isOptional : true};
AppObject[nameof<ObjectPropertyConfig>(s => s.prototype)]  = {types : ['object'],isOptional : true};
AppObject[nameof<ObjectPropertyConfig>(s => s.convert)]    = {types : ['function'],isOptional : true};

const AppController = {};   
AppController[nameof<ControllerConfig>(s => s.input)]            = {types : ['object'],isOptional : true};
AppController[nameof<ControllerConfig>(s => s.beforeHandle)]     = {types : ['function','array'],isOptional : true};
AppController[nameof<ControllerConfig>(s => s.systemController)] = {types : ['boolean'],isOptional : true};
AppController[nameof<ControllerConfig>(s => s.wsAccess)]         = {types : ['boolean'],isOptional : true};
AppController[nameof<ControllerConfig>(s => s.httpAccess)]       = {types : ['boolean'],isOptional : true};
AppController[nameof<ControllerConfig>(s => s.httpGetAllowed)]   = {types : ['boolean'],isOptional : true};
AppController[nameof<ControllerConfig>(s => s.httpPostAllowed)]  = {types : ['boolean'],isOptional : true};
AppController[nameof<ControllerConfig>(s => s.inputValidation)]  = {types : ['boolean'],isOptional : true};
AppController[nameof<ControllerConfig>(s => s.inputAllAllow)]    = {types : ['boolean'],isOptional : true};
AppController[nameof<ControllerConfig>(s => s.filePath)]         = {types : ['string'],isOptional : true};
AppController[nameof<ControllerConfig>(s => s.fileName)]         = {types : ['string'],isOptional : true};
AppController[nameof<ControllerConfig>(s => s.access)]           = {types : ['string','function','number','array'],isOptional : true};
AppController[nameof<ControllerConfig>(s => s.notAccess)]        = {types : ['string','function','number','array'],isOptional : true};
AppController[nameof<ControllerConfig>(s => s.versionAccess)]    = {types : ['string','object'],isOptional : true};

const AppControllerDefaults = {};
AppControllerDefaults[nameof<ControllerConfig>(s => s.input)]            = {types : ['object'],isOptional : true};
AppControllerDefaults[nameof<ControllerConfig>(s => s.beforeHandle)]     = {types : ['function','array'],isOptional : true};
AppControllerDefaults[nameof<ControllerConfig>(s => s.systemController)] = {types : ['boolean'],isOptional : true};
AppControllerDefaults[nameof<ControllerConfig>(s => s.wsAccess)]         = {types : ['boolean'],isOptional : true};
AppControllerDefaults[nameof<ControllerConfig>(s => s.httpAccess)]       = {types : ['boolean'],isOptional : true};
AppControllerDefaults[nameof<ControllerConfig>(s => s.httpGetAllowed)]   = {types : ['boolean'],isOptional : true};
AppControllerDefaults[nameof<ControllerConfig>(s => s.httpPostAllowed)]  = {types : ['boolean'],isOptional : true};
AppControllerDefaults[nameof<ControllerConfig>(s => s.inputValidation)]  = {types : ['boolean'],isOptional : true};
AppControllerDefaults[nameof<ControllerConfig>(s => s.inputAllAllow)]    = {types : ['boolean'],isOptional : true};
AppControllerDefaults[nameof<ControllerConfig>(s => s.access)]           = {types : ['string','function','number','array'],isOptional : true};
AppControllerDefaults[nameof<ControllerConfig>(s => s.notAccess)]        = {types : ['string','function','number','array'],isOptional : true};
AppControllerDefaults[nameof<ControllerConfig>(s => s.versionAccess)]    = {types : ['string','object'],isOptional : true};

const Main = {};
Main[nameof<MainConfig>(s => s.port)]               = {types : ['number'],isOptional : true};
Main[nameof<MainConfig>(s => s.hostname)]           = {types : ['string'],isOptional : true};
Main[nameof<MainConfig>(s => s.debug)]              = {types : ['boolean'],isOptional : true};
Main[nameof<MainConfig>(s => s.startDebug)]         = {types : ['boolean'],isOptional : true};
Main[nameof<MainConfig>(s => s.showConfigWarnings)] = {types : ['boolean'],isOptional : true};
Main[nameof<MainConfig>(s => s.environment)]        = {types : ['string'],isOptional : true};
Main[nameof<MainConfig>(s => s.timeZone)]           = {types : ['string'],isOptional : true};
Main[nameof<MainConfig>(s => s.zationConsoleLog)]   = {types : ['boolean'],isOptional : true};
Main[nameof<MainConfig>(s => s.scConsoleLog)]       = {types : ['boolean'],isOptional : true};
Main[nameof<MainConfig>(s => s.useScUws)]           = {types : ['boolean'],isOptional : true};
Main[nameof<MainConfig>(s => s.useTokenCheckKey)]   = {types : ['boolean'],isOptional : true};

Main[nameof<MainConfig>(s => s.workers)]
    = {types : ['number','string'],isOptional : true, stringOnlyEnum : [OptionAuto]};

Main[nameof<MainConfig>(s => s.brokers)]
    = {types : ['number','string'],isOptional : true, stringOnlyEnum : [OptionAuto]};

Main[nameof<MainConfig>(s => s.appName)]              = {types : ['string'],isOptional : true};
Main[nameof<MainConfig>(s => s.secure)]               = {types : ['boolean'],isOptional : true};
Main[nameof<MainConfig>(s => s.httpsConfig)]          = {types : ['object'],isOptional : true};
Main[nameof<MainConfig>(s => s.useAuth)]              = {types : ['boolean'],isOptional : true};
Main[nameof<MainConfig>(s => s.useProtocolCheck)]     = {types : ['boolean'],isOptional : true};
Main[nameof<MainConfig>(s => s.useHttpMethodCheck)]   = {types : ['boolean'],isOptional : true};
Main[nameof<MainConfig>(s => s.sendErrorDescription)] = {types : ['boolean'],isOptional : true};
Main[nameof<MainConfig>(s => s.usePanel)]             = {types : ['boolean'],isOptional : true};
Main[nameof<MainConfig>(s => s.panelUser)]            = {types : ['object','array'],isOptional : true};
Main[nameof<MainConfig>(s => s.clientJsPrepare)]      = {types : ['boolean'],isOptional : true};
Main[nameof<MainConfig>(s => s.path)]                 = {types : ['string'],isOptional : true};

Main[nameof<MainConfig>(s => s.authStart)]          = {types : ['boolean'],isOptional : true};
Main[nameof<MainConfig>(s => s.authStartDuration)]  = {types : ['number'],isOptional : true};
Main[nameof<MainConfig>(s => s.postKey)]            = {types : ['string'],isOptional : true};
Main[nameof<MainConfig>(s => s.authKey)]            = {types : ['string','object'],isOptional : true};
Main[nameof<MainConfig>(s => s.authDefaultExpiry)]  = {types : ['number'],isOptional : true};
Main[nameof<MainConfig>(s => s.authAlgorithm)]      = {types : ['string'],isOptional : true};
Main[nameof<MainConfig>(s => s.authPrivateKey)]     = {types : ['string','object'],isOptional : true};
Main[nameof<MainConfig>(s => s.authPublicKey)]      = {types : ['string','object'],isOptional : true};

//service
Main[nameof<MainConfig>(s => s.killServerOnServicesCreateError)] = {types : ['boolean'],isOptional : true};

//Cluster
Main[nameof<MainConfig>(s => s.clusterAuthKey)]     = {types : ['string','null'],isOptional : true};
Main[nameof<MainConfig>(s => s.clusterSecretKey)]   = {types : ['string','null'],isOptional : true};
Main[nameof<MainConfig>(s => s.stateServerHost)]    = {types : ['string','null'],isOptional : true};
Main[nameof<MainConfig>(s => s.stateServerPort)]    = {types : ['number','null'],isOptional : true};

Main[nameof<MainConfig>(s => s.clusterShareTokenAuth)]                 = {types : ['boolean'],isOptional : true};
Main[nameof<MainConfig>(s => s.clusterMappingEngine)]                  = {types : ['string','null'],isOptional : true};
Main[nameof<MainConfig>(s => s.clusterClientPoolSize)]                 = {types : ['number','null'],isOptional : true};
Main[nameof<MainConfig>(s => s.clusterInstanceIp)]                     = {types : ['string','null'],isOptional : true};
Main[nameof<MainConfig>(s => s.clusterInstanceIpFamily)]               = {types : ['string','null'],isOptional : true};
Main[nameof<MainConfig>(s => s.clusterStateServerConnectTimeout)]      = {types : ['number','null'],isOptional : true};
Main[nameof<MainConfig>(s => s.clusterStateServerAckTimeout)]          = {types : ['number','null'],isOptional : true};
Main[nameof<MainConfig>(s => s.clusterStateServerReconnectRandomness)] = {types : ['number','null'],isOptional : true};

//Sc
Main[nameof<MainConfig>(s => s.scLogLevel)]                 = {types : ['number'],isOptional : true};
Main[nameof<MainConfig>(s => s.socketChannelLimit)]         = {types : ['number'],isOptional : true};
Main[nameof<MainConfig>(s => s.crashWorkerOnError)]         = {types : ['boolean'],isOptional : true};
Main[nameof<MainConfig>(s => s.rebootWorkerOnCrash)]        = {types : ['boolean'],isOptional : true};
Main[nameof<MainConfig>(s => s.killMasterOnSignal)]         = {types : ['boolean'],isOptional : true};
Main[nameof<MainConfig>(s => s.instanceId)]                 = {types : ['string','null'],isOptional : true};
Main[nameof<MainConfig>(s => s.killWorkerMemoryThreshold)]  = {types : ['number','null'],isOptional : true};
Main[nameof<MainConfig>(s => s.connectTimeout)]             = {types : ['number'],isOptional : true};
Main[nameof<MainConfig>(s => s.handshakeTimeout)]           = {types : ['number'],isOptional : true};
Main[nameof<MainConfig>(s => s.ackTimeout)]                 = {types : ['number'],isOptional : true};
Main[nameof<MainConfig>(s => s.ipcAckTimeout)]              = {types : ['number'],isOptional : true};
Main[nameof<MainConfig>(s => s.socketUpgradeTimeout)]       = {types : ['number',],isOptional : true};
Main[nameof<MainConfig>(s => s.origins)]                    = {types : ['string'],isOptional : true};
Main[nameof<MainConfig>(s => s.pingInterval)]               = {types : ['number'],isOptional : true};
Main[nameof<MainConfig>(s => s.pingTimeout)]                = {types : ['number'],isOptional : true};
Main[nameof<MainConfig>(s => s.processTermTimeout)]         = {types : ['number'],isOptional : true};
Main[nameof<MainConfig>(s => s.propagateErrors)]            = {types : ['boolean'],isOptional : true};
Main[nameof<MainConfig>(s => s.propagateWarnings)]          = {types : ['boolean'],isOptional : true};
Main[nameof<MainConfig>(s => s.middlewareEmitWarnings)]     = {types : ['boolean'],isOptional : true};
Main[nameof<MainConfig>(s => s.rebootOnSignal)]             = {types : ['boolean'],isOptional : true};
Main[nameof<MainConfig>(s => s.downgradeToUser)]            = {types : ['boolean'],isOptional : true};
Main[nameof<MainConfig>(s => s.socketRoot)]                 = {types : ['string','null'],isOptional : true};
Main[nameof<MainConfig>(s => s.schedulingPolicy)]           = {types : ['string','null'],isOptional : true};
Main[nameof<MainConfig>(s => s.allowClientPublish)]         = {types : ['boolean'],isOptional : true};
Main[nameof<MainConfig>(s => s.tcpSynBacklog)]              = {types : ['object','boolean','string','null'],isOptional : true};
Main[nameof<MainConfig>(s => s.workerStatusInterval)]       = {types : ['number'],isOptional : true};
Main[nameof<MainConfig>(s => s.pubSubBatchDuration)]        = {types : ['number','null'],isOptional : true};

const StarterConfig = {};
ObjectTools.addObToOb(StarterConfig,Main);
StarterConfig[nameof<StarterConfig>(s => s.controller)]    = {types : ['string'],isOptional : true};
StarterConfig[nameof<StarterConfig>(s => s.configs)]       = {types : ['string'],isOptional : true};
StarterConfig[nameof<StarterConfig>(s => s.appConfig)]     = {types : ['string'],isOptional : true};
StarterConfig[nameof<StarterConfig>(s => s.serviceConfig)] = {types : ['string'],isOptional : true};
StarterConfig[nameof<StarterConfig>(s => s.errorConfig)]   = {types : ['string'],isOptional : true};
StarterConfig[nameof<StarterConfig>(s => s.eventConfig)]   = {types : ['string'],isOptional : true};
StarterConfig[nameof<StarterConfig>(s => s.channelConfig)] = {types : ['string'],isOptional : true};
StarterConfig[nameof<StarterConfig>(s => s.mainConfig)]    = {types : ['string'],isOptional : true};

const allValidationTypes = ObjectTools.getObjValues(ValidationTypes);
const allFormatLetters = ObjectTools.getObjValues(FormatLetters);

const InputBody = {};
InputBody[nameof<ValuePropertyConfig>(s => s.isOptional)]   = {types : ['boolean'],isOptional : true};
InputBody[nameof<ValuePropertyConfig>(s => s.default)]      = {types : ['string','array','number','boolean','object','function'],isOptional : true};
InputBody[nameof<ValuePropertyConfig>(s => s.convert)]      = {types : ['function'],isOptional : true};
InputBody[nameof<ValuePropertyConfig>(s => s.type)]         = {types : ['string','array'],isOptional : true,enum:allValidationTypes};
InputBody[nameof<ValuePropertyConfig>(s => s.strictType)]   = {types : ['boolean'],isOptional : true};
InputBody[nameof<ValuePropertyConfig>(s => s.convertType)]  = {types : ['boolean'],isOptional : true};
InputBody[nameof<ValuePropertyConfig>(s => s.enum)]         = {types : ['array'],isOptional : true};
InputBody[nameof<ValuePropertyConfig>(s => s.privateEnum)]  = {types : ['array'],isOptional : true};
InputBody[nameof<ValuePropertyConfig>(s => s.minLength)]    = {types : ['number'],isOptional : true};
InputBody[nameof<ValuePropertyConfig>(s => s.maxLength)]    = {types : ['number'],isOptional : true};
InputBody[nameof<ValuePropertyConfig>(s => s.length)]       = {types : ['number'],isOptional : true};
InputBody[nameof<ValuePropertyConfig>(s => s.contains)]     = {types : ['string','array'],isOptional : true};
InputBody[nameof<ValuePropertyConfig>(s => s.equals)]       = {types : ['string','number','array','object','boolean','function'],isOptional : true};
InputBody[nameof<ValuePropertyConfig>(s => s.minValue)]     = {types : ['number'],isOptional : true};
InputBody[nameof<ValuePropertyConfig>(s => s.maxValue)]     = {types : ['number'],isOptional : true};
InputBody[nameof<ValuePropertyConfig>(s => s.regex)]        = {types : ['string','object'],isOptional : true};
InputBody[nameof<ValuePropertyConfig>(s => s.endsWith)]     = {types : ['string'],isOptional : true};
InputBody[nameof<ValuePropertyConfig>(s => s.startsWith)]   = {types : ['string'],isOptional : true};
InputBody[nameof<ValuePropertyConfig>(s => s.isLetters)]    = {types : ['string'],isOptional : true,enum:allFormatLetters};
InputBody[nameof<ValuePropertyConfig>(s => s.validate)]     = {types : ['function','array'],isOptional : true};

const ChannelConfig = {};
ChannelConfig[nameof<ChannelConfig>(s => s.customChannels)]       = {types : ['object'],isOptional : true};
ChannelConfig[nameof<ChannelConfig>(s => s.customIdChannels)]     = {types : ['object'],isOptional : true};
ChannelConfig[nameof<ChannelConfig>(s => s.userCh)]               = {types : ['object'],isOptional : true};
ChannelConfig[nameof<ChannelConfig>(s => s.authUserGroupCh)]      = {types : ['object'],isOptional : true};
ChannelConfig[nameof<ChannelConfig>(s => s.defaultUserGroupCh)]   = {types : ['object'],isOptional : true};
ChannelConfig[nameof<ChannelConfig>(s => s.allCh)]                = {types : ['object'],isOptional : true};

const ServiceConfig = {};
ServiceConfig[nameof<ServiceConfig>(s => s.services)]         = {types : ['object'],isOptional : true};
ServiceConfig[nameof<ServiceConfig>(s => s.customServices)]   = {types : ['object'],isOptional : true};

const PanelUserConfig = {};
PanelUserConfig[nameof<PanelUserConfig>(s => s.userName)]     = {types : ['string'],isOptional : false};
PanelUserConfig[nameof<PanelUserConfig>(s => s.password)]     = {types : ['string'],isOptional : false};

const ChannelFullItem = {};
ChannelFullItem[nameof<CustomChannelConfig>(s => s.clientPublishAccess)]      = {types : ['function','boolean','number','array','string'],isOptional : true};
ChannelFullItem[nameof<CustomChannelConfig>(s => s.clientPublishNotAccess)]   = {types : ['function','boolean','number','array','string'],isOptional : true};
ChannelFullItem[nameof<CustomChannelConfig>(s => s.subscribeAccess)]          = {types : ['function','boolean','number','array','string'],isOptional : true};
ChannelFullItem[nameof<CustomChannelConfig>(s => s.subscribeNotAccess)]       = {types : ['function','boolean','number','array','string'],isOptional : true};
ChannelFullItem[nameof<CustomChannelConfig>(s => s.onClientPublish)]          = {types : ['function','array'],isOptional : true};
ChannelFullItem[nameof<CustomChannelConfig>(s => s.onBagPublish)]             = {types : ['function','array'],isOptional : true};
ChannelFullItem[nameof<CustomChannelConfig>(s => s.onSubscription)]           = {types : ['function','array'],isOptional : true};
ChannelFullItem[nameof<CustomChannelConfig>(s => s.onUnsubscription)]         = {types : ['function','array'],isOptional : true};
ChannelFullItem[nameof<ChannelSettings>(s => s.socketGetOwnPublish)]          = {types : ['boolean','array'],isOptional : true};

const ChannelNormalItem = {};
ChannelNormalItem[nameof<ChannelSettings>(s => s.socketGetOwnPublish)]    = {types : ['boolean'],isOptional : true};
ChannelNormalItem[nameof<ZationChannelConfig>(s => s.onClientPublish)]    = {types : ['function','array'],isOptional : true};
ChannelNormalItem[nameof<ZationChannelConfig>(s => s.onBagPublish)]       = {types : ['function','array'],isOptional : true};
ChannelNormalItem[nameof<ZationChannelConfig>(s => s.onSubscription)]     = {types : ['function','array'],isOptional : true};
ChannelNormalItem[nameof<ZationChannelConfig>(s => s.onUnsubscription)]   = {types : ['function','array'],isOptional : true};
ChannelNormalItem[nameof<ZationChannelConfig>(s => s.allowClientPublish)] = {types : ['boolean'],isOptional : true};

const Services = {};
Services[nameof<Service>(s => s.mySql)]                 = {types : ['object'],isOptional : true};
Services[nameof<Service>(s => s.nodeMailer)]            = {types : ['object'],isOptional : true};
Services[nameof<Service>(s => s.postgresSql)]           = {types : ['object'],isOptional : true};
Services[nameof<Service>(s => s.mongoDb)]               = {types : ['object'],isOptional : true};

const ArrayShortCutSpecify = {};
ArrayShortCutSpecify[nameof<ArraySettings>(s => s.minLength)]         = {types : ['number'],isOptional : true};
ArrayShortCutSpecify[nameof<ArraySettings>(s => s.maxLength)]         = {types : ['number'],isOptional : true};
ArrayShortCutSpecify[nameof<ArraySettings>(s => s.length)]            = {types : ['number'],isOptional : true};
ArrayShortCutSpecify[nameof<ArraySettings>(s => s.isOptional)]        = {types : ['boolean'],isOptional: true};
ArrayShortCutSpecify[nameof<ValuePropertyConfig>(s => s.default)]     = {types : ['string','array','number','boolean','object','function'],isOptional : true};
ArrayShortCutSpecify[nameof<ArraySettings>(s => s.convert)]           = {types : ['function'],isOptional: true};

const AppArray = {};
AppArray[nameof<ArrayPropertyConfig>(s => s.array)]             = {types : ['object','string','array'],isOptional : true};
AppArray[nameof<ArrayPropertyConfig>(s => s.minLength)]         = {types : ['number'],isOptional : true};
AppArray[nameof<ArrayPropertyConfig>(s => s.maxLength)]         = {types : ['number'],isOptional : true};
AppArray[nameof<ArrayPropertyConfig>(s => s.length)]            = {types : ['number'],isOptional : true};
AppArray[nameof<ArrayPropertyConfig>(s => s.isOptional)]        = {types : ['boolean'],isOptional: true};
AppArray[nameof<ValuePropertyConfig>(s => s.default)]           = {types : ['string','array','number','boolean','object','function'],isOptional : true};
AppArray[nameof<ArrayPropertyConfig>(s => s.convert)]           = {types : ['function'],isOptional: true};

const AuthUserGroup = {};
AuthUserGroup[nameof<AuthUserGroupConfig>(s => s.panelAccess)]      = {types : ['boolean'],isOptional: true};
AuthUserGroup[nameof<AuthUserGroupConfig>(s => s.panelDisplayName)] = {types : ['string'],isOptional: true};

const EventConfig = {};
EventConfig[nameof<EventConfig>(s => s.express)]                = {types : ['function','array'],isOptional : true};
EventConfig[nameof<EventConfig>(s => s.scServer)]               = {types : ['function','array'],isOptional : true};
EventConfig[nameof<EventConfig>(s => s.socket)]                 = {types : ['function','array'],isOptional : true};
EventConfig[nameof<EventConfig>(s => s.workerIsStarted)]        = {types : ['function','array'],isOptional : true};
EventConfig[nameof<EventConfig>(s => s.workerLeaderIsStarted)]  = {types : ['function','array'],isOptional : true};
EventConfig[nameof<EventConfig>(s => s.httpServerIsStarted)]    = {types : ['function','array'],isOptional : true};
EventConfig[nameof<EventConfig>(s => s.wsServerIsStarted)]      = {types : ['function','array'],isOptional : true};
EventConfig[nameof<EventConfig>(s => s.isStarted)]              = {types : ['function','array'],isOptional : true};
EventConfig[nameof<EventConfig>(s => s.beforeError)]            = {types : ['function','array'],isOptional : true};
EventConfig[nameof<EventConfig>(s => s.beforeTaskError)]        = {types : ['function','array'],isOptional : true};
EventConfig[nameof<EventConfig>(s => s.beforeCodeError)]        = {types : ['function','array'],isOptional : true};
EventConfig[nameof<EventConfig>(s => s.beforeTaskErrorBag)]     = {types : ['function','array'],isOptional : true};
EventConfig[nameof<EventConfig>(s => s.socketDisconnection)]    = {types : ['function','array'],isOptional : true};
EventConfig[nameof<EventConfig>(s => s.workerMessage)]          = {types : ['function','array'],isOptional : true};
EventConfig[nameof<EventConfig>(s => s.middlewareAuthenticate)] = {types : ['function'],isOptional : true};

EventConfig[nameof<EventConfig>(s => s.scServerError)]           = {types : ['function','array'],isOptional : true};
EventConfig[nameof<EventConfig>(s => s.scServerNotice)]          = {types : ['function','array'],isOptional : true};
EventConfig[nameof<EventConfig>(s => s.scServerHandshake)]       = {types : ['function','array'],isOptional : true};
EventConfig[nameof<EventConfig>(s => s.scServerConnectionAbort)] = {types : ['function','array'],isOptional : true};
EventConfig[nameof<EventConfig>(s => s.scServerConnection)]      = {types : ['function','array'],isOptional : true};
EventConfig[nameof<EventConfig>(s => s.scServerDisconnection)]   = {types : ['function','array'],isOptional : true};
EventConfig[nameof<EventConfig>(s => s.scServerClosure)]         = {types : ['function','array'],isOptional : true};
EventConfig[nameof<EventConfig>(s => s.scServerSubscription)]    = {types : ['function','array'],isOptional : true};
EventConfig[nameof<EventConfig>(s => s.scServerUnsubscription)]  = {types : ['function','array'],isOptional : true};
EventConfig[nameof<EventConfig>(s => s.scServerAuthentication)]  = {types : ['function','array'],isOptional : true};
EventConfig[nameof<EventConfig>(s => s.scServerDeauthentication)]          = {types : ['function','array'],isOptional : true};
EventConfig[nameof<EventConfig>(s => s.scServerAuthenticationStateChange)] = {types : ['function','array'],isOptional : true};
EventConfig[nameof<EventConfig>(s => s.scServerBadSocketAuthToken)]        = {types : ['function','array'],isOptional : true};
EventConfig[nameof<EventConfig>(s => s.scServerReady)]                     = {types : ['function','array'],isOptional : true};

EventConfig[nameof<EventConfig>(s => s.socketError)]              = {types : ['function','array'],isOptional : true};
EventConfig[nameof<EventConfig>(s => s.socketRaw)]                = {types : ['function','array'],isOptional : true};
EventConfig[nameof<EventConfig>(s => s.socketConnect)]            = {types : ['function','array'],isOptional : true};
EventConfig[nameof<EventConfig>(s => s.socketDisconnect)]         = {types : ['function','array'],isOptional : true};
EventConfig[nameof<EventConfig>(s => s.socketConnectAbort)]       = {types : ['function','array'],isOptional : true};
EventConfig[nameof<EventConfig>(s => s.socketClose)]              = {types : ['function','array'],isOptional : true};
EventConfig[nameof<EventConfig>(s => s.socketSubscribe)]          = {types : ['function','array'],isOptional : true};
EventConfig[nameof<EventConfig>(s => s.socketUnsubscribe)]        = {types : ['function','array'],isOptional : true};
EventConfig[nameof<EventConfig>(s => s.socketBadAuthToken)]       = {types : ['function','array'],isOptional : true};
EventConfig[nameof<EventConfig>(s => s.socketAuthenticate)]       = {types : ['function','array'],isOptional : true};
EventConfig[nameof<EventConfig>(s => s.socketDeauthenticate)]     = {types : ['function','array'],isOptional : true};
EventConfig[nameof<EventConfig>(s => s.socketAuthStateChange)]    = {types : ['function','array'],isOptional : true};
EventConfig[nameof<EventConfig>(s => s.socketMessage)]            = {types : ['function','array'],isOptional : true};

EventConfig[nameof<EventConfig>(s => s.scMiddlewareAuthenticate)] = {types : ['function'],isOptional : true};
EventConfig[nameof<EventConfig>(s => s.scMiddlewareHandshakeWs)]  = {types : ['function'],isOptional : true};
EventConfig[nameof<EventConfig>(s => s.scMiddlewareHandshakeSc)]  = {types : ['function'],isOptional : true};
EventConfig[nameof<EventConfig>(s => s.scMiddlewareSubscribe)]    = {types : ['function'],isOptional : true};
EventConfig[nameof<EventConfig>(s => s.scMiddlewarePublishIn)]    = {types : ['function'],isOptional : true};
EventConfig[nameof<EventConfig>(s => s.scMiddlewarePublishOut)]   = {types : ['function'],isOptional : true};
EventConfig[nameof<EventConfig>(s => s.scMiddlewareEmit)]         = {types : ['function'],isOptional : true};

const Structures = {
    App : App,
    BackgroundTask : BackgroundTask,
    AppObject : AppObject,
    AppController : AppController,
    AppControllerDefaults : AppControllerDefaults,
    Main : Main,
    StarterConfig : StarterConfig,
    InputBody : InputBody,
    ChannelConfig : ChannelConfig,
    ServiceConfig : ServiceConfig,
    ChannelFullItem : ChannelFullItem,
    ChannelNormalItem : ChannelNormalItem,
    Services : Services,
    AppArray : AppArray,
    ArrayShortCutSpecify : ArrayShortCutSpecify,
    EventConfig : EventConfig,
    Error : Error,
    PanelUserConfig : PanelUserConfig,
    AuthUserGroup : AuthUserGroup
};
export = Structures;