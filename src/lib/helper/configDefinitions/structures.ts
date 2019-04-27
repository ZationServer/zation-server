/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import {EventConfig} from "./eventConfig";
import BagExtension, {
    AnyOfModelConfig,
    AppConfig, ArrayModelConfig, ArraySettings,
    AuthUserGroupConfig,
    BackgroundTask,
    ControllerConfig,
    ModelOptional, ObjectModelConfig, ValueModelConfig
} from "./appConfig";
import {
    MainConfig,
    OPTION_AUTO,
    OPTION_HALF_AUTO,
    PanelUserConfig
} from "./mainConfig";
import {StarterConfig}   from "./starterConfig";
// noinspection TypeScriptPreferShortImport
import {ValidationTypes} from "../constants/validationTypes";
import {FormatLetters}   from "../constants/validation";
import {ServiceConfig}   from "./serviceConfig";
import {ChannelConfig, ChannelSettings, CustomChannelConfig, ZationChannelConfig} from "./channelConfig";
import {ServiceModule}   from "zation-service";
import ObjectUtils       from "../utils/objectUtils";

const App = {};
App[nameof<AppConfig>(s => s.authController)]     = {types : ['string'],isOptional : true};
App[nameof<AppConfig>(s => s.controllers)]        = {types : ['object'],isOptional : true};
App[nameof<AppConfig>(s => s.userGroups)]         = {types : ['object'],isOptional : true};
App[nameof<AppConfig>(s => s.controllerDefaults)] = {types : ['object'],isOptional : true};
App[nameof<AppConfig>(s => s.models)]             = {types : ['object'],isOptional : true};
App[nameof<AppConfig>(s => s.backgroundTasks)]    = {types : ['object'],isOptional : true};
App[nameof<AppConfig>(s => s.bagExtensions)]      = {types : ['array'],isOptional : true};

const BackgroundTask = {};
BackgroundTask[nameof<BackgroundTask>(s => s.every)] = {types : ['number','array','object'],isOptional : true};
BackgroundTask[nameof<BackgroundTask>(s => s.at)]    = {types : ['number','array','object'],isOptional : true};
BackgroundTask[nameof<BackgroundTask>(s => s.task)]  = {types : ['function','array'],arrayType : 'function',isOptional : true};

const BagExtension = {};
BagExtension[nameof<BagExtension>(s => s.bag)]          = {types : ['object'],isOptional : false};
BagExtension[nameof<BagExtension>(s => s.smallBag)]     = {types : ['object'],isOptional : false};

type ServiceModuleDefault = ServiceModule<any,any,any>;
const ServiceModule = {};
ServiceModule[nameof<ServiceModuleDefault>(s => s.serviceName)]    = {types : ['string'],isOptional : false};
ServiceModule[nameof<ServiceModuleDefault>(s => s.bagExtensions)]  = {types : ['object'],isOptional : false};
ServiceModule[nameof<ServiceModuleDefault>(s => s.service)]        = {types : ['object'],isOptional : false};

const ObjectModel = {};
ObjectModel[nameof<ObjectModelConfig>(s => s.properties)] = {types : ['object'],isOptional : false};
ObjectModel[nameof<ObjectModelConfig>(s => s.construct)]  = {types : ['function'],isOptional : true};
ObjectModel[nameof<ObjectModelConfig>(s => s.extends)]    = {types : ['string'],isOptional : true};
ObjectModel[nameof<ObjectModelConfig>(s => s.isOptional)] = {types : ['boolean'],isOptional: true};
ObjectModel[nameof<ObjectModelConfig>(s => s.default)]     = {types : ['string','array','number','boolean','object','function'],isOptional : true};
ObjectModel[nameof<ObjectModelConfig>(s => s.prototype)]  = {types : ['object'],isOptional : true};
ObjectModel[nameof<ObjectModelConfig>(s => s.convert)]    = {types : ['function'],isOptional : true};

const ControllerConfig = {};
ControllerConfig[nameof<ControllerConfig>(s => s.input)]            = {types : ['object'],isOptional : true};
ControllerConfig[nameof<ControllerConfig>(s => s.multiInput)]       = {types : ['object'],isOptional : true};
ControllerConfig[nameof<ControllerConfig>(s => s.singleInput)]      = {types : ['object','array','string'],isOptional : true};
ControllerConfig[nameof<ControllerConfig>(s => s.prepareHandle)]    = {types : ['function','array'],arrayType : 'function',isOptional : true};
ControllerConfig[nameof<ControllerConfig>(s => s.systemController)] = {types : ['boolean'],isOptional : true};
ControllerConfig[nameof<ControllerConfig>(s => s.wsAccess)]         = {types : ['boolean'],isOptional : true};
ControllerConfig[nameof<ControllerConfig>(s => s.httpAccess)]       = {types : ['boolean'],isOptional : true};
ControllerConfig[nameof<ControllerConfig>(s => s.httpGetAllowed)]   = {types : ['boolean'],isOptional : true};
ControllerConfig[nameof<ControllerConfig>(s => s.httpPostAllowed)]  = {types : ['boolean'],isOptional : true};
ControllerConfig[nameof<ControllerConfig>(s => s.inputValidation)]  = {types : ['boolean'],isOptional : true};
ControllerConfig[nameof<ControllerConfig>(s => s.inputAllAllow)]    = {types : ['boolean'],isOptional : true};
ControllerConfig[nameof<ControllerConfig>(s => s.access)]           = {types : ['string','function','number','array'],isOptional : true};
ControllerConfig[nameof<ControllerConfig>(s => s.notAccess)]        = {types : ['string','function','number','array'],isOptional : true};
ControllerConfig[nameof<ControllerConfig>(s => s.versionAccess)]    = {types : ['string','object'],isOptional : true};
ControllerConfig[nameof<ControllerConfig>(s => s.systemAccess)]     = {types : ['array'],arrayType : 'string',isOptional : true};

const AnyOf = {};
AnyOf[nameof<AnyOfModelConfig>(s => s.anyOf)]     = {types : ['array','object'],isOptional : false};
AnyOf[nameof<ModelOptional>(s => s.isOptional)]   = {types : ['boolean'],isOptional : true};
AnyOf[nameof<ModelOptional>(s => s.default)]      = {types : ['string','array','number','boolean','object','function'],isOptional : true};

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
    = {types : ['number','string'],isOptional : true, stringOnlyEnum : [OPTION_AUTO,OPTION_HALF_AUTO]};

Main[nameof<MainConfig>(s => s.brokers)]
    = {types : ['number','string'],isOptional : true, stringOnlyEnum : [OPTION_AUTO,OPTION_HALF_AUTO]};

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
Main[nameof<MainConfig>(s => s.origins)]              = {types : ['string','null','array'],isOptional : true};

Main[nameof<MainConfig>(s => s.authStart)]          = {types : ['boolean'],isOptional : true};
Main[nameof<MainConfig>(s => s.authStartDuration)]  = {types : ['number'],isOptional : true};
Main[nameof<MainConfig>(s => s.postKey)]            = {types : ['string'],isOptional : true};
Main[nameof<MainConfig>(s => s.authKey)]            = {types : ['string','object'],isOptional : true};
Main[nameof<MainConfig>(s => s.authDefaultExpiry)]  = {types : ['number'],isOptional : true};
Main[nameof<MainConfig>(s => s.authAlgorithm)]      = {types : ['string'],isOptional : true};
Main[nameof<MainConfig>(s => s.authPrivateKey)]     = {types : ['string','object'],isOptional : true};
Main[nameof<MainConfig>(s => s.authPublicKey)]      = {types : ['string','object'],isOptional : true};

Main[nameof<MainConfig>(s => s.validationCheckLimit)]      = {types : ['number'],isOptional : true};

Main[nameof<MainConfig>(s => s.variables)]          = {types : ['object'],isOptional : true};

//service
Main[nameof<MainConfig>(s => s.killServerOnServicesCreateError)] = {types : ['boolean'],isOptional : true};

//log
Main[nameof<MainConfig>(s => s.logToFile)]        = {types : ['boolean'],isOptional : true};
Main[nameof<MainConfig>(s => s.logPath)]          = {types : ['string'],isOptional : true};
Main[nameof<MainConfig>(s => s.logDownloadable)]  = {types : ['boolean'],isOptional : true};
Main[nameof<MainConfig>(s => s.logAccessKey)]     = {types : ['string'],isOptional : true};

Main[nameof<MainConfig>(s => s.logRequests)]      = {types : ['boolean'],isOptional : true};
Main[nameof<MainConfig>(s => s.logServerErrors)]  = {types : ['boolean'],isOptional : true};
Main[nameof<MainConfig>(s => s.logCodeErrors)]    = {types : ['boolean'],isOptional : true};
Main[nameof<MainConfig>(s => s.logStarted)]       = {types : ['boolean'],isOptional : true};

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
Main[nameof<MainConfig>(s => s.scOrigins)]                  = {types : ['string','null'],isOptional : true};
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
ObjectUtils.addObToOb(StarterConfig,Main);
StarterConfig[nameof<StarterConfig>(s => s.rootPath)]      = {types : ['string'],isOptional : true};
StarterConfig[nameof<StarterConfig>(s => s.configs)]       = {types : ['string'],isOptional : true};
StarterConfig[nameof<StarterConfig>(s => s.appConfig)]     = {types : ['string'],isOptional : true};
StarterConfig[nameof<StarterConfig>(s => s.serviceConfig)] = {types : ['string'],isOptional : true};
StarterConfig[nameof<StarterConfig>(s => s.errorConfig)]   = {types : ['string'],isOptional : true};
StarterConfig[nameof<StarterConfig>(s => s.eventConfig)]   = {types : ['string'],isOptional : true};
StarterConfig[nameof<StarterConfig>(s => s.channelConfig)] = {types : ['string'],isOptional : true};
StarterConfig[nameof<StarterConfig>(s => s.mainConfig)]    = {types : ['string'],isOptional : true};
StarterConfig[nameof<StarterConfig>(s => s.checkConfigs)]  = {types : ['boolean'],isOptional : true};

const allValidationTypes = ObjectUtils.getObjValues(ValidationTypes);
const allFormatLetters = ObjectUtils.getObjValues(FormatLetters);

const ValueModel = {};
ValueModel[nameof<ValueModelConfig>(s => s.isOptional)]   = {types : ['boolean'],isOptional : true};
ValueModel[nameof<ValueModelConfig>(s => s.default)]      = {types : ['string','array','number','boolean','object','function'],isOptional : true};
ValueModel[nameof<ValueModelConfig>(s => s.convert)]      = {types : ['function'],isOptional : true};
ValueModel[nameof<ValueModelConfig>(s => s.extends)]      = {types : ['string'],isOptional : true};
ValueModel[nameof<ValueModelConfig>(s => s.type)]         = {types : ['string','array'],isOptional : true,enum:allValidationTypes};
ValueModel[nameof<ValueModelConfig>(s => s.strictType)]   = {types : ['boolean'],isOptional : true};
ValueModel[nameof<ValueModelConfig>(s => s.convertType)]  = {types : ['boolean'],isOptional : true};
ValueModel[nameof<ValueModelConfig>(s => s.enum)]         = {types : ['array'],isOptional : true};
ValueModel[nameof<ValueModelConfig>(s => s.privateEnum)]  = {types : ['array'],isOptional : true};
ValueModel[nameof<ValueModelConfig>(s => s.minLength)]    = {types : ['number'],isOptional : true};
ValueModel[nameof<ValueModelConfig>(s => s.maxLength)]    = {types : ['number'],isOptional : true};
ValueModel[nameof<ValueModelConfig>(s => s.length)]       = {types : ['number'],isOptional : true};
ValueModel[nameof<ValueModelConfig>(s => s.contains)]     = {types : ['string','array'],isOptional : true};
ValueModel[nameof<ValueModelConfig>(s => s.equals)]       = {types : ['string','number','array','object','boolean','function'],isOptional : true};
ValueModel[nameof<ValueModelConfig>(s => s.minValue)]     = {types : ['number'],isOptional : true};
ValueModel[nameof<ValueModelConfig>(s => s.maxValue)]     = {types : ['number'],isOptional : true};
ValueModel[nameof<ValueModelConfig>(s => s.regex)]        = {types : ['string','object'],isOptional : true};
ValueModel[nameof<ValueModelConfig>(s => s.endsWith)]     = {types : ['string'],isOptional : true};
ValueModel[nameof<ValueModelConfig>(s => s.startsWith)]   = {types : ['string'],isOptional : true};
ValueModel[nameof<ValueModelConfig>(s => s.letters)]      = {types : ['string'],isOptional : true,enum:allFormatLetters};
ValueModel[nameof<ValueModelConfig>(s => s.charClass)]    = {types : ['string'],isOptional : true};
ValueModel[nameof<ValueModelConfig>(s => s.maxByteSize)]  = {types : ['number'],isOptional : true};
ValueModel[nameof<ValueModelConfig>(s => s.minByteSize)]  = {types : ['number'],isOptional : true};
ValueModel[nameof<ValueModelConfig>(s => s.mimeType)]     = {types : ['string','array','null'],isOptional : true};
ValueModel[nameof<ValueModelConfig>(s => s.mimeSubType)]  = {types : ['string','array','null'],isOptional : true};
ValueModel[nameof<ValueModelConfig>(s => s.before)]       = {types : ['object','function'],isOptional : true};
ValueModel[nameof<ValueModelConfig>(s => s.after)]        = {types : ['object','function'],isOptional : true};
ValueModel[nameof<ValueModelConfig>(s => s.validate)]     = {types : ['function','array'],isOptional : true};

const ChannelConfig = {};
ChannelConfig[nameof<ChannelConfig>(s => s.customChannels)]       = {types : ['object'],isOptional : true};
ChannelConfig[nameof<ChannelConfig>(s => s.customIdChannels)]     = {types : ['object'],isOptional : true};
ChannelConfig[nameof<ChannelConfig>(s => s.userCh)]               = {types : ['object'],isOptional : true};
ChannelConfig[nameof<ChannelConfig>(s => s.authUserGroupCh)]      = {types : ['object'],isOptional : true};
ChannelConfig[nameof<ChannelConfig>(s => s.defaultUserGroupCh)]   = {types : ['object'],isOptional : true};
ChannelConfig[nameof<ChannelConfig>(s => s.allCh)]                = {types : ['object'],isOptional : true};

const ServiceConfig = {};
ServiceConfig[nameof<ServiceConfig>(s => s.services)]               = {types : ['object'],isOptional : true};
ServiceConfig[nameof<ServiceConfig>(s => s.serviceModules)]         = {types : ['array'],isOptional : true};

const PanelUserConfig = {};
PanelUserConfig[nameof<PanelUserConfig>(s => s.username)]     = {types : ['string'],isOptional : false};
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

const ArrayShortCutSpecify = {};
ArrayShortCutSpecify[nameof<ArraySettings>(s => s.minLength)]         = {types : ['number'],isOptional : true};
ArrayShortCutSpecify[nameof<ArraySettings>(s => s.maxLength)]         = {types : ['number'],isOptional : true};
ArrayShortCutSpecify[nameof<ArraySettings>(s => s.length)]            = {types : ['number'],isOptional : true};
ArrayShortCutSpecify[nameof<ArraySettings>(s => s.isOptional)]        = {types : ['boolean'],isOptional: true};
ArrayShortCutSpecify[nameof<ValueModelConfig>(s => s.default)]        = {types : ['string','array','number','boolean','object','function'],isOptional : true};
ArrayShortCutSpecify[nameof<ArraySettings>(s => s.convert)]           = {types : ['function'],isOptional: true};

const ArrayModel = {};
ArrayModel[nameof<ArrayModelConfig>(s => s.array)]             = {types : ['object','string','array'],isOptional : true};
ArrayModel[nameof<ArrayModelConfig>(s => s.minLength)]         = {types : ['number'],isOptional : true};
ArrayModel[nameof<ArrayModelConfig>(s => s.maxLength)]         = {types : ['number'],isOptional : true};
ArrayModel[nameof<ArrayModelConfig>(s => s.length)]            = {types : ['number'],isOptional : true};
ArrayModel[nameof<ArrayModelConfig>(s => s.isOptional)]        = {types : ['boolean'],isOptional: true};
ArrayModel[nameof<ValueModelConfig>(s => s.default)]           = {types : ['string','array','number','boolean','object','function'],isOptional : true};
ArrayModel[nameof<ArrayModelConfig>(s => s.convert)]           = {types : ['function'],isOptional: true};

const AuthUserGroup = {};
AuthUserGroup[nameof<AuthUserGroupConfig>(s => s.panelAccess)]      = {types : ['boolean'],isOptional: true};
AuthUserGroup[nameof<AuthUserGroupConfig>(s => s.panelDisplayName)] = {types : ['string'],isOptional: true};

const EventConfig = {};
EventConfig[nameof<EventConfig>(s => s.express)]                = {types : ['function','array'],arrayType : 'function',isOptional : true};
EventConfig[nameof<EventConfig>(s => s.scServer)]               = {types : ['function','array'],arrayType : 'function',isOptional : true};
EventConfig[nameof<EventConfig>(s => s.socket)]                 = {types : ['function','array'],arrayType : 'function',isOptional : true};
EventConfig[nameof<EventConfig>(s => s.workerStarted)]          = {types : ['function','array'],arrayType : 'function',isOptional : true};
EventConfig[nameof<EventConfig>(s => s.workerLeaderStarted)]    = {types : ['function','array'],arrayType : 'function',isOptional : true};
EventConfig[nameof<EventConfig>(s => s.httpServerStarted)]      = {types : ['function','array'],arrayType : 'function',isOptional : true};
EventConfig[nameof<EventConfig>(s => s.wsServerStarted)]        = {types : ['function','array'],arrayType : 'function',isOptional : true};
EventConfig[nameof<EventConfig>(s => s.started)]                = {types : ['function','array'],arrayType : 'function',isOptional : true};
EventConfig[nameof<EventConfig>(s => s.beforeError)]            = {types : ['function','array'],arrayType : 'function',isOptional : true};
EventConfig[nameof<EventConfig>(s => s.beforeBackError)]        = {types : ['function','array'],arrayType : 'function',isOptional : true};
EventConfig[nameof<EventConfig>(s => s.beforeCodeError)]        = {types : ['function','array'],arrayType : 'function',isOptional : true};
EventConfig[nameof<EventConfig>(s => s.beforeBackErrorBag)]     = {types : ['function','array'],arrayType : 'function',isOptional : true};
EventConfig[nameof<EventConfig>(s => s.socketDisconnection)]    = {types : ['function','array'],arrayType : 'function',isOptional : true};
EventConfig[nameof<EventConfig>(s => s.workerMessage)]          = {types : ['function','array'],arrayType : 'function',isOptional : true};
EventConfig[nameof<EventConfig>(s => s.middlewareAuthenticate)] = {types : ['function'],isOptional : true};

EventConfig[nameof<EventConfig>(s => s.sc_serverError)]           = {types : ['function','array'],arrayType : 'function',isOptional : true};
EventConfig[nameof<EventConfig>(s => s.sc_serverNotice)]          = {types : ['function','array'],arrayType : 'function',isOptional : true};
EventConfig[nameof<EventConfig>(s => s.sc_serverHandshake)]       = {types : ['function','array'],arrayType : 'function',isOptional : true};
EventConfig[nameof<EventConfig>(s => s.sc_serverConnectionAbort)] = {types : ['function','array'],arrayType : 'function',isOptional : true};
EventConfig[nameof<EventConfig>(s => s.sc_serverConnection)]      = {types : ['function','array'],arrayType : 'function',isOptional : true};
EventConfig[nameof<EventConfig>(s => s.sc_serverDisconnection)]   = {types : ['function','array'],arrayType : 'function',isOptional : true};
EventConfig[nameof<EventConfig>(s => s.sc_serverClosure)]         = {types : ['function','array'],arrayType : 'function',isOptional : true};
EventConfig[nameof<EventConfig>(s => s.sc_serverSubscription)]    = {types : ['function','array'],arrayType : 'function',isOptional : true};
EventConfig[nameof<EventConfig>(s => s.sc_serverUnsubscription)]  = {types : ['function','array'],arrayType : 'function',isOptional : true};
EventConfig[nameof<EventConfig>(s => s.sc_serverAuthentication)]  = {types : ['function','array'],arrayType : 'function',isOptional : true};
EventConfig[nameof<EventConfig>(s => s.sc_serverDeauthentication)]          = {types : ['function','array'],arrayType : 'function',isOptional : true};
EventConfig[nameof<EventConfig>(s => s.sc_serverAuthenticationStateChange)] = {types : ['function','array'],arrayType : 'function',isOptional : true};
EventConfig[nameof<EventConfig>(s => s.sc_serverBadSocketAuthToken)]        = {types : ['function','array'],arrayType : 'function',isOptional : true};
EventConfig[nameof<EventConfig>(s => s.sc_serverReady)]                     = {types : ['function','array'],arrayType : 'function',isOptional : true};

EventConfig[nameof<EventConfig>(s => s.sc_socketError)]              = {types : ['function','array'],arrayType : 'function',isOptional : true};
EventConfig[nameof<EventConfig>(s => s.sc_socketRaw)]                = {types : ['function','array'],arrayType : 'function',isOptional : true};
EventConfig[nameof<EventConfig>(s => s.sc_socketConnect)]            = {types : ['function','array'],arrayType : 'function',isOptional : true};
EventConfig[nameof<EventConfig>(s => s.sc_socketDisconnect)]         = {types : ['function','array'],arrayType : 'function',isOptional : true};
EventConfig[nameof<EventConfig>(s => s.sc_socketConnectAbort)]       = {types : ['function','array'],arrayType : 'function',isOptional : true};
EventConfig[nameof<EventConfig>(s => s.sc_socketClose)]              = {types : ['function','array'],arrayType : 'function',isOptional : true};
EventConfig[nameof<EventConfig>(s => s.sc_socketSubscribe)]          = {types : ['function','array'],arrayType : 'function',isOptional : true};
EventConfig[nameof<EventConfig>(s => s.sc_socketUnsubscribe)]        = {types : ['function','array'],arrayType : 'function',isOptional : true};
EventConfig[nameof<EventConfig>(s => s.sc_socketBadAuthToken)]       = {types : ['function','array'],arrayType : 'function',isOptional : true};
EventConfig[nameof<EventConfig>(s => s.sc_socketAuthenticate)]       = {types : ['function','array'],arrayType : 'function',isOptional : true};
EventConfig[nameof<EventConfig>(s => s.sc_socketDeauthenticate)]     = {types : ['function','array'],arrayType : 'function',isOptional : true};
EventConfig[nameof<EventConfig>(s => s.sc_socketAuthStateChange)]    = {types : ['function','array'],arrayType : 'function',isOptional : true};
EventConfig[nameof<EventConfig>(s => s.sc_socketMessage)]            = {types : ['function','array'],arrayType : 'function',isOptional : true};

EventConfig[nameof<EventConfig>(s => s.sc_middlewareAuthenticate)] = {types : ['function'],isOptional : true};
EventConfig[nameof<EventConfig>(s => s.sc_middlewareHandshakeWs)]  = {types : ['function'],isOptional : true};
EventConfig[nameof<EventConfig>(s => s.sc_middlewareHandshakeSc)]  = {types : ['function'],isOptional : true};
EventConfig[nameof<EventConfig>(s => s.sc_middlewareSubscribe)]    = {types : ['function'],isOptional : true};
EventConfig[nameof<EventConfig>(s => s.sc_middlewarePublishIn)]    = {types : ['function'],isOptional : true};
EventConfig[nameof<EventConfig>(s => s.sc_middlewarePublishOut)]   = {types : ['function'],isOptional : true};
EventConfig[nameof<EventConfig>(s => s.sc_middlewareEmit)]         = {types : ['function'],isOptional : true};

export const Structures = {
    App : App,
    BackgroundTask : BackgroundTask,
    ObjectModel : ObjectModel,
    ControllerConfig : ControllerConfig,
    Main : Main,
    StarterConfig : StarterConfig,
    ValueModel : ValueModel,
    ChannelConfig : ChannelConfig,
    ServiceConfig : ServiceConfig,
    ChannelFullItem : ChannelFullItem,
    ChannelNormalItem : ChannelNormalItem,
    ArrayModel : ArrayModel,
    ArrayShortCutSpecify : ArrayShortCutSpecify,
    EventConfig : EventConfig,
    PanelUserConfig : PanelUserConfig,
    AuthUserGroup : AuthUserGroup,
    AnyOf : AnyOf,
    BagExtension : BagExtension,
    serviceModule : ServiceModule
};
