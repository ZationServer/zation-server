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
// noinspection ES6PreferShortImport
import {DataboxConfig}        from "../parts/databoxConfig";
// noinspection ES6PreferShortImport
import {Events}               from '../parts/events';
// noinspection ES6PreferShortImport
import {Middleware}           from '../parts/middleware';
import {UserGroupsConfig}                  from '../parts/userGroupsConfig';
import {AnyDataboxClass}                   from '../../../../api/databox/AnyDataboxClass';
import {AnyChannelClass}                   from '../../../../api/channel/AnyChannelClass';
// noinspection ES6PreferShortImport
import {ChannelConfig}                     from '../parts/channelConfig';
// noinspection ES6PreferShortImport
import {ReceiverConfig}                    from '../parts/receiverConfig';
import {ReceiverClass}                     from '../../../../api/Receiver';

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
    events?: Events;

    /**
     * In this property, you can define some middleware functions.
     * @example
     * middleware: {
     *     socket: (socket) => {
     *         if(socket.getHandshakeAttachment()?.oldClient){
     *             return false;
     *         }
     *     }
     * }
     */
    middleware?: Middleware;

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
     *    access: 'all'
     * }
     */
    controllerDefaults?: ControllerConfig;

    /**
     * In this property, you can define all your receivers.
     * The value must be an object.
     * The key of each property is the identifier of the receiver.
     * The value of each property is the imported Receiver class
     * or an ApiLevelSwitch of Receiver classes.
     * @example
     * receivers: {
     *    move: MoveReceiver
     * }
     */
    receivers?: Record<string,ReceiverClass | ApiLevelSwitch<ReceiverClass>>;

    /**
     * With this property, you can define a default Receiver configuration
     * that will be used in each Receiver as a fallback.
     * @example
     * receiverDefaults: {
     *    access: 'all'
     * }
     */
    receiverDefaults?: ReceiverConfig;

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
    databoxes?: Record<string,AnyDataboxClass | ApiLevelSwitch<AnyDataboxClass>>;

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
     * In this property, you can define all your Channels.
     * The value must be an object.
     * The key of each property is the identifier of the Channel.
     * The value of each property is the imported Channel class or
     * an ApiLevelSwitch of Channel classes.
     * @example
     * channels: {
     *     profile: ProfileChannel,
     *     info: InfoChannel,
     * }
     */
    channels?: Record<string,AnyChannelClass | ApiLevelSwitch<AnyChannelClass>>;

    /**
     * With this property, you can define a default Channel configuration
     * that will be used in each Channel as a fallback.
     * @example
     * channelDefaults: {
     *     subscribe: {
     *         access: 'all'
     *     }
     * },
     */
    channelDefaults?: ChannelConfig;

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

    /**
     * Define all client systems that are allowed to connect to the server.
     * Optionally you also can set required versions of a system.
     * Notice that the client sends the system and version in the
     * handshake and focus on different client applications.
     * Look in the examples to see what possibilities you have.
     * @default 'any'
     * @example
     * //string
     * allowedSystems: 'any'       // Allow any system and version
     * //object
     * allowedSystems: {
     *     'IOS': 1.0,             // Allow system IOS with at least version 1.0
     *     'ANDROID': 4.2,         // Allow system Android with at least version 4.2
     *     'WIN': 'any',           // Allow system WIN with any version
     *     'MAC': [1.3,1.8,2.2]    // Allow system MAC with version 1.3, 1.8 or 2.2
     * }
     */
    allowedSystems?: 'any' | Record<string,number | number[] | 'any'>
}