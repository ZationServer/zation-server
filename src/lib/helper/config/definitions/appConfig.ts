/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import {ControllerClass}      from "../../../api/Controller";
import {ApiLevelSwitch}       from "../../apiLevel/apiLevelUtils";
import {ControllerConfig}     from "./controllerConfig";
import {Model}                from "./inputConfig";
import {BackgroundTask}       from "./backgroundTaskConfig";
import {DataBoxClassDef, DataBoxConfig} from "./dataBoxConfig";
import {ChannelsConfig, PreCompiledChannelConfig} from "./channelsConfig";

export interface AppConfig
{
    /**
     * In this property, you can define all your user groups.
     * @example
     * userGroups : {
     *   auth : {
     *       user : {
     *            panelDisplayName : 'User'
     *       },
     *   },
     * default : 'guest'
     * },
     */
    userGroups  ?: UserGroupsConfig;

    /**
     * The id of the authController.
     * This property makes it possible to send an authentication request to the server.
     * Then the server will automatically use the linked controller.
     * @example
     * authController : 'login',
     */
    authController  ?: string;

    /**
    * In this property, you can define all your controllers.
    * The value must be an object.
    * The key of each property is the id of the controller.
    * The value of each property is the imported controller class.
    * @example
    * controllers : {
        *    register : RegisterController,
        *    login : LogInController,
        * }
    */
    controllers  ?: Record<string,ControllerClass | ApiLevelSwitch<ControllerClass>>;

    /**
     * With this property, you can define a default controller configuration that will be used in each controller.
     * @example
     * controllerDefaults : {
     *    wsAccess : true,
     *    httpAccess : true,
     *    httpPostAllowed : true,
     *    httpGetAllowed : true,
     *    access : 'all',
     * },
     */
    controllerDefaults  ?: ControllerConfig;

    /**
     * In this property, you can define all your DataBoxes.
     * The value must be an object.
     * The key of each property is the id of the DataBox.
     * The value of each property is the imported DataBox class.
     * @example
     * dataBoxes : {
     *    profile : ProfileDataBox,
     *    chat : ChatDataBox,
     * }
     */
    dataBoxes ?: Record<string,DataBoxClassDef | ApiLevelSwitch<DataBoxClassDef>>;

    /**
     * With this property, you can define a default DataBox configuration that will be used in each DataBox.
     * @example
     * dataBoxDefaults : {
     *    access : 'all',
     * },
     */
    dataBoxDefaults ?: DataBoxConfig;

    /**
     * In this property, you can define all your models.
     * @example
     * models : {
     *   //example of model for an value.
     *   userName: {
     *      type: 'string',
     *      maxLength: 15,
     *      charClass: 'a-zA-Z._0-9'
     *   },
     *   //example of model for an object.
     *   chatMessage : {
     *          properties : {
     *              text : {},
     *              fromId : {}
     *          }
     *     },
     *   //example of model for an array.
     *   names : ['v.name',{maxLength : 20}]
     * }
     */
    models ?: Record<string,Model>;

    /**
     * In this property, you can configure all channels of the server
     * or create your custom (id) channels.
     * @example
     * channels : {
     *    customChannels : {
     *        ...
     *    }
     * }
     */
    channels ?: ChannelsConfig;

    /**
     * In this property, you can define background tasks.
     * @example
     * backgroundTasks : {
     *      myTask : {
     *          task : (sb) => {
     *              console.log(`TaskRunning on worker -> ${sb.getWorkerId()}`)
     *          },
     *          every : 1000
     *      }
     * },
     */
    backgroundTasks  ?: Record<string,BackgroundTask>,

    /**
     * In this property, you can import bag extensions.
     * @example
     * bagExtensions : [MyBagExtension1,MyBagExtension2],
     */
    bagExtensions ?: BagExtension[];
}

export interface PreCompiledAppConfig extends AppConfig{
    channels : PreCompiledChannelConfig
}

export default interface BagExtension {
    /**
     * All extensions for the SmallBag.
     * Notice that the Bag extends the SmallBag
     */
    smallBag ?: Record<string,any>,
    /**
     * All extensions for the Bag.
     */
    bag ?: Record<string,any>
}

export interface UserGroupsConfig
{
    /**
     * A socket that is not authenticated belongs to the default user group.
     * In this property, you can define the name of these user group.
     * @example
     * default : 'guest'
     */
    default  ?: string;
    /**
     * The auth object contains all user groups that can only be reached
     * if the socket is authenticated.
     * @example
     * auth : {
     *      user : {
     *           panelDisplayName : 'User'
     *      },
     * },
     */
    auth  ?: Record<string,AuthUserGroupConfig>;
}

export interface AuthUserGroupConfig
{
    /**
     * This property is only for advanced use cases.
     * Here you can set if this user group has panel access automatically.
     */
    panelAccess  ?: boolean;
    /**
     * Here you can define the name of the user group
     * that will be displayed in the zation panel.
     */
    panelDisplayName  ?: string;
}