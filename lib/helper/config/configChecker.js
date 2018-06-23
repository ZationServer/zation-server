/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

const Const              = require('./../constants/constWrapper');
const Logger             = require('./../logger/logger');
const ConfigError        = require('./../config/configError');
const ConfigCheckerTools = require('./configCheckerTools');
const ObjectPath         = require('./../tools/objectPath');
const ObjectTools        = require('./../tools/objectTools');
const Structures         = require('./structures');


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
       (Structures.EventConfig,this._zc.getEventConfig(),'',Const.Settings.CN.EVENT,this._ceb);
   }

   _checkChannelConfig()
   {
       //main structure
       ConfigCheckerTools.assertStructure
       (Structures.ChannelConfig,this._zc.getChannelConfig(),'',Const.Settings.CN.CHANNEL,this._ceb);

       if(this._zc.isChannel(Const.Channel.KEYS.DEFAULTS))
       {
           this._checkChannelItem(this._zc.getChannel(Const.Channel.KEYS.DEFAULTS),'Default: ');
       }

       let customChannel = this._zc.getChannel(Const.Channel.KEYS.CUSTOM_CHANNELS);
       if(typeof customChannel === 'object')
       {
           for(let channel in customChannel)
           {
               if(customChannel.hasOwnProperty(channel))
               {
                   this._checkChannelItem(customChannel[channel],`Custom Channel: ${channel} `);
               }
           }
       }
   }

   _checkChannelItem(channel,target)
   {
       ConfigCheckerTools.assertStructure
       (Structures.ChannelItem,channel,target,Const.Settings.CN.CHANNEL,this._ceb);
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
               this._checkObject(this._objectsConfig[objName],`Object: ${objName} `,objName);
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
               ConfigCheckerTools.assertStructure(Structures.ValidationGroup,groupConfig,`validationGroup ${group} `,Const.Settings.CN.APP,this._ceb);

               this._checkOnlyValidationFunctions(groupConfig,`validation group ${group}`);
           }
       }
   }

   _checkObject(obj,target,objName)
   {
       ConfigCheckerTools.assertStructure(Structures.AppObject,obj,target,Const.Settings.CN.APP,this._ceb);

       //check property body
       if(typeof obj[Const.App.OBJECTS.PROPERTIES] === 'object')
       {
           let props = obj[Const.App.OBJECTS.PROPERTIES];
           for(let k in props)
           {
               if(props.hasOwnProperty(k))
               {
                   this._checkInputBody(props[k],`${target}propertyPath: ${k}`,objName);
               }
           }
       }
   }

   _checkAppConfigMain()
   {
       ConfigCheckerTools.assertStructure(Structures.App,this._zc.getAppConfig(),'',Const.Settings.CN.APP,this._ceb);
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
       ConfigCheckerTools.assertStructure(Structures.Main,this._zc.getMainConfig(),'',Const.Settings.CN.MAIN,this._ceb);
   }

    _checkServiceConfig()
    {
        //checkStructure
        ConfigCheckerTools.assertStructure
        (Structures.ServiceConfig,this._zc.getServiceConfig(),'',Const.Settings.CN.SERVICE,this._ceb);

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
           (Structures.Services,s,`Services: `,Const.Settings.CN.SERVICE,this._ceb);

           for(let serviceName in s)
           {
               if(s.hasOwnProperty(serviceName) && typeof s[serviceName] === 'object')
               {
                   let service = s[serviceName];
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
                               `Services: '${serviceName}', key ${k} `,
                               Const.Settings.CN.SERVICE,
                               this._ceb
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
                       `Custom Services: `,
                       Const.Settings.CN.SERVICE,
                       this._ceb
                   );

                   if(typeof cs[serviceName] === 'object')
                   {
                       //check custom services structure
                       let service = cs[serviceName];

                       //check create and get
                       ConfigCheckerTools.assertProperty
                       (
                           Const.Service.CUSTOM_SERVICES.CREATE,
                           service,
                           'function',
                           false,
                           `Custom Services: '${serviceName}' `,
                           Const.Settings.CN.SERVICE,
                           this._ceb
                       );
                       ConfigCheckerTools.assertProperty
                       (
                           Const.Service.CUSTOM_SERVICES.GET,
                           service,
                           'function',
                           true,
                           `Custom Services: '${serviceName}' `,
                           Const.Settings.CN.SERVICE,
                           this._ceb
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
                                   `Custom Services: '${serviceName}', `,
                                   Const.Settings.CN.SERVICE,
                                   this._ceb
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
                   this._checkController(controller[cName],`Controller: ${cName}`);
               }
           }
       }

       //check controllerDefault
       if (this._zc.isApp(Const.App.KEYS.CONTROLLER_DEFAULT))
       {
           let controller = this._zc.getApp(Const.App.KEYS.CONTROLLER_DEFAULT);
           this._checkController(controller,`ControllerDefault`);
       }
   }

   _checkController(cc,target)
   {
       this._checkControllerAccessKey(cc,target);
       ConfigCheckerTools.assertStructure(Structures.AppController,cc,target,Const.Settings.CN.APP,this._ceb);
       this._checkControllerInput(cc,target);
   }

   _checkControllerInput(cc,target)
   {
       let input = cc[Const.App.CONTROLLER.INPUT];
       if(typeof input === 'object')
       {
           for(let k in input)
           {
               if(input.hasOwnProperty(k))
               {
                   this._checkInputBody(input[k],`${target}, inputPath: ${k}`);
               }
           }
       }
   }

   _checkPropertyByObjLink(objLinkName,target,objName)
   {
       if(!this._objectsConfig.hasOwnProperty(objLinkName))
       {
           this._ceb.addConfigError(new ConfigError(Const.Settings.CN.APP,
               `${target} the dependency to object: '${objLinkName}' can not be resolved, Object not found.`));
       }
       else
       {
           //check if object import it self (by controller objName will be undefined)
           if(objName === objLinkName)
           {
               this._ceb.addConfigError(new ConfigError(Const.Settings.CN.APP,
                   `${target} object self import, will create an infinite loop.`));
           }
           else if(objName !== undefined)
           {
               //add to import table to check later the imports
               this._objectImports.push({o:objName,i:objLinkName});
           }
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
           if(value.length === 0)
           {
               this._ceb.addConfigError(new ConfigError(Const.Settings.CN.APP,
                   `${target} you have to specify an object link.`));
           }
           else if(value.length > 1)
           {
               this._ceb.addConfigError(new ConfigError(Const.Settings.CN.APP,
                   `${target} only one link to an object is valid.`));
           }
           else
           {
               let name = value[0];
               if(typeof name === 'string')
               {
                   this._checkPropertyByObjLink(value,target,objName);
               }
               else
               {
                   this._ceb.addConfigError(new ConfigError(Const.Settings.CN.APP,
                       `${target} object link must be of type string.`));
               }
           }
       }
       else if(typeof value === "object")
       {
           //check input
           if(value.hasOwnProperty(Const.App.OBJECTS.PROPERTIES))
           {
               //isObject
               ConfigCheckerTools.assertStructure(Structures.AppObject,value,target,Const.Settings.CN.APP,this._ceb);
               if(typeof value[Const.App.OBJECTS.PROPERTIES] === 'object')
               {
                   let props = value[Const.App.OBJECTS.PROPERTIES];
                   //check properties
                   for(let k in props)
                   {
                       if(props.hasOwnProperty(k))
                       {
                           this._checkInputBody(props[k],`${target}.${k}`)
                       }
                   }
               }
           }
           else
           {
               //isNormalInputBody
               ConfigCheckerTools.assertStructure(Structures.InputBody,value,`${target} `,Const.Settings.CN.APP,this._ceb);

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
               `${target} wrong value type. Use a string to link to an object or an object to define the input body.`));
       }
   }

   _checkValidValidationGroup(value,target)
   {
       if(!this._validationGroupConfig.hasOwnProperty(value))
       {
           this._ceb.addConfigError(new ConfigError(Const.Settings.CN.APP,
               `${target} the dependency to validation group: '${value}' can not be resolved, Group not found.`));
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
               `${target} number type can't use this function${useFunctions.length>1 ? 's' : ''}: ${useFunctions.toString()}.`));
       }

       if (!isNumber && ObjectTools.hasOneOf(value,Const.Validator.ONLY_NUMBER_FUNCTIONS))
       {
           let useFunctions = ObjectTools.getFoundKeys(value,Const.Validator.ONLY_NUMBER_FUNCTIONS);
           this._ceb.addConfigError(new ConfigError(Const.Settings.CN.APP,
               `${target} not number type can't use this function${useFunctions.length>1 ? 's' : ''}: ${useFunctions.toString()}.`));
       }
   }

   _checkControllerAccessKey(cc,target)
   {
       let notAccess = cc[Const.App.CONTROLLER.NOT_ACCESS];
       let access    = cc[Const.App.CONTROLLER.ACCESS];

       if(notAccess !== undefined && access !== undefined)
       {
           this._ceb.addConfigError(new ConfigError(Const.Settings.CN.APP),
               `${target} has a access and notAccess keyword only one is allowed!`);
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
               `${target} property ${keyword}:`,
               Const.Settings.CN.APP,
               this._ceb,
               `user group '${string}' is not found in auth groups or is default group.`
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
                       `${Const.App.KEYS.VERSION_CONTROL} `,
                       Const.Settings.CN.APP,
                       this._ceb
                   );
               }
           }
       }
   }

}

module.exports = ConfigChecker;