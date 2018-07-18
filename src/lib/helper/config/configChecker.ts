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

//todo
/*
app config
if type = file -> only file functions
 */

class ConfigChecker
{
   private readonly zc : ZationConfig;
   private readonly ceb : ConfigErrorBag;

   private objectsConfig : object;
   private validationGroupConfig : object;
   private cNames : object;
   private validAccessValues : any[];
   private objectImports : any[];

   constructor(zationConfig,configErrorBag)
   {
       this.zc = zationConfig;
       this.ceb = configErrorBag;
   }

   public checkStarterConfig()
   {
       ConfigCheckerTools.assertStructure
       (Structures.StarterConfig,this.zc.getStarterConfig(),
           Const.Settings.CN.STARTER,this.ceb);
   }

   public checkAllConfigs()
   {
       this.prepare();
       this.checkConfig();
   }
   
   private prepare()
   {
       this.prepareAllValidUserGroupsAndCheck();
       this.objectsConfig =
           this.zc.isApp(Const.App.KEYS.OBJECTS) && typeof this.zc.getApp(Const.App.KEYS.OBJECTS) === 'object'
               ? this.zc.getApp(Const.App.KEYS.OBJECTS) : {};

       this.validationGroupConfig =
           this.zc.isApp(Const.App.KEYS.VALIDATION_GROUPS) && typeof this.zc.getApp(Const.App.KEYS.VALIDATION_GROUPS) === 'object'
               ? this.zc.getApp(Const.App.KEYS.VALIDATION_GROUPS) : {};

       this.cNames = {};
   }

   private prepareAllValidUserGroupsAndCheck()
   {
       let groups : any = [];

       let extraKeys : any = [Const.App.ACCESS.ALL,Const.App.ACCESS.ALL_NOT_AUTH,Const.App.ACCESS.ALL_AUTH];

       let authGroups = ObjectPath.getPath(this.zc.getAppConfig(),
           [Const.App.KEYS.USER_GROUPS,Const.App.USER_GROUPS.AUTH]);

       if(!this.zc.isApp(Const.App.KEYS.USER_GROUPS))
       {
           Logger.printConfigWarning
           (Const.Settings.CN.APP,`No settings for the user groups are found! DefaultUserGroup will be set to 'default'`);
       }

       if(authGroups !== undefined)
       {
           groups = Object.keys(authGroups);
       }

       //checkAuthGroups don't have a all/allAuth/allNotAuth Name
       for(let i = 0; i < groups.length; i++)
       {
           if(extraKeys.includes(groups[i]))
           {
               this.ceb.addConfigError(new ConfigError(Const.Settings.CN.APP,
                   `auth user group with name ${groups[i]} is not allowed use an other name!`));
           }
       }

       let defaultGroup = ObjectPath.getPath(this.zc.getAppConfig(),
           [Const.App.KEYS.USER_GROUPS,Const.App.USER_GROUPS.DEFAULT]);

       if(defaultGroup !== undefined)
       {
           if(extraKeys.includes(defaultGroup))
           {
               this.ceb.addConfigError(new ConfigError(Const.Settings.CN.APP,
                   `default user group with name ${defaultGroup} is not allowed use an other name!`));
           }
           groups.push(defaultGroup);
       }
       else
       {
           Logger.printConfigWarning
           (Const.Settings.CN.APP,`No settings for the default user group found! DefaultUserGroup will be set to 'default'`);
           groups.push(Const.Settings.DEFAULT_USER_GROUP.FALLBACK);
       }

       this.validAccessValues = groups;
       this.validAccessValues.push(Const.App.ACCESS.ALL,Const.App.ACCESS.ALL_NOT_AUTH,Const.App.ACCESS.ALL_AUTH);
   }
   
   private checkConfig()
   {
       this.checkMainConfig();
       this.checkAppConfig();
       this.checkChannelConfig();
       this.checkServiceConfig();
       this.checkEventConfig();
       this.checkErrorConfig();
   }

   private checkAppConfig()
   {
       this.checkAccessControllerDefaultIsSet();
       this.checkAppConfigMain();
       this.checkObjectsConfig();
       this.checkValidationGroups();
       this.checkVersionControl();
       this.checkControllerConfigs();
       this.checkAuthController();
       this.checkBackgroundTasks();
   }

   private checkBackgroundTasks()
   {
       let bkt = this.zc.getApp(Const.App.BACKGROUND_TASKS);

       if(typeof bkt === 'object')
       {
           for(let name in bkt)
           {
               if(bkt.hasOwnProperty(name))
               {
                   ConfigCheckerTools.assertStructure
                   (Structures.BackgroundTask,bkt[name],
                       Const.Settings.CN.APP,this.ceb,new Target(`BackgroundTask: '${name}'`));
               }
           }
       }
   }

   private checkAuthController()
   {
       let authControllerName = this.zc.getApp(Const.App.KEYS.AUTH_CONTROLLER);
       if(typeof authControllerName === "string" && this.zc.isApp(Const.App.KEYS.CONTROLLER))
       {
           let controller = this.zc.getApp(Const.App.KEYS.CONTROLLER);
           if(!controller.hasOwnProperty(authControllerName))
           {
               this.ceb.addConfigError(new ConfigError(Const.Settings.CN.APP,
                   `AuthController: '${authControllerName}' is not found.`));
           }
           else
           {
               //checkAuthControllerAccess value
               let authController = controller[authControllerName];
               if(authController[Const.App.CONTROLLER.ACCESS] !== Const.App.ACCESS.ALL)
               {
                   Logger.printConfigWarning
                   (Const.Settings.CN.APP,`It is recommended to set the access of the authController directly to 'all'.`);
               }
           }
       }
   }


   private checkEventConfig()
   {
       ConfigCheckerTools.assertStructure
       (Structures.EventConfig,this.zc.getEventConfig(),Const.Settings.CN.EVENT,this.ceb);
   }

   private checkErrorConfig()
   {
       if(typeof this.zc.getErrorConfig() === 'object')
       {
           let errors = this.zc.getErrorConfig();
           for(let k in errors)
           {
               if(errors.hasOwnProperty(k))
               {
                   this.checkError(errors[k],new Target(`error '${k}'`));
               }
           }
       }
   }

   private checkError(error: object,target : Target)
   {
       ConfigCheckerTools.assertStructure
       (Structures.Error,error,Const.Settings.CN.ERROR,this.ceb,target);
   }

   private checkChannelConfig()
   {
       //main structure
       ConfigCheckerTools.assertStructure
       (Structures.ChannelConfig,this.zc.getChannelConfig(),Const.Settings.CN.CHANNEL,this.ceb);

       if(this.zc.isChannel(Const.Channel.KEYS.DEFAULTS))
       {
           this.checkChannelItem(this.zc.getChannel(Const.Channel.KEYS.DEFAULTS),new Target('Default'),true);
       }


       let customChannel = this.zc.getChannel(Const.Channel.KEYS.CUSTOM_CHANNELS);
       if(typeof customChannel === 'object')
       {
           for(let channel in customChannel)
           {
               if(customChannel.hasOwnProperty(channel))
               {
                   this.checkChannelItem(customChannel[channel],new Target(`CustomChannel: '${channel}'`));
               }
           }
       }

       let customIdChannel = this.zc.getChannel(Const.Channel.KEYS.CUSTOM_ID_CHANNELS);
       if(typeof customIdChannel === 'object')
       {
           for(let channel in customIdChannel)
           {
               if(customIdChannel.hasOwnProperty(channel))
               {
                   this.checkChannelItem(customIdChannel[channel],new Target(`CustomIdChannel: '${channel}'`));
               }
           }
       }
   }

   private checkChannelItem(channel,target,isDefault = false)
   {
       ConfigCheckerTools.assertStructure
       (Structures.ChannelItem,channel,Const.Settings.CN.CHANNEL,this.ceb,target);

       if(channel.hasOwnProperty(Const.Channel.CHANNEL.PUBLISH) &&
           channel.hasOwnProperty(Const.Channel.CHANNEL.NOT_PUBLISH))
       {
           this.ceb.addConfigError(new ConfigError(Const.Settings.CN.CHANNEL,
               `${target.getTarget()} only 'publish' or 'notPublish' keyword is allow.`));
       }
       if(channel.hasOwnProperty(Const.Channel.CHANNEL.SUBSCRIBE) &&
           channel.hasOwnProperty(Const.Channel.CHANNEL.NOT_SUBSCRIBE))
       {
           this.ceb.addConfigError(new ConfigError(Const.Settings.CN.CHANNEL,
               `${target.getTarget()} only 'subscribe' or 'notSubscribe' keyword is allow.`));
       }

       //check access dependency to userGroups
       this.checkAccessKeyDependency
       (channel[Const.Channel.CHANNEL.PUBLISH],Const.Channel.CHANNEL.PUBLISH,target);
       this.checkAccessKeyDependency
       (channel[Const.Channel.CHANNEL.NOT_PUBLISH],Const.Channel.CHANNEL.NOT_PUBLISH,target);
       this.checkAccessKeyDependency
       (channel[Const.Channel.CHANNEL.SUBSCRIBE],Const.Channel.CHANNEL.SUBSCRIBE,target);
       this.checkAccessKeyDependency
       (channel[Const.Channel.CHANNEL.NOT_SUBSCRIBE],Const.Channel.CHANNEL.NOT_SUBSCRIBE,target);

       if
       (
           isDefault &&
           !(
               (channel.hasOwnProperty(Const.Channel.CHANNEL.PUBLISH) ||
                   channel.hasOwnProperty(Const.Channel.CHANNEL.NOT_PUBLISH)) &&
               (channel.hasOwnProperty(Const.Channel.CHANNEL.SUBSCRIBE) ||
                   channel.hasOwnProperty(Const.Channel.CHANNEL.NOT_SUBSCRIBE))
           )
       )
       {
           Logger.printConfigWarning(Const.Settings.CN.CHANNEL,'It is recommended to set a default value for publish and subscribe.');
       }
   }


   private checkAccessControllerDefaultIsSet()
   {
       let access = ObjectPath.getPath(this.zc.getAppConfig(),
           [Const.App.KEYS.CONTROLLER_DEFAULT,Const.App.CONTROLLER.ACCESS]);

       let notAccess = ObjectPath.getPath(this.zc.getAppConfig(),
           [Const.App.KEYS.CONTROLLER_DEFAULT,Const.App.CONTROLLER.NOT_ACCESS]);

       if(access === undefined && notAccess === undefined)
       {
           Logger.printConfigWarning(Const.Settings.CN.APP,'It is recommended to set a controller default value for access or notAccess.');
       }
   }

   private checkObjectsConfig()
   {
       this.objectImports = [];
       for(let objName in this.objectsConfig)
       {
           if(this.objectsConfig.hasOwnProperty(objName))
           {
               if(!Array.isArray(this.objectsConfig[objName]) &&  typeof this.objectsConfig[objName] === 'object')
               {
                   this.checkObject(this.objectsConfig[objName],new Target(`Object: ${objName}`,'propertyPath'),objName);
               }
               else
               {
                   this.ceb.addConfigError(new ConfigError(Const.Settings.CN.APP,
                       `Object: '${objName}' value must be an object!`));
               }
           }
       }
       this.checkCrossImports();
   }

   private checkCrossImports()
   {
       for(let i = 0; i < this.objectImports.length; i++)
       {
           let objImport = this.objectImports[i];
           if(this.isCrossIn(objImport))
           {
               this.objectImports[i] = {};

               this.ceb.addConfigError(new ConfigError(Const.Settings.CN.APP,
                   `Object: '${objImport['o']}' uses '${objImport['i']}' Object: '${objImport['i']}' uses '${objImport['o']}' a cross import, it will create an infinite loop.`));
           }
       }
   }

   private isCrossIn(objImport)
   {
       for(let i = 0; i < this.objectImports.length; i++)
       {
           if
           (
               this.objectImports[i]['o'] === objImport['i'] &&
               this.objectImports[i]['i'] === objImport['o']
           )
           {
               return true;
           }
       }
   }

   private checkValidationGroups()
   {
       for(let group in this.validationGroupConfig)
       {
           if(this.validationGroupConfig.hasOwnProperty(group))
           {
               let groupConfig = this.validationGroupConfig[group];
               ConfigCheckerTools.assertStructure
               (Structures.ValidationGroup,groupConfig,Const.Settings.CN.APP,this.ceb,new Target(`validationGroup '${group}'`));

               this.checkOnlyValidationFunctions(groupConfig,`validation group ${group}`);
           }
       }
   }

   private checkObject(obj,target,objName)
   {
       ConfigCheckerTools.assertStructure(Structures.AppObject,obj,Const.Settings.CN.APP,this.ceb,target);

       //check property body
       if(typeof obj[Const.App.OBJECTS.PROPERTIES] === 'object')
       {
           let props = obj[Const.App.OBJECTS.PROPERTIES];
           for(let k in props)
           {
               if(props.hasOwnProperty(k))
               {
                   this.checkInputBody(props[k],target.addPath(k),objName);
               }
           }
       }
   }

   private checkAppConfigMain()
   {
       ConfigCheckerTools.assertStructure(Structures.App,this.zc.getAppConfig(),Const.Settings.CN.APP,this.ceb);
   }

   private checkMainConfig()
   {
       //check secure Auth Block
       if(this.zc.getMain(Const.Main.KEYS.EXTRA_SECURE_AUTH) && !this.zc.getMain(Const.Main.KEYS.USE_TEMP_DB_TOKEN_INFO))
       {
           this.zc.getMainConfig()[Const.Main.KEYS.EXTRA_SECURE_AUTH] = false;
           Logger.printConfigWarning
           (
               Const.Settings.CN.MAIN,
               'Extra secure auth can only use with temp db token info. Extra secure auth is set to false!'
           );
       }

       //checkStructure
       ConfigCheckerTools.assertStructure(Structures.Main,this.zc.getMainConfig(),Const.Settings.CN.MAIN,this.ceb);

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
       const panelUserConfig = this.zc.getMain(Const.Main.PANEL_USER);
       if(Array.isArray(panelUserConfig)) {
           for(let i = 0; i < panelUserConfig.length; i++) {
               this.checkPanelUserConfig(panelUserConfig[i],new Target(`UserConfig '${i}'`));
           }
       }
       else if(typeof panelUserConfig === 'object') {
           this.checkPanelUserConfig(panelUserConfig)

       }
   }

   private checkPanelUserConfig(config : object,target ?: Target)
   {
       //checkStructure
       ConfigCheckerTools.assertStructure(Structures.PanelUserConfig,config,Const.Settings.CN.MAIN,this.ceb,target);
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
       if (this.zc.isApp(Const.App.KEYS.CONTROLLER_DEFAULT))
       {
           let controller = this.zc.getApp(Const.App.KEYS.CONTROLLER_DEFAULT);
           this.checkController(controller,new Target(`ControllerDefault`),'controllerDefault');
       }

       this.checkControllerPaths();
   }

   private checkController(cc,target,cName)
   {
       this.checkControllerAccessKey(cc,target);
       ConfigCheckerTools.assertStructure(Structures.AppController,cc,Const.Settings.CN.APP,this.ceb,target);
       this.checkControllerInput(cc,target);
       this.checkControllerClass(cc,target,cName);
   }

   private checkControllerClass(cc,target,cName)
   {
       let cPath = ControllerCheckTools.getControllerFPathForCheck(cc,cName);
       this.addControllerPaths(cPath,cName);

       if(cPath === 'controllerDefault')
       {
           return;
       }

       if(!ControllerCheckTools.controllerFileExist(cc,cPath,this.zc))
       {
           this.ceb.addConfigError(new ConfigError(Const.Settings.CN.APP,
               `${target.getTarget()} on Path: '${cPath}', can not found controller file.`));
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
            if(input[keys[i]][Const.App.INPUT.IS_OPTIONAL] !== undefined &&
                input[keys[i]][Const.App.INPUT.IS_OPTIONAL])
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
               `${target.getTarget()} the dependency to object: '${objLinkName}' can not be resolved, Object not found.`));
       }
       else
       {
           //check if object import it self (by controller objName will be undefined)
           if(objName === objLinkName)
           {
               this.ceb.addConfigError(new ConfigError(Const.Settings.CN.APP,
                   `${target.getTarget()} object self import, will create an infinite loop.`));
           }
           else if(objName !== undefined)
           {
               //add to import table to check later the imports
               this.objectImports.push({o:objName,i:objLinkName});
           }
       }
   }

   private checkArrayShortCut(value,target,objName)
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
           this.checkPropertyByObjLink(value,target,objName);
       }
       else if(Array.isArray(value))
       {
           this.checkArrayShortCut(value,target,objName);
       }
       else if(typeof value === "object")
       {
           //check input
           if(value.hasOwnProperty(Const.App.OBJECTS.PROPERTIES))
           {
               //isObject
               ConfigCheckerTools.assertStructure(Structures.AppObject,value,Const.Settings.CN.APP,this.ceb,target);
               if(typeof value[Const.App.OBJECTS.PROPERTIES] === 'object')
               {
                   let props = value[Const.App.OBJECTS.PROPERTIES];
                   //check properties
                   for(let k in props)
                   {
                       if(props.hasOwnProperty(k))
                       {
                           this.checkInputBody(props[k],target.addPath(k),objName);
                       }
                   }
               }
           }
           else if(value.hasOwnProperty(Const.App.INPUT.ARRAY))
           {
               //isArray
               ConfigCheckerTools.assertStructure(Structures.AppArray,value,Const.Settings.CN.APP,this.ceb,target);
               if(typeof value[Const.App.INPUT.ARRAY] === 'object')
               {
                   let inArray = value[Const.App.INPUT.ARRAY];
                   this.checkInputBody(inArray,target.addPath('Array'),objName);
               }
           }
           else
           {
               //is this in body from an array?
               if(
                   target.getLastPath() === 'Array' &&
                   typeof value[Const.App.INPUT.IS_OPTIONAL] === 'boolean' &&
                   value[Const.App.INPUT.IS_OPTIONAL]
               )
               {
                   Logger.printConfigWarning
                   (
                       Const.Settings.CN.APP,
                       `${target.getTarget()} Optional param in an array is useless.`
                   );
               }

               //isNormalInputBody
               ConfigCheckerTools.assertStructure(Structures.InputBody,value,Const.Settings.CN.APP,this.ceb,target);

               //check for only number/string functions
               this.checkOnlyValidationFunctions(value,target);

               //check validationGroups
               if(value.hasOwnProperty(Const.App.INPUT.VALIDATION_GROUP))
               {
                   this.checkValidValidationGroup(value[Const.App.INPUT.VALIDATION_GROUP],target);
               }
           }
       }
       else
       {
           this.ceb.addConfigError(new ConfigError(Const.Settings.CN.APP,
               `${target.getTarget()} wrong value type. Use a string to link to an object or an object to define the input body or an array shortcut.`));
       }
   }

   private checkValidValidationGroup(value,target)
   {
       if(!this.validationGroupConfig.hasOwnProperty(value))
       {
           this.ceb.addConfigError(new ConfigError(Const.Settings.CN.APP,
               `${target.getTarget()} the dependency to validation group: '${value}' can not be resolved, Group not found.`));
       }
   }

   private checkOnlyValidationFunctions(value,target)
   {
       let type = value[Const.App.INPUT.TYPE];
       let isNumber =  type === Const.Validator.TYPE.INT || type === Const.Validator.TYPE.FLOAT;

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

   private checkVersionControl()
   {
       let versionControlConfig = this.zc.getApp(Const.App.KEYS.VERSION_CONTROL);
       if(versionControlConfig !== undefined)
       {
           if(Object.keys(versionControlConfig).length === 0)
           {
               Logger.printConfigWarning
               (
                   Const.Settings.CN.APP,
                   'It is recommended that VersionControl has at least one version!'
               );
           }

           for(let k in versionControlConfig)
           {
               if(versionControlConfig.hasOwnProperty(k))
               {
                   ConfigCheckerTools.assertProperty
                   (
                       k,
                       versionControlConfig,
                       'number',
                       true,
                       Const.Settings.CN.APP,
                       this.ceb,
                       new Target(Const.App.KEYS.VERSION_CONTROL),
                   );
               }
           }
       }
   }

}

export = ConfigChecker;