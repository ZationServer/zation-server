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
import {
    CustomChannelConfig, CustomCh, ZationChannelsConfig, PreCompiledCustomChannelConfig
} from "./channelsConfig";

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
     * With this property, you can define a default controller configuration
     * that will be used in each controller as a fallback.
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
     * With this property, you can define a default DataBox configuration
     * that will be used in each DataBox as a fallback.
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
     * In this property, you can configure all predefined zation channels.
     * @example
     * zationChannels : {
     *    userCh : {
     *        socketGetOwnPublish : false
     *    }
     * }
     */
    zationChannels ?: ZationChannelsConfig;

    /**
     * Define your custom channels. There are two different variants:
     * The first variant is the usual custom channel,
     * that is useful if you only need one instance of that channel type.
     * The second variant is the custom channel family.
     * You should use this variant if you need more than one channel
     * of these type and they only differ by an id.
     * For example, I have a private user chat where more chats can exist with a specific id.
     * Now I can have more channels from type user chat with different identifiers.
     * Look in the example below to see how you actually can define custom channels.
     * @example
     * customChannels : {
     *     // Definition of a custom channel family.
     *     // Notice the array brackets around the object!
     *     privateChats : [{
     *          subscribeAccess : 'allAuth',
     *     }],
     *     // Definition of a usual custom channel.
     *     publicStream : {
     *         subscribeAccess : 'allAuth',
     *     }
     * }
     */
    customChannels ?: Record<string,CustomChannelConfig>

    /**
     * With this property, you can define a default custom channel configuration
     * that will be used in each custom channel as a fallback.
     * @example
     * customChannelDefaults : {
     *     clientPublishAccess : false
     * }
     */
    customChannelDefaults ?: CustomCh

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

export default interface BagExtension {
    /**
     * All extensions for the Bag.
     * Notice that the ReqBag extends the Bag.
     */
    bag ?: Record<string,any>,
    /**
     * All extensions for the RequestBag.
     */
    requestBag ?: Record<string,any>
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

export interface PreCompiledAppConfig extends AppConfig{
    customChannels ?: Record<string,PreCompiledCustomChannelConfig>
}