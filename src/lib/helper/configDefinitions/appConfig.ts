/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import {ControllerClass}      from "../../api/Controller";
import SmallBag               from "../../api/SmallBag";
import {ApiLevelSwitch}       from "../apiLevel/apiLevelUtils";
import {ControllerConfig}     from "./controllerConfig";
import {Model}                from "./inputConfig";

export interface AppConfig
{
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
}

export type TaskFunction = (smallBag : SmallBag) => Promise<void> | void;

export interface BackgroundTask
{
    /**
     * Defines when the background task should be invoked.
     * At will invoke the background task only one time.
     * You can use a number to define the milliseconds or a TimeObj to define a Time.
     * @example
     * // Will invoke the background task when the hour is 10.
     * at : {hour : 10}
     * // Will invoke the background task when the hour is 10 or 8.
     * at : [{hour : 10},{hour : 8}]
     * // Will invoke the background task when the hour is 10 and second 30.
     * at : {hour : 10,second : 30}
     * // Will invoke the background task after 30 seconds.
     * at : 30000
     */
    at  ?: number | TimeObj | TimeObj[] | number[];
    /**
     * Defines when the background task should be invoked.
     * Every will invoke the background task every time.
     * You can use a number to define the milliseconds or a TimeObj to define a Time.
     * @example
     * // Will invoke the background task whenever the hour is 10.
     * every : {hour : 10}
     * // Will invoke the background task whenever the hour is 10 or 8.
     * every : [{hour : 10},{hour : 8}]
     * // Will invoke the background task whenever the hour is 10 and second 30.
     * every : {hour : 10,second : 30}
     * // Will invoke the background task every 30 seconds.
     * every : 30000
     */
    every  ?: number | TimeObj | TimeObj[] | number[];
    /**
     * The task method defines the general task of the background task.
     * Optionally you can pass an array of tasks.
     * @example
     * task : (sb : SmallBag) => {
     *    console.log(`TaskRunning on worker -> ${sb.getWorkerId()}`);
     * },
     */
    task  ?: TaskFunction | TaskFunction[];
    /**
     * Indicates if this task should be cluster save.
     * That means if you have multiple servers in a cluster,
     * only one of them will executing the task. Otherwise,
     * every server will perform that task.
     * @default true
     */
    clusterSafe ?: boolean;
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

export interface TimeObj
{
    /**
     * The specific hour when the background task should be executed.
     */
    hour ?: number;
    /**
     * The specific minute when the background task should be executed.
     */
    minute ?: number;
    /**
     * The specific second when the background task should be executed.
     */
    second ?: number;
    /**
     * The specific millisecond when the background task should be executed.
     */
    millisecond ?: number;
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