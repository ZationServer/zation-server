/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

const Const                = require('./../constants/constWrapper');
const Logger               = require('./../logger/logger');
const ConfigError          = require('./../config/configError');
const ConfigCheckerTools   = require('./configCheckerTools');
const ControllerCheckTools = require('./../controller/controllerCheckTools');
const ObjectPath           = require('./../tools/objectPath');
const ObjectTools          = require('./../tools/objectTools');
const Structures           = require('./structures');
const Target               = require('./target');


//todo
/*
app config
if type = file -> only file functions

error config
all

main config
second layer for ex. https
 */

class ConfigChecker
{
   constructor(zationConfig,configErrorBag)
   {
       this._zc = zationConfig;
       this._ceb = configErrorBag;
       this._prepare();
       this._checkConfig();
   }
   
   _prepare()
   {
       this._prepareAllValidUserGroupsAndCheck();
       this._objectsConfig =
           this._zc.isApp(Const.App.KEYS.OBJECTS) && typeof this._zc.getApp(Const.App.KEYS.OBJECTS) === 'object'
               ? this._zc.getApp(Const.App.KEYS.OBJECTS) : {};

       this._validationGroupConfig =
           this._zc.isApp(Const.App.KEYS.VALIDATION_GROUPS) && typeof this._zc.getApp(Const.App.KEYS.VALIDATION_GROUPS) === 'object'
               ? this._zc.getApp(Const.App.KEYS.VALIDATION_GROUPS) : {};

       this._cNames = {};
   }

   _prepareAllValidUserGroupsAndCheck()
   {
       let groups = [];

       let extraKeys  = [Const.App.ACCESS.ALL,Const.App.ACCESS.ALL_NOT_AUTH,Const.App.ACCESS.ALL_AUTH];

       let authGroups = ObjectPath.getPath(this._zc.getAppConfig(),
           [Const.App.KEYS.USER_GROUPS,Const.App.USER_GROUPS.AUTH]);

       if(authGroups !== undefined)
       {
           groups = Object.keys(authGroups);
       }

       //checkAuthGroups don't have a all/allAuth/allNotAuth Name
       for(let i = 0; i < groups.length; i++)
       {
           if(extraKeys.includes(groups[i]))
           {
               this._ceb.addConfigError(new ConfigError(Const.Settings.CN.APP,
                   `auth user group with name ${groups[i]} is not allowed use an other name!`));
           }
       }

       let defaultGroup = ObjectPath.getPath(this._zc.getAppConfig(),
           [Const.App.KEYS.USER_GROUPS,Const.App.USER_GROUPS.DEFAULT]);

       if(defaultGroup !== undefined)
       {
           if(extraKeys.includes(defaultGroup))
           {
               this._ceb.addConfigError(new ConfigError(Const.Settings.CN.APP,
                   `default user group with name ${defaultGroup} is not allowed use an other name!`));
           }
           groups.push(defaultGroup);
       }
       else
       {
           groups.push(Const.Settings.DEFAULT_USER_GROUP.FALLBACK);
       }

       this._validAccessValues = groups;
       this._validAccessValues.push(Const.App.ACCESS.ALL,Const.App.ACCESS.ALL_NOT_AUTH,Const.App.ACCESS.ALL_AUTH);
   }
   
   _checkConfig()
   {
       this._checkMainConfig();
       this._checkAppConfig();
       this._checkChannelConfig();
       this._checkServiceConfig();
       this._checkEventConfig();
   }

   _checkAppConfig()
   {
       this._checkAccessControllerDefaultIsSet();
       this._checkAppConfigMain();
       this._checkObjectsConfig();
       this._checkValidationGroups();
       this._checkVersionControl();
       this._checkControllerConfigs();
   }

   _checkEventConfig()
   {
       ConfigCheckerTools.assertStructure
       (Structures.EventConfig,this._zc.getEventConfig(),Const.Settings.CN.EVENT,this._ceb);
   }

   _checkChannelConfig()
   {
       //main structure
       ConfigCheckerTools.assertStructure
       (Structures.ChannelConfig,this._zc.getChannelConfig(),Const.Settings.CN.CHANNEL,this._ceb);

       if(this._zc.isChannel(Const.Channel.KEYS.DEFAULTS))
       {
           this._checkChannelItem(this._zc.getChannel(Const.Channel.KEYS.DEFAULTS),new Target('Default'),true);
       }


       let customChannel = this._zc.getChannel(Const.Channel.KEYS.CUSTOM_CHANNELS);
       if(typeof customChannel === 'object')
       {
           for(let channel in customChannel)
           {
               if(customChannel.hasOwnProperty(channel))
               {
                   this._checkChannelItem(customChannel[channel],new Target(`CustomChannel: '${channel}'`));
               }
           }
       }

       let customIdChannel = this._zc.getChannel(Const.Channel.KEYS.CUSTOM_ID_CHANNELS);
       if(typeof customIdChannel === 'object')
       {
           for(let channel in customIdChannel)
           {
               if(customIdChannel.hasOwnProperty(channel))
               {
                   this._checkChannelItem(customIdChannel[channel],new Target(`CustomIdChannel: '${channel}'`));
               }
           }
       }
   }

   _checkChannelItem(channel,target,isDefault = false)
   {
       ConfigCheckerTools.assertStructure
       (Structures.ChannelItem,channel,Const.Settings.CN.CHANNEL,this._ceb,target);

       if(channel.hasOwnProperty(Const.Channel.CHANNEL.PUBLISH) &&
           channel.hasOwnProperty(Const.Channel.CHANNEL.NOT_PUBLISH))
       {
           this._ceb.addConfigError(new ConfigError(Const.Settings.CN.CHANNEL,
               `${target.getTarget()} only 'publish' or 'notPublish' keyword is allow.`));
       }
       if(channel.hasOwnProperty(Const.Channel.CHANNEL.SUBSCRIBE) &&
           channel.hasOwnProperty(Const.Channel.CHANNEL.NOT_SUBSCRIBE))
       {
           this._ceb.addConfigError(new ConfigError(Const.Settings.CN.CHANNEL,
               `${target.getTarget()} only 'subscribe' or 'notSubscribe' keyword is allow.`));
       }

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

   _checkAccessControllerDefaultIsSet()
   {
       let access = ObjectPath.getPath(this._zc.getAppConfig(),
           [Const.App.KEYS.CONTROLLER_DEFAULT,Const.App.CONTROLLER.ACCESS]);

       let notAccess = ObjectPath.getPath(this._zc.getAppConfig(),
           [Const.App.KEYS.CONTROLLER_DEFAULT,Const.App.CONTROLLER.NOT_ACCESS]);

       if(access === undefined && notAccess === undefined)
       {
           Logger.printConfigWarning(Const.Settings.CN.APP,'It is recommended to set a controller default value for access or notAccess.');
       }
   }

   _checkObjectsConfig()
   {
       this._objectImports = [];
       for(let objName in this._objectsConfig)
       {
           if(this._objectsConfig.hasOwnProperty(objName))
           {
               this._checkObject(this._objectsConfig[objName],new Target(`Object: ${objName}`,'propertyPath'),objName);
           }
       }
       this._checkCrossImports();
   }

   _checkCrossImports()
   {
       for(let i = 0; i < this._objectImports.length; i++)
       {
           let objImport = this._objectImports[i];
           if(this._isCrossIn(objImport))
           {
               this._objectImports[i] = {};

               this._ceb.addConfigError(new ConfigError(Const.Settings.CN.APP,
                   `Object: '${objImport['o']}' uses '${objImport['i']}' Object: '${objImport['i']}' uses '${objImport['o']}' a cross import, it will create an infinite loop.`));
           }
       }
   }

   _isCrossIn(objImport)
   {
       for(let i = 0; i < this._objectImports.length; i++)
       {
           if
           (
               this._objectImports[i]['o'] === objImport['i'] &&
               this._objectImports[i]['i'] === objImport['o']
           )
           {
               return true;
           }
       }
   }

   _checkValidationGroups()
   {
       for(let group in this._validationGroupConfig)
       {
           if(this._validationGroupConfig.hasOwnProperty(group))
           {
               let groupConfig = this._validationGroupConfig[group];
               ConfigCheckerTools.assertStructure
               (Structures.ValidationGroup,groupConfig,Const.Settings.CN.APP,this._ceb,new Target(`validationGroup '${group}'`));

               this._checkOnlyValidationFunctions(groupConfig,`validation group ${group}`);
           }
       }
   }

   _checkObject(obj,target,objName)
   {
       ConfigCheckerTools.assertStructure(Structures.AppObject,obj,Const.Settings.CN.APP,this._ceb,target);

       //check property body
       if(typeof obj[Const.App.OBJECTS.PROPERTIES] === 'object')
       {
           let props = obj[Const.App.OBJECTS.PROPERTIES];
           for(let k in props)
           {
               if(props.hasOwnProperty(k))
               {
                   this._checkInputBody(props[k],target.addPath(k),objName);
               }
           }
       }
   }

   _checkAppConfigMain()
   {
       ConfigCheckerTools.assertStructure(Structures.App,this._zc.getAppConfig(),Const.Settings.CN.APP,this._ceb);
   }

   _checkMainConfig()
   {
       //check secure Auth Block
       if(this._zc.getMain(Const.Main.KEYS.EXTRA_SECURE_AUTH) && !this._zc.getMain(Const.Main.KEYS.USE_TEMP_DB_TOKEN_INFO))
       {
           this._zc.getMainConfig()[Const.Main.KEYS.EXTRA_SECURE_AUTH] = false;
           Logger.printConfigWarning
           (
               Const.Settings.CN.MAIN,
               'Extra secure auth can only use with temp db token info. Extra secure auth is set to false!'
           );
       }

       //checkStructure
       ConfigCheckerTools.assertStructure(Structures.Main,this._zc.getMainConfig(),Const.Settings.CN.MAIN,this._ceb);
   }

    _checkServiceConfig()
    {
        //checkStructure
        ConfigCheckerTools.assertStructure
        (Structures.ServiceConfig,this._zc.getServiceConfig(),Const.Settings.CN.SERVICE,this._ceb);

        //checkServices
        this._checkServices();

        //check Custom Services
        this._checkCustomServices();
    }

   _checkServices()
   {
       let s = this._zc.getService(Const.Service.KEYS.SERVICES);

       //check services
       if(typeof s === 'object')
       {
           ConfigCheckerTools.assertStructure
           (Structures.Services,s,Const.Settings.CN.SERVICE,this._ceb,new Target(`Services`));

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
                               this._ceb,
                               target
                           );
                       }
                   }
               }
           }

       }
   }

   _checkCustomServices()
   {
       let cs = this._zc.getService(Const.Service.KEYS.CUSTOM_SERVICES);
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
                       this._ceb,
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
                           this._ceb,
                           target
                       );
                       ConfigCheckerTools.assertProperty
                       (
                           Const.Service.CUSTOM_SERVICES.GET,
                           service,
                           'function',
                           true,
                           Const.Settings.CN.SERVICE,
                           this._ceb,
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
                                   this._ceb,
                                   target
                               );
                           }
                       }
                   }
               }
           }
       }
   }

   _checkControllerConfigs()
   {
       //check Controller
       if (this._zc.isApp(Const.App.KEYS.CONTROLLER))
       {
           let controller = this._zc.getApp(Const.App.KEYS.CONTROLLER);
           for(let cName in controller)
           {
               if(controller.hasOwnProperty(cName))
               {
                   this._checkController(controller[cName],new Target(`Controller: '${cName}'`),cName);
               }
           }
       }

       //check controllerDefault
       if (this._zc.isApp(Const.App.KEYS.CONTROLLER_DEFAULT))
       {
           let controller = this._zc.getApp(Const.App.KEYS.CONTROLLER_DEFAULT);
           this._checkController(controller,new Target(`ControllerDefault`),'controllerDefault');
       }

       this._checkControllerPaths();
   }

   _checkController(cc,target,cName)
   {
       this._checkControllerAccessKey(cc,target);
       ConfigCheckerTools.assertStructure(Structures.AppController,cc,Const.Settings.CN.APP,this._ceb,target);
       this._checkControllerInput(cc,target);
       this._checkControllerClass(cc,target,cName);
   }

   _checkControllerClass(cc,target,cName)
   {
       let cPath = ControllerCheckTools.getControllerFPathForCheck(cc,cName);
       this._addControllerPaths(cPath,cName,target);

       if(cPath === 'controllerDefault')
       {
           return;
       }

       if(!ControllerCheckTools.canControllerRequire(cc,cPath,this._zc))
       {
           this._ceb.addConfigError(new ConfigError(Const.Settings.CN.APP,
               `${target.getTarget()} on Path: '${cPath}', can not found to require.`));
       }
       else
       {
           if(!ControllerCheckTools.isControllerExtendsController(cc,cPath,this._zc))
           {
               this._ceb.addConfigError(new ConfigError(Const.Settings.CN.APP,
                   `${target.getTarget()} on Path: '${cPath}', is not extends from main Controller class.`));
           }
       }
   }

   _checkControllerPaths()
   {
       for(let p in this._cNames)
       {
           if(this._cNames.hasOwnProperty(p) && Array.isArray(this._cNames[p])
             && this._cNames[p].length > 1)
           {
               Logger.printConfigWarning
               (
                   Const.Settings.CN.APP,
                   `Controller: '${this._cNames[p].toString()}' have the same lowercase path (Warning for case insensitive systems) or path: '${p}'.`
               );
           }
       }
   }

   _addControllerPaths(path,cName)
   {
       let sPath = path.toLowerCase();

       if(Array.isArray(this._cNames[sPath])) {
           this._cNames[sPath].push(cName);
       }
       else {
           this._cNames[sPath] = [cName];
       }
   }

   _checkControllerInput(cc,target)
   {
       let input = cc[Const.App.CONTROLLER.INPUT];
       let keys = [];
       if(typeof input === 'object')
       {
           for(let k in input)
           {
               if(input.hasOwnProperty(k))
               {
                   keys.push(k);
                   this._checkInputBody(input[k],target.addPath(k));
               }
           }
       }
       this._checkOptionalRecommendation(keys,input,target);
   }

    // noinspection JSMethodCanBeStatic
    _checkOptionalRecommendation(keys,input,target)
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

   _checkPropertyByObjLink(objLinkName,target,objName)
   {
       if(!this._objectsConfig.hasOwnProperty(objLinkName))
       {
           this._ceb.addConfigError(new ConfigError(Const.Settings.CN.APP,
               `${target.getTarget()} the dependency to object: '${objLinkName}' can not be resolved, Object not found.`));
       }
       else
       {
           //check if object import it self (by controller objName will be undefined)
           if(objName === objLinkName)
           {
               this._ceb.addConfigError(new ConfigError(Const.Settings.CN.APP,
                   `${target.getTarget()} object self import, will create an infinite loop.`));
           }
           else if(objName !== undefined)
           {
               //add to import table to check later the imports
               this._objectImports.push({o:objName,i:objLinkName});
           }
       }
   }

   _checkArrayShortCut(value,target,objName)
   {
       if(value.length === 0)
       {
           this._ceb.addConfigError(new ConfigError(Const.Settings.CN.APP,
               `${target.getTarget()} you have to specify an object link (string) or an inputBody (object) or an new array shortcut.`));
       }
       else if(value.length === 1)
       {
           this._checkInputBody(value[0],target.addPath('Array'),objName);
       }
       else if(value.length === 2)
       {
           let newTarget = target.setExtraInfo('Array Shortcut Element 2');
           if(typeof value[1] !== 'object')
           {
               this._ceb.addConfigError(new ConfigError(Const.Settings.CN.APP,
                   `${newTarget.getTarget()} the second shortCut item should be from typ object and can specify the array. Given typ is: '${typeof value[1]}'`));
           }
           else
           {
               ConfigCheckerTools.assertStructure(Structures.ArrayShortCutSpecify,value[1],Const.Settings.CN.APP,this._ceb,newTarget);
           }

           this._checkInputBody(value[0],target.addPath('Array'),objName);
       }
       else
       {
           this._ceb.addConfigError(new ConfigError(Const.Settings.CN.APP,
               `${target.getTarget()} invalid shortCut length: '${value.length}', 2 values are valid. First specify content and second to specify array.`));
       }
   }

   _checkInputBody(value,target,objName)
   {
       if(typeof value === 'string')
       {
           this._checkPropertyByObjLink(value,target,objName);
       }
       else if(Array.isArray(value))
       {
           this._checkArrayShortCut(value,target,objName);
       }
       else if(typeof value === "object")
       {
           //check input
           if(value.hasOwnProperty(Const.App.OBJECTS.PROPERTIES))
           {
               //isObject
               ConfigCheckerTools.assertStructure(Structures.AppObject,value,Const.Settings.CN.APP,this._ceb,target);
               if(typeof value[Const.App.OBJECTS.PROPERTIES] === 'object')
               {
                   let props = value[Const.App.OBJECTS.PROPERTIES];
                   //check properties
                   for(let k in props)
                   {
                       if(props.hasOwnProperty(k))
                       {
                           this._checkInputBody(props[k],target.addPath(k),objName);
                       }
                   }
               }
           }
           else if(value.hasOwnProperty(Const.App.INPUT.ARRAY))
           {
               //isArray
               ConfigCheckerTools.assertStructure(Structures.AppArray,value,Const.Settings.CN.APP,this._ceb,target);
               if(typeof value[Const.App.INPUT.ARRAY] === 'object')
               {
                   let inArray = value[Const.App.INPUT.ARRAY];
                   this._checkInputBody(inArray,target.addPath('Array'),objName);
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
               ConfigCheckerTools.assertStructure(Structures.InputBody,value,Const.Settings.CN.APP,this._ceb,target);

               //check for only number/string functions
               this._checkOnlyValidationFunctions(value,target);

               //check validationGroups
               if(value.hasOwnProperty(Const.App.INPUT.VALIDATION_GROUP))
               {
                   this._checkValidValidationGroup(value[Const.App.INPUT.VALIDATION_GROUP],target);
               }
           }
       }
       else
       {
           this._ceb.addConfigError(new ConfigError(Const.Settings.CN.APP,
               `${target.getTarget()} wrong value type. Use a string to link to an object or an object to define the input body or an array shortcut.`));
       }
   }

   _checkValidValidationGroup(value,target)
   {
       if(!this._validationGroupConfig.hasOwnProperty(value))
       {
           this._ceb.addConfigError(new ConfigError(Const.Settings.CN.APP,
               `${target.getTarget()} the dependency to validation group: '${value}' can not be resolved, Group not found.`));
       }
   }

   _checkOnlyValidationFunctions(value,target)
   {
       let type = value[Const.App.INPUT.TYPE];
       let isNumber =  type === Const.Validator.TYPE.INT || type === Const.Validator.TYPE.FLOAT;

       if (isNumber && ObjectTools.hasOneOf(value,Const.Validator.ONLY_STRING_FUNCTIONS))
       {
           let useFunctions = ObjectTools.getFoundKeys(value,Const.Validator.ONLY_STRING_FUNCTIONS);
           this._ceb.addConfigError(new ConfigError(Const.Settings.CN.APP,
               `${target.getTarget()} number type can't use this function${useFunctions.length>1 ? 's' : ''}: ${useFunctions.toString()}.`));
       }

       if (!isNumber && ObjectTools.hasOneOf(value,Const.Validator.ONLY_NUMBER_FUNCTIONS))
       {
           let useFunctions = ObjectTools.getFoundKeys(value,Const.Validator.ONLY_NUMBER_FUNCTIONS);
           this._ceb.addConfigError(new ConfigError(Const.Settings.CN.APP,
               `${target.getTarget()} not number type can't use this function${useFunctions.length>1 ? 's' : ''}: ${useFunctions.toString()}.`));
       }
   }

   _checkControllerAccessKey(cc,target)
   {
       let notAccess = cc[Const.App.CONTROLLER.NOT_ACCESS];
       let access    = cc[Const.App.CONTROLLER.ACCESS];

       if(notAccess !== undefined && access !== undefined)
       {
           this._ceb.addConfigError(new ConfigError(Const.Settings.CN.APP),
               `${target.getTarget()} has a access and notAccess keyword only one is allowed!`);
       }
       else
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
           this._checkAccessKeyDependency(cc[keyWord],keyWord,target);
       }
   }

   _checkAccessKeyDependency(value,keyword,target)
   {
       let checkDependency = (string) =>
       {
           ConfigCheckerTools.assertEqualsOne
           (
               this._validAccessValues,
               string,
               Const.Settings.CN.APP,
               this._ceb,
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

   _checkVersionControl()
   {
       let versionControlConfig = this._zc.getApp(Const.App.KEYS.VERSION_CONTROL);
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
                       this._ceb,
                       new Target(Const.App.KEYS.VERSION_CONTROL),
                   );
               }
           }
       }
   }

}

module.exports = ConfigChecker;