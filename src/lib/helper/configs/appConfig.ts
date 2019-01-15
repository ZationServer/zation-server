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
    authController  ?: string;
    controllers  ?: Record<string,(ControllerClass)>;
    userGroups  ?: UserGroupsConfig;
    controllerDefaults  ?: ControllerConfig;
    values  ?: Record<string,ValuePropertyConfig>;
    objects  ?: Record<string,ObjectPropertyConfig>;
    arrays  ?: Record<string,ArrayPropertyConfig | ArrayShortSyntax>;
    backgroundTasks  ?: Record<string,BackgroundTask>
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

