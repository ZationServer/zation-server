/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

// noinspection TypeScriptPreferShortImport
import {Bag}             from '../../api/Bag';
import SmallBag        = require("../../api/SmallBag");
import ZationToken     = require("../infoObjects/zationTokenInfo");
import TaskErrorBag    = require("../../api/TaskErrorBag");
import {ControllerClass} from "../../api/Controller";
// noinspection TypeScriptPreferShortImport
import {ValidationTypes} from "../constants/validationTypes";

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
    anyOf : Record<string,Property> | Property[]
}

export type TaskFunction = (smallBag : SmallBag) => Promise<void> | void;

export interface BackgroundTask
{
    at  ?: number | TimeObj | TimeObj[] | number[];
    every  ?: number | TimeObj | TimeObj[] | number[];
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
    default  ?: string;
    auth  ?: Record<string,AuthUserGroupConfig>;
}

export interface AuthUserGroupConfig
{
    panelAccess  ?: boolean;
    panelDisplayName  ?: string;
}

export type ControllerInput = Record<string,Property | AnyOfProperty>;
export type BeforeHandleFunction = (bag : Bag) => Promise<void> | void;
export type ControllerAccessFunction = (smallBag : SmallBag,token : ZationToken | null) => Promise<boolean> | boolean;

export interface ControllerConfig
{
    input  ?: ControllerInput;
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

