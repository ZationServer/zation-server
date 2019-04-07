/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

// noinspection TypeScriptPreferShortImport
import {Bag}             from '../../api/Bag';
import SmallBag        = require("../../api/SmallBag");
import TaskErrorBag    = require("../../api/TaskErrorBag");
import {ControllerClass} from "../../api/Controller";
// noinspection TypeScriptPreferShortImport
import {ValidationTypes} from "../constants/validationTypes";
import {ZationToken} from "../constants/internal";

export interface AppConfig
{
    /**
     * The name of the authController.
     * This property makes it possible to send an authentication request to the server.
     * aThen the server will automatically use the linked controller.
     * @example
     * authController : 'login',
     */
    authController  ?: string;

    /**
     * In this property, you can define all your controllers.
     * The value must be an object.
     * The key of each property is the name of the controller.
     * The value of each property is the imported controller class.
     * @example
     * controllers : {
     *    register : RegisterController,
     *    login : LogInController,
     * }
     */
    controllers  ?: Record<string,ControllerClass>;

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
     * In this property, you can define all your user values.
     * @example
     * values : {
     *   userName: {
            type: 'string',
            maxLength: 15,
            charClass: 'a-zA-Z._0-9'
         },
     * }
     */
    values  ?: Record<string,ValuePropertyConfig>;

    /**
     * In this property, you can define all your objects.
     * @example
     * objects : {
     *  chatMessage : {
     *          properties : {
     *              text : {},
     *              fromId : {}
     *          }
     *     },
     * }
     */
    objects  ?: Record<string,ObjectPropertyConfig>;

    /**
     * In this property, you can define all your arrays.
     * @example
     * arrays : {
     *   names : ['v.name',{maxLength : 20}]
     * }
     *
     */
    arrays  ?: Record<string,ArrayPropertyConfig | ArrayShortSyntax>;

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

export type Property = ValuePropertyConfig | ObjectPropertyConfig | ArrayPropertyConfig | ArrayShortSyntax | string;

export interface AnyOfProperty extends PropertyOptional
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
    anyOf : Record<string,Property> | Property[]
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
}

export default interface BagExtension {
    smallBag : Record<string,any>,
    bag : Record<string,any>
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
     * It works parameter based, the key is the parameter name,
     * and the value is the configuration of the parameter input.
     * If you want to get only one anonymous input you can use the property singleInput.
     * @example
     * multiInput : {
     *     name : {
     *         type : 'string'
     *     },
     *     age : {
     *         type : 'string',
     *         minValue : 14
     *     }
     * }
     */
    multiInput ?: MultiInput;
    /**
     * This property defines a single input.
     * (Not parameter based like multiInput or input)
     * @example
     * singleInput : {
     *     type : 'string',
     *     minLength : 5
     * }
     */
    singleInput ?: SingleInput;
    /**
     * This property defines the input.
     * Its a shortcut for the property multiInput.
     * It works parameter based, the key is the parameter name,
     * and the value is the configuration of the parameter input.
     * If you want to get only one anonymous input you can use the property singleInput.
     * multiInput : {
     *     name : {
     *         type : 'string'
     *     },
     *     age : {
     *         type : 'string',
     *         minValue : 14
     *     }
     * }
     */
    input ?: MultiInput;
}

export interface MultiInput {
    [key: string]: SingleInput;
}
export type SingleInput = Property | AnyOfProperty;

export type BeforeHandleFunction = (bag : Bag) => Promise<void> | void;
export type ControllerAccessFunction = (smallBag : SmallBag,token : ZationToken | null) => Promise<boolean> | boolean;

export interface ControllerConfig extends InputConfig
{
    beforeHandle  ?: BeforeHandleFunction[] | BeforeHandleFunction;
    systemController  ?: boolean;
    wsAccess  ?: boolean;
    httpAccess  ?: boolean;
    httpGetAllowed  ?: boolean;
    httpPostAllowed  ?: boolean;
    inputValidation  ?: boolean;
    inputAllAllow  ?: boolean;
    access  ?: string | number | (string | number)[] | ControllerAccessFunction;
    notAccess  ?: string | number | (string | number)[] | ControllerAccessFunction;
    versionAccess  ?: string | Record<string,number | number[]>
}

export type ValidatorFunction = (value : any,taskErrorBag : TaskErrorBag,inputPath : string,smallBag : SmallBag,type ?: string) => Promise<void> | void;
export type ConvertValueFunction = (value : any, smallBag : SmallBag) => Promise<any> | any;
export type GetDateFunction = (smallBag : SmallBag) => Promise<Date> | Date;

export interface ValuePropertyConfig extends PropertyOptional
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

export interface PropertyOptional {
    isOptional  ?: boolean;
    default ?: any
}

export type ObjectProperties = Record<string,Property | AnyOfProperty>;
export type ConvertObjectFunction = (obj: any, smallBag : SmallBag) => Promise<any> | any;
export type ConstructObjectFunction = (self : any, smallBag : SmallBag) => Promise<void> | void;

export interface ObjectPropertyConfig extends PropertyOptional
{
    properties : ObjectProperties;
    extends  ?: string;
    prototype  ?: object;
    construct  ?: ConstructObjectFunction;
    convert  ?: ConvertObjectFunction;
    moreInputAllowed ?: boolean;
}

export interface ArrayPropertyConfig extends ArraySettings
{
    array : Property | AnyOfProperty
}

export type ConvertArrayFunction = (array: any[], smallBag : SmallBag) => Promise<any> | any;

export interface ArraySettings extends PropertyOptional
{
    minLength  ?: number;
    maxLength  ?: number;
    length  ?: number;
    convert  ?: ConvertArrayFunction
}

export interface ArrayShortSyntax extends Array<Property | AnyOfProperty | ArraySettings | undefined>
{
    0 : Property | AnyOfProperty
    1 ?: ArraySettings
}


