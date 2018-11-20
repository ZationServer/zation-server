/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import ZationConfig = require("../../main/zationConfig");
import Logger = require('../logger/logger');
import ConfigError = require('./configError');
import ConfigCheckerTools = require('./configCheckerTools');
import ControllerCheckTools = require('../controller/controllerCheckTools');
import ObjectPath = require('../tools/objectPath');
import ObjectTools = require('../tools/objectTools');
import Structures = require('./structures');
import Target = require('./target');
import ConfigErrorBag = require("./configErrorBag");
import {ConfigNames, DefaultUserGroupFallBack, ZationAccess} from "../constants/internal";
import {
    AnyOfProperty,
    AppConfig, ArrayPropertyConfig, ArrayShortSyntax,
    ControllerConfig,
    ControllerInput,
    ObjectPropertyConfig, PropertyOptional,
    ValuePropertyConfig
} from "../configs/appConfig";
import {PanelUserConfig} from "../configs/mainConfig";
import {CustomService} from "../configs/serviceConfig";
import {ValidationTypes} from "../constants/validationTypes";
import {ChannelConfig, ChannelDefault, CustomChannelConfig} from "../configs/channelConfig";
import {OnlyDateFunctions, OnlyNumberFunctions, OnlyStringFunctions} from "../constants/validation";
import PropertyImportEngine = require("./propertyImportEngine");
import Iterator = require("../tools/iterator");

class ConfigChecker
{
    private readonly zc: ZationConfig;
    private readonly ceb: ConfigErrorBag;

    private objectsConfig: Record<string, ObjectPropertyConfig>;
    private valuesConfig: Record<string, ValuePropertyConfig>;
    private arraysConfig : Record<string, ArrayPropertyConfig | ArrayShortSyntax>;
    private cNames: object;
    private validAccessValues: any[];

    private propertyImportEngine : PropertyImportEngine;

    constructor(zationConfig, configErrorBag) {
        this.zc = zationConfig;
        this.ceb = configErrorBag;
    }

    public checkStarterConfig() {
        ConfigCheckerTools.assertStructure
        (Structures.StarterConfig, this.zc.starterConfig,
            ConfigNames.STARTER, this.ceb);
    }

    public checkAllConfigs() {
        this.prepare();
        this.checkConfig();
    }

    private prepare() {
        this.prepareAllValidUserGroupsAndCheck();
        this.objectsConfig = typeof this.zc.appConfig.objects === 'object' ? this.zc.appConfig.objects : {};
        this.valuesConfig = typeof this.zc.appConfig.values === 'object' ? this.zc.appConfig.values : {};
        this.arraysConfig = typeof this.zc.appConfig.arrays === 'object' ? this.zc.appConfig.arrays : {};
        this.propertyImportEngine = new PropertyImportEngine(this.objectsConfig,this.valuesConfig,this.arraysConfig);
        this.cNames = {};
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

        if (typeof this.zc.appConfig.userGroups === 'object') {
            if (typeof this.zc.appConfig.userGroups.auth === 'object') {

                const authUserGroups = this.zc.appConfig.userGroups.auth;
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
            if (typeof this.zc.appConfig.userGroups.default === 'string') {
                const defaultGroup = this.zc.appConfig.userGroups.default;
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
        this.checkErrorConfig();
    }

    private checkAppConfig() {
        this.checkAccessControllerDefaultIsSet();
        this.checkAppConfigMain();
        this.checkObjectsConfig();
        this.checkValuesConfig();
        this.checkArraysConfig();
        this.checkControllerConfigs();
        this.checkAuthController();
        this.checkBackgroundTasks();
    }

    private checkBackgroundTasks() {
        const bkt = this.zc.appConfig.backgroundTasks;
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
        const authControllerName = this.zc.appConfig.authController;
        if (typeof authControllerName === "string") {
            const controller = this.zc.appConfig.controller || {};
            if (!controller.hasOwnProperty(authControllerName)) {
                this.ceb.addConfigError(new ConfigError(ConfigNames.APP,
                    `AuthController: '${authControllerName}' is not found.`));
            } else {
                //checkAuthControllerAccess value
                let authController = controller[authControllerName];
                if (authController.access !== ZationAccess.ALL) {
                    Logger.printConfigWarning
                    (ConfigNames.APP, `It is recommended to set the access of the authController directly to 'all'.`);
                }
            }
        }
    }

    private checkEventConfig() {
        ConfigCheckerTools.assertStructure
        (Structures.EventConfig, this.zc.eventConfig, ConfigNames.EVENT, this.ceb);
    }

    private checkErrorConfig() {
        if (typeof this.zc.errorConfig === 'object') {
            const errors = this.zc.errorConfig;
            for (let k in errors) {
                if (errors.hasOwnProperty(k)) {
                    this.checkCustomName(k,'error');
                    this.checkError(errors[k], new Target(`error '${k}'`));
                }
            }
        }
    }

    private checkError(error: object, target: Target) {
        ConfigCheckerTools.assertStructure
        (Structures.Error, error, ConfigNames.ERROR, this.ceb, target);
    }

    private checkChannelConfig() {
        //main structure
        ConfigCheckerTools.assertStructure
        (Structures.ChannelConfig, this.zc.channelConfig, ConfigNames.CHANNEL, this.ceb);

        let mainChannels = this.zc.channelConfig;
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
        let access = ObjectPath.get(this.zc.appConfig,
            [nameof<AppConfig>(s => s.controllerDefaults), nameof<ControllerConfig>(s => s.access)]);

        let notAccess = ObjectPath.get(this.zc.appConfig,
            [nameof<AppConfig>(s => s.controllerDefaults), nameof<ControllerConfig>(s => s.notAccess)]);

        if (access === undefined && notAccess === undefined) {
            Logger.printConfigWarning(ConfigNames.APP, 'It is recommended to set a controller default value for protocolAccess or notAccess.');
        }
    }

    private checkObjectsConfig() {
        for (let objName in this.objectsConfig) {
            if (this.objectsConfig.hasOwnProperty(objName)) {
                this.checkCustomName(objName,'object property','Objects: ');
                if (!Array.isArray(this.objectsConfig[objName]) && typeof this.objectsConfig[objName] === 'object') {
                    const target = new Target(`Objects: ${objName}`);
                    this.checkObject(this.objectsConfig[objName],target,objName);
                    this.circularCheck(this.objectsConfig[objName],target, {name : objName, isObj : true});
                } else {
                    this.ceb.addConfigError(new ConfigError(ConfigNames.APP,
                        `Objects: '${objName}' value must be an object!`));
                }
            }
        }
    }


    private checkValuesConfig() {
        for (let valueName in this.valuesConfig) {
            if (this.valuesConfig.hasOwnProperty(valueName)) {
                const valueConfig = this.valuesConfig[valueName];
                if(!Array.isArray(valueConfig) && typeof this.valuesConfig[valueName] === 'object'){
                    this.checkCustomName(valueName,'value property','Values: ');
                    this.checkValueProperty( this.valuesConfig[valueName],new Target(`Values: '${valueName}'`),valueName);
                }
                else{
                    this.ceb.addConfigError(new ConfigError(ConfigNames.APP,
                        `Values: '${valueName}' value must be an object!`));
                }
            }
        }
    }

    private checkArraysConfig()
    {
        for(let arrayName in this.arraysConfig)
        {
            if(this.arraysConfig.hasOwnProperty(arrayName)) {
                const arrayConfig = this.arraysConfig[arrayName];
                if(Array.isArray(arrayConfig) || typeof arrayConfig === 'object') {
                    this.checkCustomName(arrayName,'array property','Arrays: ');
                    const target = new Target(`Arrays: '${arrayName}'`);
                    this.checkProperty(this.arraysConfig[arrayName],target);
                    this.circularCheck(this.arraysConfig[arrayName],target, {name : arrayName, isObj : false});
                }
                else{
                    this.ceb.addConfigError(new ConfigError(ConfigNames.APP,
                        `Arrays: '${arrayName}' value must be an object or array!`));
                }
            }
        }
    }

    private checkObject(obj: ObjectPropertyConfig, target: Target, objName ?: string) {

        ConfigCheckerTools.assertStructure(Structures.AppObject, obj, ConfigNames.APP, this.ceb, target);
        const prototype = typeof obj.prototype === 'object' ? obj.prototype : {};
        //check property body and prototype property name problem
        if (typeof obj.properties === 'object') {
            let props = obj.properties;
            for (let k in props) {
                if (props.hasOwnProperty(k)) {
                    this.checkCustomName(k,'property',target.getTarget()+' ');
                    this.checkProperty(props[k], target.addPath(k), objName);
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
            this.checkObjExtendResolve(obj.extends, target);
            this.checkOverrideProp(obj.properties, target.addPath(`extends=>${obj.extends}`), obj.extends);

        }
    }

    private checkObjExtendResolve(objExtendName, target) {
        if (!this.objectsConfig.hasOwnProperty(objExtendName)) {
            this.ceb.addConfigError(new ConfigError(ConfigNames.APP,
                `${target.getTarget()} the inheritance dependency to object: '${objExtendName}' can not be resolved, Object not found.`));
        }
    }

    private checkOverrideProp(props, target, superName,ex : string[] = []) {
        if (typeof this.objectsConfig[superName] === 'object' && typeof props === 'object') {
            const superObj = this.objectsConfig[superName];
            if (typeof superObj.prototype === 'object') {
                const superPrototype = superObj.prototype;
                for (let prop in props) {
                    if (props.hasOwnProperty(prop)) {
                        if (superPrototype.hasOwnProperty(prop)) {
                            Logger.printConfigWarning(
                                ConfigNames.APP,
                                `${target.getTarget()} Property '${prop}' will shadowing an inherited prototype property '${prop}' from object '${superName}'.`);
                        }
                    }
                }
            }
            if (typeof superObj.extends === 'string' && !ex.includes(superObj.extends)) {
                ex.push(superObj.extends);
                this.checkOverrideProp(props, target.addPath(`extends=>${superObj.extends}`), superObj.extends,ex);
            }
        }
    }

    private checkAppConfigMain() {
        ConfigCheckerTools.assertStructure(Structures.App, this.zc.appConfig, ConfigNames.APP, this.ceb);
    }

    private checkMainConfig() {
        //checkStructure
        ConfigCheckerTools.assertStructure(Structures.Main, this.zc.mainConfig, ConfigNames.MAIN, this.ceb);
        this.checkPanelUserMainConfig();
    }

    private checkPanelUserMainConfig() {
        const panelUserConfig = this.zc.mainConfig.panelUser;
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

        if (this.zc.mainConfig.usePanel && !hasOneUser) {
            Logger.printConfigWarning
            (
                ConfigNames.MAIN,
                `The zation panel is activated but no panelUser is defined in the main config.`
            );
        }

    }

    private checkPanelUserConfig(config: PanelUserConfig, target ?: Target) {
        //checkStructure
        ConfigCheckerTools.assertStructure(Structures.PanelUserConfig, config, ConfigNames.MAIN, this.ceb, target);

        if (config.password === 'admin' &&
            config.userName === 'admin' &&
            this.zc.mainConfig.usePanel) {
            Logger.printConfigWarning
            (ConfigNames.MAIN, `Its recommend to not use the default panel access credentials!` +
                ` So please change them in the main config!`);
        }
    }

    private checkServiceConfig() {
        //checkStructure
        ConfigCheckerTools.assertStructure
        (Structures.ServiceConfig, this.zc.serviceConfig, ConfigNames.SERVICE, this.ceb);

        //checkServices
        this.checkServices();

        //check Custom Services
        this.checkCustomServices();
    }

    private checkServices() {
        const s = this.zc.serviceConfig.services;
        //check services
        if (typeof s === 'object') {
            ConfigCheckerTools.assertStructure
            (Structures.Services, s, ConfigNames.SERVICE, this.ceb, new Target(`Services`));

            for (let serviceName in s) {
                if (s.hasOwnProperty(serviceName) && typeof s[serviceName] === 'object') {
                    const service = s[serviceName];
                    const target = new Target(`Services: '${serviceName}'`);

                    for (let k in service) {
                        if (service.hasOwnProperty(k)) {
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
            }

        }
    }

    private checkCustomServices() {
        const cs = this.zc.serviceConfig.customServices;
        //check custom services
        if (typeof cs === 'object') {
            for (let serviceName in cs) {
                if (cs.hasOwnProperty(serviceName)) {

                    this.checkCustomName(serviceName,'custom service');

                    //check only objects in
                    ConfigCheckerTools.assertProperty
                    (
                        serviceName,
                        cs,
                        'object',
                        true,
                        ConfigNames.SERVICE,
                        this.ceb,
                        new Target(`Custom Services`)
                    );

                    if (typeof cs[serviceName] === 'object') {
                        //check custom services structure
                        let service = cs[serviceName];
                        let target = new Target(`Custom Services: '${serviceName}'`);

                        //check create and get
                        ConfigCheckerTools.assertProperty
                        (
                            nameof<CustomService>(s => s.get),
                            service,
                            'function',
                            true,
                            ConfigNames.SERVICE,
                            this.ceb,
                            target
                        );
                        ConfigCheckerTools.assertProperty
                        (
                            nameof<CustomService>(s => s.create),
                            service,
                            'function',
                            true,
                            ConfigNames.SERVICE,
                            this.ceb,
                            target
                        );

                        for (let k in service) {
                            if (service.hasOwnProperty(k)) {
                                if (k === nameof<CustomService>(s => s.get) ||
                                    k === nameof<CustomService>(s => s.create)) {
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
                }
            }
        }
    }

    private checkControllerConfigs() {
        //check Controller
        if (typeof this.zc.appConfig.controller === 'object') {
            const controller = this.zc.appConfig.controller;
            for (let cName in controller) {
                if (controller.hasOwnProperty(cName)) {
                    this.checkController(controller[cName], new Target(`Controller: '${cName}'`), cName);
                }
            }
        }

        //check controllerDefault
        if (typeof this.zc.appConfig.controllerDefaults === 'object') {
            const controller = this.zc.appConfig.controllerDefaults;
            this.checkController(controller, new Target(nameof<AppConfig>(s => s.controllerDefaults)));
        }

        this.checkControllerPaths();
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

    private checkController(cc: object, target: Target, cName ?: string) {
        this.checkControllerAccessKey(cc, target);

        const structure = cName ? Structures.AppController : Structures.AppControllerDefaults;
        ConfigCheckerTools.assertStructure(structure, cc, ConfigNames.APP, this.ceb, target);

        this.checkInputAllAllow(cc, target);

        this.checkControllerInput(cc, target);
        this.checkControllerVersionAccess(cc, target);

        if (cName) {
            this.checkControllerClass(cc, target, cName);
        }
    }

    // noinspection JSMethodCanBeStatic
    private checkInputAllAllow(cc: ControllerConfig, target: Target) {
        if (typeof cc.inputAllAllow === 'boolean' &&
            cc.inputAllAllow && typeof cc.input === 'object') {
            Logger.printConfigWarning(
                ConfigNames.APP,
                `${target.getTarget()} the property input is ignored with inputAllAllow true.`
            );
        }
    }

    private checkControllerClass(cc: object, target: Target, cName: string) {
        let cPath = ControllerCheckTools.getControllerFPathForCheck(cc, cName);
        this.addControllerPaths(cPath, cName);

        if (!ControllerCheckTools.controllerFileExist(cc, cPath, this.zc)) {
            this.ceb.addConfigError(new ConfigError(ConfigNames.APP,
                `${target.getTarget()} on Path: '${cPath}', can not found the controller file.`));
        }
        else
        {
            try {
                const controller = ControllerCheckTools.requireController(cc, cPath, this.zc);
                if (!ControllerCheckTools.isControllerExtendsController(controller)) {
                    this.ceb.addConfigError(new ConfigError(ConfigNames.APP,
                        `${target.getTarget()} on Path: '${cPath}', is not extends from main Controller class.`));
                }
            }
            catch (e) {
                this.ceb.addConfigError(new ConfigError(ConfigNames.APP,
                    `${target.getTarget()} on Path: '${cPath}', can not require, syntax errors.`));
            }
        }
    }

    private checkControllerPaths() {
        for (let p in this.cNames) {
            if (this.cNames.hasOwnProperty(p) && Array.isArray(this.cNames[p])
                && this.cNames[p].length > 1) {
                Logger.printConfigWarning
                (
                    ConfigNames.APP,
                    `Controller: '${this.cNames[p].toString()}' have the same lowercase path (Warning for case insensitive systems) or path: '${p}'.`
                );
            }
        }
    }

    private addControllerPaths(path, cName) {
        let sPath = path.toLowerCase();

        if (Array.isArray(this.cNames[sPath])) {
            this.cNames[sPath].push(cName);
        } else {
            this.cNames[sPath] = [cName];
        }
    }

    private checkControllerInput(cc: ControllerConfig, target: Target) {
        const input = cc.input;
        const keys: any[] = [];
        if (typeof input === 'object') {
            for (let k in input) {
                if (input.hasOwnProperty(k)) {
                    keys.push(k);
                    this.checkCustomName(k,'controller input property',target.getTarget() + ' ');
                    this.checkProperty(input[k], target.addPath(k));
                }
            }
            this.checkOptionalRecommendation(keys, input, target);
        }
    }

    // noinspection JSMethodCanBeStatic
    private checkOptionalRecommendation(keys: string[], input: ControllerInput, target: Target) {
        let wasLastOptional = false;
        for (let i = keys.length - 1; i >= 0; i--) {
            if (input[keys[i]][nameof<ValuePropertyConfig>(s => s.isOptional)] !== undefined &&
                input[keys[i]][nameof<ValuePropertyConfig>(s => s.isOptional)]) {
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
        if(PropertyImportEngine.correctSyntax(link)) {
            const {type,exist,name,isOp} = this.propertyImportEngine.check(link);
            if(!exist) {
                this.ceb.addConfigError(new ConfigError(ConfigNames.APP,
                    `${target.getTarget()} the link dependency to ${type}: '${name}' can not be resolved, ${type} not found.`));
            }
            else {
                this.checkOptionalArrayWarning(isOp,target);
            }
        }
        else {
            this.ceb.addConfigError(new ConfigError(ConfigNames.APP,
                `${target.getTarget()} the link dependency definition '${link}' has syntax errors.`))
        }
    }

    private checkArrayShortCut(value, target: Target, objName) {
        if (value.length === 0) {
            this.ceb.addConfigError(new ConfigError(ConfigNames.APP,
                `${target.getTarget()} you have to specify an object link (string) or an inputBody (object) or an new array shortcut.`));
        } else if (value.length === 1) {
            this.checkProperty(value[0], target.addPath('ArrayItem'), objName);
        } else if (value.length === 2) {
            let newTarget = target.setExtraInfo('Array Shortcut Element 2');
            if (typeof value[1] !== 'object') {
                this.ceb.addConfigError(new ConfigError(ConfigNames.APP,
                    `${newTarget.getTarget()} the second shortCut item should be from typ object and can specify the array. Given typ is: '${typeof value[1]}'`));
            } else {
                this.checkOptionalArrayWarning(value,target);
                ConfigCheckerTools.assertStructure(Structures.ArrayShortCutSpecify, value[1], ConfigNames.APP, this.ceb, newTarget);
            }

            this.checkProperty(value[0], target.addPath('ArrayItem'), objName);
        } else {
            this.ceb.addConfigError(new ConfigError(ConfigNames.APP,
                `${target.getTarget()} invalid shortCut length: '${value.length}', 2 values are valid. First specify content and second to specify array.`));
        }
    }

    private circularCheck(value,target,mainSrc : {name : string,isObj : boolean},otherSrc : {array : string[],object : string[],ex : string[]} = {array:[],object:[],ex:[]})
    {
        if (typeof value === 'string') {
            if(PropertyImportEngine.correctSyntax(value)) {
                const {exist,obj,name,type} = this.propertyImportEngine.check(value);
                const typeSrc = type === 'Object' ? otherSrc.object : otherSrc.array;
                if(name === mainSrc.name && ((mainSrc.isObj && type === 'Object') || (!mainSrc.isObj && type === 'Array'))){
                    this.ceb.addConfigError(new ConfigError(ConfigNames.APP,
                        `${target.getTarget()} creates a circular import.`));
                }
                else if(exist && type !== 'Value' && !typeSrc.includes(name)) {
                    typeSrc.push(name);
                    this.circularCheck(obj,target.addPath(`import-${type}=>${name}`),mainSrc,otherSrc);
                }
            }
        } else if (Array.isArray(value)) {
            if(value.length > 0){
                this.circularCheck(value[0], target.addPath('ArrayItem'), mainSrc,otherSrc);
            }
        } else if (typeof value === "object") {
            if (typeof value[nameof<ObjectPropertyConfig>(s => s.properties)] === 'object') {
                this.circularObjectCheck(value,target,[],mainSrc,otherSrc);
            } else if (typeof value[nameof<ArrayPropertyConfig>(s => s.array)] === 'object') {
                //isArray
                const inArray = value[nameof<ArrayPropertyConfig>(s => s.array)];
                this.circularCheck(inArray,target.addPath('ArrayItem'), mainSrc,otherSrc);
            } else if(value.hasOwnProperty(nameof<AnyOfProperty>(s => s.anyOf)))
            {
                const anyOf = value[nameof<AnyOfProperty>(s => s.anyOf)];
                if(typeof anyOf === 'object' || Array.isArray(anyOf)) {
                    Iterator.iterateSync((key,value) => {
                        this.circularCheck(value,target.addPath(key),mainSrc,otherSrc);
                    },anyOf);
                }
            }
        }
    }

    circularObjectCheck(value,target,excludeProps : string[],mainSrc : {name : string,isObj : boolean},otherSrc : {array : string[],object : string[],ex : string[]})
    {
        const props = value[nameof<ObjectPropertyConfig>(s => s.properties)];

        //ex check
        const extend = value[nameof<ObjectPropertyConfig>(s => s.extends)];

        if (typeof extend === 'string' && typeof this.objectsConfig[extend] === 'object' && !otherSrc.ex.includes(extend)) {
            if(mainSrc.isObj && mainSrc.name === extend) {
                this.ceb.addConfigError(new ConfigError(ConfigNames.APP,
                    `${target.addPath(`extends=>${extend}`).getTarget()} creates a circular inheritance.`));
            }
            else {
                otherSrc.ex.push(extend);
                this.circularObjectCheck(this.objectsConfig[extend],target.addPath(`extends=>${extend}`),Object.keys(props),mainSrc,otherSrc);
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

    private checkProperty(value, target, objName ?: string) {
        if (typeof value === 'string') {
           this.checkLink(value,target);
        } else if (Array.isArray(value)) {
            this.checkArrayShortCut(value, target, objName);
        } else if (typeof value === "object") {
            this.checkOptionalArrayWarning(value,target);
            //check input
            if (value.hasOwnProperty(nameof<ObjectPropertyConfig>(s => s.properties))) {
                this.checkObject(value, target, objName);
            } else if (value.hasOwnProperty(nameof<ArrayPropertyConfig>(s => s.array))) {
                //isArray
                ConfigCheckerTools.assertStructure(Structures.AppArray, value, ConfigNames.APP, this.ceb, target);
                if (typeof value[nameof<ArrayPropertyConfig>(s => s.array)] === 'object') {
                    const inArray = value[nameof<ArrayPropertyConfig>(s => s.array)];
                    this.checkProperty(inArray,target.addPath('ArrayItem'), objName);
                }
            } else if(value.hasOwnProperty(nameof<AnyOfProperty>(s => s.anyOf))) {
                ConfigCheckerTools.assertStructure(Structures.AnyOf, value, ConfigNames.APP, this.ceb, target);
                const anyOf = value[nameof<AnyOfProperty>(s => s.anyOf)];
                let count = 0;
                if (typeof anyOf === 'object' || Array.isArray(anyOf)) {
                    Iterator.iterateSync((key, value) => {
                        count++;
                        this.checkProperty(value, target.addPath(key), objName)
                    }, anyOf);
                }

                if (count < 2) {
                    this.ceb.addConfigError(new ConfigError(ConfigNames.APP,
                        `${target.getTarget()} anyOf modifier must have at least two properties.`));
                }
            }
            else {
                this.checkValueProperty(value,target);
            }
        } else {
            this.ceb.addConfigError(new ConfigError(ConfigNames.APP,
                `${target.getTarget()} wrong value type. Use a string to link to an object or an object to define the input body or an array shortcut.`));
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
                    typeof value[nameof<PropertyOptional>(s => s.isOptional)] === 'boolean' &&
                    target[nameof<PropertyOptional>(s => s.isOptional)]
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

    private checkValueProperty(config : object,target : Target,valueName ?: string)
    {
        //isNormalInputBody
        ConfigCheckerTools.assertStructure(Structures.InputBody, config, ConfigNames.APP, this.ceb, target);
        //check all that is not depend on full config
        this.checkRegexFunction(config, target);
        this.checkCharClassFunction(config,target);

        //check extends
        const ex = config[nameof<ValuePropertyConfig>(s => s.extends)];
        if(typeof ex === 'string') {
            if(!this.valuesConfig.hasOwnProperty(ex)) {
                this.ceb.addConfigError(new ConfigError(ConfigNames.APP,
                    `${target.getTarget()} the inheritance dependency to value: '${ex}' can not be resolved, Value not found.`));
            }else if(typeof valueName === 'string') {
                //check no self import
                config = this.checkProcessValueInheritance(target,config,config,valueName);
                target.setExtraInfo('Compiled with inheritance');
            }
        }

        //check for only number/string functions
        this.checkOnlyValidationFunction(config,target);
    }

    private checkProcessValueInheritance(target : Target,mainConfig : object,exConfig : object,valueName : string,otherSrc : string[] = []) : object
    {
        const ex = exConfig[nameof<ValuePropertyConfig>(s => s.extends)];
        if(this.valuesConfig.hasOwnProperty(ex) && typeof this.valuesConfig[ex] === 'object') {
            if(ex === valueName) {
                this.ceb.addConfigError(new ConfigError(ConfigNames.APP,
                    `${target.addPath(`extends=>${ex}`).getTarget()} creates a circular inheritance.`));
                return mainConfig;
            }
            else if(!otherSrc.includes(ex)) {
                otherSrc.push(ex);
                const exValueConfig = this.valuesConfig[ex];
                ObjectTools.addObToOb(mainConfig,exValueConfig);
                return this.checkProcessValueInheritance
                (target.addPath(`extends=>${ex}`),mainConfig,exValueConfig,valueName,otherSrc);
            }
        }
        return mainConfig;
    }

    private checkOnlyValidationFunction(value: ValuePropertyConfig, target) {
        if(value.type !== undefined)
        {
            const type = value.type;
            const isNumber = type === ValidationTypes.INT || type === ValidationTypes.FLOAT || type === ValidationTypes.NUMBER;

            if (isNumber && ObjectTools.hasOneOf(value, OnlyStringFunctions)) {
                const useFunctions = ObjectTools.getFoundKeys(value, OnlyStringFunctions);
                this.ceb.addConfigError(new ConfigError(ConfigNames.APP,
                    `${target.getTarget()} number type can't use this function${useFunctions.length > 1 ? 's' : ''}: ${useFunctions.toString()}.`));
            }

            if (!isNumber && (ObjectTools.hasOneOf(value, OnlyNumberFunctions))) {
                const useFunctions = ObjectTools.getFoundKeys(value, OnlyNumberFunctions);
                this.ceb.addConfigError(new ConfigError(ConfigNames.APP,
                    `${target.getTarget()} not number type can't use this function${useFunctions.length > 1 ? 's' : ''}: ${useFunctions.toString()}.`));
            }

            //check date functions
            if(type !== ValidationTypes.DATE && ObjectTools.hasOneOf(value,OnlyDateFunctions))
            {
                const useFunctions = ObjectTools.getFoundKeys(value, OnlyDateFunctions);
                this.ceb.addConfigError(new ConfigError(ConfigNames.APP,
                    `${target.getTarget()} not date type can't use this function${useFunctions.length > 1 ? 's' : ''}: ${useFunctions.toString()}.`));
            }
        }
    }

    private checkCharClassFunction(value : ValuePropertyConfig,target) {
       if(typeof value.charClass === 'string'){
           this.checkValidStringRegex
           (value.charClass,target.addPath(nameof<ValuePropertyConfig>(s => s.charClass)),'is not a valid regex char class. Do not forget to escape special characters.');
       }
    }

    private checkRegexFunction(value: ValuePropertyConfig, target: Target) {
        const regex = value.regex;
        const regexTarget = target.addPath(nameof<ValuePropertyConfig>(s => s.regex));

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
        if (!name.match(/^[a-zA-Z0-9-]*$/)) {
            this.ceb.addConfigError(new ConfigError(ConfigNames.APP,
                `${preString}'${name}' is not a valid ${type} name! Only letters, numbers and the minus symbol are allowed.`));
        }
    }

}

export = ConfigChecker;