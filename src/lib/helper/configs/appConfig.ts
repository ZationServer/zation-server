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
import BagExtension      from "../bagExtension/bagExtension";

export interface AppConfig<E extends BagExtension = {smallBag:{},bag:{}}>
{
    authController  ?: string;
    controllers  ?: Record<string,(ControllerClass<E>)>;
    userGroups  ?: UserGroupsConfig;
    controllerDefaults  ?: ControllerConfig<E>;
    values  ?: Record<string,ValuePropertyConfig<E>>;
    objects  ?: Record<string,ObjectPropertyConfig<E>>;
    arrays  ?: Record<string,ArrayPropertyConfig<E> | ArrayShortSyntax<E>>;
    backgroundTasks  ?: Record<string,BackgroundTask<E>>,
    bagExtensions ?: BagExtension[];
}

export type Property<E extends BagExtension = {smallBag:{},bag:{}}> = ValuePropertyConfig<E> | ObjectPropertyConfig<E> | ArrayPropertyConfig<E> | ArrayShortSyntax<E> | string;

export interface AnyOfProperty<E extends BagExtension = {smallBag:{},bag:{}}> extends PropertyOptional
{
    anyOf : Record<string,Property<E>> | Property<E>[]
}

export type TaskFunction<E extends BagExtension = {smallBag:{},bag:{}}> = (smallBag : (SmallBag & E["smallBag"])) => Promise<void> | void;

export interface BackgroundTask<E extends BagExtension = {smallBag:{},bag:{}}>
{
    at  ?: number | TimeObj | TimeObj[] | number[];
    every  ?: number | TimeObj | TimeObj[] | number[];
    task  ?: TaskFunction<E> | TaskFunction<E>[];
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

export type ControllerInput<E extends BagExtension = {smallBag:{},bag:{}}> = Record<string,Property<E> | AnyOfProperty<E>>;
export type BeforeHandleFunction<E extends BagExtension = {smallBag:{},bag:{}}> = (bag : (Bag & E["smallBag"] & E["bag"])) => Promise<void> | void;
export type ControllerAccessFunction<E extends BagExtension = {smallBag:{},bag:{}}> = (smallBag : (SmallBag & E["smallBag"]),token : ZationToken | null) => Promise<boolean> | boolean;

export interface ControllerConfig<E extends BagExtension = {smallBag:{},bag:{}}>
{
    input  ?: ControllerInput<E>;
    beforeHandle  ?: BeforeHandleFunction<E>[] | BeforeHandleFunction<E>;
    systemController  ?: boolean;
    wsAccess  ?: boolean;
    httpAccess  ?: boolean;
    httpGetAllowed  ?: boolean;
    httpPostAllowed  ?: boolean;
    inputValidation  ?: boolean;
    inputAllAllow  ?: boolean;
    access  ?: string | number | (string | number)[] | ControllerAccessFunction<E>;
    notAccess  ?: string | number | (string | number)[] | ControllerAccessFunction<E>;
    versionAccess  ?: string | Record<string,number | number[]>
}

export type ValidatorFunction<E extends BagExtension = {smallBag:{},bag:{}}> = (value : any,taskErrorBag : TaskErrorBag,inputPath : string,smallBag : (SmallBag & E["smallBag"]),type ?: string) => Promise<void> | void;
export type ConvertValueFunction<E extends BagExtension = {smallBag:{},bag:{}}> = (value : any, smallBag : (SmallBag & E["smallBag"])) => Promise<any> | any;
export type GetDateFunction<E extends BagExtension = {smallBag:{},bag:{}}> = (smallBag : (SmallBag & E["smallBag"])) => Promise<Date> | Date;

export interface ValuePropertyConfig<E extends BagExtension = {smallBag:{},bag:{}}> extends PropertyOptional
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
    before ?: Date | GetDateFunction<E>;
    after ?: Date | GetDateFunction<E>;
    validate  ?: ValidatorFunction<E> | ValidatorFunction<E>[];
    convert  ?: ConvertValueFunction<E>;
    convertType  ?: boolean;
    extends ?: string;
}

export interface PropertyOptional {
    isOptional  ?: boolean;
    default ?: any
}

export type ObjectProperties<E extends BagExtension = {smallBag:{},bag:{}}> = Record<string,Property<E> | AnyOfProperty<E>>;
export type ConvertObjectFunction<E extends BagExtension = {smallBag:{},bag:{}}> = (obj: any, smallBag : (SmallBag & E["smallBag"])) => Promise<any> | any;
export type ConstructObjectFunction<E extends BagExtension = {smallBag:{},bag:{}}> = (self : any, smallBag : (SmallBag & E["smallBag"])) => Promise<void> | void;

export interface ObjectPropertyConfig<E extends BagExtension = {smallBag:{},bag:{}}> extends PropertyOptional
{
    properties : ObjectProperties<E>;
    extends  ?: string;
    prototype  ?: object;
    construct  ?: ConstructObjectFunction<E>;
    convert  ?: ConvertObjectFunction<E>;
    moreInputAllowed ?: boolean;
}

export interface ArrayPropertyConfig<E extends BagExtension = {smallBag:{},bag:{}}> extends ArraySettings<E>
{
    array : Property<E> | AnyOfProperty<E>
}

export type ConvertArrayFunction<E extends BagExtension = {smallBag:{},bag:{}}> = (array: any[], smallBag : (SmallBag & E["smallBag"])) => Promise<any> | any;

export interface ArraySettings<E extends BagExtension = {smallBag:{},bag:{}}> extends PropertyOptional
{
    minLength  ?: number;
    maxLength  ?: number;
    length  ?: number;
    convert  ?: ConvertArrayFunction<E>
}

export interface ArrayShortSyntax<E extends BagExtension = {smallBag:{},bag:{}}> extends Array<Property<E> | AnyOfProperty<E> | ArraySettings<E> | undefined>
{
    0 : Property<E> | AnyOfProperty<E>
    1 ?: ArraySettings<E>
}

