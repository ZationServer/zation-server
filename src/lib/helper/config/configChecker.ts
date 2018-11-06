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
    AppConfig, ArrayPropertyConfig,
    ControllerConfig,
    ControllerInput,
    ObjectPropertyConfig,
    ValuePropertyConfig
} from "../configs/appConfig";
import {PanelUserConfig} from "../configs/mainConfig";
import {CustomService} from "../configs/serviceConfig";
import {ValidationTypes} from "../constants/validationTypes";
import {ChannelConfig, ChannelDefault, CustomChannelConfig} from "../configs/channelConfig";
import {OnlyNumberFunctions, OnlyStringFunctions} from "../constants/validation";

class ConfigChecker {
    private readonly zc: ZationConfig;
    private readonly ceb: ConfigErrorBag;

    private objectsConfig: Record<string, ObjectPropertyConfig>;
    private valuesConfig: Record<string, ValuePropertyConfig>;
    private cNames: object;
    private validAccessValues: any[];
    private objectImports: any[];
    private objectExtensions: any[];

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
        this.checkInputGroups();
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

                                if (chName.indexOf('.') !== -1) {
                                    this.ceb.addConfigError(new ConfigError(ConfigNames.CHANNEL,
                                        `${firstTarget.getTarget()} Channel name ${chName} is not valid! Dot/s in name are not allowed.`));
                                }
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
        this.objectImports = [];
        this.objectExtensions = [];
        for (let objName in this.objectsConfig) {
            if (this.objectsConfig.hasOwnProperty(objName)) {

                if (objName.indexOf('.') !== -1) {
                    this.ceb.addConfigError(new ConfigError(ConfigNames.APP,
                        `${objName} is not a valid object name! Dot/s in name are not allowed.`));
                }

                if (!Array.isArray(this.objectsConfig[objName]) && typeof this.objectsConfig[objName] === 'object') {
                    this.checkObject(this.objectsConfig[objName], new Target(`Object: ${objName}`, 'propertyPath'), objName);
                } else {
                    this.ceb.addConfigError(new ConfigError(ConfigNames.APP,
                        `Object: '${objName}' value must be an object!`));
                }
            }
        }
        this.checkCrossImportsOrExtends();
    }

    private checkCrossImportsOrExtends() {
        for (let i = 0; i < this.objectImports.length; i++) {
            let objDep = this.objectImports[i];
            if (this.isCrossIn(objDep, this.objectImports)) {
                this.objectImports[i] = {};

                this.ceb.addConfigError(new ConfigError(ConfigNames.APP,
                    `Object: '${objDep['s']}' uses '${objDep['t']}' Object: '${objDep['t']}' uses '${objDep['s']}' a cyclic import, it will create an infinite loop.`));
            }
        }

        for (let i = 0; i < this.objectExtensions.length; i++) {
            let objDep = this.objectExtensions[i];
            if (this.isCrossIn(objDep, this.objectExtensions)) {
                this.objectExtensions[i] = {};

                this.ceb.addConfigError(new ConfigError(ConfigNames.APP,
                    `Object: '${objDep['s']}' extends '${objDep['t']}' Object: '${objDep['t']}' extends '${objDep['s']}' a cyclic inheritance, it will create an infinite loop.`));
            }
        }
    }

    // noinspection JSMethodCanBeStatic
    private isCrossIn(objDep, array: object[]) {
        for (let i = 0; i < array.length; i++) {
            if
            (
                array[i]['s'] === objDep['t'] &&
                array[i]['t'] === objDep['s']
            ) {
                return true;
            }
        }
        return false;
    }

    private checkInputGroups() {
        for (let group in this.valuesConfig) {
            if (this.valuesConfig.hasOwnProperty(group)) {

                if (group.indexOf('.') !== -1) {
                    this.ceb.addConfigError(new ConfigError(ConfigNames.APP,
                        `${group} is not a valid input group name! Dot/s in name are not allowed.`));
                }

                const groupConfig = this.valuesConfig[group];
                ConfigCheckerTools.assertStructure
                (Structures.InputBody, groupConfig, ConfigNames.APP, this.ceb, new Target(`inputGroup '${group}'`));

                this.checkValidationFunctions(groupConfig, new Target(`inputGroup '${group}'`));
            }
        }
    }

    private checkObject(obj: ObjectPropertyConfig, target: Target, objName) {

        ConfigCheckerTools.assertStructure(Structures.AppObject, obj, ConfigNames.APP, this.ceb, target);

        let prototype = typeof obj.prototype === 'object' ? obj.prototype : {};

        //check property body and method property name problem
        if (typeof obj.properties === 'object') {
            let props = obj.properties;
            for (let k in props) {
                if (props.hasOwnProperty(k)) {
                    this.checkInputBody(props[k], target.addPath(k), objName);

                    if (prototype.hasOwnProperty(k)) {
                        Logger.printConfigWarning(
                            ConfigNames.APP,
                            `${target.getTarget()} Property '${k}' will override the prototype property '${k}'.`);
                    }
                }
            }
        }
        //check for extend
        if (typeof obj.extends === 'string') {
            this.checkObjExtend(obj.extends, target, objName);
            this.checkOverrideProp(obj.properties, target, obj.extends);

        }
    }

    private checkOverrideProp(props, target, superName) {
        if (typeof this.objectsConfig[superName] === 'object' && typeof props === 'object') {
            const superObj = this.objectsConfig[superName];
            if (typeof superObj.prototype === 'object') {
                const superMethods = superObj.prototype;
                for (let prop in props) {
                    if (props.hasOwnProperty(prop)) {
                        if (superMethods.hasOwnProperty(prop)) {
                            Logger.printConfigWarning(
                                ConfigNames.APP,
                                `${target.getTarget()} Property '${prop}' will override an inherited prototype property '${prop}' from object '${superName}'.`);
                        }
                    }
                }
            }
            if (typeof superObj.extends === 'string') {
                this.checkOverrideProp(props, target, superObj.extends);
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
                            false,
                            ConfigNames.SERVICE,
                            this.ceb,
                            target
                        );
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


                        for (let k in service) {
                            if (service.hasOwnProperty(k)) {
                                if (k === nameof<CustomService>(s => s.get) ||
                                    k === nameof<CustomService>(s => s.get)) {
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
        } else if (!ControllerCheckTools.canControllerRequire(cc, cPath, this.zc)) {
            this.ceb.addConfigError(new ConfigError(ConfigNames.APP,
                `${target.getTarget()} on Path: '${cPath}', can not require, syntax errors.`));
        } else {
            if (!ControllerCheckTools.isControllerExtendsController(cc, cPath, this.zc)) {
                this.ceb.addConfigError(new ConfigError(ConfigNames.APP,
                    `${target.getTarget()} on Path: '${cPath}', is not extends from main Controller class.`));
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
                    this.checkInputBody(input[k], target.addPath(k));
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

    private checkPropertyByObjLink(objLinkName, target, objName) {
        if (!this.objectsConfig.hasOwnProperty(objLinkName)) {
            this.ceb.addConfigError(new ConfigError(ConfigNames.APP,
                `${target.getTarget()} the link dependency to object: '${objLinkName}' can not be resolved, Object not found.`));
        } else {
            //check if object import it self (by controller objName will be undefined)
            if (objName === objLinkName) {
                this.ceb.addConfigError(new ConfigError(ConfigNames.APP,
                    `${target.getTarget()} object self import, will create an infinite loop.`));
            } else if (objName !== undefined) {
                //add to import table to check later the imports
                this.objectImports.push({s: objName, t: objLinkName});
            }
        }
    }

    private checkObjExtend(objExtendName, target, objName) {
        if (!this.objectsConfig.hasOwnProperty(objExtendName)) {
            this.ceb.addConfigError(new ConfigError(ConfigNames.APP,
                `${target.getTarget()} the inheritance dependency to object: '${objExtendName}' can not be resolved, Object not found.`));
        } else {
            //check if object extend it self (by controller objName will be undefined)
            if (objName === objExtendName) {
                this.ceb.addConfigError(new ConfigError(ConfigNames.APP,
                    `${target.getTarget()} object self inheritance, will create an infinite loop.`));
            } else if (objName !== undefined) {
                //add to extend table to check later the extensions
                this.objectExtensions.push({s: objName, t: objExtendName});
            }
        }
    }

    private checkArrayShortCut(value, target: Target, objName) {
        if (value.length === 0) {
            this.ceb.addConfigError(new ConfigError(ConfigNames.APP,
                `${target.getTarget()} you have to specify an object link (string) or an inputBody (object) or an new array shortcut.`));
        } else if (value.length === 1) {
            this.checkInputBody(value[0], target.addPath('Array'), objName);
        } else if (value.length === 2) {
            let newTarget = target.setExtraInfo('Array Shortcut Element 2');
            if (typeof value[1] !== 'object') {
                this.ceb.addConfigError(new ConfigError(ConfigNames.APP,
                    `${newTarget.getTarget()} the second shortCut item should be from typ object and can specify the array. Given typ is: '${typeof value[1]}'`));
            } else {
                ConfigCheckerTools.assertStructure(Structures.ArrayShortCutSpecify, value[1], ConfigNames.APP, this.ceb, newTarget);
            }

            this.checkInputBody(value[0], target.addPath('Array'), objName);
        } else {
            this.ceb.addConfigError(new ConfigError(ConfigNames.APP,
                `${target.getTarget()} invalid shortCut length: '${value.length}', 2 values are valid. First specify content and second to specify array.`));
        }
    }

    private checkInputBody(value, target, objName ?: object) {
        if (typeof value === 'string') {
            if (value.startsWith('g.')) {
                //check inputGroups
                this.checkValidInputGroup(value.replace('g.', ''), target);
            } else {
                this.checkPropertyByObjLink(value.replace('o.', ''), target, objName);
            }
        } else if (Array.isArray(value)) {
            this.checkArrayShortCut(value, target, objName);
        } else if (typeof value === "object") {
            //check input
            if (value.hasOwnProperty(nameof<ObjectPropertyConfig>(s => s.properties))) {
                this.checkObject(value, target, objName);
            } else if (value.hasOwnProperty(nameof<ArrayPropertyConfig>(s => s.array))) {
                //isArray
                ConfigCheckerTools.assertStructure(Structures.AppArray, value, ConfigNames.APP, this.ceb, target);
                if (typeof value[nameof<ArrayPropertyConfig>(s => s.array)] === 'object') {
                    const inArray = value[nameof<ArrayPropertyConfig>(s => s.array)];
                    this.checkInputBody(inArray, target.addPath('Array'), objName);
                }
            } else {
                //is this in body from an array?
                if (
                    target.getLastPath() === 'Array' &&
                    typeof value[nameof<ValuePropertyConfig>(s => s.isOptional)] === 'boolean' &&
                    value[nameof<ValuePropertyConfig>(s => s.isOptional)]
                ) {
                    Logger.printConfigWarning(
                        ConfigNames.APP,
                        `${target.getTarget()} Optional param in an array is useless.`
                    );
                }

                //isNormalInputBody
                ConfigCheckerTools.assertStructure(Structures.InputBody, value, ConfigNames.APP, this.ceb, target);

                //check for only number/string functions
                this.checkValidationFunctions(value, target);
            }
        } else {
            this.ceb.addConfigError(new ConfigError(ConfigNames.APP,
                `${target.getTarget()} wrong value type. Use a string to link to an object or an object to define the input body or an array shortcut.`));
        }
    }

    private checkValidInputGroup(value, target) {
        if (!this.valuesConfig.hasOwnProperty(value)) {
            this.ceb.addConfigError(new ConfigError(ConfigNames.APP,
                `${target.getTarget()} the dependency to input group: '${value}' can not be resolved, Group not found.`));
        }
    }

    private checkValidationFunctions(value, target: Target) {
        this.checkOnlyValidationFunction(value, target);
        this.checkRegexFunction(value, target);
    }

    private checkOnlyValidationFunction(value: ValuePropertyConfig, target) {
        const type = value.type;
        const isNumber = type === ValidationTypes.INT || type === ValidationTypes.FLOAT || type === ValidationTypes.NUMBER;

        if (isNumber && ObjectTools.hasOneOf(value, OnlyStringFunctions)) {
            let useFunctions = ObjectTools.getFoundKeys(value, OnlyStringFunctions);
            this.ceb.addConfigError(new ConfigError(ConfigNames.APP,
                `${target.getTarget()} number type can't use this function${useFunctions.length > 1 ? 's' : ''}: ${useFunctions.toString()}.`));
        }

        if (!isNumber && ObjectTools.hasOneOf(value, OnlyNumberFunctions)) {
            let useFunctions = ObjectTools.getFoundKeys(value, OnlyNumberFunctions);
            this.ceb.addConfigError(new ConfigError(ConfigNames.APP,
                `${target.getTarget()} not number type can't use this function${useFunctions.length > 1 ? 's' : ''}: ${useFunctions.toString()}.`));
        }
    }

    private checkRegexFunction(value: ValuePropertyConfig, target: Target) {
        const regex = value.regex;
        const regexTarget = target.addPath('regex');

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

}

export = ConfigChecker;