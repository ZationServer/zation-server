/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */
import Const           = require('./../constants/constWrapper');
import Bag             = require("../../api/Bag");
import SmallBag        = require("../../api/SmallBag");
import ValidationTypes = require("../constants/validationTypes");

const a: AppConfig =
    {
        backgroundTasks :
            {

                a :
                    {

                        task : (sb) =>
                        {
                        }
                    }
            }



    };

export interface AppConfig
{
    authController ?: string;
    controller ?: Record<string,ControllerConfig>;
    userGroups ?: UserGroupConfig;
    versionControl ?: Record<string,number>;
    controllerDefault ?: ControllerConfig;
    objects ?: Record<string,ObjectConfig>;
    validationGroups ?: Record<string,InputValidationConfig>;
    backgroundTasks ?: Record<string,BackgroundTask>;
}

export type TaskFunction = (smallBag : SmallBag) => Promise<void>;

export interface BackgroundTask
{
    at ?: number | TimeObj | TimeObj[] | number[];
    every ?: number | TimeObj | TimeObj[] | number[];
    task ?: TaskFunction | TaskFunction[];
}

export interface TimeObj
{
    hour ?: number;
    minute ?: number;
    second ?: number;
    millisecond ?: number;
}

export interface UserGroupConfig
{
    default ?: string;
    auth ?: Record<string,object>;
}

export interface ControllerConfig
{
    input ?: Record<string,InputConfig | ObjectConfig | ArrayConfig | string | ArrayShortSyntax>;
    beforeHandle ?: BeforeHandleFunction[] | BeforeHandleFunction;
    systemController ?: boolean;
    wsAccess ?: boolean;
    httpAccess ?: boolean;
    inputValidation ?: boolean;
    inputAllAllow ?: boolean;
    extraSecure ?: boolean;
    path ?: string;
    name ?: string;
    access ?: string | number | (string | number)[] | ControllerAccessFunction;
    notAccess ?: string | number | (string | number)[] | ControllerAccessFunction;
}

export type BeforeHandleFunction = (bag : Bag) => Promise<void>;
export type ControllerAccessFunction = (smallBag : SmallBag,token : object) => Promise<void>;

export interface InputValidationConfig
{
    type ?: ValidationTypes;
    enum ?: any [];
    privateEnum ?: any [];
    minLength ?: number;
    maxLength ?: number;
    length ?: number;
    contains ?: string;
    equals ?: string | number | object;
    biggerThan ?: number;
    lesserThan ?: number;
    regex ?: string;
    endsWith ?: string;
    startsWith ?: string;
    isLetters ?: string;
}

export interface InputConfig extends InputValidationConfig
{
    [Const.App.INPUT.IS_OPTIONAL] ?: boolean;
    [Const.App.INPUT.VALIDATION_GROUP] ?: string;
}

export interface ObjectConfig
{
    [Const.App.OBJECTS.PROPERTIES] :
        Record<string,InputConfig | ObjectConfig | ArrayConfig | string | ArrayShortSyntax>;

    [Const.App.OBJECTS.COMPILE_AS] ?: CompileAsFunction;
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

export type CompileAsFunction = (obj: object,smallBag : SmallBag) => any;
