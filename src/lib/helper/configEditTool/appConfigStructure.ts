/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */
import Const           = require('./../constants/constWrapper');
import Bag             = require("../../api/Bag");
import SmallBag        = require("../../api/SmallBag");
import ZationToken     = require("../infoObjects/zationToken");
import TaskErrorBag    = require("../../api/TaskErrorBag");

export interface AppConfig
{
    [Const.App.KEYS.AUTH_CONTROLLER] ?: string;
    [Const.App.KEYS.CONTROLLER] ?: Record<string,ControllerConfig>;
    [Const.App.KEYS.USER_GROUPS] ?: UserGroupsConfig;
    [Const.App.KEYS.CONTROLLER_DEFAULTS] ?: ControllerDefaultsConfig;
    [Const.App.KEYS.VALUES] ?: Record<string,ValuePropertyConfig>;
    [Const.App.KEYS.OBJECTS] ?: Record<string,ObjectPropertyConfig>;
    [Const.App.KEYS.ARRAYS] ?: Record<string,ArrayPropertyConfig | ArrayShortSyntax>;
    [Const.App.KEYS.BACKGROUND_TASKS] ?: Record<string,BackgroundTask>
}

export type Property = ValuePropertyConfig | ObjectPropertyConfig | ArrayPropertyConfig | ArrayShortSyntax | string;

export type TaskFunction = (smallBag : SmallBag) => Promise<void> | void;

export interface BackgroundTask
{
    [Const.App.BACKGROUND_TASKS.AT] ?: number | TimeObj | TimeObj[] | number[];
    [Const.App.BACKGROUND_TASKS.EVERY] ?: number | TimeObj | TimeObj[] | number[];
    [Const.App.BACKGROUND_TASKS.TASK] ?: TaskFunction | TaskFunction[];
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
    [Const.App.USER_GROUPS.DEFAULT] ?: string;
    [Const.App.USER_GROUPS.AUTH] ?: Record<string,AuthUserGroupConfig>;
}

export interface AuthUserGroupConfig
{
    [Const.App.AUTH_USER_GROUP.PANEL_ACCESS] ?: boolean;
    [Const.App.AUTH_USER_GROUP.PANEL_DISPLAY_NAME] ?: string;
}

export type ControllerInput = Record<string,Property>;
export type BeforeHandleFunction = (bag : Bag) => Promise<void> | void;
export type ControllerAccessFunction = (smallBag : SmallBag,token : ZationToken) => Promise<boolean> | boolean;

export interface ControllerDefaultsConfig
{
    [Const.App.CONTROLLER.INPUT] ?: ControllerInput;
    [Const.App.CONTROLLER.BEFORE_HANDLE] ?: BeforeHandleFunction[] | BeforeHandleFunction;
    [Const.App.CONTROLLER.SYSTEM_CONTROLLER] ?: boolean;
    [Const.App.CONTROLLER.WS_ACCESS] ?: boolean;
    [Const.App.CONTROLLER.HTTP_ACCESS] ?: boolean;
    [Const.App.CONTROLLER.HTTP_GET_ALLOWED] ?: boolean;
    [Const.App.CONTROLLER.HTTP_POST_ALLOWED] ?: boolean;
    [Const.App.CONTROLLER.INPUT_VALIDATION] ?: boolean;
    [Const.App.CONTROLLER.INPUT_ALL_ALLOW] ?: boolean;
    [Const.App.CONTROLLER.ACCESS] ?: string | number | (string | number)[] | ControllerAccessFunction;
    [Const.App.CONTROLLER.NOT_ACCESS] ?: string | number | (string | number)[] | ControllerAccessFunction;
    [Const.App.CONTROLLER.VERSION_ACCESS] ?: string | Record<string,number | number[]>
}

export interface ControllerConfig extends ControllerDefaultsConfig
{
    [Const.App.CONTROLLER.FILE_PATH] ?: string;
    [Const.App.CONTROLLER.FILE_NAME] ?: string;
}

export type ValidatorFunction = (value : any,taskErrorBag : TaskErrorBag,inputPath : string,smallBag : SmallBag) => Promise<void> | void;
export type ConvertValueFunction = (value : any, smallBag : SmallBag) => Promise<any> | any;

export interface ValuePropertyConfig
{
    [Const.Validator.VALUE.KEYS.TYPE] ?: string | string[];
    [Const.Validator.VALUE.KEYS.STRICT_TYPE] ?: boolean;
    [Const.Validator.VALUE.KEYS.FUNCTION_ENUM] ?: any [];
    [Const.Validator.VALUE.KEYS.FUNCTION_PRIVATE_ENUM] ?: any [];
    [Const.Validator.VALUE.KEYS.FUNCTION_MIN_LENGTH] ?: number;
    [Const.Validator.VALUE.KEYS.FUNCTION_MAX_LENGTH] ?: number;
    [Const.Validator.VALUE.KEYS.FUNCTION_LENGTH] ?: number;
    [Const.Validator.VALUE.KEYS.FUNCTION_CONTAINS] ?: string | string[];
    [Const.Validator.VALUE.KEYS.FUNCTION_EQUALS] ?: string | number | object;
    [Const.Validator.VALUE.KEYS.FUNCTION_BIGGER_THAN] ?: number;
    [Const.Validator.VALUE.KEYS.FUNCTION_LESSER_THAN] ?: number;
    [Const.Validator.VALUE.KEYS.FUNCTION_REGEX] ?: string | RegExp | Record<string,RegExp | string>;
    [Const.Validator.VALUE.KEYS.FUNCTION_ENDS_WITH] ?: string;
    [Const.Validator.VALUE.KEYS.FUNCTION_STARTS_WITH] ?: string;
    [Const.Validator.VALUE.KEYS.FORMAT_IS_LETTERS] ?: string;
    [Const.Validator.VALUE.KEYS.VALIDATE] ?: ValidatorFunction | ValidatorFunction[];
    [Const.App.VALUE.IS_OPTIONAL] ?: boolean;
    [Const.App.VALUE.CONVERT] ?: ConvertValueFunction;
    [Const.App.VALUE.CONVERT_TYPE] ?: boolean;
}

export type ObjectProperties = Record<string,Property>;
export type ConvertObjectFunction = (obj: object, smallBag : SmallBag) => Promise<any> | any;
export type ConstructObjectFunction = (self : object, smallBag : SmallBag) => Promise<void> | void;

export interface ObjectPropertyConfig
{
    [Const.App.OBJECT.PROPERTIES] : ObjectProperties;
    [Const.App.OBJECT.IS_OPTIONAL] ?: boolean;
    [Const.App.OBJECT.EXTENDS] ?: string;
    [Const.App.OBJECT.PROTOTYPE] ?: object;
    [Const.App.OBJECT.CONSTRUCT] ?: ConstructObjectFunction;
    [Const.App.OBJECT.CONVERT] ?: ConvertObjectFunction;
}

export interface ArrayPropertyConfig extends ArraySettings
{
    [Const.App.ARRAY.ARRAY] : Property;
}

export type ConvertArrayFunction = (array: any[], smallBag : SmallBag) => Promise<any> | any;

export interface ArraySettings
{
    [Const.Validator.ARRAY.KEYS.MIN_LENGTH] ?: number;
    [Const.Validator.ARRAY.KEYS.MAX_LENGTH] ?: number;
    [Const.Validator.ARRAY.KEYS.LENGTH] ?: number;
    [Const.App.ARRAY.IS_OPTIONAL] ?: boolean;
    [Const.App.ARRAY.CONVERT] ?: ConvertArrayFunction
}

export interface ArrayShortSyntax extends Array<Property | ArraySettings>
{
    0 : Property
    1 : ArraySettings
}
