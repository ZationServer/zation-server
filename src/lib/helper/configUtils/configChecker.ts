/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import Bag from './../../api/Bag';
import {ConfigNames, DefaultUserGroupFallBack, ZationAccess} from "../constants/internal";
import BagExtension, {
    AppConfig,
    ControllerConfig,
    InputConfig, MultiInput,
    ModelOptional, ObjectModelConfig, AnyOfModelConfig, ArrayModelConfig, ValueModelConfig, Model,
} from "../configDefinitions/appConfig";
import {PanelUserConfig}      from "../configDefinitions/mainConfig";
import {MainService, Service} from "../configDefinitions/serviceConfig";
import {ChannelConfig, ChannelDefault, CustomChannelConfig} from "../configDefinitions/channelConfig";
// noinspection TypeScriptPreferShortImport
import {ValidationTypes} from "../constants/validationTypes";
import {
    OnlyBase64Functions,
    OnlyDateFunctions,
    OnlyNumberFunctions,
    OnlyStringFunctions,
    TypeTypes
} from "../constants/validation";
import ModelImportEngine    from "./modelImportEngine";
import ConfigErrorBag       from "./configErrorBag";
import ConfigCheckerTools   from "./configCheckerTools";
import {Structures}         from "../configDefinitions/structures";
import ConfigError          from "./configError";
import Target               from "./target";
import Logger               from "../logger/logger";
import SmallBag             from "../../api/SmallBag";
import ObjectPath           from "../utils/objectPath";
import Controller, {ControllerClass} from "../../api/Controller";
import Iterator             from "../utils/iterator";
import ObjectUtils          from "../utils/objectUtils";
import ConfigLoader   from "../configManager/configLoader";

export default class ConfigChecker
{
    private readonly zcLoader: ConfigLoader;
    private readonly ceb: ConfigErrorBag;

    private modelsConfig: Record<string, Model>;
    private cNames: object;
    private validAccessValues: any[];
    private methodBagExNames : string[] = [];
    private serviceNames : string[] = [];

    private modelImportEngine : ModelImportEngine;

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
        this.modelImportEngine = new ModelImportEngine(this.modelsConfig);
        this.cNames = {};
    }

    private checkAppBagExtensions()
    {
        if(Array.isArray(this.zcLoader.appConfig.bagExtensions)){
            this.checkBagExtensions(this.zcLoader.appConfig.bagExtensions,
                new Target('BagExtensions -> '),true,ConfigNames.APP);
        }
    }

    private checkBagExtensions(extensions : BagExtension[],target : Target,addIndex : boolean,configName : ConfigNames)
    {
        for(let i = 0; i < extensions.length; i++) {
            let curTarget;
            if(addIndex) {
                curTarget = target.addPath('index ' + i.toString());
            }
            else {
                curTarget = target;
            }
            ConfigCheckerTools.assertStructure
            (Structures.BagExtension, extensions[i], configName, this.ceb, curTarget);

            if(typeof extensions[i] === 'object' &&
                typeof extensions[i].smallBag === 'object' &&
                typeof extensions[i].bag === 'object'
            ){
                const bagMethods = extensions[i].bag;
                const smallBagMethods = extensions[i].smallBag;

                for(let k in bagMethods){
                    if(bagMethods.hasOwnProperty(k)){
                        this.checkBagExtensionMethod(k,bagMethods,false,configName,target);
                    }
                }

                for(let k in smallBagMethods){
                    if(smallBagMethods.hasOwnProperty(k)){
                        this.checkBagExtensionMethod(k,smallBagMethods,true,configName,target);
                    }
                }
            }
        }
    }

    private checkBagExtensionMethod(methodName : string,methods,isSmallBag : boolean,configName : ConfigNames,target : Target)
    {
        if(this.methodBagExNames.includes(methodName)){
            this.ceb.addConfigError(new ConfigError(configName,
                `${target.getTarget()} conflict with method name: ${methodName}.`));
        }
        if(Bag.prototype.hasOwnProperty(methodName)){
            this.ceb.addConfigError(new ConfigError(configName,
                `${target.getTarget()} conflict with Bag method name: ${methodName}.`));
        }
        if(isSmallBag && SmallBag.prototype.hasOwnProperty(methodName)){
            this.ceb.addConfigError(new ConfigError(configName,
                `${target.getTarget()} conflict with SmallBag method name: ${methodName}.`));
        }
        if(typeof methods[methodName] !== "function"){
            this.ceb.addConfigError(new ConfigError(configName,
                `${target.getTarget()} extension method '${methodName}' is not a function.`));
        }
        this.methodBagExNames.push(methodName);
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
        this.checkChannelConfig();
        this.checkServiceConfig();
        this.checkEventConfig();
    }

    private checkAppConfig() {
        this.checkAccessControllerDefaultIsSet();
        this.checkAppConfigMain();
        this.checkModelsConfig();
        this.checkControllersConfigs();
        this.checkAuthController();
        this.checkBackgroundTasks();
        this.checkAppBagExtensions();
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
        const authControllerName = this.zcLoader.appConfig.authController;
        if (typeof authControllerName === "string") {
            const controller = this.zcLoader.appConfig.controllers || {};
            if (!controller.hasOwnProperty(authControllerName)) {
                this.ceb.addConfigError(new ConfigError(ConfigNames.APP,
                    `AuthController: '${authControllerName}' is not found.`));
            } else {
                //checkAuthControllerAccess value
                let authController = controller[authControllerName].config;
                if (authController.access !== ZationAccess.ALL) {
                    Logger.printConfigWarning
                    (ConfigNames.APP, `It is recommended to set the access of the authController directly to 'all'.`);
                }
            }
        }
    }

    private checkEventConfig() {
        ConfigCheckerTools.assertStructure
        (Structures.EventConfig, this.zcLoader.eventConfig, ConfigNames.EVENT, this.ceb);
    }

    private checkChannelConfig() {
        //main structure
        ConfigCheckerTools.assertStructure
        (Structures.ChannelConfig, this.zcLoader.channelConfig, ConfigNames.CHANNEL, this.ceb);

        let mainChannels = this.zcLoader.channelConfig;
        for (let key in mainChannels) {
            if (mainChannels.hasOwnProperty(key) && typeof mainChannels[key] === 'object') {
                if (key === nameof<ChannelConfig>(s => s.customChannels) || key === nameof<ChannelConfig>(s => s.customIdChannels)) {
                    const chPart = mainChannels[key];
                    const firstTarget = new Target(key);
                    if(typeof chPart === 'object')
                    {
                        for (let chName in chPart) {
                            if (chPart.hasOwnProperty(chName)) {
                                this.checkCustomName(chName,'channel name',firstTarget.getTarget() + ' ');
                                if(typeof chPart[chName] === 'object') {
                                    this.checkFullChannelItem(chPart[chName], firstTarget, chName);
                                }
                            }
                        }
                    }
                } else if
                (
                    key === nameof<ChannelConfig>(s => s.allCh) || key === nameof<ChannelConfig>(s => s.defaultUserGroupCh) ||
                    key === nameof<ChannelConfig>(s => s.authUserGroupCh) || key === nameof<ChannelConfig>(s => s.userCh)) {
                    ConfigCheckerTools.assertStructure
                    (Structures.ChannelNormalItem, mainChannels[key], ConfigNames.CHANNEL, this.ceb, new Target(key));
                }
            }
        }
    }

    private checkFullChannelItem(channel: CustomChannelConfig, firstTarget: Target, chName: string): void {
        const mainTarget = firstTarget.addPath(chName);

        ConfigCheckerTools.assertStructure
        (Structures.ChannelFullItem, channel, ConfigNames.CHANNEL, this.ceb, mainTarget);

        if (typeof channel === 'object') {
            if (channel.clientPublishAccess !== undefined && channel.clientPublishNotAccess !== undefined) {
                this.ceb.addConfigError(new ConfigError(ConfigNames.CHANNEL,
                    `${mainTarget.getTarget()} only 'publishAccess' or 'publishNotAccess' keyword is allow.`));
            }
            if (channel.subscribeAccess !== undefined && channel.subscribeNotAccess !== undefined) {
                this.ceb.addConfigError(new ConfigError(ConfigNames.CHANNEL,
                    `${mainTarget.getTarget()} only 'subscribeAccess' or 'subscribeNotAccess' keyword is allow.`));
            }

            //check protocolAccess dependency to userGroups
            this.checkAccessKeyDependency
            (channel.clientPublishAccess, nameof<CustomChannelConfig>(s => s.clientPublishAccess), mainTarget);
            this.checkAccessKeyDependency
            (channel.clientPublishNotAccess, nameof<CustomChannelConfig>(s => s.clientPublishNotAccess), mainTarget);
            this.checkAccessKeyDependency
            (channel.subscribeAccess, nameof<CustomChannelConfig>(s => s.subscribeAccess), mainTarget);
            this.checkAccessKeyDependency
            (channel.subscribeNotAccess, nameof<CustomChannelConfig>(s => s.subscribeNotAccess), mainTarget);

            this.warningForPublish(channel.clientPublishAccess, mainTarget);
            this.warningForPublish(channel.clientPublishNotAccess, mainTarget, true);
        }

        if
        (
            chName === nameof<ChannelDefault>(s => s.default) &&
            !(
                (channel.clientPublishAccess !== undefined || channel.clientPublishNotAccess !== undefined) &&
                (channel.subscribeAccess !== undefined || channel.subscribeNotAccess !== undefined)
            )
        ) {
            Logger.printConfigWarning(`${ConfigNames.CHANNEL} ${firstTarget.getMainTarget()}`, 'It is recommended to set a default value for clientPublishAccess and subscribeAccess.');
        }
    }

    // noinspection JSMethodCanBeStatic
    private warningForPublish(value: any, target: Target, convert: boolean = false): void {
        if (value !== undefined && (typeof value !== "boolean" || (convert ? !value : value))) {
            Logger.printConfigWarning
            (ConfigNames.CHANNEL,
                `${target.getTarget()} please notice that 'publishAccess' is used when a client publish from outside!` +
                `So it is better to use an controller (with validation) and publish from server side!`);
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
                    this.checkModel(model,target,name);
                    this.circularCheck(model,target,{name : name,isObj : ConfigChecker.isObjModel(model)});
                }
                else {
                    this.ceb.addConfigError(new ConfigError(ConfigNames.APP,
                        `Models: '${name}' value must be an object, array or string!`));
                }
            }
        }
    }

    private checkObject(obj: ObjectModelConfig, target: Target) {
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
        if (typeof obj.extends === 'string') {
            this.checkObjExtendResolve(obj.properties,obj.extends,target);
        }
    }

    private static isObjModel(obj : any) : boolean {
        return typeof obj === 'object' && typeof obj[nameof<ObjectModelConfig>(s => s.properties)] === 'object';
    }

    private static isValueModel(obj : any) : boolean {
        return typeof obj === 'object' &&
            obj[nameof<ObjectModelConfig>(s => s.properties)] === undefined &&
            obj[nameof<ArrayModelConfig>(s => s.array)] === undefined &&
            obj[nameof<AnyOfModelConfig>(s => s.anyOf)] === undefined;
    }

    // noinspection JSUnusedLocalSymbols
    private static isArrayModel(arr : any) : boolean {
        return Array.isArray(arr) || (
            typeof arr === 'object' &&
            typeof arr[nameof<ArrayModelConfig>(s => s.array)] === 'object'
        );
    }

    private checkObjExtendResolve(objProps,objExtendName, target) {
        if (!this.modelsConfig.hasOwnProperty(objExtendName)) {
            this.ceb.addConfigError(new ConfigError(ConfigNames.APP,
                `${target.getTarget()} the inheritance dependency to object model: '${objExtendName}' can not be resolved, Object model not found.`));
        }
        else {
            try {
                const {value,keyPath} = this.modelImportEngine.tryExtendsResolveCheck(objExtendName);
                if(!ConfigChecker.isObjModel(value)) {
                    this.ceb.addConfigError(new ConfigError(ConfigNames.APP,
                        `${target.getTarget()} the inheritance dependency to object model: '${objExtendName}' can not be resolved, model is not an object model.`));
                }

                this.checkOverrideProp(objProps,value,target,`extends=>${keyPath.join('->')}`);
            }
            catch (e) {}
        }
    }

    private checkOverrideProp(props,superObj,target : Target,extendPath,ex : string[] = []) {
        if (typeof superObj === 'object' && typeof props === 'object') {
            if (typeof superObj.prototype === 'object') {
                const superPrototype = superObj.prototype;
                for (let prop in props) {
                    if (props.hasOwnProperty(prop)) {
                        if (superPrototype.hasOwnProperty(prop)) {
                            Logger.printConfigWarning(
                                ConfigNames.APP,
                                `${target.getTarget()} Property '${prop}' will shadowing an inherited prototype property '${prop}' from model object '${extendPath}'.`);
                        }
                    }
                }
            }
            if (typeof superObj.extends === 'string' && !ex.includes(superObj.extends)) {
                ex.push(superObj.extends);
                try {
                    const {value,keyPath} = this.modelImportEngine.tryExtendsResolveCheck(superObj.extends);
                    this.checkOverrideProp(props,value,target.addPath(extendPath),`extends=>${keyPath.join('->')}`,ex);
                }
                catch (e) {}
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
            (ConfigNames.MAIN, `Its recommend to not use the default panel access credentials!` +
                ` So please change them in the main config!`);
        }

        // for javascript version
        // noinspection SuspiciousTypeOfGuard
        if(typeof config.username === 'string' && config.username !== 'admin' &&
        config.username === config.password) {
            Logger.printConfigWarning
            (ConfigNames.MAIN, `It's not recommended to use the panel username as a password also!`);
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

                   this.checkBagExtensions([c.bagExtensions],
                       new Target(`Service Module: '${c.serviceName}' bag extension ->`),false,ConfigNames.SERVICE);
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
        //check Controller
        if (typeof this.zcLoader.appConfig.controllers === 'object') {
            const controller = this.zcLoader.appConfig.controllers;
            for (let cName in controller) {
                if (controller.hasOwnProperty(cName)) {
                    this.checkController(controller[cName], new Target(`Controller: '${cName}'`));
                }
            }
        }

        //check controllerDefault
        if (typeof this.zcLoader.appConfig.controllerDefaults === 'object') {
            const controller = this.zcLoader.appConfig.controllerDefaults;
            this.checkControllerConfig(controller, new Target(nameof<AppConfig>(s => s.controllerDefaults)));
        }

    }

    // noinspection JSMethodCanBeStatic
    private checkControllerVersionAccess(cc: ControllerConfig, target: Target) {
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
                `${target.getTarget()} is not extends from main Controller class.`));
        }
    }

    private checkControllerConfig(config : ControllerConfig,target : Target)
    {
        ConfigCheckerTools.assertStructure(Structures.ControllerConfig, config, ConfigNames.APP, this.ceb, target);
        this.checkControllerAccessKey(config, target);
        this.checkInputAllAllow(config, target);
        this.checkInputConfig(config,target);
        this.checkControllerVersionAccess(config, target);
    }

    // noinspection JSMethodCanBeStatic
    private checkInputAllAllow(cc: ControllerConfig, target: Target) {
        if (typeof cc.inputAllAllow === 'boolean' &&
            cc.inputAllAllow &&
            (typeof cc.input === 'object' || typeof cc.multiInput === 'object' || typeof  cc.singleInput !== 'undefined')) {
            Logger.printConfigWarning(
                ConfigNames.APP,
                `${target.getTarget()} the properties input,multiInput,singleInput are ignored with inputAllAllow true.`
            );
        }
    }

    private checkInputConfig(inputConfig : InputConfig, target : Target) {
        const inConfigs : string[] = [];
        if(inputConfig.input){
            inConfigs.push(nameof<InputConfig>(s => s.input));
            this.checkMultiInput(inputConfig.input,target);
        }
        if(inputConfig.multiInput){
            inConfigs.push(nameof<InputConfig>(s => s.multiInput));
            this.checkMultiInput(inputConfig.multiInput,target);
        }
        if(inputConfig.singleInput){
            inConfigs.push(nameof<InputConfig>(s => s.singleInput));
            this.checkSingleInput(inputConfig.singleInput,target);
        }
        if(inConfigs.length > 1){
            this.ceb.addConfigError(new ConfigError(ConfigNames.APP,
                `${target.getTarget()} Only one of the input config properties: 'input','multiInput','singleInput' is allowed. You have set: ${inConfigs.toString()}.`));
        }
    }

    private checkMultiInput(multiInput : MultiInput,target : Target) {
        const keys: any[] = [];
        if (typeof multiInput === 'object') {
            for (let k in multiInput) {
                if (multiInput.hasOwnProperty(k)) {
                    keys.push(k);
                    this.checkCustomName(k,'controller input property',target.getTarget() + ' ');
                    this.checkModel(multiInput[k], target.addPath(k));
                }
            }
            this.checkOptionalRecommendation(keys, multiInput, target);
        }
    }

    private checkSingleInput(singleInput : Model,target : Target) {
        this.checkModel(singleInput,target);
    }

    // noinspection JSMethodCanBeStatic
    private checkOptionalRecommendation(keys: string[], input: MultiInput, target: Target) {
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
        if(ModelImportEngine.correctSyntax(link)) {
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
     * @param otherSrc
     */
    private circularCheck(value,target,mainSrc : {name : string,isObj : boolean},otherSrc : {models : string[],ex : string[]} = {models : [],ex:[]})
    {
        if (typeof value === 'string') {
            if(ModelImportEngine.correctSyntax(value)) {
                const {exist,linkedValue,name} = this.modelImportEngine.peakCheck(value);
                /*
                Check only basename is not included in the import chain.
                A -> B Ok
                B -> C Ok
                C -> D NotOk
                D -> C NotOk
                Abort check if we detect an repeat of import.
                 */
                if(name === mainSrc.name){
                    this.ceb.addConfigError(new ConfigError(ConfigNames.APP,
                        `${target.getTarget()} creates a circular import.`));
                }
                else if(exist && !otherSrc.models.includes(name)) {
                    otherSrc.models.push(name);
                    this.circularCheck(linkedValue,target.addPath(`import-model=>${name}`),mainSrc,otherSrc);
                }
            }
        } else if (Array.isArray(value)) {
            //array model
            if(value.length > 0){
                this.circularCheck(value[0], target.addPath('ArrayItem'), mainSrc,otherSrc);
            }
        } else if (typeof value === "object") {
            if (typeof value[nameof<ObjectModelConfig>(s => s.properties)] === 'object') {
                //object model
                this.circularObjectCheck(value,target,[],mainSrc,otherSrc);
            } else if (typeof value[nameof<ArrayModelConfig>(s => s.array)] === 'object') {
                //array model
                const inArray = value[nameof<ArrayModelConfig>(s => s.array)];
                this.circularCheck(inArray,target.addPath('ArrayItem'), mainSrc,otherSrc);
            } else if(value.hasOwnProperty(nameof<AnyOfModelConfig>(s => s.anyOf)))
            {
                //any of model
                const anyOf = value[nameof<AnyOfModelConfig>(s => s.anyOf)];
                if(typeof anyOf === 'object' || Array.isArray(anyOf)) {
                    Iterator.iterateSync((key,value) => {
                        this.circularCheck(value,target.addPath(key),mainSrc,otherSrc);
                    },anyOf);
                }
            }
        }
    }

    circularObjectCheck(value,target,excludeProps : string[],mainSrc : {name : string,isObj : boolean},otherSrc : {models : string[],ex : string[]})
    {
        const props = value[nameof<ObjectModelConfig>(s => s.properties)];

        //ex check
        const extend = value[nameof<ObjectModelConfig>(s => s.extends)];

        if (typeof extend === 'string' && this.modelsConfig[extend] !== undefined && !otherSrc.ex.includes(extend)) {
            if(mainSrc.isObj && mainSrc.name === extend) {
                this.ceb.addConfigError(new ConfigError(ConfigNames.APP,
                    `${target.addPath(`extends=>${extend}`).getTarget()} creates a circular inheritance.`));
            }
            else {
                otherSrc.ex.push(extend);
                this.circularObjectCheck(this.modelsConfig[extend],target.addPath(`extends=>${extend}`),Object.keys(props),mainSrc,otherSrc);
            }
        }

        if(typeof props === 'object') {
            for(let propName in props){
                if(props.hasOwnProperty(propName) && !excludeProps.includes(propName)) {
                    this.circularCheck(props[propName],target.addPath(propName), mainSrc,otherSrc);
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
     * @param baseName
     */
    private checkModel(value, target, baseName : string | undefined = undefined) {
        if (typeof value === 'string') {
            //model link
           this.checkLink(value,target);
        } else if (Array.isArray(value)) {
            //model array short cut
            this.checkArrayShortCut(value, target);
        } else if (typeof value === "object") {
            this.checkOptionalArrayWarning(value,target);
            //check input
            if (value.hasOwnProperty(nameof<ObjectModelConfig>(s => s.properties))) {
                //is object model
                this.checkObject(value, target);
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
                this.checkValueProperty(value,target,baseName);
            }
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
                if (type[i] === ValidationTypes.INT || type[i] === ValidationTypes.FLOAT || type[i] === ValidationTypes.NUMBER) {
                    types.push(TypeTypes.NUMBER);
                }
                else if(type[i] === ValidationTypes.DATE) {
                    types.push(TypeTypes.DATE);
                }
                else if(type[i] === ValidationTypes.BASE64){
                    types.push(TypeTypes.BASE64);
                }
                else if(type[i] === ValidationTypes.NULL || type[i] === ValidationTypes.ARRAY || type[i] === ValidationTypes.OBJECT){
                    types.push(TypeTypes.OTHER);
                }
                else if(type[i] === ValidationTypes.ALL) {
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

    private checkValueProperty(config : object,target : Target,baseName ?: string)
    {
        //isNormalInputBody
        ConfigCheckerTools.assertStructure(Structures.ValueModel, config, ConfigNames.APP, this.ceb, target);
        //check all that is not depend on full config
        this.checkRegexFunction(config, target);
        this.checkCharClassFunction(config,target);

        //check extends
        const ex = config[nameof<ValueModelConfig>(s => s.extends)];
        if(typeof ex === 'string') {
            if(!this.modelsConfig.hasOwnProperty(ex)) {
                this.ceb.addConfigError(new ConfigError(ConfigNames.APP,
                    `${target.getTarget()} the inheritance dependency to value model: '${ex}' can not be resolved, Value model not found.`));
            }
            else if(typeof baseName === 'string') {
                //check no self inheritance
                config = this.checkProcessValueInheritance(target,config,config,baseName,[],true);
                target = target.setExtraInfo('Compiled with inheritance');
            }
        }
        //check for only number/string functions
        this.checkOnlyValidationFunction(config,target);
    }

    private checkProcessValueInheritance(target : Target,mainConfig : object,exConfig : object,valueName : string,otherSrc : string[] = [],base : boolean = false) : object
    {
        const ex = exConfig[nameof<ValueModelConfig>(s => s.extends)];
        if(this.modelsConfig.hasOwnProperty(ex)) {
            if(ex === valueName) {
                this.ceb.addConfigError(new ConfigError(ConfigNames.APP,
                    `${target.addPath(`extends=>${ex}`).getTarget()} creates a circular inheritance.`));
            }
            else {
                try {
                    const {value,keyPath} = this.modelImportEngine.tryExtendsResolveCheck(ex);
                    if(!ConfigChecker.isValueModel(value)) {
                        //only check if this process is the base process.
                        if(base){
                            this.ceb.addConfigError(new ConfigError(ConfigNames.APP,
                                `${target.getTarget()} value model can only extend value models and '${keyPath.join('->')}' refers not to a value model.`));
                        }
                    }
                    else if(!otherSrc.includes(ex)) {
                        otherSrc.push(ex);
                        ObjectUtils.addObToOb(mainConfig,value);

                        //add also the extension from an extension
                        return this.checkProcessValueInheritance
                        (target.addPath(`extends=>${keyPath.join('->')}`),mainConfig,value,valueName,otherSrc);
                    }
                }
                catch (e) {}
            }
        }
        return mainConfig;
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

    private checkControllerAccessKey(cc: ControllerConfig, target) {
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