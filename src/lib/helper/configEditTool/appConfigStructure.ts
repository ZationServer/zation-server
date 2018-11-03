/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */
import Const           = require('./../constants/constWrapper');
import Bag             = require("../../api/Bag");
import SmallBag        = require("../../api/SmallBag");
import ZationToken     = require("../infoObjects/zationToken");
import TaskErrorBag = require("../../api/TaskErrorBag");

export interface AppConfig
{
    [Const.App.KEYS.AUTH_CONTROLLER] ?: string;
    [Const.App.KEYS.CONTROLLER] ?: Record<string,ControllerConfig>;
    [Const.App.KEYS.USER_GROUPS] ?: UserGroupsConfig;
    [Const.App.KEYS.CONTROLLER_DEFAULTS] ?: ControllerDefaultsConfig;
    [Const.App.KEYS.OBJECTS] ?: Record<string,ObjectConfig>;
    [Const.App.KEYS.INPUT_GROUPS] ?: Record<string,InputConfig>;
    [Const.App.KEYS.BACKGROUND_TASKS] ?: Record<string,BackgroundTask>
}

export type TaskFunction = (smallBag : SmallBag) => Promise<void> | void;

export type ControllerInput = Record<string,InputProperty>;
export type InputProperty = InputConfig | ObjectConfig | ArrayConfig | string | ArrayShortSyntax;

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

export interface ControllerDefaultsConfig
{
    [Const.App.CONTROLLER.INPUT] ?: Record<string,InputConfig | ObjectConfig | ArrayConfig | string | ArrayShortSyntax>;
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

export type BeforeHandleFunction = (bag : Bag) => Promise<void> | void;
export type ControllerAccessFunction = (smallBag : SmallBag,token : ZationToken) => Promise<boolean> | boolean;

export type ValidatorFunction = (value : any,taskErrorBag : TaskErrorBag,inputPath : string,smallBag : SmallBag) => Promise<void> | void;

export interface InputConfig
{
    [Const.Validator.KEYS.TYPE] ?: string | string[];
    [Const.Validator.KEYS.STRICT_TYPE] ?: boolean;
    [Const.Validator.KEYS.FUNCTION_ENUM] ?: any [];
    [Const.Validator.KEYS.FUNCTION_PRIVATE_ENUM] ?: any [];
    [Const.Validator.KEYS.FUNCTION_MIN_LENGTH] ?: number;
    [Const.Validator.KEYS.FUNCTION_MAX_LENGTH] ?: number;
    [Const.Validator.KEYS.FUNCTION_LENGTH] ?: number;
    [Const.Validator.KEYS.FUNCTION_CONTAINS] ?: string;
    [Const.Validator.KEYS.FUNCTION_EQUALS] ?: string | number | object;
    [Const.Validator.KEYS.FUNCTION_BIGGER_THAN] ?: number;
    [Const.Validator.KEYS.FUNCTION_LESSER_THAN] ?: number;
    [Const.Validator.KEYS.FUNCTION_REGEX] ?: string | RegExp | Record<string,RegExp | string>;
    [Const.Validator.KEYS.FUNCTION_ENDS_WITH] ?: string;
    [Const.Validator.KEYS.FUNCTION_STARTS_WITH] ?: string;
    [Const.Validator.KEYS.FORMAT_IS_LETTERS] ?: string;
    [Const.Validator.KEYS.VALIDATE] ?: ValidatorFunction | ValidatorFunction[];

    [Const.App.INPUT.IS_OPTIONAL] ?: boolean;
    [Const.App.INPUT.CONVERT] ?: ConstructValueFunction;
    [Const.App.INPUT.CONVERT_TYPE] ?: boolean;
}

export type ObjectProperties = Record<string,InputConfig | ObjectConfig | ArrayConfig | string | ArrayShortSyntax>;

export interface ObjectConfig
{
    [Const.App.OBJECTS.PROPERTIES] : ObjectProperties;
    [Const.App.OBJECTS.CONSTRUCT] ?: ConstructObjectFunction;
    [Const.App.OBJECTS.EXTENDS] ?: string;
}

export interface ArrayConfig extends ArraySettings
{
    [Const.App.INPUT.ARRAY] : InputConfig | ObjectConfig | ArrayConfig | string | ArrayShortSyntax;
    [Const.App.INPUT.IS_OPTIONAL] : boolean;
}

export interface ArraySettings
{
    [Const.App.ARRAY.MIN_LENGTH] ?: number;
    [Const.App.ARRAY.MAX_LENGTH] ?: number;
    [Const.App.ARRAY.LENGTH] ?: number;
}

export interface ArrayShortSyntax extends Array<string | ArrayShortSyntax | InputConfig | ObjectConfig | ArrayConfig | ArraySettings>
{
    0 : string | ArrayShortSyntax | InputConfig | ObjectConfig | ArrayConfig
    1 : ArraySettings
}

export type ConstructObjectFunction = (obj: object, smallBag : SmallBag) => Promise<any> | any;
export type ConstructValueFunction = (value : any, smallBag : SmallBag) => Promise<any> | any;
