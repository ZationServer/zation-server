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
       this._prepareAllValidUserGroups();
   }

   _prepareAllValidUserGroups()
   {
       let groups = [];

       let authGroups = ObjectPath.getPath(this._zc.getAppConfig(),[Const.App.GROUPS,Const.App.GROUPS_AUTH_GROUPS]);
       if(authGroups !== undefined)
       {
           groups = Object.keys(authGroups);
       }

       let defaultGroup = ObjectPath.getPath(this._zc.getAppConfig(),[Const.App.GROUPS,Const.App.GROUPS_DEFAULT_GROUP]);

       if(defaultGroup !== undefined)
       {
           groups.push(defaultGroup);
       }
       else
       {
           groups.push(Const.Settings.DEFAULT_GROUP_FALLBACK);
       }
       groups.push(Const.App.ACCESS_ALL,Const.App.ACCESS_ALL_AUTH,Const.App.ACCESS_ALL_NOT_AUTH);
       this._userGroups = groups;
   }
   
   _checkConfig()
   {
       this._checkControllerConfigs();
       this._checkVersionControl();
       this._checkMainConfig();
   }

   _checkMainConfig()
   {
       //check secure Auth Block
       if(this._zc.getMain(Const.Main.EXTRA_SECURE_AUTH) && !this._zc.getMain(Const.Main.USE_TEMP_DB_TOKEN_INFO))
       {
           this._zc.getMainConfig()[Const.Main.EXTRA_SECURE_AUTH] = false;
           Logger.printConfigWarning
           (
               Const.Main.MAIN_CONFIG,
               'Extra secure auth can only use with temp db token info. Extra secure auth is set to false!'
           );
       }

   }

   _checkControllerConfigs()
   {
       //check Controller
       if
       (
           ConfigCheckerTools.assertProperty
           (Const.App.CONTROLLER,this._zc.getAppConfig(),'object',true,"",Const.Main.APP_CONFIG,this._ceb)
           &&
           this._zc.isApp(Const.App.CONTROLLER)
       )
       {
           let controller = this._zc.getApp(Const.App.CONTROLLER);
           for(let cName in controller)
           {
               if(controller.hasOwnProperty(cName))
               {
                   this._checkController(controller[cName],`Controller: ${cName}`);
               }
           }
       }

       //check controllerDefault
       if
       (
           ConfigCheckerTools.assertProperty
           (Const.App.CONTROLLER_DEFAULT,this._zc.getAppConfig(),'object',true,"",Const.Main.APP_CONFIG,this._ceb)
           &&
           this._zc.isApp(Const.App.CONTROLLER_DEFAULT)
       )
       {
           let controller = this._zc.getApp(Const.App.CONTROLLER_DEFAULT);
           this._checkController(controller,`ControllerDefault`);
       }
   }

   _checkController(cc,target)
   {
       this._checkControllerAccessKey(cc,target);

       //check types
       ConfigCheckerTools.assertProperty
       (Const.App.CONTROLLER_INPUT,cc,'object',true,target,Const.Main.APP_CONFIG,this._ceb);

       ConfigCheckerTools.assertProperty
       (Const.App.CONTROLLER_BEFORE_HANDLE,cc,['function','array'],true,target,Const.Main.APP_CONFIG,this._ceb);

       ConfigCheckerTools.assertProperties
       (
           [
               Const.App.CONTROLLER_SYSTEM_CONTROLLER,
               Const.App.CONTROLLER_SOCKER_ACCESS,
               Const.App.CONTROLLER_HTTP_ACCESS,
               Const.App.CONTROLLER_INPUT_VALIDATION,
               Const.App.CONTROLLER_EXTRA_SECURE,
               Const.App.CONTROLLER_PARAMS_CAN_MISSING
           ],
           cc,
           'boolean',
           true,
           target,
           Const.Main.APP_CONFIG,
           this._ceb
       );

       ConfigCheckerTools.assertProperty
       (Const.App.CONTROLLER_PATH,cc,'string',true,target,Const.Main.APP_CONFIG,this._ceb);

       ConfigCheckerTools.assertProperty
       (Const.App.CONTROLLER_NAME,cc,'string',true,target,Const.Main.APP_CONFIG,this._ceb);

       this._checkControllerInput(cc,target);
   }

   _checkControllerInput(cc,target)
   {
       let input = cc[Const.App.CONTROLLER_INPUT];

       if(input !== undefined)
       {


       }







   }

   _checkControllerAccessKey(cc,target)
   {
       let notAccess = cc[Const.App.CONTROLLER_NOT_ACCESS];
       let access    = cc[Const.App.CONTROLLER_ACCESS];

       if(notAccess !== undefined && access !== undefined)
       {
           this._ceb.addConfigError(new ConfigError(Const.Main.APP_CONFIG),
               `${target} has a access and notAccess keyword only one is allowed!`);
       }
       else
       {
           let keyWord = '';
           //search One
           if(notAccess !== undefined && access === undefined)
           {
               keyWord = Const.App.CONTROLLER_NOT_ACCESS;
           }
           else if(notAccess === undefined && access !== undefined)
           {
               keyWord = Const.App.CONTROLLER_ACCESS;
           }

           ConfigCheckerTools.assertProperty
           (keyWord,cc,['string','function','number','array'],true,target,Const.Main.APP_CONFIG,this._ceb);

           this._checkAccessKeyDependency(cc[keyWord],keyWord,target);
       }
   }

   _checkAccessKeyDependency(value,keyword,target)
   {
       let checkDependency = (string) =>
       {
           ConfigCheckerTools.assertEqualsOne
           (
               this._userGroups,
               string,
               `${target} property ${keyword}:`,
               Const.Main.APP_CONFIG,this._ceb,`user group '${string}' is not found in auth groups or is default group!`
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
       let versionControlConfig = this._zc.getApp(Const.App.VERSION_CONTROL);
       if(versionControlConfig !== undefined)
       {
           if(Object.keys(versionControlConfig).length === 0)
           {
               Logger.printConfigWarning
               (
                   Const.Main.MAIN_CONFIG,
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
                       Const.App.VERSION_CONTROL,
                       Const.Main.APP_CONFIG,
                       this._ceb
                   );
               }
           }
       }
   }

}

module.exports = ConfigChecker;