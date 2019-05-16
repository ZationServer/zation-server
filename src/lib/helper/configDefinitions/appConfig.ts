/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import Bag               from '../../api/Bag';
import {ControllerClass} from "../../api/Controller";
// noinspection TypeScriptPreferShortImport
import {ValidationTypes} from "../constants/validationTypes";
import BackErrorBag      from "../../api/BackErrorBag";
import SmallBag          from "../../api/SmallBag";
import ZationTokenInfo   from "../infoObjects/zationTokenInfo";
import {ApiLevelSwitch} from "../apiLevel/apiLevelUtils";

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

export type Model =
    ValueModelConfig | ObjectModelConfig | ArrayModelConfig | ArrayModelShortSyntax | string | AnyOfModelConfig;

export interface AnyOfModelConfig extends ModelOptional
{
    /**
     * With the anyOf modifier, you can define different properties.
     * The input needs only to match with one of them to be valid.
     * @example
     * ```
     * // any of with array
     * anyOf : ['v.email','v.userName'],
     * // any of with object (Will help to get a better input path)
     * anyOf : {
     *   email : 'v.email',
     *   userName : 'v.userName'
     * }
     * ```
     */
    anyOf : Record<string,Model> | Model[]
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
    smallBag ?: Record<string,any>,
    bag ?: Record<string,any>
}

export interface TimeObj
{
    hour ?: number;
    minute ?: number;
    second ?: number;
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

export interface InputConfig {
    /**
     * This property defines the input.
     * It will be used to validate and format the data that flows into the component.
     * It can specify an input that is based on parameters
     * so that you can map models to a parameter name.
     * Or it can specify a single model as an input.
     * - Parameter-based input.
     * To define a parameter based input use an object as a value.
     * The keys of the object are the parameter names,
     * and the value defines an anonymous model or link to a declared model.
     * - Single model input
     * To set a single model input, you have to use an array as a value with exactly one item.
     * This item is an anonymous model or link to a declared model.
     * Notice that you also can use the single method on the Config class
     * for making it more clear that this is a single model input.
     * @example
     * //Parameter-based input
     * input : {
     *     name : {
     *         type : 'string'
     *     },
     *     age : {
     *         type : 'int',
     *         minValue : 14
     *     }
     * }
     * //Client can send  ->
     * {name : 'Luca', age : 20}
     * //or
     * ['Luca',20]
     *
     * //-Single model input-
     * input : [{
     *     type : 'string',
     *     minLength : 4
     * }]
     * //or
     * input : Config.single({
     *     type : 'string',
     *     minLength : 4
     * })
     * //Client can send ->
     * "ThisIsAnyString"
     */
    input ?: Input;
}

export type Input = ParamInput | SingleModelInput;

export interface SingleModelInput {
    [0]: Model;
}

export interface ParamInput {
    [key: string]: Model;
}

export type PrepareHandleFunction = (bag : Bag) => Promise<void> | void;

export type ControllerAccessFunction = (smallBag : SmallBag,token : ZationTokenInfo | null) => Promise<boolean> | boolean;

export interface ControllerConfig extends InputConfig
{
    /**
     * This property can be used to add functions in the prepare handle event of this controller.
     * This event gets invoked before the handle method of the controller.
     * Every prepare handle method will also be bound to the controller instance.
     * It can be used to prepare stuff on the bag.
     * (The bag is unique for every request.)
     * It is also possible to throw an error to the client.
     * @example
     * prepareHandle : [(bag) => {...}]
     * @throws
     * You can also throw TaskErrors, which are sent to the client with a not success response.
     */
    prepareHandle ?: PrepareHandleFunction[] | PrepareHandleFunction;
    wsAccess  ?: boolean;
    httpAccess  ?: boolean;
    httpGetAllowed  ?: boolean;
    httpPostAllowed  ?: boolean;
    inputAllAllow  ?: boolean;
    access  ?: string | number | (string | number)[] | ControllerAccessFunction;
    notAccess  ?: string | number | (string | number)[] | ControllerAccessFunction;
    versionAccess  ?: 'all' | Record<string,number | number[]>;
    systemAccess ?: 'all' | string[];
}

export type ValidatorFunction = (value : any,backErrorBag : BackErrorBag,inputPath : string,smallBag : SmallBag,type ?: string) => Promise<void> | void;
export type ConvertValueFunction = (value : any, smallBag : SmallBag) => Promise<any> | any;
export type GetDateFunction = (smallBag : SmallBag) => Promise<Date> | Date;

export interface ValueModelConfig extends ModelOptional
{
    type  ?: ValidationTypes | string | (ValidationTypes | string)[];
    strictType  ?: boolean;
    enum  ?: any [];
    privateEnum  ?: any [];
    minLength  ?: number;
    maxLength  ?: number;
    length  ?: number;
    contains  ?: string | string[];
    equals  ?: string | number | object;
    minValue  ?: number;
    maxValue  ?: number;
    regex  ?: string | RegExp | Record<string,RegExp | string>;
    endsWith  ?: string;
    startsWith  ?: string;
    letters  ?: string;
    charClass ?: string;
    maxByteSize ?: number;
    minByteSize ?: number;
    mimeType ?: string | null | (string | null)[];
    mimeSubType ?: string | null | (string | null)[];
    before ?: Date | GetDateFunction;
    after ?: Date | GetDateFunction;
    validate  ?: ValidatorFunction | ValidatorFunction[];
    convert  ?: ConvertValueFunction;
    convertType  ?: boolean;
    extends ?: string;
}

export interface ModelOptional {
    isOptional  ?: boolean;
    default ?: any
}

export type ObjectProperties = Record<string,Model>;
export type ConvertObjectFunction = (obj: any, smallBag : SmallBag) => Promise<any> | any;
export type ConstructObjectFunction = (self : any, smallBag : SmallBag) => Promise<void> | void;

export interface ObjectModelConfig extends ModelOptional
{
    properties : ObjectProperties;
    extends  ?: string;
    prototype  ?: object;
    construct  ?: ConstructObjectFunction;
    convert  ?: ConvertObjectFunction;
    moreInputAllowed ?: boolean;
}

export interface ArrayModelConfig extends ArraySettings
{
    array : Model
}

export type ConvertArrayFunction = (array: any[], smallBag : SmallBag) => Promise<any> | any;

export interface ArraySettings extends ModelOptional
{
    minLength  ?: number;
    maxLength  ?: number;
    length  ?: number;
    convert  ?: ConvertArrayFunction
}

export interface ArrayModelShortSyntax extends Array<Model | ArraySettings | undefined>
{
    0 : Model
    1 ?: ArraySettings
}