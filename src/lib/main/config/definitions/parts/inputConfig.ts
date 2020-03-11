/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {AnyClass, AnyInputConfigTranslatable, AnyModelConfigTranslatable} from './configComponents';
import BackErrorBag from '../../../../api/BackErrorBag';
import Bag          from '../../../../api/Bag';
// noinspection TypeScriptPreferShortImport
import {ValidationType}      from '../../../constants/validationType.js';
import {ValidationFunctions} from './validationFunctions';
import {modelDefaultSymbol, modelOptionalSymbol} from '../../../constants/model';

export type ModelConfig = ValueModel | ObjectModel | ArrayModel | ArrayModelShortSyntax | AnyOfModel;
export type Model = ModelConfig | AnyClass | AnyModelConfigTranslatable;

export interface AnyOfModel extends ModelOptional
{
    /**
     * With the anyOf model, you can wrap different models together.
     * The input needs only to match with one of these models to be valid.
     * @example
     * ```
     * //todo user the name smybols of models?
     * // any of with array
     * anyOf: [email,userName],
     * // any of with object (Will help to get a better input path)
     * anyOf: {
     *   email: email,
     *   userName: userName
     * }
     * ```
     */
    anyOf: Record<string,Model> | Model[]
}

export interface InputConfig {
    /**
     * This property defines the input.
     * It will be used to validate and format the data that flows into the component.
     * It can specify an input that is based on parameters
     * so that you can map models to a parameter name.
     * Or it can specify a single model as an input.
     * - Parameter-based input.
     * To define a parameter based input, use an object as a value.
     * The keys of the object are the parameter names, and the values represent the models.
     * Notice that it is strongly recommended to only use string keys (with letters) in the object literal,
     * to keep the same order in a for-in loop.
     * That is important for Zation when you send your data as an array.
     * A modern way to create a parameter based input would be to
     * create a class and use the ParamInput decorator.
     * - Single model input
     * To set a single model input, you have multiple options.
     * When you have a reusable model, means it was created with the $model function or
     * the $ObjectModel decorator, you can directly refer to this model.
     * In case you have a disposable model,
     * you can use the $single function or wrap the model with square brackets.
     * @example
     * //Parameter-based input
     * input: {
     *     name: {
     *         type: 'string'
     *     },
     *     age: {
     *         type: 'int',
     *         minValue: 14
     *     }
     * }
     * //or
     * class Parameter {
     *
     *  @Model({type: 'string'})
     *  name: string;
     *
     *  @Model({type: 'int', minValue: 14})
     *  age: number;
     *
     * }
     * input: Parameter
     * //Client can send  ->
     * {name: 'Luca', age: 20}
     * //or
     * ['Luca',20]
     *
     * //-Single model input-
     * input: $model({
     *     type: 'string',
     *     minLength: 4
     * })
     * //or
     * input: $single({
     *     type: 'string',
     *     minLength: 4
     * })
     * //or
     * input: [{
     *     type: 'string',
     *     minLength: 4
     * }]
     * //Client can send ->
     * "ThisIsAnyString"
     */
    input?: Input;
    /**
     * Specifies if any input is allowed
     * that means the input validation and converter are disabled.
     * @default false.
     */
    allowAnyInput?: boolean;
}

export type Input = ParamInput | SingleModelInput | AnyClass | AnyInputConfigTranslatable;

export interface SingleModelInput {
    [0]: Model;
}

export interface ParamInput {
    [key: string]: Model;
}

export type ValidateFunction = (value: any, backErrorBag: BackErrorBag, inputPath: string, bag: Bag, type: string | undefined) => Promise<void> | void;
export type ConvertValueFunction = (value: any, bag: Bag) => Promise<any> | any;
export type GetDateFunction = (bag: Bag) => Promise<Date> | Date;

export interface ValueModel extends ValidationFunctions, ModelOptional
{
    /**
     * Set the allowed type of the value model.
     * Notice that you also can set an array of types, then the first valid type will be taken.
     * Look in the examples to see what possibilities you have.
     * @default all
     * @example
     * 'all'
     * 'object'
     * 'array'
     * 'string'
     * 'char'
     * 'null'
     * 'int'
     * 'float'
     * 'number'
     * 'date'
     * 'email'
     * 'boolean'
     * 'sha512'
     * 'sha256'
     * 'sha384'
     * 'sha1'
     * 'md5'
     * 'hexColor'
     * 'hexadecimal'
     * 'ip5'
     * 'ip6'
     * 'isbn10'
     * 'isbn13'
     * 'json'
     * 'url'
     * 'mimeType'
     * 'macAddress'
     * 'mobileNumber'
     * 'uuid3'
     * 'uuid4'
     * 'uuid5'
     * 'base64'
     * 'ascii'
     * 'userId'
     * 'mongoId'
     * 'latLong'
     */
    type?: ValidationType | (ValidationType)[];
    /**
     * Specify if the value model should use strict type mode.
     * In this mode, types are checked strictly. For example, in strict mode,
     * there are only real numbers allowed (2,34,13,54),
     * but in not strict mode also strings that contain numbers are allowed ('34', '200').
     * The non-strict mode will also automatically convert (if convertType is set to true) the string numbers to real numbers.
     * The same can happen for booleans zation will interpret booleans in non-strict mode
     * e.g., a 1 or '1' is interpreted as a true boolean.
     * @default true
     */
    strictType?: boolean;
    /**
     * Validate the value model with your validation checks.
     * It can be one Validation check function or more functions in an array.
     * This is useful to do advance checks; for example,
     * you want to check if the email is already registered in the database.
     * @example
     * validate: [async (value,backErrorBag,inputPath,bag,type) => {
     *   if(....){
     *       //error
     *       bagErrorBag.addBackError(bag.newBackError({
     *          reason: ...
     *      }));
     *   }
     * }]
     */
    validate?: ValidateFunction | ValidateFunction[];
    /**
     * Convert the input value in a specific value; for example,
     * you want to add something to the end of a string.
     * The converting process will only be invoked if the value model has no validation errors.
     * @example
     * convert: async (value,bag) => {
     *     return value+'end';
     * }
     */
    convert?: ConvertValueFunction;
    /**
     * Set if zation should convert the type correctly.
     * That for example, can be used to convert non-strict type value to the correct type
     * or convert a Date type to real date instance.
     * @default true
     */
    convertType?: boolean;
}

export interface ModelOptional {
    /**
     * @internal
     * Specifies if this model is optional,
     * so the input doesn't need to provide the data for it.
     * @default false
     */
    [modelOptionalSymbol]?: boolean;
    /**
     * @internal
     * Define a default value that will be used
     * if the input had not provided the value.
     * Only works when the model is optional (with the $optional function).
     */
    [modelDefaultSymbol]?: any
}

export type ObjectProperties = Record<string,Model>;
export type ConvertObjectFunction = (obj: Record<string,any>, bag: Bag) => Promise<any> | any;
export type ConstructObjectFunction = (this: Record<string,any>, bag: Bag) => Promise<void> | void;

export interface ObjectModel extends ModelOptional
{
    /**
     * Specifies the properties of the object.
     * This property is required to define an object model.
     * @example
     * properties: {
     *     name: {},
     *     age: {},
     *     email: {}
     * }
     */
    properties: ObjectProperties;
    /**
     * Set the prototype of the input object to a specific prototype.
     * @example
     * prototype: {
     *     getName: function() {
     *         return this.name;
     *     }
     * }
     */
    prototype?: object;
    /**
     * Set the construct function of the object model,
     * that function can be as a constructor on the input object.
     * It will be called with the input object as this and the small bag
     * that allows you to add properties to the object.
     * @example
     * construct: function(bag) {
     *    this.fullName = `${this.firstName} ${this.lastName}`;
     * }
     */
    construct?: ConstructObjectFunction;
    /**
     * Convert the input object in a specific value;
     * for example, you only want the name value of the object.
     * The converting process will only be invoked if the object model has no validation errors.
     * @example
     * convert: (obj,bag) => {
     *    return obj['name'];
     * }
     */
    convert?: ConvertObjectFunction;
    /**
     * Set if the input can have more properties as there defined in the model.
     * @default false
     */
    morePropsAllowed?: boolean;
}

export interface ArrayModel extends ArraySettings
{
    /**
     * Define the model of the items that the array can contain.
     * This property is required to define an array model.
     * @example
     * array: 'name'
     */
    array: Model
}

export type ConvertArrayFunction = (array: any[], bag: Bag) => Promise<any> | any;

export interface ArraySettings extends ModelOptional
{
    /**
     * MinLength defines the minimum length of the input array.
     * @example
     * minLength: 3
     */
    minLength?: number;
    /**
     * MaxLength defines the maximum length of the input array.
     * @example
     * maxLength: 10
     */
    maxLength?: number;
    /**
     * Length defines the exact length of the input array.
     * @example
     * length: 5
     */
    length?: number;
    /**
     * Convert the input array in a specific value; for example,
     * you want only to have the first item.
     * The converting process will only be invoked if the array model has no validation errors.
     * @example
     * convert: (array,bag) => {
     *    return array[0];
     * }
     */
    convert?: ConvertArrayFunction
}

export interface ArrayModelShortSyntax extends Array<Model | ArraySettings | undefined>
{
    /**
     * Specifies the model of the items that the array can contain.
     */
    0: Model
    /**
     * Define settings of the array model.
     * @default {}
     */
    1?: ArraySettings
}