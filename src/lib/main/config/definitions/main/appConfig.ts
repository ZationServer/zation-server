/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {ControllerClass}      from "../../../../api/Controller";
import {ApiLevelSwitch}       from "../../../apiLevel/apiLevelUtils";
// noinspection TypeScriptPreferShortImport,ES6PreferShortImport
import {ControllerConfig}     from "../parts/controllerConfig";
import {BackgroundTask}       from "../parts/backgroundTask";
import {DataboxClassDef, DataboxConfig} from "../parts/databoxConfig";
import {
    CustomChannelConfig, CustomCh, ZationChannelsConfig, PreCompiledCustomChannelConfig
} from "../parts/channelsConfig";
import {Events, PrecompiledEvents}         from '../parts/events';
import {Middleware, PrecompiledMiddleware} from '../parts/middleware';
import {UserGroupsConfig}                  from '../parts/userGroupsConfig';

export interface AppConfig
{
    /**
     * In this property, you can define all your user groups.
     * @example
     * userGroups: {
     *   auth: {
     *       user: {
     *            panelDisplayName: 'User'
     *       },
     *   },
     * default: 'guest'
     * },
     */
    userGroups?: UserGroupsConfig;

    /**
     * In this property, you can react to specific events.
     * @example
     * events: {
     *     socketConnection : (socket) => {
     *     },
     *     socketDisconnection : (socket) => {
     *     }
     * }
     */
    events?: Events,

    /**
     * In this property, you can define some middleware functions.
     * @example
     * middleware: {
     *     socket: (socket) => {
     *         if(socket.handshakeVariables['oldClient']){
     *             return false;
     *         }
     *     }
     * }
     */
    middleware?: Middleware,

    /**
    * In this property, you can define all your controllers.
    * The value must be an object.
    * The key of each property is the identifier of the controller.
    * The value of each property is the imported Controller class
    * or an ApiLevelSwitch of Controller classes.
    * @example
    * controllers: {
    *    register: RegisterController,
    *    login: LogInController,
    * }
    */
    controllers?: Record<string,ControllerClass | ApiLevelSwitch<ControllerClass>>;

    /**
     * With this property, you can define a default Controller configuration
     * that will be used in each Controller as a fallback.
     * @example
     * controllerDefaults: {
     *    wsAccess: true,
     *    httpAccess: true,
     *    httpPostAllowed: true,
     *    httpGetAllowed: true,
     *    access: 'all',
     * },
     */
    controllerDefaults?: ControllerConfig;

    /**
     * In this property, you can define all your Databoxes.
     * The value must be an object.
     * The key of each property is the identifier of the Databox.
     * The value of each property is the imported Databox class or
     * an ApiLevelSwitch of Databox classes.
     * @example
     * databoxes: {
     *     profile: ProfileDatabox,
     *     chat: ChatDatabox,
     * }
     */
    databoxes?: Record<string,DataboxClassDef | ApiLevelSwitch<DataboxClassDef>>;

    /**
     * With this property, you can define a default Databox configuration
     * that will be used in each Databox as a fallback.
     * @example
     * databoxDefaults: {
     *     access: 'all',
     * },
     */
    databoxDefaults?: DataboxConfig;

    /**
     * In this property, you can configure all predefined zation channels.
     * @example
     * zationChannels: {
     *    userCh: {
     *        socketGetOwnPublish: false
     *    }
     * }
     */
    zationChannels?: ZationChannelsConfig;

    /**
     * Define your custom channels. There are two different variants:
     * The first variant is the usual custom channel,
     * that is useful if you only need one instance of that channel type.
     * The second variant is the custom channel family.
     * You should use this variant if you need more than one channel instance
     * of these type and they only differ by an instance of an entity.
     * For example, I have a private user chat where more chats can exist with a specific id.
     * By using a custom channel family I can have more channel instances from
     * type user chat with different members (id of the chat).
     * Look in the example below to see how you actually can define custom channels.
     * The key of each property is the identifier of the custom channel.
     * @example
     * customChannels: {
     *     // Definition of a custom channel family.
     *     // Notice the array brackets around the object!
     *     privateChats: [{
     *          subscribeAccess: 'allAuth',
     *     }],
     *     // Definition of a usual custom channel.
     *     publicStream: {
     *         subscribeAccess: 'allAuth',
     *     }
     * }
     */
    customChannels?: Record<string,CustomChannelConfig>

    /**
     * With this property, you can define a default custom channel configuration
     * that will be used in each custom channel as a fallback.
     * @example
     * customChannelDefaults: {
     *     clientPublishAccess: false
     * }
     */
    customChannelDefaults?: CustomCh

    /**
     * In this property, you can define background tasks.
     * @example
     * backgroundTasks: {
     *      myTask: {
     *          task: (sb) => {
     *              console.log(`TaskRunning on worker -> ${sb.getWorkerId()}`)
     *          },
     *          every: 1000
     *      }
     * },
     */
    backgroundTasks?: Record<string,BackgroundTask>,
}

export interface PrecompiledAppConfig extends AppConfig{
    events: PrecompiledEvents,
    middleware: PrecompiledMiddleware,
    customChannels?: Record<string,PreCompiledCustomChannelConfig>
}