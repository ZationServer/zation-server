/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import RequestBag                                            from '../../../api/RequestBag';
import {ConfigNames, DefaultUserGroupFallBack, ZationAccess} from "../../constants/internal";
import BagExtension, {
    AppConfig,
} from "../definitions/appConfig";
import {PanelUserConfig}      from "../definitions/mainConfig";
import {MainService, Service} from "../definitions/serviceConfig";
import {
    BaseCustomChannelConfig,
    ZationChannelConfig
} from "../definitions/channelsConfig";
// noinspection TypeScriptPreferShortImport
import {ValidationType} from "../../constants/validationType";
import {
    OnlyBase64Functions,
    OnlyDateFunctions,
    OnlyNumberFunctions,
    OnlyStringFunctions,
    TypeTypes
} from "../../constants/validation";
import ModelResolveEngine    from "./modelResolveEngine";
import ConfigErrorBag       from "./configErrorBag";
import ConfigCheckerTools   from "./configCheckerTools";
import {Structures}         from "../definitions/structures";
import ConfigError          from "./configError";
import Target               from "./target";
import Logger               from "../../logger/logger";
import Bag                  from "../../../api/Bag";
import ObjectPath           from "../../utils/objectPath";
import Controller, {ControllerClass} from "../../../api/Controller";
import Iterator             from "../../utils/iterator";
import ObjectUtils          from "../../utils/objectUtils";
import ConfigLoader         from "../manager/configLoader";
import {isInputConfigTranslatable} from "../../../api/ConfigTranslatable";
import ResolveUtils                from "./resolveUtils";
import {
    AnyOfModelConfig,
    ArrayModelConfig,
    InputConfig,
    Model, ModelOptional,
    ObjectModelConfig, ParamInput, ValueModelConfig
} from "../definitions/inputConfig";
// noinspection TypeScriptPreferShortImport
import {ControllerConfig}                      from "../definitions/controllerConfig";
import {DataboxClassDef, DataboxConfig}        from "../definitions/databoxConfig";
import DataboxFamily                           from "../../../api/databox/DataboxFamily";
import Databox                                 from "../../../api/databox/Databox";
import {AuthAccessConfig, VersionAccessConfig} from "../definitions/configComponents";
import DbConfigUtils                           from "../../databox/dbConfigUtils";

export interface ModelCheckedMem {
    _checked : boolean
}

export default class ConfigChecker
{
    private readonly zcLoader: ConfigLoader;
    private readonly ceb: ConfigErrorBag;

    private modelsConfig: Record<string, Model>;
    private validAccessValues: any[];
    private bagExPropNames : string[] = [];
    private serviceNames : string[] = [];

    private modelImportEngine : ModelResolveEngine;

    constructor(zationConfigLoader, configErrorBag) {
        this.zcLoader = zationConfigLoader;
        this.ceb = configErrorBag;
    }

    public checkStarterConfig() {
        ConfigCheckerTools.assertStructure
        (Structures.StarterConfig, this.zcLoader.starterConfig,
            ConfigNames.STARTER, this.ceb);
    }

    public checkAllConfigs() {
        this.prepare();
        this.checkConfig();
    }

    private prepare() {
        this.prepareAllValidUserGroupsAndCheck();
        this.modelsConfig = typeof this.zcLoader.appConfig.models === 'object' ? this.zcLoader.appConfig.models : {};
        this.modelImportEngine = new ModelResolveEngine(this.modelsConfig);
    }

    private checkAppBagExtensions()
    {
        const appBagExtensions = this.zcLoader.appConfig.bagExtensions;
        if(Array.isArray(appBagExtensions)){
            for(let i = 0; i < appBagExtensions.length; i++) {
                this.checkBagExtension(
                    appBagExtensions[i],
                    new Target('BagExtensions').addPath('index ' + i.toString()),
                    ConfigNames.APP
                );
            }
        }
    }

    private checkBagExtension(extension : BagExtension,target : Target,configName : ConfigNames)
    {
        ConfigCheckerTools.assertStructure
        (Structures.BagExtension, extension, configName, this.ceb, target);

        const moduleBagExProps : string[] = [];

        if(typeof extension === 'object'){
            const reqBagExProps = extension.requestBag;
            if(typeof reqBagExProps === 'object') {
                for(let k in reqBagExProps){
                    if(reqBagExProps.hasOwnProperty(k)){
                        this.checkBagExtensionProp(k,reqBagExProps,false,configName,target);

                        if(!moduleBagExProps.includes(k)){moduleBagExProps.push(k);}
                    }
                }
            }
            const bagExProps = extension.bag;
            if(typeof bagExProps === 'object') {
                for(let k in bagExProps){
                    if(bagExProps.hasOwnProperty(k)){
                        this.checkBagExtensionProp(k,bagExProps,true,configName,target);

                        if(!moduleBagExProps.includes(k)){moduleBagExProps.push(k);}
                    }
                }
            }
            for(let i = 0; i < moduleBagExProps.length; i++) {
                if(this.bagExPropNames.includes(moduleBagExProps[i])){
                    this.ceb.addConfigError(new ConfigError(configName,
                        `${target.getTarget()} conflict with other bag extension, property name: ${moduleBagExProps[i]}.`));
                }
                this.bagExPropNames.push(moduleBagExProps[i]);
            }
        }
    }

    private checkBagExtensionProp
    (
        propName : string,
        exProps,
        isBag : boolean,
        configName : ConfigNames,
        target : Target
    )
    {
        if(isBag) {
            if(Bag.prototype.hasOwnProperty(propName)){
                this.ceb.addConfigError(new ConfigError(configName,
                    `${target.getTarget()} conflict with Bag property name: ${propName}.`));
            }
        }
        else {
            if(RequestBag.prototype.hasOwnProperty(propName)){
                this.ceb.addConfigError(new ConfigError(configName,
                    `${target.getTarget()} conflict with RequestBag property name: ${propName}.`));
            }

        }
        if(exProps[propName] === undefined){
            this.ceb.addConfigError(new ConfigError(configName,
                `${target.getTarget()} extension property '${propName}' is undefined.`));
        }
    }

    private checkUserGroupName(name: string, notAllowed: string[], isAuth: boolean) {
        if (name.indexOf('.') !== -1) {
            this.ceb.addConfigError(new ConfigError(ConfigNames.APP,
                `${name} is not a valid ${isAuth ? 'auth' : 'default'} user group! Dot/s in name are not allowed.`));
        }
        if (notAllowed.includes(name)) {
            this.ceb.addConfigError(new ConfigError(ConfigNames.APP,
                `${isAuth ? 'auth' : 'default'} user group with name ${name} is not allowed use an other name!`));
        }
    }

    private prepareAllValidUserGroupsAndCheck() {

        let groups: any = [];
        let extraKeys: any = [ZationAccess.ALL, ZationAccess.ALL_NOT_AUTH, ZationAccess.ALL_AUTH];

        if (typeof this.zcLoader.appConfig.userGroups === 'object') {
            if (typeof this.zcLoader.appConfig.userGroups.auth === 'object') {

                const authUserGroups = this.zcLoader.appConfig.userGroups.auth;
                groups = Object.keys(authUserGroups);

                //check auth user groups
                for (let aug in authUserGroups) {
                    if (authUserGroups.hasOwnProperty(aug)) {
                        this.checkUserGroupName(aug, extraKeys, true);
                        ConfigCheckerTools.assertStructure
                        (Structures.AuthUserGroup, authUserGroups[aug],
                            ConfigNames.APP, this.ceb, new Target(`Auth User Group: '${aug}'`));
                    }
                }
            }
            if (typeof this.zcLoader.appConfig.userGroups.default === 'string') {
                const defaultGroup = this.zcLoader.appConfig.userGroups.default;
                this.checkUserGroupName(defaultGroup, extraKeys, false);
                groups.push(defaultGroup);
            } else {
                Logger.printConfigWarning
                (ConfigNames.APP, `No settings for the default user group found! Default user group will be set to ${DefaultUserGroupFallBack}`);
                groups.push(DefaultUserGroupFallBack);
            }
        } else {
            Logger.printConfigWarning
            (ConfigNames.APP, `No settings for the user groups are found! DefaultUserGroup will be set to 'default'`);
        }

        this.validAccessValues = groups;
        this.validAccessValues.push(...extraKeys);
    }

    private checkConfig() {
        this.checkMainConfig();
        this.checkAppConfig();
        this.checkServiceConfig();
        this.checkEventConfig();
    }

    private checkAppConfig() {
        this.checkAccessControllerDefaultIsSet();
        this.checkAppConfigMain();
        this.checkModelsConfig();
        this.checkControllersConfigs();
        this.checkDataboxConfigs();
        this.checkAuthController();
        this.checkBackgroundTasks();
        this.checkAppBagExtensions();
        this.checkCustomChannelsDefaults();
        this.checkCustomChannels();
        this.checkZationChannels();
    }

    private checkBackgroundTasks() {
        const bkt = this.zcLoader.appConfig.backgroundTasks;
        if (typeof bkt === 'object') {
            for (let name in bkt) {
                if (bkt.hasOwnProperty(name)) {
                    ConfigCheckerTools.assertStructure
                    (Structures.BackgroundTask, bkt[name],
                        ConfigNames.APP, this.ceb, new Target(`BackgroundTask: '${name}'`));
                }
            }
        }
    }

    private checkAuthController() {
        const authControllerId = this.zcLoader.appConfig.authController;
        if (typeof authControllerId === "string") {
            const controller = this.zcLoader.appConfig.controllers || {};
            if (!controller.hasOwnProperty(authControllerId)) {
                this.ceb.addConfigError(new ConfigError(ConfigNames.APP,
                    `AuthController: '${authControllerId}' is not found.`));
            } else {
                //checkAuthControllerAccess value
                Iterator.iterateCompDefinition<ControllerClass>(controller[authControllerId],(controllerClass, apiLevel) => {
                    if (controllerClass.config.access !== ZationAccess.ALL) {
                        Logger.printConfigWarning
                        (ConfigNames.APP, `It is recommended to set the access of the authController ${apiLevel ? `(API Level: ${apiLevel}) ` : ''}directly to 'all'.`);
                    }
                });
            }
        }
    }

    private checkEventConfig() {
        ConfigCheckerTools.assertStructure
        (Structures.EventConfig, this.zcLoader.eventConfig, ConfigNames.EVENT, this.ceb);
    }

    private checkCustomChannelsDefaults(){
        const customChannelsDefaults = this.zcLoader.appConfig.customChannelDefaults;
        if(typeof customChannelsDefaults === 'object'){
            this.checkCustomChannelConfig(customChannelsDefaults, new Target('Custom channel defaults: ') , false);
        }
    }

    private checkCustomChannels() {
        const customChannels = this.zcLoader.appConfig.customChannels;
        if(typeof customChannels === 'object'){
            const target = new Target('Custom Channels: ');

            for(let key in customChannels){
                if(customChannels.hasOwnProperty(key)){

                    const secTarget = target.addPath(key);

                    let value : any = customChannels[key];
                    let isFamily = false;

                    if(Array.isArray(value)){
                        if(value.length > 1){
                            this.ceb.addConfigError(new ConfigError(ConfigNames.APP,
                                `${secTarget.getTarget()} to define a custom channel family, the array should only contain one or zero elements.`));
                        }
                        value = value[0] || {};
                        isFamily = true;
                    }

                    this.checkCustomName(key,'Custom channel name',target.getTarget() + ' ');
                    this.checkCustomChannelConfig(value, secTarget, isFamily);
                }
            }
        }
    }

    private checkZationChannels() {
        const zationChannels = this.zcLoader.appConfig.zationChannels;

        if(typeof zationChannels === 'object'){
            const target = new Target('Zation Channels: ');

            ConfigCheckerTools.assertStructure
            (Structures.ZationChannelsConfig, zationChannels, ConfigNames.APP, this.ceb,target);

            for(let key in zationChannels){
                if(zationChannels.hasOwnProperty(key)){
                    this.checkZationChannelConfig(zationChannels[key],target.addPath(key));
                }
            }
        }
    }

    private checkClientPubAccess(channel : ZationChannelConfig,target : Target) {
        if (channel.clientPublishAccess !== undefined && channel.clientPublishNotAccess !== undefined) {
            this.ceb.addConfigError(new ConfigError(ConfigNames.APP,
                `${target.getTarget()} only 'publishAccess' or 'publishNotAccess' keyword is allow.`));
        }

        //check protocolAccess dependency to userGroups
        this.checkAccessKeyDependency
        (channel.clientPublishAccess, nameof<ZationChannelConfig>(s => s.clientPublishAccess), target);
        this.checkAccessKeyDependency
        (channel.clientPublishNotAccess, nameof<ZationChannelConfig>(s => s.clientPublishNotAccess), target);

        this.warningForPublish(channel.clientPublishAccess, target);
        this.warningForPublish(channel.clientPublishNotAccess, target, true);
    }

    private checkSubAccess(channel : BaseCustomChannelConfig, target : Target) {
        if (channel.subscribeAccess !== undefined && channel.subscribeNotAccess !== undefined) {
            this.ceb.addConfigError(new ConfigError(ConfigNames.APP,
                `${target.getTarget()} only 'subscribeAccess' or 'subscribeNotAccess' keyword is allow.`));
        }

        //check protocolAccess dependency to userGroups
        this.checkAccessKeyDependency
        (channel.subscribeAccess, nameof<BaseCustomChannelConfig>(s => s.subscribeAccess), target);
        this.checkAccessKeyDependency
        (channel.subscribeNotAccess, nameof<BaseCustomChannelConfig>(s => s.subscribeNotAccess), target);
    }


    private checkZationChannelConfig(channel : ZationChannelConfig,target : Target) {
        ConfigCheckerTools.assertStructure
        (Structures.ZationChannelConfig,channel, ConfigNames.APP, this.ceb, target);
        if(typeof channel === 'object'){
            this.checkClientPubAccess(channel,target);
        }
    }

    private checkCustomChannelConfig(channel: BaseCustomChannelConfig, target: Target, isCustomChFamily : boolean): void {
        ConfigCheckerTools.assertStructure
        (isCustomChFamily ? Structures.CustomChFamilyConfig : Structures.CustomChConfig, channel, ConfigNames.APP, this.ceb, target);

        if (typeof channel === 'object') {
            this.checkClientPubAccess(channel,target);
            this.checkSubAccess(channel,target);
        }
    }

    // noinspection JSMethodCanBeStatic
    private warningForPublish(value: any, target: Target, convert: boolean = false): void {
        if (value !== undefined && (typeof value !== "boolean" || (convert ? !value : value))) {
            Logger.printConfigWarning
            (ConfigNames.APP,
                `${target.getTarget()} please notice that 'clientPubAccess' is used when a client publishes from outside in a channel! ` +
                `That is only useful for advanced use cases otherwise its recommended to use a controller (with validation) and publish from the server side.`);
        }
    }


    private checkAccessControllerDefaultIsSet() {
        let access = ObjectPath.get(this.zcLoader.appConfig,
            [nameof<AppConfig>(s => s.controllerDefaults), nameof<ControllerConfig>(s => s.access)]);

        let notAccess = ObjectPath.get(this.zcLoader.appConfig,
            [nameof<AppConfig>(s => s.controllerDefaults), nameof<ControllerConfig>(s => s.notAccess)]);

        if (access === undefined && notAccess === undefined) {
            Logger.printConfigWarning(ConfigNames.APP, 'It is recommended to set a controller default value for access or notAccess.');
        }
    }

    private checkModelsConfig() {
        for (let name in this.modelsConfig) {
            if (this.modelsConfig.hasOwnProperty(name)) {
                this.checkCustomName(name,'model','Models: ');

                const model = this.modelsConfig[name];

                // noinspection SuspiciousTypeOfGuard
                if(Array.isArray(model) || typeof model === 'object' || typeof model === 'string') {
                    const target = new Target(`Models: ${name}`);
                    this.checkModel(model,target,true);
                    this.circularCheck(model,target,{name : name,model,isObj : ConfigChecker.isObjModel(model)});
                }
                else {
                    this.ceb.addConfigError(new ConfigError(ConfigNames.APP,
                        `Models: '${name}' value must be an object, array or string!`));
                }
            }
        }
    }

    private checkObject(obj: ObjectModelConfig, target: Target,mainModel : boolean,inheritanceCheck : boolean = true) {
        ConfigCheckerTools.assertStructure(Structures.ObjectModel, obj, ConfigNames.APP, this.ceb, target);
        const prototype = typeof obj.prototype === 'object' ? obj.prototype : {};
        //check property body and prototype property name problem
        if (typeof obj.properties === 'object') {
            let props = obj.properties;
            for (let k in props) {
                if (props.hasOwnProperty(k)) {
                    this.checkCustomName(k,'property',target.getTarget()+' ');
                    this.checkModel(props[k], target.addPath(k));
                    if (prototype.hasOwnProperty(k)) {
                        Logger.printConfigWarning(
                            ConfigNames.APP,
                            `${target.getTarget()} Property '${k}' will shadowing the prototype property '${k}'.`);
                    }
                }
            }
        }
        //check for extend
        if (obj.extends !== undefined && inheritanceCheck) {
            this.checkObjExtendResolve
            (target,target,obj.extends,obj,{otherSrc : [], regModel : mainModel,baseModelLevel : true});
        }
    }

    private static isObjModel(obj : any) : boolean {
        return typeof obj === 'object' && typeof obj[nameof<ObjectModelConfig>(s => s.properties)] === 'object';
    }

    private static isValueModel(obj : any) : obj is ValueModelConfig {
        return typeof obj === 'object' &&
            obj[nameof<ObjectModelConfig>(s => s.properties)] === undefined &&
            obj[nameof<ArrayModelConfig>(s => s.array)] === undefined &&
            obj[nameof<AnyOfModelConfig>(s => s.anyOf)] === undefined;
    }

    // @ts-ignore
    // noinspection JSUnusedLocalSymbols
    private static isArrayModel(arr : any) : boolean {
        return Array.isArray(arr) || (
            typeof arr === 'object' &&
            typeof arr[nameof<ArrayModelConfig>(s => s.array)] === 'object'
        );
    }

    /**
     * Check object inheritance that also can include
     * new anonymous object models or already checked object models.
     * @param target
     * @param srcTarget
     * @param value
     * @param srcObjModel
     * @param processInfo
     * @param beforeReqModel
     */
    private checkObjExtendResolve(target : Target,srcTarget : Target,value : any,srcObjModel : ObjectModelConfig,
                                         processInfo : {otherSrc : any[], baseModelLevel : boolean,regModel : boolean},beforeReqModel : boolean = false) : void
    {
        const valueType = typeof value;
        if(valueType === 'string'){
            if(this.modelsConfig.hasOwnProperty(value)){
                target = target.addPath(`extends=>${value}`);
                processInfo.baseModelLevel = false;
                this.checkObjExtendResolve(target,srcTarget,this.modelsConfig[value],srcObjModel,processInfo,true);
            }
            else {
                if(processInfo.baseModelLevel){
                    this.ceb.addConfigError(new ConfigError(ConfigNames.APP,
                        `${target.getTarget()} the inheritance dependency to object model: '${value}' can not be resolved, Object model not found.`));
                }
                return;
            }
        }
        else if(valueType === 'object' || valueType === 'function') {
            const res = ResolveUtils.modelResolveCheck(value);
            if(typeof res === "string"){
                this.checkObjExtendResolve(target,srcTarget,res,srcObjModel,processInfo);
            }
            else {
                if(!beforeReqModel){
                    target = target.addPath(`extends=>AnonymousModel`);
                }

                if(!ConfigChecker.isObjModel(res)){
                    if(processInfo.baseModelLevel){
                        this.ceb.addConfigError(new ConfigError(ConfigNames.APP,
                            `${target.getTarget()} an object model can only extend an object model.`));
                    }
                    return;
                }
                else {
                    const sameModelBase = res === srcObjModel;
                    if(processInfo.otherSrc.includes(res) || sameModelBase){
                        if(processInfo.baseModelLevel || sameModelBase){
                            this.ceb.addConfigError(new ConfigError(ConfigNames.APP,
                                `${target.getTarget()} creates a circular inheritance.`));
                        }
                    }
                    else {
                        processInfo.otherSrc.push(res);
                        this.checkOverrideProp(srcObjModel.properties,res,target,srcTarget);

                        //Check only new anonymous object models.
                        if(processInfo.baseModelLevel && !(res as ModelCheckedMem)._checked){
                            this.checkObject(res,target,false,false);
                            (res as ModelCheckedMem)._checked = true;
                        }

                        if(res.extends !== undefined){
                            this.checkObjExtendResolve(target,srcTarget,res.extends,srcObjModel,processInfo);
                        }
                    }
                }
            }
        }
    }

    // noinspection JSMethodCanBeStatic
    private checkOverrideProp(props,superObj,target : Target,srcTarget : Target) {
        if (typeof props === 'object' && typeof superObj.prototype === 'object') {
            const superPrototype = superObj.prototype;
            for (let prop in props) {
                if (props.hasOwnProperty(prop)) {
                    if (superPrototype.hasOwnProperty(prop)) {
                        Logger.printConfigWarning(
                            ConfigNames.APP,
                            `${srcTarget.getTarget()} Property '${prop}' is shadowing an inherited prototype property '${prop}' from ${target.getPath()}.`);
                    }
                }
            }
        }
    }

    private checkAppConfigMain() {
        ConfigCheckerTools.assertStructure(Structures.App, this.zcLoader.appConfig, ConfigNames.APP, this.ceb);
    }

    private checkMainConfig() {
        //checkStructure
        ConfigCheckerTools.assertStructure(Structures.Main, this.zcLoader.mainConfig, ConfigNames.MAIN, this.ceb);
        this.checkPanelUserMainConfig();
        this.checkOrigins();
        this.checkDefaultClientApiLevel();
    }

    private checkDefaultClientApiLevel()
    {
        if(this.zcLoader.mainConfig.defaultClientApiLevel) {
            if(!Number.isInteger(this.zcLoader.mainConfig.defaultClientApiLevel)){
                this.ceb.addConfigError(new ConfigError(ConfigNames.MAIN,
                    `The defaultClientApiLevel must be an integer.`));
            }
            if(this.zcLoader.mainConfig.defaultClientApiLevel < 1){
                this.ceb.addConfigError(new ConfigError(ConfigNames.MAIN,
                    `The defaultClientApiLevel cannot be lesser than one..`));
            }
        }
    }

    private checkOrigins()
    {
        if(Array.isArray(this.zcLoader.mainConfig.origins)) {
            this.zcLoader.mainConfig.origins.forEach(((o,i) => {
                // for javascript version
                // noinspection SuspiciousTypeOfGuard
                if(typeof o !== 'string'){
                    this.ceb.addConfigError(new ConfigError(ConfigNames.MAIN,
                        `Origin: '${i}' must be a string.`));
                }
            }));
        }
    }

    private checkPanelUserMainConfig() {
        const panelUserConfig = this.zcLoader.mainConfig.panelUser;
        let hasOneUser = false;
        if (Array.isArray(panelUserConfig)) {
            for (let i = 0; i < panelUserConfig.length; i++) {
                hasOneUser = true;
                this.checkPanelUserConfig(panelUserConfig[i], new Target(`Panel UserConfig '${i}'`));
            }
        } else if (typeof panelUserConfig === 'object') {
            hasOneUser = true;
            this.checkPanelUserConfig(panelUserConfig, new Target(`Panel UserConfig`));
        }

        if (this.zcLoader.mainConfig.usePanel && !hasOneUser) {
            Logger.printConfigWarning
            (
                ConfigNames.MAIN,
                `The zation panel is activated but no panelUser is defined in the main config.`
            );
        }

    }

    private checkPanelUserConfig(config: PanelUserConfig, target : Target) {
        //checkStructure
        ConfigCheckerTools.assertStructure(Structures.PanelUserConfig, config, ConfigNames.MAIN, this.ceb, target);

        // for javascript version
        // noinspection SuspiciousTypeOfGuard
        if(typeof config.password === 'string' && config.password.length < 4) {
            this.ceb.addConfigError(new ConfigError(ConfigNames.APP,
                `${target.getTarget()} panel user password must be at least 4 characters long.`));
        }

        // for javascript version
        // noinspection SuspiciousTypeOfGuard
        if(typeof config.username === 'string' && config.username.length < 1) {
            this.ceb.addConfigError(new ConfigError(ConfigNames.APP,
                `${target.getTarget()} panel username must be at least 1 character long.`));
        }

        if (config.password === 'admin' &&
            config.username === 'admin' &&
            this.zcLoader.mainConfig.usePanel) {
            Logger.printConfigWarning
            (ConfigNames.MAIN, `Don't forget to change the panel access credentials in the main configuration.`);
        }

        // for javascript version
        // noinspection SuspiciousTypeOfGuard
        if(typeof config.username === 'string' && config.username !== 'admin' &&
        config.password.toLocaleUpperCase().indexOf(config.username.toLocaleLowerCase()) !== -1) {
            Logger.printConfigWarning
            (ConfigNames.MAIN, `Please choose a more secure password (that not contains the username).`);
        }
    }

    private checkServiceConfig() {
        //checkStructure
        ConfigCheckerTools.assertStructure
        (Structures.ServiceConfig, this.zcLoader.serviceConfig, ConfigNames.SERVICE, this.ceb);
        //check Services
        this.checkServices();
        //check load Services
        this.checkServiceModules();
    }

    private checkServiceModules()
    {
        const ls = this.zcLoader.serviceConfig.serviceModules;
        //check custom services
        if (Array.isArray(ls)) {
            ls.forEach((c,i) => {

                ConfigCheckerTools.assertStructure
                (Structures.serviceModule, c, ConfigNames.SERVICE, this.ceb, new Target('Service Module index: ' + i));

               // for javascript version
               // noinspection SuspiciousTypeOfGuard
                if(typeof c.serviceName === 'string') {
                   this.checkService(c.serviceName,c.service,'Service Module');

                   this.checkBagExtension(
                       c.bagExtensions,
                       new Target(`Service Module: '${c.serviceName}' bag extension ->`),
                       ConfigNames.SERVICE
                   );
               }
            });
        }
    }

    private checkService(serviceName : string,config : MainService<any,any,any>,targetName : string = 'Service')
    {
        if(this.serviceNames.includes(serviceName)) {
            this.ceb.addConfigError(new ConfigError(ConfigNames.APP,
                `Service key: '${serviceName}' is duplicated.`));
        }

        this.serviceNames.push(serviceName);
        this.checkCustomName(serviceName,targetName);


        if (typeof config === 'object') {
            //check custom services structure
            let service = config;
            let target = new Target(`${targetName}: '${serviceName}'`);

            //check create and get
            ConfigCheckerTools.assertProperty
            (
                nameof<Service>(s => s.get),
                service,
                'function',
                true,
                ConfigNames.SERVICE,
                this.ceb,
                target
            );
            ConfigCheckerTools.assertProperty
            (
                nameof<Service>(s => s.create),
                service,
                'function',
                false,
                ConfigNames.SERVICE,
                this.ceb,
                target
            );

            for (let k in service) {
                if (service.hasOwnProperty(k)) {
                    if (k === nameof<Service>(s => s.get) ||
                        k === nameof<Service>(s => s.create)) {
                        continue;
                    }
                    ConfigCheckerTools.assertProperty
                    (
                        k,
                        service,
                        'object',
                        true,
                        ConfigNames.SERVICE,
                        this.ceb,
                        target
                    );
                }
            }
        }
        else{
            this.ceb.addConfigError(new ConfigError(ConfigNames.APP,
                `${targetName}: '${serviceName}' must to be an object.`));
        }
    }

    private checkServices() {
        const cs = this.zcLoader.serviceConfig.services;
        //check custom services
        if (typeof cs === 'object') {
            for (let serviceName in cs) {
                if (cs.hasOwnProperty(serviceName)) {
                    this.checkService(serviceName,cs[serviceName]);
                }
            }
        }
    }

    private checkControllersConfigs() {
        //check Controllers
        if (typeof this.zcLoader.appConfig.controllers === 'object') {
            const controller = this.zcLoader.appConfig.controllers;
            for (let cId in controller) {
                if (controller.hasOwnProperty(cId)) {
                    Iterator.iterateCompDefinition<ControllerClass>(controller[cId],(controllerClass,apiLevel) =>{
                        if(apiLevel !== undefined && isNaN(parseInt(apiLevel))) {
                            this.ceb.addConfigError(new ConfigError(ConfigNames.APP,
                                `Controller: '${cId}' the API level must be an integer. The value ${apiLevel} is not allowed.`));
                        }
                        this.checkController(controllerClass, new Target(`Controller: '${cId}' ${apiLevel ? `(API Level: ${apiLevel}) ` : ''}`));
                    });
                }
            }
        }

        //check controllerDefault
        if (typeof this.zcLoader.appConfig.controllerDefaults === 'object') {
            const controller = this.zcLoader.appConfig.controllerDefaults;
            this.checkControllerConfig(controller, new Target(nameof<AppConfig>(s => s.controllerDefaults)));
        }

    }

    private checkDataboxConfigs() {
        //check Databoxes
        if (typeof this.zcLoader.appConfig.databoxes === 'object') {
            const databoxes = this.zcLoader.appConfig.databoxes;
            for (let cId in databoxes) {
                if (databoxes.hasOwnProperty(cId)) {
                    Iterator.iterateCompDefinition<DataboxClassDef>(databoxes[cId],(databoxClass, apiLevel) =>{
                        if(apiLevel !== undefined && isNaN(parseInt(apiLevel))) {
                            this.ceb.addConfigError(new ConfigError(ConfigNames.APP,
                                `Databox: '${cId}' the API level must be an integer. The value ${apiLevel} is not allowed.`));
                        }
                        this.checkDatabox(databoxClass, new Target(`Databox: '${cId}' ${apiLevel ? `(API Level: ${apiLevel}) ` : ''}`));
                    });
                }
            }
        }

        //check Databox defaults
        if (typeof this.zcLoader.appConfig.databoxDefaults === 'object') {
            const databox = this.zcLoader.appConfig.databoxDefaults;
            this.checkDataboxConfig(databox, new Target(nameof<AppConfig>(s => s.databoxDefaults)));
        }

    }

    // noinspection JSMethodCanBeStatic
    private checkVersionAccessConfig(cc: VersionAccessConfig, target: Target) {
        if (typeof cc.versionAccess === 'object' &&
            Object.keys(cc.versionAccess).length === 0) {
            Logger.printConfigWarning(
                ConfigNames.APP,
                target.getTarget() + ' It is recommended that versionAccess has at least one system!'
            );
        }

    }

    private checkController(cv: ControllerClass, target: Target) {
        if(cv.prototype instanceof Controller) {
            this.checkControllerConfig(cv.config,target);
        }
        else {
            this.ceb.addConfigError(new ConfigError(ConfigNames.APP,
                `${target.getTarget()} is not extends the main Controller class.`));
        }
    }

    private checkControllerConfig(config : ControllerConfig,target : Target)
    {
        ConfigCheckerTools.assertStructure(Structures.ControllerConfig, config, ConfigNames.APP, this.ceb, target);
        this.checkAuthAccessConfig(config, target);
        this.checkInputConfig(config,target.addPath('input'));
        this.checkVersionAccessConfig(config, target);
    }

    private checkDatabox(cdb: DataboxClassDef, target: Target) {
        if(cdb.prototype instanceof DataboxFamily || cdb.prototype instanceof Databox) {
            this.checkDataboxConfig(cdb.config,target);
        }
        else {
            this.ceb.addConfigError(new ConfigError(ConfigNames.APP,
                `${target.getTarget()} is not extends the main Databox or DataIdBox class.`));
        }
    }

    private checkDataboxConfig(config : DataboxConfig, target : Target)
    {
        ConfigCheckerTools.assertStructure(Structures.DataboxConfig, config, ConfigNames.APP, this.ceb, target);

        if(typeof config.maxSocketInputChannels === 'number' && config.maxSocketInputChannels <= 0){
            this.ceb.addConfigError(new ConfigError(ConfigNames.APP,
                `${target.getTarget()} the maximum socket input channels must be greater than 0.`));
        }

        this.checkAuthAccessConfig(config, target);

        this.checkInputConfig(DbConfigUtils.convertDbInitInput(config),
            target.addPath('initInput'),'Init');

        this.checkInputConfig(DbConfigUtils.convertDbFetchInput(config),
            target.addPath('fetchInput'),'Fetch');

        this.checkVersionAccessConfig(config, target);
    }

    // noinspection JSMethodCanBeStatic
    private checkInputAllAllow(inputConfig: InputConfig, target: Target,inputTypeName : string = '') {
        if (typeof inputConfig.allowAnyInput === 'boolean' &&
            inputConfig.allowAnyInput &&
            (typeof inputConfig.input === 'object')) {
            Logger.printConfigWarning(
                ConfigNames.APP,
                `${target.getTarget()} is ignored with allowAny${inputTypeName}Input true.`
            );
        }
    }

    /**
     * Checks an input config.
     * @param inputConfig
     * @param target
     * @param inputTypeName
     * The input type starting with upper case letter.
     */
    private checkInputConfig(inputConfig : InputConfig, target : Target,inputTypeName : string = '') {
        /**
         * Check main structure with structure of controller or stream.
         */
        if(inputConfig.input){
            let input = inputConfig.input;
            if(isInputConfigTranslatable(input)){
                input = input.__toInputConfig();
            }

            if(Array.isArray(input)){
                if(input.length === 1){
                    this.checkSingleInput(input[0],target);
                }
                else {
                    this.ceb.addConfigError(new ConfigError(ConfigNames.APP,
                        `${target.getTarget()} to define a single input model the array must have exactly one item.`));
                }
            }
            else {
                // @ts-ignore
                this.checkParamInput(input,target);
            }
        }
        this.checkInputAllAllow(inputConfig, target,inputTypeName);
    }

    private checkParamInput(paramInput : ParamInput, target : Target) {
        const keys: any[] = [];
        if (typeof paramInput === 'object') {
            for (let k in paramInput) {
                if (paramInput.hasOwnProperty(k)) {
                    if(!isNaN(parseInt(k))){
                        this.ceb.addConfigError(new ConfigError(ConfigNames.APP,
                            `${target.getTarget()} numeric key ${k} is not allowed in a param based input config because it changes the key order in a for in loop.`));
                    }
                    keys.push(k);
                    this.checkCustomName(k,'input property',target.getTarget() + ' ');
                    this.checkModel(paramInput[k], target.addPath(k));
                }
            }
            this.checkOptionalRecommendation(keys, paramInput, target);
        }
    }

    private checkSingleInput(singleInput : Model,target : Target) {
        this.checkModel(singleInput,target);
    }

    // noinspection JSMethodCanBeStatic
    private checkOptionalRecommendation(keys: string[], input: ParamInput, target: Target) {
        let wasLastOptional = false;
        for (let i = keys.length - 1; i >= 0; i--) {
            if (input[keys[i]][nameof<ValueModelConfig>(s => s.isOptional)] !== undefined &&
                input[keys[i]][nameof<ValueModelConfig>(s => s.isOptional)]) {
                if ((keys.length - 1) !== i && !wasLastOptional) {
                    Logger.printConfigWarning(
                        ConfigNames.APP,
                        `${target.getTarget()} input: '${keys[i]}', It is recommended to set the optional parameters at the first input level at the end.`
                    );
                    break;
                }
                wasLastOptional = true;
            } else {
                wasLastOptional = false;
            }
        }
    }

    private checkLink(link : string,target : Target)
    {
        if(ModelResolveEngine.correctSyntax(link)) {
            let {exist,name,linkedValue,isOp} = this.modelImportEngine.peakCheck(link);
            if(!exist) {
                this.ceb.addConfigError(new ConfigError(ConfigNames.APP,
                    `${target.getTarget()} the link dependency to model: '${name}' can not be resolved, model not found.`));
            }
            else {
                /*
                Check if the array content is set to optional.
                 */
                try {
                    if(typeof linkedValue === "string"){
                        isOp = this.modelImportEngine.fullCheckIsOp(linkedValue);
                    }
                    if(isOp !== null){
                        this.checkOptionalArrayWarning(isOp,target);
                    }
                }
                catch (e) {}
            }
        }
        else {
            this.ceb.addConfigError(new ConfigError(ConfigNames.APP,
                `${target.getTarget()} the link dependency definition '${link}' has syntax errors.`))
        }
    }



    private checkArrayShortCut(value, target: Target) {
        if (value.length === 0) {
            this.ceb.addConfigError(new ConfigError(ConfigNames.APP,
                `${target.getTarget()} you have to specify an model link (string) or an anonymous model (object) or an new array shortcut.`));
        } else if (value.length === 1) {
            this.checkModel(value[0], target.addPath('ArrayItem'));
        } else if (value.length === 2) {
            let newTarget = target.setExtraInfo('Array Shortcut Element 2');
            if (typeof value[1] !== 'object') {
                this.ceb.addConfigError(new ConfigError(ConfigNames.APP,
                    `${newTarget.getTarget()} the second shortCut item should be from typ object and can specify the array. Given typ is: '${typeof value[1]}'`));
            } else {
                this.checkOptionalArrayWarning(value,target);
                ConfigCheckerTools.assertStructure(Structures.ArrayShortCutSpecify, value[1], ConfigNames.APP, this.ceb, newTarget);
            }

            this.checkModel(value[0], target.addPath('ArrayItem'));
        } else {
            this.ceb.addConfigError(new ConfigError(ConfigNames.APP,
                `${target.getTarget()} invalid shortCut length: '${value.length}', 2 values are valid. First specify content and second to specify array.`));
        }
    }

    /**
     * @description
     * Check for circular links in the models.
     * Only for import of models and object extensions.
     * @param value
     * @param target
     * @param mainSrc
     * name -> name of the main src
     * isObj -> true indicates model is an object model and false indicates unknown type.
     * @param processInfo
     */
    private circularCheck(value,target,mainSrc : {name : string,model : Model,isObj : boolean},
                          processInfo : {inBaseModel : boolean,models : any[],ex : any[]} = {inBaseModel : true,models : [],ex:[]})
    {
        value = ResolveUtils.modelResolveCheck(value);

        if (typeof value === 'string') {
            processInfo.inBaseModel = false;
            if(ModelResolveEngine.correctSyntax(value)) {
                const {exist,linkedValue,name} = this.modelImportEngine.peakCheck(value);
                /*
                Check only basename is not included in the import chain.
                A -> B Ok
                B -> C Ok
                C -> D NotOk
                D -> C NotOk
                Abort check if we detect an repeat of import.
                 */
                /**
                 * Protects against
                 * 'A' -> 'A'
                 */
                if(name === mainSrc.name || linkedValue === mainSrc.model){
                    this.ceb.addConfigError(new ConfigError(ConfigNames.APP,
                        `${target.getTarget()} creates a circular import.`));
                }
                else if(exist && !processInfo.models.includes(name)) {
                    processInfo.models.push(name);
                    this.circularCheck(linkedValue,target.addPath(`import-model=>${name}`),mainSrc,processInfo);
                }
            }
        } else if (Array.isArray(value)) {
            //array model
            if(value.length > 0){
                this.circularCheck(value[0], target.addPath('ArrayItem'), mainSrc,processInfo);
            }
        } else if (typeof value === "object") {
            if(processInfo.inBaseModel && processInfo.models.includes(value)){
                this.ceb.addConfigError(new ConfigError(ConfigNames.APP,
                    `${target.getTarget()} creates a circular import.`));
                return;
            }
            processInfo.models.push(value);

            if (typeof value[nameof<ObjectModelConfig>(s => s.properties)] === 'object') {
                //object model
                this.circularObjectCheck(value,target,[],mainSrc,processInfo);
            } else if (typeof value[nameof<ArrayModelConfig>(s => s.array)] === 'object') {
                //array model
                const inArray = value[nameof<ArrayModelConfig>(s => s.array)];
                this.circularCheck(inArray,target.addPath('ArrayItem'), mainSrc,processInfo);
            } else if(value.hasOwnProperty(nameof<AnyOfModelConfig>(s => s.anyOf)))
            {
                //any of model
                const anyOf = value[nameof<AnyOfModelConfig>(s => s.anyOf)];
                if(typeof anyOf === 'object' || Array.isArray(anyOf)) {
                    Iterator.iterateSync((key,value) => {
                        this.circularCheck(value,target.addPath(key),mainSrc,processInfo);
                    },anyOf);
                }
            }
        }
    }

    circularObjectCheck(value,target,excludeProps : string[],mainSrc : {name : string,model,isObj : boolean},
                        processInfo : {models : any[],inBaseModel : boolean,ex : any[]})
    {
        const props = value[nameof<ObjectModelConfig>(s => s.properties)];

        //ex check
        const extend = value[nameof<ObjectModelConfig>(s => s.extends)];

        let extendExists = false;
        let extendValue;
        const extendType = typeof extend;
        let extendPathAdd;
        if(extendType === 'string'){
            if(this.modelsConfig[extend] !== undefined){
                extendValue = this.modelsConfig[extend];
                extendExists = true;
                extendPathAdd = `extends=>${extend}`;
            }
        }
        else if(extendType === 'object' || extendType === 'function'){
            extendExists = true;
            extendValue = ResolveUtils.modelResolveCheck(extend);
            if(typeof extendValue === 'string'){
                extendPathAdd = `extends=>${extendValue}`
            }
            else {
                extendPathAdd = `extends=>AnonymousModel`
            }
        }

        if(extendExists && !processInfo.ex.includes(extendValue)
            && mainSrc.name !== extendValue && mainSrc.model !== extendValue)
        {
            processInfo.ex.push(extendValue);
            this.circularObjectCheck(extendValue,target.addPath(extendPathAdd),Object.keys(props),mainSrc,processInfo);
        }

        if(typeof props === 'object') {
            for(let propName in props){
                if(props.hasOwnProperty(propName) && !excludeProps.includes(propName)) {
                    this.circularCheck(props[propName],target.addPath(propName), mainSrc,processInfo);
                }
            }
        }
    }

    /**
     * @description
     * Check model.
     * (checks also for value circle extensions)
     * @param value
     * @param target
     * @param mainModel
     */
    private checkModel(value, target,mainModel : boolean = false) {

        value = ResolveUtils.modelResolveCheck(value);

        if (typeof value === 'string') {
            //model link
           this.checkLink(value,target);
        } else if (Array.isArray(value)) {
            //model array short cut
            this.checkArrayShortCut(value, target);
        } else if (typeof value === "object") {

            if((value as ModelCheckedMem)._checked){
                return;
            }

            this.checkOptionalArrayWarning(value,target);
            //check input
            if (value.hasOwnProperty(nameof<ObjectModelConfig>(s => s.properties))) {
                //is object model
                this.checkObject(value, target, mainModel);
            } else if (value.hasOwnProperty(nameof<ArrayModelConfig>(s => s.array))) {
                //is array model
                ConfigCheckerTools.assertStructure(Structures.ArrayModel, value, ConfigNames.APP, this.ceb, target);
                if (typeof value[nameof<ArrayModelConfig>(s => s.array)] === 'object') {
                    const inArray = value[nameof<ArrayModelConfig>(s => s.array)];
                    this.checkModel(inArray,target.addPath('ArrayItem'));
                }
            } else if(value.hasOwnProperty(nameof<AnyOfModelConfig>(s => s.anyOf))) {
                //is any of model modifier
                ConfigCheckerTools.assertStructure(Structures.AnyOf, value, ConfigNames.APP, this.ceb, target);
                const anyOf = value[nameof<AnyOfModelConfig>(s => s.anyOf)];
                let count = 0;
                if (typeof anyOf === 'object' || Array.isArray(anyOf)) {
                    Iterator.iterateSync((key, value) => {
                        count++;
                        this.checkModel(value, target.addPath(key))
                    }, anyOf);
                }

                if (count < 2) {
                    this.ceb.addConfigError(new ConfigError(ConfigNames.APP,
                        `${target.getTarget()} anyOf model modifier must have at least two properties.`));
                }
            }
            else {
                //is value model
                this.checkValueProperty(value,target,mainModel);
            }

            (value as ModelCheckedMem)._checked = true;
        } else {
            this.ceb.addConfigError(new ConfigError(ConfigNames.APP,
                `${target.getTarget()} wrong value type. Use a string to link to a model or an object to define an anonymous model or an array shortcut.`));
        }
    }

    // noinspection JSMethodCanBeStatic
    checkOptionalArrayWarning(value : object | boolean,target : Target)
    {
        if (
            target.getLastPath() === 'ArrayItem' && (
                (typeof value === 'boolean' && value) ||
                (
                    typeof value === 'object' &&
                    typeof value[nameof<ModelOptional>(s => s.isOptional)] === 'boolean' &&
                    target[nameof<ModelOptional>(s => s.isOptional)]
                )
            )
        )
        {
            Logger.printConfigWarning(
                ConfigNames.APP,
                `${target.getTarget()} Optional param in an array is useless.`
            );
        }
    }

    // noinspection JSMethodCanBeStatic
    private checkOnlyValidationFunction(value: ValueModelConfig, target) {
        if(value.type !== undefined) {
            const type = Array.isArray(value.type) ? value.type : [value.type];
            const types : TypeTypes[] = [];
            for(let i = 0; i < type.length; i++) {
                if (type[i] === ValidationType.INT || type[i] === ValidationType.FLOAT || type[i] === ValidationType.NUMBER) {
                    types.push(TypeTypes.NUMBER);
                }
                else if(type[i] === ValidationType.DATE) {
                    types.push(TypeTypes.DATE);
                }
                else if(type[i] === ValidationType.BASE64){
                    types.push(TypeTypes.BASE64);
                }
                else if(type[i] === ValidationType.NULL || type[i] === ValidationType.ARRAY || type[i] === ValidationType.OBJECT){
                    types.push(TypeTypes.OTHER);
                }
                else if(type[i] === ValidationType.ALL) {
                    return;
                }
                else {
                    types.push(TypeTypes.STRING);
                }
            }

            if(ObjectUtils.hasOneOf(value, OnlyStringFunctions) && (!types.includes(TypeTypes.STRING) && !types.includes(TypeTypes.BASE64))) {
                Logger.printConfigWarning(
                    ConfigNames.APP,
                    `${target.getTarget()} unused validation functions (no type string or base64) -> ${ObjectUtils.getFoundKeys(value,OnlyStringFunctions).toString()}.`
                );
            }
            if(ObjectUtils.hasOneOf(value, OnlyNumberFunctions) && !types.includes(TypeTypes.NUMBER)) {
                Logger.printConfigWarning(
                    ConfigNames.APP,
                    `${target.getTarget()} unused validation functions (no type number) -> ${ObjectUtils.getFoundKeys(value,OnlyNumberFunctions).toString()}.`
                );
            }
            if(ObjectUtils.hasOneOf(value, OnlyDateFunctions) && !types.includes(TypeTypes.DATE)) {
                Logger.printConfigWarning(
                    ConfigNames.APP,
                    `${target.getTarget()} unused validation functions (no type date) -> ${ObjectUtils.getFoundKeys(value,OnlyDateFunctions).toString()}.`
                );
            }
            if(ObjectUtils.hasOneOf(value, OnlyBase64Functions) && !types.includes(TypeTypes.BASE64)) {
                Logger.printConfigWarning(
                    ConfigNames.APP,
                    `${target.getTarget()} unused validation functions (no type base64) -> ${ObjectUtils.getFoundKeys(value,OnlyBase64Functions).toString()}.`
                );
            }
        }
    }

    private checkValueProperty(config : ValueModelConfig,target : Target,mainModel : boolean,inheritanceCheck : boolean = true)
    {
        //isNormalInputBody
        ConfigCheckerTools.assertStructure(Structures.ValueModel, config, ConfigNames.APP, this.ceb, target);
        //check all that is not depend on full config
        this.checkRegexFunction(config, target);
        this.checkCharClassFunction(config,target);

        //check extends
        const ex = config.extends;
        if(ex !== undefined && inheritanceCheck){
            //check no self inheritance
            this.checkProcessValueInheritance(target,ex,config,{baseModelLevel : true,otherSrc : [],regModel : mainModel});
            target = target.setExtraInfo('Compiled with inheritance');
        }
        //check for only number/string functions
        this.checkOnlyValidationFunction(config,target);
    }


    private checkProcessValueInheritance(target : Target,value : any,srcValueModel : ValueModelConfig,
                                         processInfo : {otherSrc : any[], baseModelLevel : boolean,regModel : boolean},beforeRegModel : boolean = false) : void
    {
        const valueType = typeof value;
        if(valueType === 'string'){
            if(this.modelsConfig.hasOwnProperty(value)){
                target = target.addPath(`extends=>${value}`);
                processInfo.baseModelLevel = false;
                this.checkProcessValueInheritance(target,this.modelsConfig[value],srcValueModel,processInfo,true);
            }
            else {
                if(processInfo.baseModelLevel){
                    this.ceb.addConfigError(new ConfigError(ConfigNames.APP,
                        `${target.getTarget()} the inheritance dependency to value model: '${value}' can not be resolved, Value model not found.`));
                }
                return;
            }
        }
        else if(valueType === 'object' || valueType === 'function') {
            const res = ResolveUtils.modelResolveCheck(value);
            if(typeof res === "string"){
                this.checkProcessValueInheritance(target,res,srcValueModel,processInfo);
            }
            else {
                if(!beforeRegModel){
                    target = target.addPath(`extends=>AnonymousModel`);
                }

                if(!ConfigChecker.isValueModel(res)){
                    if(processInfo.baseModelLevel){
                        this.ceb.addConfigError(new ConfigError(ConfigNames.APP,
                            `${target.getTarget()} a value model can only extend a value model.`));
                    }
                    return;
                }
                else {
                    const sameModelBase = res === srcValueModel;
                    if(processInfo.otherSrc.includes(res) || sameModelBase){
                        if(processInfo.baseModelLevel || sameModelBase){
                            this.ceb.addConfigError(new ConfigError(ConfigNames.APP,
                                `${target.getTarget()} creates a circular inheritance.`));
                        }
                    }
                    else {
                        processInfo.otherSrc.push(res);
                        ObjectUtils.addObToOb(srcValueModel,res);

                        //Check only new anonymous value models.
                        if(processInfo.baseModelLevel && !(res as ModelCheckedMem)._checked){
                            this.checkValueProperty(res,target,false,false);
                            (res as ModelCheckedMem)._checked = true;
                        }

                        if(res.extends !== undefined){
                            this.checkProcessValueInheritance(target,res.extends,srcValueModel,processInfo);
                        }
                    }
                }
            }
        }
    }

    private checkCharClassFunction(value : ValueModelConfig,target) {
       if(typeof value.charClass === 'string'){
           this.checkValidStringRegex
           (value.charClass,target.addPath(nameof<ValueModelConfig>(s => s.charClass)),'is not a valid regex char class. Do not forget to escape special characters.');
       }
    }

    private checkRegexFunction(value: ValueModelConfig, target: Target) {
        const regex = value.regex;
        const regexTarget = target.addPath(nameof<ValueModelConfig>(s => s.regex));

        if (typeof regex === 'object' && !(regex instanceof RegExp)) {
            for (let regexName in regex) {
                if (regex.hasOwnProperty(regexName)) {
                    this.checkRegex(regex[regexName], regexTarget.addPath(regexName));
                }
            }
        } else if (regex !== undefined) {
            this.checkRegex(value, regexTarget);
        }
    }

    private checkRegex(value, target) {
        if (!(typeof value === 'string' || value instanceof RegExp)) {
            this.ceb.addConfigError(new ConfigError(ConfigNames.APP,
                `${target.getTarget()} is not a string or an ReqExp object.`));
        }
        else if(typeof value === 'string') {
            this.checkValidStringRegex(value,target);
        }
    }

    private checkValidStringRegex(value,target,error : string = 'is not a valid regex.') {
        try {
            new RegExp(value);
        } catch(e) {
            this.ceb.addConfigError(new ConfigError(ConfigNames.APP,
                `${target.getTarget()} ${error}`));
        }
    }

    private static getAccessKeyWord(access: any, notAccess: any): string {
        let keyWord = '';
        //search One
        if (notAccess !== undefined && access === undefined) {
            keyWord = nameof<ControllerConfig>(s => s.notAccess);
        } else if (notAccess === undefined && access !== undefined) {
            keyWord = nameof<ControllerConfig>(s => s.access)
        }
        return keyWord;
    }

    private checkAuthAccessConfig(cc: AuthAccessConfig<any>, target) {
        const notAccess = cc.notAccess;
        const access = cc.access;

        if (notAccess !== undefined && access !== undefined) {
            this.ceb.addConfigError(new ConfigError(ConfigNames.APP,
                `${target.getTarget()} has a access and notAccess keyword only one is allowed!`));
        } else {
            const keyWord = ConfigChecker.getAccessKeyWord(access, notAccess);
            this.checkAccessKeyDependency(cc[keyWord], keyWord, target);
        }
    }

    private checkAccessKeyDependency(value, keyword, target) {
        const checkDependency = (string) => {
            ConfigCheckerTools.assertEqualsOne
            (
                this.validAccessValues,
                string,
                ConfigNames.APP,
                this.ceb,
                `user group '${string}' is not found in auth groups or is default group.`,
                target.addPath(keyword)
            );
        };

        if (typeof value === 'string') {
            checkDependency(value);
        } else if (Array.isArray(value)) {
            value.forEach((e) => {
                if (typeof e === 'string') {
                    checkDependency(e);
                }
            })
        }
    }

    private checkCustomName(name : string,type : string,preString : string = '') : void
    {
        if (!name.match(/^[a-zA-Z0-9-/_]+$/)) {
            this.ceb.addConfigError(new ConfigError(ConfigNames.APP,
                `${preString}'${name}' is not a valid ${type} name! Only letters, numbers and the minus symbol are allowed.`));
        }
    }
}