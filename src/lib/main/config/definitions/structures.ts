/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {Events} from "./parts/events";
import {
    AppConfig
} from "./main/appConfig";
import {
    MainConfig,
    OPTION_AUTO,
    OPTION_HALF_AUTO,
    PanelUserConfig
} from "./main/mainConfig";
import {StarterConfig}   from "./main/starterConfig";
// noinspection TypeScriptPreferShortImport
import {ValidationType}  from "../../constants/validationType";
import {FormatLetters}   from "../../constants/validation";
import {
    ChannelSettings,
    BaseCustomChannelConfig,
    CustomChFamily,
    ZationChannelConfig,
    ZationChannelsConfig
} from "./parts/channelsConfig";
import ObjectUtils       from "../../utils/objectUtils";
import {
    AnyOfModelConfig,
    ArrayModelConfig,
    ArraySettings,
    ModelOptional,
    ObjectModelConfig,
    ValueModelConfig
} from "./parts/inputConfig";
import {ControllerConfig} from "./parts/controllerConfig";
import {BackgroundTask}   from "./parts/backgroundTask";
import {DataboxConfig}    from "./parts/databoxConfig";
import {Service}          from 'zation-service';
import {Structure}        from '../utils/configCheckerTools';
import {Middleware} from './parts/middleware';
import {AuthUserGroupConfig} from './parts/userGroupsConfig';

const App: Structure = {};
App[nameof<AppConfig>(s => s.userGroups)]         = {types: ['object'],optional: true};
App[nameof<AppConfig>(s => s.events)]             = {types: ['object'],optional: true};
App[nameof<AppConfig>(s => s.middleware)]         = {types: ['object'],optional: true};
App[nameof<AppConfig>(s => s.authController)]     = {types: ['string'],optional: true};
App[nameof<AppConfig>(s => s.controllers)]        = {types: ['object'],optional: true};
App[nameof<AppConfig>(s => s.controllerDefaults)] = {types: ['object'],optional: true};
App[nameof<AppConfig>(s => s.databoxes)]          = {types: ['object'],optional: true};
App[nameof<AppConfig>(s => s.databoxDefaults)]    = {types: ['object'],optional: true};
App[nameof<AppConfig>(s => s.models)]             = {types: ['object'],optional: true};
App[nameof<AppConfig>(s => s.zationChannels)]     = {types: ['object'],optional: true};
App[nameof<AppConfig>(s => s.customChannels)]     = {types: ['object'],optional: true};
App[nameof<AppConfig>(s => s.customChannelDefaults)] = {types: ['object'],optional: true};
App[nameof<AppConfig>(s => s.backgroundTasks)]    = {types: ['object'],optional: true};

const BackgroundTask: Structure = {};
BackgroundTask[nameof<BackgroundTask>(s => s.every)] = {types: ['number','array','object'],optional: true};
BackgroundTask[nameof<BackgroundTask>(s => s.at)]    = {types: ['number','array','object'],optional: true};
BackgroundTask[nameof<BackgroundTask>(s => s.task)]  = {types: ['function','array'],arrayType: 'function',optional: true};
BackgroundTask[nameof<BackgroundTask>(s => s.clusterSafe)] = {types: ['boolean'],optional: true};

const ObjectModel: Structure = {};
ObjectModel[nameof<ObjectModelConfig>(s => s.properties)] = {types: ['object'],optional: false};
ObjectModel[nameof<ObjectModelConfig>(s => s.construct)]  = {types: ['function'],optional: true};
ObjectModel[nameof<ObjectModelConfig>(s => s.extends)]    = {types: ['string','object','function'],optional: true};
ObjectModel[nameof<ObjectModelConfig>(s => s.isOptional)] = {types: ['boolean'],optional: true};
ObjectModel[nameof<ObjectModelConfig>(s => s.default)]    = {types: ['string','array','number','boolean','object','function'],optional: true};
ObjectModel[nameof<ObjectModelConfig>(s => s.prototype)]  = {types: ['object'],optional: true};
ObjectModel[nameof<ObjectModelConfig>(s => s.convert)]    = {types: ['function'],optional: true};
ObjectModel[nameof<ObjectModelConfig>(s => s.morePropsAllowed)] = {types: ['boolean'],optional: true};

const ControllerConfig: Structure = {};
ControllerConfig[nameof<ControllerConfig>(s => s.input)]            = {types: ['object','array','function'],optional: true};
ControllerConfig[nameof<ControllerConfig>(s => s.middleware)]       = {types: ['function','array'],arrayType: 'function',optional: true};
ControllerConfig[nameof<ControllerConfig>(s => s.wsAccess)]         = {types: ['boolean'],optional: true};
ControllerConfig[nameof<ControllerConfig>(s => s.httpAccess)]       = {types: ['boolean'],optional: true};
ControllerConfig[nameof<ControllerConfig>(s => s.httpGetAllowed)]   = {types: ['boolean'],optional: true};
ControllerConfig[nameof<ControllerConfig>(s => s.httpPostAllowed)]  = {types: ['boolean'],optional: true};
ControllerConfig[nameof<ControllerConfig>(s => s.allowAnyInput)]    = {types: ['boolean'],optional: true};
ControllerConfig[nameof<ControllerConfig>(s => s.access)]           = {types: ['string','function','object','array'],optional: true};
ControllerConfig[nameof<ControllerConfig>(s => s.versionAccess)]    = {types: ['string','object'],optional: true};
ControllerConfig[nameof<ControllerConfig>(s => s.systemAccess)]     = {types: ['array'],arrayType: 'string',optional: true};

const DataboxConfig: Structure = {};
DataboxConfig[nameof<DataboxConfig>(s => s.access)]           = {types: ['string','function','object','array'],optional: true};
DataboxConfig[nameof<DataboxConfig>(s => s.notAccess)]        = {types: ['string','function','object','array'],optional: true};
DataboxConfig[nameof<DataboxConfig>(s => s.versionAccess)]    = {types: ['string','object'],optional: true};
DataboxConfig[nameof<DataboxConfig>(s => s.systemAccess)]     = {types: ['array'],arrayType: 'string',optional: true};
DataboxConfig[nameof<DataboxConfig>(s => s.parallelFetch)]    = {types: ['boolean'],optional: true};
DataboxConfig[nameof<DataboxConfig>(s => s.maxBackpressure)]  = {types: ['number'],optional: true};
DataboxConfig[nameof<DataboxConfig>(s => s.maxSocketInputChannels)] = {types: ['number'],optional: true};
DataboxConfig[nameof<DataboxConfig>(s => s.initInput)]              = {types: ['object','array','function'],optional: true};
DataboxConfig[nameof<DataboxConfig>(s => s.allowAnyInitInput)]      = {types: ['boolean'],optional: true};
DataboxConfig[nameof<DataboxConfig>(s => s.fetchInput)]             = {types: ['object','array','function'],optional: true};
DataboxConfig[nameof<DataboxConfig>(s => s.allowAnyFetchInput)]     = {types: ['boolean'],optional: true};

const AnyOf: Structure = {};
AnyOf[nameof<AnyOfModelConfig>(s => s.anyOf)]     = {types: ['array','object'],optional: false};
AnyOf[nameof<ModelOptional>(s => s.isOptional)]   = {types: ['boolean'],optional: true};
AnyOf[nameof<ModelOptional>(s => s.default)]      = {types: ['string','array','number','boolean','object','function'],optional: true};

const Main: Structure = {};
Main[nameof<MainConfig>(s => s.instanceId)]         = {types: ['string'],optional: true};
Main[nameof<MainConfig>(s => s.port)]               = {types: ['number'],optional: true};
Main[nameof<MainConfig>(s => s.hostname)]           = {types: ['string'],optional: true};
Main[nameof<MainConfig>(s => s.debug)]              = {types: ['boolean'],optional: true};
Main[nameof<MainConfig>(s => s.startDebug)]         = {types: ['boolean'],optional: true};
Main[nameof<MainConfig>(s => s.killOnStartFailure)] = {types: ['boolean'],optional: true};
Main[nameof<MainConfig>(s => s.showConfigWarnings)] = {types: ['boolean'],optional: true};
Main[nameof<MainConfig>(s => s.environment)]        = {types: ['string'],optional: true};
Main[nameof<MainConfig>(s => s.timeZone)]           = {types: ['string'],optional: true};
Main[nameof<MainConfig>(s => s.zationConsoleLog)]   = {types: ['boolean'],optional: true};
Main[nameof<MainConfig>(s => s.scConsoleLog)]       = {types: ['boolean'],optional: true};
Main[nameof<MainConfig>(s => s.wsEngine)]           = {types: ['string'],optional: true};
Main[nameof<MainConfig>(s => s.defaultClientApiLevel)]   = {types: ['number'],optional: true};
Main[nameof<MainConfig>(s => s.useTokenClusterKeyCheck)] = {types: ['boolean'],optional: true};

Main[nameof<MainConfig>(s => s.workers)]
    = {types: ['number','string'],optional: true, stringOnlyEnum: [OPTION_AUTO,OPTION_HALF_AUTO]};

Main[nameof<MainConfig>(s => s.brokers)]
    = {types: ['number','string'],optional: true, stringOnlyEnum: [OPTION_AUTO,OPTION_HALF_AUTO]};

Main[nameof<MainConfig>(s => s.appName)]              = {types: ['string'],optional: true};
Main[nameof<MainConfig>(s => s.secure)]               = {types: ['boolean'],optional: true};
Main[nameof<MainConfig>(s => s.httpsConfig)]          = {types: ['object'],optional: true};
Main[nameof<MainConfig>(s => s.useTokenStateCheck)]   = {types: ['boolean'],optional: true};
Main[nameof<MainConfig>(s => s.useProtocolCheck)]     = {types: ['boolean'],optional: true};
Main[nameof<MainConfig>(s => s.useHttpMethodCheck)]   = {types: ['boolean'],optional: true};
Main[nameof<MainConfig>(s => s.sendErrorDescription)] = {types: ['boolean'],optional: true};
Main[nameof<MainConfig>(s => s.usePanel)]             = {types: ['boolean'],optional: true};
Main[nameof<MainConfig>(s => s.panelUser)]            = {types: ['object','array'],optional: true};
Main[nameof<MainConfig>(s => s.provideClientJs)]      = {types: ['boolean'],optional: true};
Main[nameof<MainConfig>(s => s.path)]                 = {types: ['string'],optional: true};
Main[nameof<MainConfig>(s => s.license)]              = {types: ['string'],optional: true};
Main[nameof<MainConfig>(s => s.origins)]              = {types: ['string','null','array'],optional: true};

Main[nameof<MainConfig>(s => s.authStart)]          = {types: ['boolean'],optional: true};
Main[nameof<MainConfig>(s => s.authStartDuration)]  = {types: ['number'],optional: true};
Main[nameof<MainConfig>(s => s.postKey)]            = {types: ['string'],optional: true};
Main[nameof<MainConfig>(s => s.authSecretKey)]      = {types: ['string','null'],optional: true};
Main[nameof<MainConfig>(s => s.authDefaultExpiry)]  = {types: ['number'],optional: true};
Main[nameof<MainConfig>(s => s.authAlgorithm)]      = {types: ['string'],optional: true};
Main[nameof<MainConfig>(s => s.authPrivateKey)]     = {types: ['string','null'],optional: true};
Main[nameof<MainConfig>(s => s.authPublicKey)]      = {types: ['string','null'],optional: true};

Main[nameof<MainConfig>(s => s.validationCheckLimit)]      = {types: ['number'],optional: true};
Main[nameof<MainConfig>(s => s.socketDataboxLimit)]        = {types: ['number'],optional: true};

Main[nameof<MainConfig>(s => s.variables)]          = {types: ['object'],optional: true};

//service
Main[nameof<MainConfig>(s => s.killServerOnServicesCreateError)] = {types: ['boolean'],optional: true};

//log
Main[nameof<MainConfig>(s => s.logFile)]              = {types: ['boolean'],optional: true};
Main[nameof<MainConfig>(s => s.logFilePath)]          = {types: ['string'],optional: true};
Main[nameof<MainConfig>(s => s.logFileDownloadable)]  = {types: ['boolean'],optional: true};
Main[nameof<MainConfig>(s => s.logFileAccessKey)]     = {types: ['string'],optional: true};

Main[nameof<MainConfig>(s => s.logFileControllerRequests)]  = {types: ['boolean'],optional: true};
Main[nameof<MainConfig>(s => s.logFileDataboxRequests)]     = {types: ['boolean'],optional: true};
Main[nameof<MainConfig>(s => s.logFileServerErrors)]        = {types: ['boolean'],optional: true};
Main[nameof<MainConfig>(s => s.logFileCodeErrors)]          = {types: ['boolean'],optional: true};
Main[nameof<MainConfig>(s => s.logFileStarted)]             = {types: ['boolean'],optional: true};

Main[nameof<MainConfig>(s => s.showPrecompiledConfigs)] = {types: ['boolean'],optional: true};

//Cluster
Main[nameof<MainConfig>(s => s.clusterAuthKey)]     = {types: ['string','null'],optional: true};
Main[nameof<MainConfig>(s => s.clusterSecretKey)]   = {types: ['string','null'],optional: true};
Main[nameof<MainConfig>(s => s.stateServerHost)]    = {types: ['string','null'],optional: true};
Main[nameof<MainConfig>(s => s.stateServerPort)]    = {types: ['number','null'],optional: true};

Main[nameof<MainConfig>(s => s.clusterShareTokenAuth)]                 = {types: ['boolean'],optional: true};
Main[nameof<MainConfig>(s => s.clusterMappingEngine)]                  = {types: ['string','null'],optional: true};
Main[nameof<MainConfig>(s => s.clusterClientPoolSize)]                 = {types: ['number','null'],optional: true};
Main[nameof<MainConfig>(s => s.clusterInstanceIp)]                     = {types: ['string','null'],optional: true};
Main[nameof<MainConfig>(s => s.clusterInstanceIpFamily)]               = {types: ['string','null'],optional: true};
Main[nameof<MainConfig>(s => s.clusterStateServerConnectTimeout)]      = {types: ['number','null'],optional: true};
Main[nameof<MainConfig>(s => s.clusterStateServerAckTimeout)]          = {types: ['number','null'],optional: true};
Main[nameof<MainConfig>(s => s.clusterStateServerReconnectRandomness)] = {types: ['number','null'],optional: true};

//Sc
Main[nameof<MainConfig>(s => s.scLogLevel)]                 = {types: ['number'],optional: true};
Main[nameof<MainConfig>(s => s.scOrigins)]                  = {types: ['string','null'],optional: true};
Main[nameof<MainConfig>(s => s.socketChannelLimit)]         = {types: ['number'],optional: true};
Main[nameof<MainConfig>(s => s.crashWorkerOnError)]         = {types: ['boolean'],optional: true};
Main[nameof<MainConfig>(s => s.rebootWorkerOnCrash)]        = {types: ['boolean'],optional: true};
Main[nameof<MainConfig>(s => s.killMasterOnSignal)]         = {types: ['boolean'],optional: true};
Main[nameof<MainConfig>(s => s.killWorkerMemoryThreshold)]  = {types: ['number','null'],optional: true};
Main[nameof<MainConfig>(s => s.connectTimeout)]             = {types: ['number'],optional: true};
Main[nameof<MainConfig>(s => s.handshakeTimeout)]           = {types: ['number'],optional: true};
Main[nameof<MainConfig>(s => s.ackTimeout)]                 = {types: ['number'],optional: true};
Main[nameof<MainConfig>(s => s.ipcAckTimeout)]              = {types: ['number'],optional: true};
Main[nameof<MainConfig>(s => s.socketUpgradeTimeout)]       = {types: ['number',],optional: true};
Main[nameof<MainConfig>(s => s.pingInterval)]               = {types: ['number'],optional: true};
Main[nameof<MainConfig>(s => s.pingTimeout)]                = {types: ['number'],optional: true};
Main[nameof<MainConfig>(s => s.processTermTimeout)]         = {types: ['number'],optional: true};
Main[nameof<MainConfig>(s => s.propagateErrors)]            = {types: ['boolean'],optional: true};
Main[nameof<MainConfig>(s => s.propagateWarnings)]          = {types: ['boolean'],optional: true};
Main[nameof<MainConfig>(s => s.middlewareEmitWarnings)]     = {types: ['boolean'],optional: true};
Main[nameof<MainConfig>(s => s.rebootOnSignal)]             = {types: ['boolean'],optional: true};
Main[nameof<MainConfig>(s => s.downgradeToUser)]            = {types: ['boolean','string'],optional: true};
Main[nameof<MainConfig>(s => s.socketRoot)]                 = {types: ['string','null'],optional: true};
Main[nameof<MainConfig>(s => s.schedulingPolicy)]           = {types: ['string','null'],optional: true};
Main[nameof<MainConfig>(s => s.allowClientPublish)]         = {types: ['boolean'],optional: true};
Main[nameof<MainConfig>(s => s.tcpSynBacklog)]              = {types: ['object','boolean','string','null'],optional: true};
Main[nameof<MainConfig>(s => s.workerStatusInterval)]       = {types: ['number'],optional: true};
Main[nameof<MainConfig>(s => s.pubSubBatchDuration)]        = {types: ['number','null'],optional: true};

const StarterConfig: Structure = {};
ObjectUtils.addObToOb(StarterConfig,Main);
StarterConfig[nameof<StarterConfig>(s => s.rootPath)]      = {types: ['string'],optional: true};
StarterConfig[nameof<StarterConfig>(s => s.configs)]       = {types: ['string'],optional: true};
StarterConfig[nameof<StarterConfig>(s => s.mainConfig)]    = {types: ['string'],optional: true};
StarterConfig[nameof<StarterConfig>(s => s.appConfig)]     = {types: ['string'],optional: true};
StarterConfig[nameof<StarterConfig>(s => s.serviceConfig)] = {types: ['string'],optional: true};
StarterConfig[nameof<StarterConfig>(s => s.checkConfigs)]  = {types: ['boolean'],optional: true};

const allValidationTypes = ObjectUtils.getObjValues(ValidationType);
const allFormatLetters = ObjectUtils.getObjValues(FormatLetters);

const ValueModel: Structure = {};
ValueModel[nameof<ValueModelConfig>(s => s.isOptional)]   = {types: ['boolean'],optional: true};
ValueModel[nameof<ValueModelConfig>(s => s.default)]      = {types: ['string','array','number','boolean','object','function'],optional: true};
ValueModel[nameof<ValueModelConfig>(s => s.convert)]      = {types: ['function'],optional: true};
ValueModel[nameof<ValueModelConfig>(s => s.extends)]      = {types: ['string','object','function'],optional: true};
ValueModel[nameof<ValueModelConfig>(s => s.type)]         = {types: ['string','array'],optional: true,enum:allValidationTypes};
ValueModel[nameof<ValueModelConfig>(s => s.strictType)]   = {types: ['boolean'],optional: true};
ValueModel[nameof<ValueModelConfig>(s => s.convertType)]  = {types: ['boolean'],optional: true};
ValueModel[nameof<ValueModelConfig>(s => s.enum)]         = {types: ['array'],optional: true};
ValueModel[nameof<ValueModelConfig>(s => s.privateEnum)]  = {types: ['array'],optional: true};
ValueModel[nameof<ValueModelConfig>(s => s.minLength)]    = {types: ['number'],optional: true};
ValueModel[nameof<ValueModelConfig>(s => s.maxLength)]    = {types: ['number'],optional: true};
ValueModel[nameof<ValueModelConfig>(s => s.length)]       = {types: ['number'],optional: true};
ValueModel[nameof<ValueModelConfig>(s => s.contains)]     = {types: ['string','array'],optional: true};
ValueModel[nameof<ValueModelConfig>(s => s.equals)]       = {types: ['string','number','array','object','boolean','function'],optional: true};
ValueModel[nameof<ValueModelConfig>(s => s.minValue)]     = {types: ['number'],optional: true};
ValueModel[nameof<ValueModelConfig>(s => s.maxValue)]     = {types: ['number'],optional: true};
ValueModel[nameof<ValueModelConfig>(s => s.regex)]        = {types: ['string','object'],optional: true};
ValueModel[nameof<ValueModelConfig>(s => s.endsWith)]     = {types: ['string'],optional: true};
ValueModel[nameof<ValueModelConfig>(s => s.startsWith)]   = {types: ['string'],optional: true};
ValueModel[nameof<ValueModelConfig>(s => s.letters)]      = {types: ['string'],optional: true,enum:allFormatLetters};
ValueModel[nameof<ValueModelConfig>(s => s.charClass)]    = {types: ['string'],optional: true};
ValueModel[nameof<ValueModelConfig>(s => s.maxByteSize)]  = {types: ['number'],optional: true};
ValueModel[nameof<ValueModelConfig>(s => s.minByteSize)]  = {types: ['number'],optional: true};
ValueModel[nameof<ValueModelConfig>(s => s.mimeType)]     = {types: ['string','array','null'],optional: true};
ValueModel[nameof<ValueModelConfig>(s => s.mimeSubType)]  = {types: ['string','array','null'],optional: true};
ValueModel[nameof<ValueModelConfig>(s => s.before)]       = {types: ['object','function'],optional: true};
ValueModel[nameof<ValueModelConfig>(s => s.after)]        = {types: ['object','function'],optional: true};
ValueModel[nameof<ValueModelConfig>(s => s.validate)]     = {types: ['function','array'],optional: true};

const ZationChannelsConfig: Structure = {};
ZationChannelsConfig[nameof<ZationChannelsConfig>(s => s.userCh)]             = {types: ['object'],optional: true};
ZationChannelsConfig[nameof<ZationChannelsConfig>(s => s.authUserGroupCh)]    = {types: ['object'],optional: true};
ZationChannelsConfig[nameof<ZationChannelsConfig>(s => s.defaultUserGroupCh)] = {types: ['object'],optional: true};
ZationChannelsConfig[nameof<ZationChannelsConfig>(s => s.allCh)]              = {types: ['object'],optional: true};

const Service: Structure = {};
Service[nameof<Service<any,any>>(s => s.get)]               = {types: ['function'],optional: true};
Service[nameof<Service<any,any>>(s => s.create)]            = {types: ['function'],optional: false};
Service[nameof<Service<any,any>>(s => s.instances)]         = {types: ['object'],optional: true};

const PanelUserConfig: Structure = {};
PanelUserConfig[nameof<PanelUserConfig>(s => s.username)]     = {types: ['string'],optional: false};
PanelUserConfig[nameof<PanelUserConfig>(s => s.password)]     = {types: ['string'],optional: false};

const CustomChConfig: Structure = {};
CustomChConfig[nameof<BaseCustomChannelConfig>(s => s.clientPublishAccess)]      = {types: ['function','boolean','object','array','string'],optional: true};
CustomChConfig[nameof<BaseCustomChannelConfig>(s => s.subscribeAccess)]          = {types: ['function','boolean','object','array','string'],optional: true};
CustomChConfig[nameof<BaseCustomChannelConfig>(s => s.onClientPublish)]          = {types: ['function','array'],optional: true};
CustomChConfig[nameof<BaseCustomChannelConfig>(s => s.onBagPublish)]             = {types: ['function','array'],optional: true};
CustomChConfig[nameof<BaseCustomChannelConfig>(s => s.onSubscription)]           = {types: ['function','array'],optional: true};
CustomChConfig[nameof<BaseCustomChannelConfig>(s => s.onUnsubscription)]         = {types: ['function','array'],optional: true};
CustomChConfig[nameof<BaseCustomChannelConfig>(s => s.versionAccess)]            = {types: ['string','object'],optional: true};
CustomChConfig[nameof<BaseCustomChannelConfig>(s => s.systemAccess)]             = {types: ['array'],arrayType: 'string',optional: true};
CustomChConfig[nameof<ChannelSettings>(s => s.socketGetOwnPublish)]          = {types: ['boolean','array'],optional: true};

const CustomChFamilyConfig: Structure = {};
ObjectUtils.addObToOb(CustomChFamilyConfig,CustomChConfig);
CustomChFamilyConfig[nameof<CustomChFamily>(s => s.idValid)]          = {types: ['function'],optional: true};

const ZationChannelConfig: Structure = {};
ZationChannelConfig[nameof<ChannelSettings>(s => s.socketGetOwnPublish)]    = {types: ['boolean'],optional: true};
ZationChannelConfig[nameof<ZationChannelConfig>(s => s.onClientPublish)]    = {types: ['function','array'],optional: true};
ZationChannelConfig[nameof<ZationChannelConfig>(s => s.onBagPublish)]       = {types: ['function','array'],optional: true};
ZationChannelConfig[nameof<ZationChannelConfig>(s => s.onSubscription)]     = {types: ['function','array'],optional: true};
ZationChannelConfig[nameof<ZationChannelConfig>(s => s.onUnsubscription)]   = {types: ['function','array'],optional: true};
ZationChannelConfig[nameof<BaseCustomChannelConfig>(s => s.clientPublishAccess)]      = {types: ['function','boolean','object','array','string'],optional: true};

const ArrayShortCutSpecify: Structure = {};
ArrayShortCutSpecify[nameof<ArraySettings>(s => s.minLength)]         = {types: ['number'],optional: true};
ArrayShortCutSpecify[nameof<ArraySettings>(s => s.maxLength)]         = {types: ['number'],optional: true};
ArrayShortCutSpecify[nameof<ArraySettings>(s => s.length)]            = {types: ['number'],optional: true};
ArrayShortCutSpecify[nameof<ArraySettings>(s => s.isOptional)]        = {types: ['boolean'],optional: true};
ArrayShortCutSpecify[nameof<ValueModelConfig>(s => s.default)]        = {types: ['string','array','number','boolean','object','function'],optional: true};
ArrayShortCutSpecify[nameof<ArraySettings>(s => s.convert)]           = {types: ['function'],optional: true};

const ArrayModel: Structure = {};
ArrayModel[nameof<ArrayModelConfig>(s => s.array)]             = {types: ['object','string','array'],optional: true};
ArrayModel[nameof<ArrayModelConfig>(s => s.minLength)]         = {types: ['number'],optional: true};
ArrayModel[nameof<ArrayModelConfig>(s => s.maxLength)]         = {types: ['number'],optional: true};
ArrayModel[nameof<ArrayModelConfig>(s => s.length)]            = {types: ['number'],optional: true};
ArrayModel[nameof<ArrayModelConfig>(s => s.isOptional)]        = {types: ['boolean'],optional: true};
ArrayModel[nameof<ValueModelConfig>(s => s.default)]           = {types: ['string','array','number','boolean','object','function'],optional: true};
ArrayModel[nameof<ArrayModelConfig>(s => s.convert)]           = {types: ['function'],optional: true};

const AuthUserGroup: Structure = {};
AuthUserGroup[nameof<AuthUserGroupConfig>(s => s.panelAccess)]      = {types: ['boolean'],optional: true};
AuthUserGroup[nameof<AuthUserGroupConfig>(s => s.panelDisplayName)] = {types: ['string'],optional: true};

const Events: Structure = {};
Events[nameof<Events>(s => s.express)]                = {types: ['function','array'],arrayType: 'function',optional: true};
Events[nameof<Events>(s => s.socketServer)]           = {types: ['function','array'],arrayType: 'function',optional: true};
Events[nameof<Events>(s => s.workerInit)]             = {types: ['function','array'],arrayType: 'function',optional: true};
Events[nameof<Events>(s => s.masterInit)]             = {types: ['function','array'],arrayType: 'function',optional: true};
Events[nameof<Events>(s => s.workerStarted)]          = {types: ['function','array'],arrayType: 'function',optional: true};
Events[nameof<Events>(s => s.httpServerStarted)]      = {types: ['function','array'],arrayType: 'function',optional: true};
Events[nameof<Events>(s => s.wsServerStarted)]        = {types: ['function','array'],arrayType: 'function',optional: true};
Events[nameof<Events>(s => s.started)]                = {types: ['function','array'],arrayType: 'function',optional: true};
Events[nameof<Events>(s => s.error)]                  = {types: ['function','array'],arrayType: 'function',optional: true};
Events[nameof<Events>(s => s.backErrors)]             = {types: ['function','array'],arrayType: 'function',optional: true};
Events[nameof<Events>(s => s.codeError)]              = {types: ['function','array'],arrayType: 'function',optional: true};
Events[nameof<Events>(s => s.workerMessage)]          = {types: ['function','array'],arrayType: 'function',optional: true};

Events[nameof<Events>(s => s.socketInit)]              = {types: ['function','array'],arrayType: 'function',optional: true};
Events[nameof<Events>(s => s.socketConnection)]        = {types: ['function','array'],arrayType: 'function',optional: true};
Events[nameof<Events>(s => s.socketDisconnection)]     = {types: ['function','array'],arrayType: 'function',optional: true};
Events[nameof<Events>(s => s.socketAuthentication)]    = {types: ['function','array'],arrayType: 'function',optional: true};
Events[nameof<Events>(s => s.socketDeauthentication)]  = {types: ['function','array'],arrayType: 'function',optional: true};
Events[nameof<Events>(s => s.socketAuthStateChange)]   = {types: ['function','array'],arrayType: 'function',optional: true};
Events[nameof<Events>(s => s.socketSubscription)]      = {types: ['function','array'],arrayType: 'function',optional: true};
Events[nameof<Events>(s => s.socketUnsubscription)]    = {types: ['function','array'],arrayType: 'function',optional: true};
Events[nameof<Events>(s => s.socketError)]             = {types: ['function','array'],arrayType: 'function',optional: true};
Events[nameof<Events>(s => s.socketRaw)]               = {types: ['function','array'],arrayType: 'function',optional: true};
Events[nameof<Events>(s => s.socketConnectionAbort)]   = {types: ['function','array'],arrayType: 'function',optional: true};
Events[nameof<Events>(s => s.socketBadAuthToken)]      = {types: ['function','array'],arrayType: 'function',optional: true};


const Middleware: Structure = {};
Middleware[nameof<Middleware>(s => s.authenticate)] = {types: ['function','array'],optional: true};
Middleware[nameof<Middleware>(s => s.socket)]       = {types: ['function','array'],optional: true};
Middleware[nameof<Middleware>(s => s.panelAuth)]    = {types: ['function','array'],optional: true};

export const Structures = {
    App: App,
    BackgroundTask: BackgroundTask,
    ObjectModel: ObjectModel,
    ControllerConfig: ControllerConfig,
    DataboxConfig: DataboxConfig,
    Main: Main,
    StarterConfig: StarterConfig,
    ValueModel: ValueModel,
    ZationChannelsConfig: ZationChannelsConfig,
    Service: Service,
    CustomChConfig: CustomChConfig,
    CustomChFamilyConfig: CustomChFamilyConfig,
    ZationChannelConfig: ZationChannelConfig,
    ArrayModel: ArrayModel,
    ArrayShortCutSpecify: ArrayShortCutSpecify,
    Events: Events,
    Middleware: Middleware,
    PanelUserConfig: PanelUserConfig,
    AuthUserGroup: AuthUserGroup,
    AnyOf: AnyOf
};
