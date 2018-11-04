/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import ZationConfig         = require("../../main/zationConfig");
import Const                = require('../constants/constWrapper');
import Logger               = require('../logger/logger');
import ConfigError          = require('./configError');
import ConfigCheckerTools   = require('./configCheckerTools');
import ControllerCheckTools = require('../controller/controllerCheckTools');
import ObjectPath           = require('../tools/objectPath');
import ObjectTools          = require('../tools/objectTools');
import Structures           = require('./structures');
import Target               = require('./target');
import ConfigErrorBag       = require("./configErrorBag");

class ConfigChecker {
    private readonly zc: ZationConfig;
    private readonly ceb: ConfigErrorBag;

    private objectsConfig: object;
    private inputGroupConfig: object;
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
        (Structures.StarterConfig, this.zc.getStarterConfig(),
            Const.Settings.CN.STARTER, this.ceb);
    }

    public checkAllConfigs() {
        this.prepare();
        this.checkConfig();
    }

    private prepare() {
        this.prepareAllValidUserGroupsAndCheck();
        this.objectsConfig =
            this.zc.isApp(Const.App.KEYS.OBJECTS) && typeof this.zc.getApp(Const.App.KEYS.OBJECTS) === 'object'
                ? this.zc.getApp(Const.App.KEYS.OBJECTS) : {};

        this.inputGroupConfig =
            this.zc.isApp(Const.App.KEYS.VALUES) && typeof this.zc.getApp(Const.App.KEYS.VALUES) === 'object'
                ? this.zc.getApp(Const.App.KEYS.VALUES) : {};

        this.cNames = {};
    }

    private prepareAllValidUserGroupsAndCheck() {
        let groups: any = [];

        let extraKeys: any = [Const.App.ACCESS.ALL, Const.App.ACCESS.ALL_NOT_AUTH, Const.App.ACCESS.ALL_AUTH];

        let authGroups = ObjectPath.get(this.zc.getAppConfig(),
            [Const.App.KEYS.USER_GROUPS, Const.App.USER_GROUPS.AUTH]);

        if (!this.zc.isApp(Const.App.KEYS.USER_GROUPS)) {
            Logger.printConfigWarning
            (Const.Settings.CN.APP, `No settings for the user groups are found! DefaultUserGroup will be set to 'default'`);
        }

        if (authGroups !== undefined) {
            groups = Object.keys(authGroups);
        }

        //checkAuthGroups don't have a all/allAuth/allNotAuth name
        for (let i = 0; i < groups.length; i++) {
            if (groups[i].indexOf('.') !== -1) {
                this.ceb.addConfigError(new ConfigError(Const.Settings.CN.APP,
                    `${groups[i]} is not a valid auth user group! Dot/s in name are not allowed.`));
            }

            if (extraKeys.includes(groups[i])) {
                this.ceb.addConfigError(new ConfigError(Const.Settings.CN.APP,
                    `auth user group with name ${groups[i]} is not allowed use an other name!`));
            }

            ConfigCheckerTools.assertStructure
            (Structures.AuthUserGroup, authGroups[groups[i]],
                Const.Settings.CN.APP, this.ceb, new Target(`Auth User Group: '${groups[i]}'`));
        }


        let defaultGroup = ObjectPath.get(this.zc.getAppConfig(),
            [Const.App.KEYS.USER_GROUPS, Const.App.USER_GROUPS.DEFAULT]);

        if (defaultGroup !== undefined) {
            if (extraKeys.includes(defaultGroup)) {
                this.ceb.addConfigError(new ConfigError(Const.Settings.CN.APP,
                    `default user group with name ${defaultGroup} is not allowed use an other name!`));
            }
            groups.push(defaultGroup);
        } else {
            Logger.printConfigWarning
            (Const.Settings.CN.APP, `No settings for the default user group found! DefaultUserGroup will be set to 'default'`);
            groups.push(Const.Settings.DEFAULT_USER_GROUP.FALLBACK);
        }

        this.validAccessValues = groups;
        this.validAccessValues.push(Const.App.ACCESS.ALL, Const.App.ACCESS.ALL_NOT_AUTH, Const.App.ACCESS.ALL_AUTH);
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
        let bkt = this.zc.getApp(Const.App.BACKGROUND_TASKS);

        if (typeof bkt === 'object') {
            for (let name in bkt) {
                if (bkt.hasOwnProperty(name)) {
                    ConfigCheckerTools.assertStructure
                    (Structures.BackgroundTask, bkt[name],
                        Const.Settings.CN.APP, this.ceb, new Target(`BackgroundTask: '${name}'`));
                }
            }
        }
    }

    private checkAuthController() {
        let authControllerName = this.zc.getApp(Const.App.KEYS.AUTH_CONTROLLER);
        if (typeof authControllerName === "string" && this.zc.isApp(Const.App.KEYS.CONTROLLER)) {
            let controller = this.zc.getApp(Const.App.KEYS.CONTROLLER);
            if (!controller.hasOwnProperty(authControllerName)) {
                this.ceb.addConfigError(new ConfigError(Const.Settings.CN.APP,
                    `AuthController: '${authControllerName}' is not found.`));
            } else {
                //checkAuthControllerAccess value
                let authController = controller[authControllerName];
                if (authController[Const.App.CONTROLLER.ACCESS] !== Const.App.ACCESS.ALL) {
                    Logger.printConfigWarning
                    (Const.Settings.CN.APP, `It is recommended to set the access of the authController directly to 'all'.`);
                }
            }
        }
    }


    private checkEventConfig() {
        ConfigCheckerTools.assertStructure
        (Structures.EventConfig, this.zc.getEventConfig(), Const.Settings.CN.EVENT, this.ceb);
    }

    private checkErrorConfig() {
        if (typeof this.zc.getErrorConfig() === 'object') {
            let errors = this.zc.getErrorConfig();
            for (let k in errors) {
                if (errors.hasOwnProperty(k)) {
                    this.checkError(errors[k], new Target(`error '${k}'`));
                }
            }
        }
    }

    private checkError(error: object, target: Target) {
        ConfigCheckerTools.assertStructure
        (Structures.Error, error, Const.Settings.CN.ERROR, this.ceb, target);
    }

    private checkChannelConfig() {
        //main structure
        ConfigCheckerTools.assertStructure
        (Structures.ChannelConfig, this.zc.getChannelConfig(), Const.Settings.CN.CHANNEL, this.ceb);


        let mainChannels = this.zc.getChannelConfig();
        for (let key in mainChannels) {
            if (mainChannels.hasOwnProperty(key) && typeof mainChannels[key] === 'object') {
                if (key === Const.Channel.KEYS.CUSTOM_CHANNELS || key === Const.Channel.KEYS.CUSTOM_ID_CHANNELS) {
                    const chPart = mainChannels[key];
                    const firstTarget = new Target(key);
                    for (let chName in chPart) {
                        if (chPart.hasOwnProperty(chName)) {

                            if (chName.indexOf('.') !== -1) {
                                this.ceb.addConfigError(new ConfigError(Const.Settings.CN.CHANNEL,
                                    `${firstTarget.getTarget()} Channel name ${chName} is not valid! Dot/s in name are not allowed.`));
                            }

                            this.checkFullChannelItem(chPart[chName], firstTarget, chName);
                        }
                    }
                } else if
                (
                    key === Const.Channel.KEYS.ALL_CH || key === Const.Channel.KEYS.DEFAULT_USER_GROUP_CH ||
                    key === Const.Channel.KEYS.AUTH_USER_GROUP_CH || key === Const.Channel.KEYS.USER_CH) {
                    ConfigCheckerTools.assertStructure
                    (Structures.ChannelNormalItem, mainChannels[key], Const.Settings.CN.CHANNEL, this.ceb, new Target(key));
                }
            }
        }
    }

    private checkFullChannelItem(channel: any, firstTarget: Target, chName: string): void {
        const mainTarget = firstTarget.addPath(chName);

        ConfigCheckerTools.assertStructure
        (Structures.ChannelFullItem, channel, Const.Settings.CN.CHANNEL, this.ceb, mainTarget);

        if (typeof channel === 'object') {
            if (channel.hasOwnProperty(Const.Channel.CHANNEL.CLIENT_PUBLISH_ACCESS) &&
                channel.hasOwnProperty(Const.Channel.CHANNEL.CLIENT_PUBLISH_NOT_ACCESS)) {
                this.ceb.addConfigError(new ConfigError(Const.Settings.CN.CHANNEL,
                    `${mainTarget.getTarget()} only 'publishAccess' or 'publishNotAccess' keyword is allow.`));
            }
            if (channel.hasOwnProperty(Const.Channel.CHANNEL.SUBSCRIBE_ACCESS) &&
                channel.hasOwnProperty(Const.Channel.CHANNEL.SUBSCRIBE_NOT_ACCESS)) {
                this.ceb.addConfigError(new ConfigError(Const.Settings.CN.CHANNEL,
                    `${mainTarget.getTarget()} only 'subscribeAccess' or 'subscribeNotAccess' keyword is allow.`));
            }

            //check protocolAccess dependency to userGroups
            this.checkAccessKeyDependency
            (channel[Const.Channel.CHANNEL.CLIENT_PUBLISH_ACCESS], Const.Channel.CHANNEL.CLIENT_PUBLISH_ACCESS, mainTarget);
            this.checkAccessKeyDependency
            (channel[Const.Channel.CHANNEL.CLIENT_PUBLISH_NOT_ACCESS], Const.Channel.CHANNEL.CLIENT_PUBLISH_NOT_ACCESS, mainTarget);
            this.checkAccessKeyDependency
            (channel[Const.Channel.CHANNEL.SUBSCRIBE_ACCESS], Const.Channel.CHANNEL.SUBSCRIBE_ACCESS, mainTarget);
            this.checkAccessKeyDependency
            (channel[Const.Channel.CHANNEL.SUBSCRIBE_NOT_ACCESS], Const.Channel.CHANNEL.SUBSCRIBE_NOT_ACCESS, mainTarget);

            this.warningForPublish(channel[Const.Channel.CHANNEL.CLIENT_PUBLISH_ACCESS], mainTarget);
            this.warningForPublish(channel[Const.Channel.CHANNEL.CLIENT_PUBLISH_NOT_ACCESS], mainTarget);
        }

        if
        (
            chName === Const.Channel.CHANNEL_DEFAULT.DEFAULT &&
            !(
                (channel.hasOwnProperty(Const.Channel.CHANNEL.CLIENT_PUBLISH_ACCESS) ||
                    channel.hasOwnProperty(Const.Channel.CHANNEL.CLIENT_PUBLISH_NOT_ACCESS)) &&
                (channel.hasOwnProperty(Const.Channel.CHANNEL.SUBSCRIBE_ACCESS) ||
                    channel.hasOwnProperty(Const.Channel.CHANNEL.SUBSCRIBE_NOT_ACCESS))
            )
        ) {
            Logger.printConfigWarning(`${Const.Settings.CN.CHANNEL} ${firstTarget.getMainTarget()}`, 'It is recommended to set a default value for clientPublishAccess and subscribeAccess.');
        }
    }

    // noinspection JSMethodCanBeStatic
    private warningForPublish(value: any, target: Target): void {
        if (value !== undefined && (typeof value !== "boolean" || value)) {
            Logger.printConfigWarning
            (Const.Settings.CN.CHANNEL,
                `${target.getTarget()} please notice that 'publishAccess' is used when a client publish from outside!` +
                `So it is better to use an controller (with validation) and publish from server side!`);
        }
    }


    private checkAccessControllerDefaultIsSet() {
        let access = ObjectPath.get(this.zc.getAppConfig(),
            [Const.App.KEYS.CONTROLLER_DEFAULTS, Const.App.CONTROLLER.ACCESS]);

        let notAccess = ObjectPath.get(this.zc.getAppConfig(),
            [Const.App.KEYS.CONTROLLER_DEFAULTS, Const.App.CONTROLLER.NOT_ACCESS]);

        if (access === undefined && notAccess === undefined) {
            Logger.printConfigWarning(Const.Settings.CN.APP, 'It is recommended to set a controller default value for protocolAccess or notAccess.');
        }
    }

    private checkObjectsConfig() {
        this.objectImports = [];
        this.objectExtensions = [];
        for (let objName in this.objectsConfig) {
            if (this.objectsConfig.hasOwnProperty(objName)) {

                if (objName.indexOf('.') !== -1) {
                    this.ceb.addConfigError(new ConfigError(Const.Settings.CN.APP,
                        `${objName} is not a valid object name! Dot/s in name are not allowed.`));
                }

                if (!Array.isArray(this.objectsConfig[objName]) && typeof this.objectsConfig[objName] === 'object') {
                    this.checkObject(this.objectsConfig[objName], new Target(`Object: ${objName}`, 'propertyPath'), objName);
                }
                else {
                    this.ceb.addConfigError(new ConfigError(Const.Settings.CN.APP,
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

                this.ceb.addConfigError(new ConfigError(Const.Settings.CN.APP,
                    `Object: '${objDep['s']}' uses '${objDep['t']}' Object: '${objDep['t']}' uses '${objDep['s']}' a cyclic import, it will create an infinite loop.`));
            }
        }

        for (let i = 0; i < this.objectExtensions.length; i++) {
            let objDep = this.objectExtensions[i];
            if (this.isCrossIn(objDep, this.objectExtensions)) {
                this.objectExtensions[i] = {};

                this.ceb.addConfigError(new ConfigError(Const.Settings.CN.APP,
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
        for (let group in this.inputGroupConfig) {
            if (this.inputGroupConfig.hasOwnProperty(group)) {

                if (group.indexOf('.') !== -1) {
                    this.ceb.addConfigError(new ConfigError(Const.Settings.CN.APP,
                        `${group} is not a valid input group name! Dot/s in name are not allowed.`));
                }

                const groupConfig = this.inputGroupConfig[group];
                ConfigCheckerTools.assertStructure
                (Structures.InputBody, groupConfig, Const.Settings.CN.APP, this.ceb, new Target(`inputGroup '${group}'`));

                this.checkValidationFunctions(groupConfig, new Target(`inputGroup '${group}'`));
            }
        }
    }

    private checkObject(obj, target : Target, objName) {

        ConfigCheckerTools.assertStructure(Structures.AppObject, obj, Const.Settings.CN.APP, this.ceb, target);

        let prototype = typeof obj[Const.App.OBJECT.PROTOTYPE] === 'object' ?
            obj[Const.App.OBJECT.PROTOTYPE] : {};

        //check property body and method property name problem
        if (typeof obj[Const.App.OBJECT.PROPERTIES] === 'object') {
            let props = obj[Const.App.OBJECT.PROPERTIES];
            for (let k in props) {
                if (props.hasOwnProperty(k)) {
                    this.checkInputBody(props[k], target.addPath(k), objName);

                    if(prototype.hasOwnProperty(k)) {
                        Logger.printConfigWarning(
                            Const.Settings.CN.APP,
                            `${target.getTarget()} Property '${k}' will override the prototype property '${k}'.`);
                    }
                }
            }
        }
        //check for extend
        if (typeof obj[Const.App.OBJECT.EXTENDS] === 'string') {
            this.checkObjExtend(obj[Const.App.OBJECT.EXTENDS],target,objName);
            this.checkOverrideProp(obj[Const.App.OBJECT.PROPERTIES],target,obj[Const.App.OBJECT.EXTENDS]);

        }
    }

    private checkOverrideProp(props,target,superName)
    {
        if(typeof this.objectsConfig[superName] === 'object' && typeof props === 'object')
        {
            const superObj = this.objectsConfig[superName];
            if(typeof superObj[Const.App.OBJECT.PROTOTYPE] === 'object')
            {
                const superMethods = superObj[Const.App.OBJECT.PROTOTYPE];
                for(let prop in props)
                {
                    if(props.hasOwnProperty(prop)) {
                        if(superMethods.hasOwnProperty(prop)) {
                            Logger.printConfigWarning(
                                Const.Settings.CN.APP,
                                `${target.getTarget()} Property '${prop}' will override an inherited prototype property '${prop}' from object '${superName}'.`);
                        }
                    }
                }
            }
            if(typeof superObj[Const.App.OBJECT.EXTENDS] === 'string'){
                this.checkOverrideProp(props,target,superObj[Const.App.OBJECT.EXTENDS]);
            }
        }
    }

    private checkAppConfigMain() {
        ConfigCheckerTools.assertStructure(Structures.App, this.zc.getAppConfig(), Const.Settings.CN.APP, this.ceb);
    }

    private checkMainConfig() {
        //checkStructure
        ConfigCheckerTools.assertStructure(Structures.Main, this.zc.getMainConfig(), Const.Settings.CN.MAIN, this.ceb);

        this.checkHttpsMainConfig();
        this.checkPanelUserMainConfig();
    }

   private checkHttpsMainConfig()
   {
       const httpsConfig = this.zc.getMain(Const.Main.KEYS.HTTPS_CONFIG);

       if(typeof httpsConfig === 'object')
       {
           //checkStructure
           ConfigCheckerTools.assertStructure(Structures.HttpsConfig,httpsConfig,Const.Settings.CN.MAIN,this.ceb);
       }
   }

   private checkPanelUserMainConfig()
   {
       const panelUserConfig = this.zc.getMain(Const.Main.KEYS.PANEL_USER);
       let hasOneUser = false;
       if(Array.isArray(panelUserConfig)) {
           for(let i = 0; i < panelUserConfig.length; i++) {
               hasOneUser = true;
               this.checkPanelUserConfig(panelUserConfig[i],new Target(`Panel UserConfig '${i}'`));
           }
       }
       else if(typeof panelUserConfig === 'object') {
           hasOneUser = true;
           this.checkPanelUserConfig(panelUserConfig,new Target(`Panel UserConfig`));
       }

       if(this.zc.getMain(Const.Main.KEYS.USE_PANEL) && !hasOneUser) {
           Logger.printConfigWarning
           (
               Const.Settings.CN.MAIN,
               `The zation panel is activated but no panelUser is defined in the main config.`
           );
       }

   }

   private checkPanelUserConfig(config : object,target ?: Target)
   {
       //checkStructure
       ConfigCheckerTools.assertStructure(Structures.PanelUserConfig,config,Const.Settings.CN.MAIN,this.ceb,target);

       if( config[Const.Main.PANEL_USER.PASSWORD] === 'admin' &&
           config[Const.Main.PANEL_USER.USER_NAME] === 'admin' &&
           this.zc.getMain(Const.Main.KEYS.USE_PANEL))
       {
           Logger.printConfigWarning
           (Const.Settings.CN.MAIN, `Its recommend to not use the default panel access credentials!` +
           ` So please change them in the main config!`);
       }
   }

    private checkServiceConfig()
    {
        //checkStructure
        ConfigCheckerTools.assertStructure
        (Structures.ServiceConfig,this.zc.getServiceConfig(),Const.Settings.CN.SERVICE,this.ceb);

        //checkServices
        this.checkServices();

        //check Custom Services
        this.checkCustomServices();
    }

   private checkServices()
   {
       let s = this.zc.getService(Const.Service.KEYS.SERVICES);

       //check services
       if(typeof s === 'object')
       {
           ConfigCheckerTools.assertStructure
           (Structures.Services,s,Const.Settings.CN.SERVICE,this.ceb,new Target(`Services`));

           for(let serviceName in s)
           {
               if(s.hasOwnProperty(serviceName) && typeof s[serviceName] === 'object')
               {
                   let service = s[serviceName];
                   let target = new Target(`Services: '${serviceName}'`);

                   for(let k in service)
                   {
                       if(service.hasOwnProperty(k))
                       {
                           ConfigCheckerTools.assertProperty
                           (
                               k,
                               service,
                               'object',
                               true,
                               Const.Settings.CN.SERVICE,
                               this.ceb,
                               target
                           );
                       }
                   }
               }
           }

       }
   }

   private checkCustomServices()
   {
       let cs = this.zc.getService(Const.Service.KEYS.CUSTOM_SERVICES);
       //check custom services
       if(typeof cs === 'object')
       {
           for(let serviceName in cs)
           {
               if(cs.hasOwnProperty(serviceName))
               {
                   //check only objects in
                   ConfigCheckerTools.assertProperty
                   (
                       serviceName,
                       cs,
                       'object',
                       true,
                       Const.Settings.CN.SERVICE,
                       this.ceb,
                       new Target(`Custom Services`)
                   );

                   if(typeof cs[serviceName] === 'object')
                   {
                       //check custom services structure
                       let service = cs[serviceName];
                       let target = new Target(`Custom Services: '${serviceName}'`);

                       //check create and get
                       ConfigCheckerTools.assertProperty
                       (
                           Const.Service.CUSTOM_SERVICES.CREATE,
                           service,
                           'function',
                           false,
                           Const.Settings.CN.SERVICE,
                           this.ceb,
                           target
                       );
                       ConfigCheckerTools.assertProperty
                       (
                           Const.Service.CUSTOM_SERVICES.GET,
                           service,
                           'function',
                           true,
                           Const.Settings.CN.SERVICE,
                           this.ceb,
                           target
                       );


                       for(let k in service)
                       {
                           if(service.hasOwnProperty(k))
                           {
                               if(k === Const.Service.CUSTOM_SERVICES.GET ||
                                   k === Const.Service.CUSTOM_SERVICES.CREATE)
                               {
                                   continue;
                               }
                               ConfigCheckerTools.assertProperty
                               (
                                   k,
                                   service,
                                   'object',
                                   true,
                                   Const.Settings.CN.SERVICE,
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

   private checkControllerConfigs()
   {
       //check Controller
       if (this.zc.isApp(Const.App.KEYS.CONTROLLER))
       {
           let controller = this.zc.getApp(Const.App.KEYS.CONTROLLER);
           for(let cName in controller)
           {
               if(controller.hasOwnProperty(cName))
               {
                   this.checkController(controller[cName],new Target(`Controller: '${cName}'`),cName);
               }
           }
       }

       //check controllerDefault
       if (this.zc.isApp(Const.App.KEYS.CONTROLLER_DEFAULTS))
       {
           let controller = this.zc.getApp(Const.App.KEYS.CONTROLLER_DEFAULTS);
           this.checkController(controller,new Target(Const.App.KEYS.CONTROLLER_DEFAULTS));
       }

       this.checkControllerPaths();
   }

   // noinspection JSMethodCanBeStatic
    private checkControllerVersionAccess(cc : object,target : Target)
   {
       if(typeof cc[Const.App.CONTROLLER.VERSION_ACCESS] === 'object' &&
           Object.keys(cc[Const.App.CONTROLLER.VERSION_ACCESS]).length === 0)
       {
           Logger.printConfigWarning
           (
               Const.Settings.CN.APP,
               target.getTarget()+' It is recommended that versionAccess has at least one system!'
           );
       }

   }

   private checkController(cc : object,target : Target,cName ? : string)
   {
       this.checkControllerAccessKey(cc,target);

       const structure = cName ? Structures.AppController : Structures.AppControllerDefaults;
       ConfigCheckerTools.assertStructure(structure,cc,Const.Settings.CN.APP,this.ceb,target);

       this.checkInputAllAllow(cc,target);

       this.checkControllerInput(cc,target);
       this.checkControllerVersionAccess(cc,target);

       if(cName) {
           this.checkControllerClass(cc,target,cName);
       }
   }

   // noinspection JSMethodCanBeStatic
    private checkInputAllAllow(cc : object,target : Target)
   {
       if(typeof cc[Const.App.CONTROLLER.INPUT_ALL_ALLOW] === 'boolean' &&
           cc[Const.App.CONTROLLER.INPUT_ALL_ALLOW] && typeof cc[Const.App.CONTROLLER.INPUT] === 'object')
       {
           Logger.printConfigWarning(
               Const.Settings.CN.APP,
               `${target.getTarget()} the property input is ignored with inputAllAllow true.`
           );

       }
   }

   private checkControllerClass(cc : object,target : Target,cName : string)
   {
       let cPath = ControllerCheckTools.getControllerFPathForCheck(cc,cName);
       this.addControllerPaths(cPath,cName);

       if(!ControllerCheckTools.controllerFileExist(cc,cPath,this.zc))
       {
           this.ceb.addConfigError(new ConfigError(Const.Settings.CN.APP,
               `${target.getTarget()} on Path: '${cPath}', can not found the controller file.`));
       }
       else if(!ControllerCheckTools.canControllerRequire(cc,cPath,this.zc))
       {
           this.ceb.addConfigError(new ConfigError(Const.Settings.CN.APP,
               `${target.getTarget()} on Path: '${cPath}', can not require, syntax errors.`));
       }
       else
       {
           if(!ControllerCheckTools.isControllerExtendsController(cc,cPath,this.zc))
           {
               this.ceb.addConfigError(new ConfigError(Const.Settings.CN.APP,
                   `${target.getTarget()} on Path: '${cPath}', is not extends from main Controller class.`));
           }
       }
   }

   private checkControllerPaths()
   {
       for(let p in this.cNames)
       {
           if(this.cNames.hasOwnProperty(p) && Array.isArray(this.cNames[p])
             && this.cNames[p].length > 1)
           {
               Logger.printConfigWarning
               (
                   Const.Settings.CN.APP,
                   `Controller: '${this.cNames[p].toString()}' have the same lowercase path (Warning for case insensitive systems) or path: '${p}'.`
               );
           }
       }
   }

   private addControllerPaths(path,cName)
   {
       let sPath = path.toLowerCase();

       if(Array.isArray(this.cNames[sPath])) {
           this.cNames[sPath].push(cName);
       }
       else {
           this.cNames[sPath] = [cName];
       }
   }

   private checkControllerInput(cc,target)
   {
       let input = cc[Const.App.CONTROLLER.INPUT];
       let keys : any[] = [];
       if(typeof input === 'object')
       {
           for(let k in input)
           {
               if(input.hasOwnProperty(k))
               {
                   keys.push(k);
                   this.checkInputBody(input[k],target.addPath(k));
               }
           }
       }
       this.checkOptionalRecommendation(keys,input,target);
   }

    // noinspection JSMethodCanBeStatic
    private checkOptionalRecommendation(keys,input,target)
    {
        let wasLastOptional = false;
        for(let i = keys.length-1; i >= 0; i--)
        {
            if(input[keys[i]][Const.App.VALUE.IS_OPTIONAL] !== undefined &&
                input[keys[i]][Const.App.VALUE.IS_OPTIONAL])
            {
                if((keys.length-1) !== i && !wasLastOptional)
                {
                    Logger.printConfigWarning
                    (
                        Const.Settings.CN.APP,
                        `${target.getTarget()} input: '${keys[i]}', It is recommended to set the optional parameters at the first input level at the end.`
                    );
                    break;
                }
                wasLastOptional = true;
            }
            else
            {
                wasLastOptional = false;
            }
        }
    }

   private checkPropertyByObjLink(objLinkName,target,objName)
   {
       if(!this.objectsConfig.hasOwnProperty(objLinkName))
       {
           this.ceb.addConfigError(new ConfigError(Const.Settings.CN.APP,
               `${target.getTarget()} the link dependency to object: '${objLinkName}' can not be resolved, Object not found.`));
       }
       else {
           //check if object import it self (by controller objName will be undefined)
           if(objName === objLinkName)
           {
               this.ceb.addConfigError(new ConfigError(Const.Settings.CN.APP,
                   `${target.getTarget()} object self import, will create an infinite loop.`));
           }
           else if(objName !== undefined)
           {
               //add to import table to check later the imports
               this.objectImports.push({s:objName,t:objLinkName});
           }
       }
   }

   private checkObjExtend(objExtendName,target,objName)
   {
       if(!this.objectsConfig.hasOwnProperty(objExtendName))
       {
           this.ceb.addConfigError(new ConfigError(Const.Settings.CN.APP,
               `${target.getTarget()} the inheritance dependency to object: '${objExtendName}' can not be resolved, Object not found.`));
       }
       else {
           //check if object extend it self (by controller objName will be undefined)
           if(objName === objExtendName) {
               this.ceb.addConfigError(new ConfigError(Const.Settings.CN.APP,
                   `${target.getTarget()} object self inheritance, will create an infinite loop.`));
           }
           else if(objName !== undefined) {
               //add to extend table to check later the extensions
               this.objectExtensions.push({s:objName,t:objExtendName});
           }
       }
   }

   private checkArrayShortCut(value,target : Target,objName)
   {
       if(value.length === 0)
       {
           this.ceb.addConfigError(new ConfigError(Const.Settings.CN.APP,
               `${target.getTarget()} you have to specify an object link (string) or an inputBody (object) or an new array shortcut.`));
       }
       else if(value.length === 1)
       {
           this.checkInputBody(value[0],target.addPath('Array'),objName);
       }
       else if(value.length === 2)
       {
           let newTarget = target.setExtraInfo('Array Shortcut Element 2');
           if(typeof value[1] !== 'object')
           {
               this.ceb.addConfigError(new ConfigError(Const.Settings.CN.APP,
                   `${newTarget.getTarget()} the second shortCut item should be from typ object and can specify the array. Given typ is: '${typeof value[1]}'`));
           }
           else
           {
               ConfigCheckerTools.assertStructure(Structures.ArrayShortCutSpecify,value[1],Const.Settings.CN.APP,this.ceb,newTarget);
           }

           this.checkInputBody(value[0],target.addPath('Array'),objName);
       }
       else
       {
           this.ceb.addConfigError(new ConfigError(Const.Settings.CN.APP,
               `${target.getTarget()} invalid shortCut length: '${value.length}', 2 values are valid. First specify content and second to specify array.`));
       }
   }

   private checkInputBody(value,target,objName ?: object)
   {
       if(typeof value === 'string')
       {
           if(value.startsWith('g.')) {
               //check inputGroups
               this.checkValidInputGroup(value.replace('g.',''),target);
           }
           else {
               this.checkPropertyByObjLink(value.replace('o.',''),target,objName);
           }
       }
       else if(Array.isArray(value))
       {
           this.checkArrayShortCut(value,target,objName);
       }
       else if(typeof value === "object")
       {
           //check input
           if(value.hasOwnProperty(Const.App.OBJECT.PROPERTIES)) {
               this.checkObject(value,target,objName);
           }
           else if(value.hasOwnProperty(Const.App.VALUE.ARRAY))
           {
               //isArray
               ConfigCheckerTools.assertStructure(Structures.AppArray,value,Const.Settings.CN.APP,this.ceb,target);
               if(typeof value[Const.App.VALUE.ARRAY] === 'object')
               {
                   let inArray = value[Const.App.VALUE.ARRAY];
                   this.checkInputBody(inArray,target.addPath('Array'),objName);
               }
           }
           else
           {
               //is this in body from an array?
               if(
                   target.getLastPath() === 'Array' &&
                   typeof value[Const.App.VALUE.IS_OPTIONAL] === 'boolean' &&
                   value[Const.App.VALUE.IS_OPTIONAL]
               ) {
                   Logger.printConfigWarning
                   (
                       Const.Settings.CN.APP,
                       `${target.getTarget()} Optional param in an array is useless.`
                   );
               }

               //isNormalInputBody
               ConfigCheckerTools.assertStructure(Structures.InputBody,value,Const.Settings.CN.APP,this.ceb,target);

               //check for only number/string functions
               this.checkValidationFunctions(value,target);
           }
       }
       else
       {
           this.ceb.addConfigError(new ConfigError(Const.Settings.CN.APP,
               `${target.getTarget()} wrong value type. Use a string to link to an object or an object to define the input body or an array shortcut.`));
       }
   }

   private checkValidInputGroup(value,target)
   {
       if(!this.inputGroupConfig.hasOwnProperty(value)) {
           this.ceb.addConfigError(new ConfigError(Const.Settings.CN.APP,
               `${target.getTarget()} the dependency to input group: '${value}' can not be resolved, Group not found.`));
       }
   }

   private checkValidationFunctions(value,target : Target)
   {
       this.checkOnlyValidationFunction(value,target);
       this.checkRegexFunction(value,target);
   }

   private checkOnlyValidationFunction(value,target)
   {
       const type = value[Const.Validator.KEYS.TYPE];
       const isNumber =  type === Const.Validator.TYPE.INT || type === Const.Validator.TYPE.FLOAT || type === Const.Validator.TYPE.NUMBER;

       if (isNumber && ObjectTools.hasOneOf(value,Const.Validator.ONLY_STRING_FUNCTIONS))
       {
           let useFunctions = ObjectTools.getFoundKeys(value,Const.Validator.ONLY_STRING_FUNCTIONS);
           this.ceb.addConfigError(new ConfigError(Const.Settings.CN.APP,
               `${target.getTarget()} number type can't use this function${useFunctions.length>1 ? 's' : ''}: ${useFunctions.toString()}.`));
       }

       if (!isNumber && ObjectTools.hasOneOf(value,Const.Validator.ONLY_NUMBER_FUNCTIONS))
       {
           let useFunctions = ObjectTools.getFoundKeys(value,Const.Validator.ONLY_NUMBER_FUNCTIONS);
           this.ceb.addConfigError(new ConfigError(Const.Settings.CN.APP,
               `${target.getTarget()} not number type can't use this function${useFunctions.length>1 ? 's' : ''}: ${useFunctions.toString()}.`));
       }
   }

   private checkRegexFunction(value,target : Target)
   {
       const regex = value[Const.Validator.KEYS.FUNCTION_REGEX];
       const regexTarget = target.addPath('regex');

       if(typeof regex === 'object' && !(regex instanceof RegExp)){
           for(let regexName in regex)
           {
               if(regex.hasOwnProperty(regexName)) {
                   this.checkRegex(regex[regexName],regexTarget.addPath(regexName));
               }
           }
       }
       else if(regex !== undefined){
           this.checkRegex(value,regexTarget);
       }
   }

   private checkRegex(value,target)
   {
       if(!(typeof value === 'string' || value instanceof RegExp)){
           this.ceb.addConfigError(new ConfigError(Const.Settings.CN.APP,
               `${target.getTarget()} is not a string or an ReqExp object.`));
       }
   }

   private static getAccessKeyWord(access : any, notAccess : any) : string
   {
       let keyWord = '';
       //search One
       if(notAccess !== undefined && access === undefined)
       {
           keyWord = Const.App.CONTROLLER.NOT_ACCESS;
       }
       else if(notAccess === undefined && access !== undefined)
       {
           keyWord = Const.App.CONTROLLER.ACCESS;
       }
       return keyWord;
   }

   private checkControllerAccessKey(cc,target)
   {
       let notAccess = cc[Const.App.CONTROLLER.NOT_ACCESS];
       let access    = cc[Const.App.CONTROLLER.ACCESS];

       if(notAccess !== undefined && access !== undefined)
       {
           this.ceb.addConfigError(new ConfigError(Const.Settings.CN.APP,
               `${target.getTarget()} has a access and notAccess keyword only one is allowed!`));
       }
       else
       {
           let keyWord = ConfigChecker.getAccessKeyWord(access,notAccess);
           this.checkAccessKeyDependency(cc[keyWord],keyWord,target);
       }
   }

   private checkAccessKeyDependency(value,keyword,target)
   {
       let checkDependency = (string) =>
       {
           ConfigCheckerTools.assertEqualsOne
           (
               this.validAccessValues,
               string,
               Const.Settings.CN.APP,
               this.ceb,
               `user group '${string}' is not found in auth groups or is default group.`,
               target.addPath(keyword)
           );
       };

       if(typeof value === 'string')
       {
           checkDependency(value);
       }
       else if(Array.isArray(value))
       {
           value.forEach((e) =>
           {
               if(typeof e === 'string')
               {
                   checkDependency(e);
               }
           })
       }
   }

}

export = ConfigChecker;