/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import BackErrorBag          from '../../api/BackErrorBag';
import {ValidationFunctions} from '../config/definitions/parts/validationFunctions';
// noinspection ES6PreferShortImport
import {ValidationType}      from './validator/validationType';
import {Model}               from './model';

export type DefinitionModel = ValueModel | ObjectModel | ArrayModel | AnyOfModel;

export interface AnyOfModel
{
    /**
     * With the anyOf model, you can wrap different models together.
     * The input needs only to match with one of these models to be valid.
     * You can wrap the models together with an array or object.
     * It only influences the input path of each model.
     * If you are using an array, the name of each model will be
     * used as a key if it is a reusable model, in case of a disposable model,
     * it uses the index as a key.
     * When using an object, the key of each model
     * is the key provided in the object.
     * @example
     * ```
     * // AnyOf with array
     * anyOf: [
     *     $model({type: 'string'},'userName'),
     *     {type: 'email'}
     * ],
     * //Input path to first would be: 'userName'
     * //Input path to second would be: '1'
     *
     * // AnyOf with object
     * anyOf: {
     *   email: email,
     *   userName: userName
     * }
     * //Input path to first would be: 'email'
     * //Input path to second would be: 'userName'
     * ```
     */
    anyOf: Record<string,Model> | Model[]
}

export type ValidateFunction = (value: any, backErrorBag: BackErrorBag, path: string, type: string | undefined) => Promise<void> | void;
export type ConvertValueFunction = (value: any) => Promise<any> | any;

export interface ValueModel extends ValidationFunctions
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
     * The Bag instance can be securely accessed with the variable 'bag'.
     * @example
     * validate: [async (value,backErrorBag,path,type) => {
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
     * The Bag instance can be securely accessed with the variable 'bag'.
     * @example
     * convert: async (value) => {
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

export type ObjectProperties = Record<string,Model>;
export type ConvertObjectFunction = (obj: Record<string,any>) => Promise<any> | any;
export type ConstructObjectFunction = (this: Record<string,any>) => Promise<void> | void;

export interface ObjectModel
{
    /**
     * Specifies the properties of the object.
     * This property is required to define an object model.
     * If you inherit from another object model all properties will also be inherited.
     * But you can override super inherited properties in the sub-model.
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
     * If you inherit from another object model Zation will build a prototype chain.
     * @example
     * prototype: {
     *     getName: function() {
     *         return this.name;
     *     }
     * }
     */
    prototype?: object;
    /**
     * Sets the baseConstruct function of the object model.
     * It behaves like the construct function. The only difference
     * is that in the case of inheritance the baseConstruct functions will not be chained.
     * Means that only the baseConstruct function of the base sub-model
     * is called but not from the other supermodels.
     * Notice also that the baseConstruct is called before the construct functions.
     * The Bag instance can be securely accessed with the variable 'bag'.
     * @example
     * baseConstruct: function() {
     *    this.fullName = `${this.firstName} ${this.lastName}`;
     * }
     */
    baseConstruct?: ConstructObjectFunction;
    /**
     * Set the construct function of the object model,
     * that function can be used as a constructor of the input object.
     * The this-context will be bound to the input object.
     * If you inherit from another object model the constructor functions will be chained.
     * Means that the super construct function is called before the sub construct function.
     * The Bag instance can be securely accessed with the variable 'bag'.
     * @example
     * construct: function() {
     *    this.fullName = `${this.firstName} ${this.lastName}`;
     * }
     */
    construct?: ConstructObjectFunction;
    /**
     * Convert the input object in a specific value;
     * for example, you only want the name value of the object.
     * The converting process will only be invoked if the object model has no validation errors.
     * If you inherit from another object model the convert functions will be chained.
     * Means the convert function of the sub-model will be called with
     * the result of the convert function from the supermodel.
     * The Bag instance can be securely accessed with the variable 'bag'.
     * @example
     * convert: (obj) => {
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

export type ConvertArrayFunction = (array: any[]) => Promise<any> | any;

export interface ArraySettings
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
     * The Bag instance can be securely accessed with the variable 'bag'.
     * @example
     * convert: (array) => {
     *    return array[0];
     * }
     */
    convert?: ConvertArrayFunction
}

export interface ArrayModel extends Array<Model | ArraySettings | undefined>
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