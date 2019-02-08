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

export interface AppConfig<SB = {},B = {}>
{
    authController  ?: string;
    controllers  ?: Record<string,(ControllerClass<SB & B>)>;
    userGroups  ?: UserGroupsConfig;
    controllerDefaults  ?: ControllerConfig<SB,B>;
    values  ?: Record<string,ValuePropertyConfig<SB>>;
    objects  ?: Record<string,ObjectPropertyConfig<SB>>;
    arrays  ?: Record<string,ArrayPropertyConfig<SB> | ArrayShortSyntax<SB>>;
    backgroundTasks  ?: Record<string,BackgroundTask<SB>>,
    bagExtensions ?: BagExtension[];
}

export type Property<SB = {}> = ValuePropertyConfig<SB> | ObjectPropertyConfig<SB> | ArrayPropertyConfig<SB> | ArrayShortSyntax<SB> | string;

export interface AnyOfProperty<SB = {}> extends PropertyOptional
{
    anyOf : Record<string,Property<SB>> | Property<SB>[]
}

export interface BagExtension {
    smallBagCompatible  : boolean;
    methods : Record<string,any>;
}

export type TaskFunction<SB = {}> = (smallBag : (SmallBag & SB)) => Promise<void> | void;

export interface BackgroundTask<SB = {}>
{
    at  ?: number | TimeObj | TimeObj[] | number[];
    every  ?: number | TimeObj | TimeObj[] | number[];
    task  ?: TaskFunction<SB> | TaskFunction<SB>[];
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

export type ControllerInput<SB = {}> = Record<string,Property<SB> | AnyOfProperty<SB>>;
export type BeforeHandleFunction<SB = {},B = {}> = (bag : (Bag & SB & B)) => Promise<void> | void;
export type ControllerAccessFunction<SB = {}> = (smallBag : (SmallBag & SB),token : ZationToken | null) => Promise<boolean> | boolean;

export interface ControllerConfig<SB = {},B = {}>
{
    input  ?: ControllerInput<SB>;
    beforeHandle  ?: BeforeHandleFunction<SB,B>[] | BeforeHandleFunction<SB,B>;
    systemController  ?: boolean;
    wsAccess  ?: boolean;
    httpAccess  ?: boolean;
    httpGetAllowed  ?: boolean;
    httpPostAllowed  ?: boolean;
    inputValidation  ?: boolean;
    inputAllAllow  ?: boolean;
    access  ?: string | number | (string | number)[] | ControllerAccessFunction<SB>;
    notAccess  ?: string | number | (string | number)[] | ControllerAccessFunction<SB>;
    versionAccess  ?: string | Record<string,number | number[]>
}

export type ValidatorFunction<SB = {}> = (value : any,taskErrorBag : TaskErrorBag,inputPath : string,smallBag : (SmallBag & SB),type ?: string) => Promise<void> | void;
export type ConvertValueFunction<SB = {}> = (value : any, smallBag : (SmallBag & SB)) => Promise<any> | any;
export type GetDateFunction<SB = {}> = (smallBag : (SmallBag & SB)) => Promise<Date> | Date;

export interface ValuePropertyConfig<SB = {}> extends PropertyOptional
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
    before ?: Date | GetDateFunction<SB>;
    after ?: Date | GetDateFunction<SB>;
    validate  ?: ValidatorFunction<SB> | ValidatorFunction<SB>[];
    convert  ?: ConvertValueFunction<SB>;
    convertType  ?: boolean;
    extends ?: string;
}

export interface PropertyOptional {
    isOptional  ?: boolean;
    default ?: any
}

export type ObjectProperties<SB = {}> = Record<string,Property<SB> | AnyOfProperty<SB>>;
export type ConvertObjectFunction<SB = {}> = (obj: any, smallBag : (SmallBag & SB)) => Promise<any> | any;
export type ConstructObjectFunction<SB = {}> = (self : any, smallBag : (SmallBag & SB)) => Promise<void> | void;

export interface ObjectPropertyConfig<SB = {}> extends PropertyOptional
{
    properties : ObjectProperties<SB>;
    extends  ?: string;
    prototype  ?: object;
    construct  ?: ConstructObjectFunction<SB>;
    convert  ?: ConvertObjectFunction<SB>;
    moreInputAllowed ?: boolean;
}

export interface ArrayPropertyConfig<SB = {}> extends ArraySettings<SB>
{
    array : Property<SB> | AnyOfProperty<SB>
}

export type ConvertArrayFunction<SB = {}> = (array: any[], smallBag : (SmallBag & SB)) => Promise<any> | any;

export interface ArraySettings<SB = {}> extends PropertyOptional
{
    minLength  ?: number;
    maxLength  ?: number;
    length  ?: number;
    convert  ?: ConvertArrayFunction<SB>
}

export interface ArrayShortSyntax<SB = {}> extends Array<Property<SB> | AnyOfProperty<SB> | ArraySettings<SB> | undefined>
{
    0 : Property<SB> | AnyOfProperty<SB>
    1 ?: ArraySettings<SB>
}

