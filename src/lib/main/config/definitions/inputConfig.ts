/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {AnyClass, AnyInputConfigTranslatable, AnyModelConfigTranslatable} from "./configComponents";
import BackErrorBag                                                       from "../../../api/BackErrorBag";
import Bag                                                                from "../../../api/Bag";
// noinspection TypeScriptPreferShortImport
import {ValidationType}                                                   from "../../constants/validationType.js";
import {FormatLetters}                                                    from "../../constants/validation";

export type Model =
    ValueModelConfig | ObjectModelConfig | ArrayModelConfig | ArrayModelShortSyntax | string | AnyOfModelConfig | AnyClass | AnyModelConfigTranslatable;

export interface AnyOfModelConfig extends ModelOptional
{
    /**
     * With the anyOf modifier, you can define different properties.
     * The input needs only to match with one of the models to be valid.
     * @example
     * ```
     * // any of with array
     * anyOf: ['v.email','v.userName'],
     * // any of with object (Will help to get a better input path)
     * anyOf: {
     *   email: 'v.email',
     *   userName: 'v.userName'
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
     * To define a parameter based input use an object as a value.
     * The keys of the object are the parameter names,
     * and the value defines an anonymous model or link to a declared model.
     * Notice that it is strongly recommended to only use string keys (with letters) in the object literal,
     * to keep the same order in a for in loop.
     * That is important for zation when you send your data as an array.
     * - Single model input
     * To set a single model input, you have to use an array as a value with exactly one item.
     * This item is an anonymous model or link to a declared model.
     * Notice that you also can use the single method on the Config class
     * for making it more clear that this is a single model input.
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
     * //Client can send  ->
     * {name: 'Luca', age: 20}
     * //or
     * ['Luca',20]
     *
     * //-Single model input-
     * input: [{
     *     type: 'string',
     *     minLength: 4
     * }]
     * //or
     * input: Config.single({
     *     type: 'string',
     *     minLength: 4
     * })
     * //Client can send ->
     * "ThisIsAnyString"
     */
    input?: Input;
    /**
     * Specifies if any input is allowed
     * that means the input validation and converter are disabled.
     * @default false.
     */
    allowAnyInput ?: boolean;
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

export interface ValueModelConfig extends ModelOptional
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
    type ?: ValidationType | string | (ValidationType | string)[];
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
    strictType ?: boolean;
    /**
     * With this property, you can define that the input should exactly match
     * with at least one of the array items.
     * @example
     * enum: ['Red','Blue','Black']
     */
    enum ?: any [];
    /**
     * With this property, you can define that the input should exactly match
     * with at least one of the array items.
     * The difference between the property enum is that in error case,
     * all options of the enum are not sent to the client.
     * @example
     * enum: ['CODE-1','CODE-2']
     */
    privateEnum ?: any [];
    /**
     * MinLength specifies the minimum length of a string.
     * @example
     * minLength: 20
     */
    minLength ?: number;
    /**
     * MaxLength specifies the maximum length of a string.
     * @example
     * maxLength: 40
     */
    maxLength ?: number;
    /**
     * Length specifies the exact length of a string.
     * @example
     * length: 10
     */
    length ?: number;
    /**
     * With contains, you can describe that a string should contain a string.
     * You also can define more strings that should be included with an array.
     * @example
     * contains: 'name'
     * contains: ['code','Code']
     */
    contains ?: string | string[];
    /**
     * With equals, you can describe that the input should be exactly equal.
     * @example
     * equals: 'something'
     */
    equals ?: any;
    /**
     * With minValue, you can define the minimum value of a number.
     * @example
     * minValue: 2
     */
    minValue ?: number;
    /**
     * With maxValue, you can define the maximum value of a number.
     * @example
     * maxValue: 2
     */
    maxValue ?: number;
    /**
     * This property can be used to define regular expressions.
     * You can define one regular expression or multiple by structure them in keys.
     * Later on the client side, you can find out which regular expression was failed with the key.
     * @example
     * regex: '([A-Za-z]{1,5})'
     * regex: /\w+/
     * regex: {
     *     'length': 'REGEX-1',
     *     'pattern': 'REGEX-2'
     * }
     */
    regex ?: string | RegExp | Record<string,RegExp | string>;
    /**
     * With endWith, you can describe with what string the input string should end.
     * @example
     * endWith: 'a'
     */
    endsWith ?: string;
    /**
     * With startWith, you can describe with what string the input string should start.
     * @example
     * startWith: 'Hello'
     */
    startsWith ?: string;
    /**
     * With letters, it is possible to define if the string letters
     * should be all in uppercase or lowercase.
     * @example
     * letters: 'lowercase'
     * letters: 'uppercase'
     */
    letters ?: FormatLetters.LOWER_CASE | FormatLetters.UPPER_CASE | string;
    /**
     * CharClass defines a regular expression char class to check the input string.
     * @example
     * charClass: 'a-zA-Z._0-9'
     * charClass: 'a-z'
     */
    charClass?: string;
    /**
     * MaxByteSize defines the maximum byte size of a string or base64 input.
     * @example
     * maxByteSize: 50
     */
    maxByteSize?: number;
    /**
     * MinByteSize defines the minimum byte size of a string or base64 input.
     * @example
     * minByteSize: 20
     */
    minByteSize?: number;
    /**
     * Validate if a base64 input is from a specific mime type.
     * You also can define more valid mime types in an array.
     * The value null means that unknown mime type is allowed
     * that can happen if the base64 string did not specify a mime type.
     * @example
     * mimeType: 'image'
     */
    mimeType?: string | null | (string | null)[];
    /**
     * Validate if a base64 input is from a specific sub mime type.
     * You also can define more valid sub mime types in an array.
     * The value null means that unknown sub mime type is allowed
     * that can happen if the base64 string did not specify a sub mime type.
     * @example
     * mimeSubType: ['jpeg','png','jpg']
     */
    mimeSubType?: string | null | (string | null)[];
    /**
     * Validate if a date is before another date.
     * You can provide the other date as a Date object or as a function that returns a date object.
     * @example
     * before: () => {
     *      return new Date();
     * }
     * before: someDate
     */
    before?: Date | GetDateFunction;
    /**
     * Validate if a date is after another date.
     * You can provide the other date as a Date object or as a function that returns a date object.
     * @example
     * after: () => {
     *      return new Date();
     * }
     * after: someDate
     */
    after?: Date | GetDateFunction;
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
    validate ?: ValidateFunction | ValidateFunction[];
    /**
     * Convert the input value in a specific value; for example,
     * you want to add something to the end of a string.
     * The converting process will only be invoked if the value model has no validation errors.
     * @example
     * convert: async (value,bag) => {
     *     return value+'end';
     * }
     */
    convert ?: ConvertValueFunction;
    /**
     * Set if zation should convert the type correctly.
     * That for example, can be used to convert non-strict type value to the correct type
     * or convert a Date type to real date instance.
     * @default true
     */
    convertType ?: boolean;
    /**
     * This property will allow you to extend from another value model.
     * Then this value model will get all properties that
     * it doesn't define by himself from the extended model.
     * @example
     * extends: 'personName'
     */
    extends?: string | ValueModelConfig | AnyModelConfigTranslatable | AnyClass;
}

export interface ModelOptional {
    /**
     * Specifies if this model is optional,
     * so the input doesn't need to provide the data for it.
     * @default false
     */
    isOptional ?: boolean;
    /**
     * Define a default value that will be used
     * if the input had not provided the value.
     */
    default?: any
}

export type ObjectProperties = Record<string,Model>;
export type ConvertObjectFunction = (obj: Record<string,any>, bag: Bag) => Promise<any> | any;
export type ConstructObjectFunction = (this: Record<string,any>, bag: Bag) => Promise<void> | void;

export interface ObjectModelConfig extends ModelOptional
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
     * Inheritance from another object model.
     * Then this object model will get all properties that it doesn't define by himself
     * from the extended model.
     * It also affects the prototype because the current object model prototype
     * will get the super prototype as a prototype.
     * Also, the super constructor will be called before the constructor of this object model.
     * The convert function will also be called with the result of the super convert function.
     * @example
     * extends: 'person'
     */
    extends ?: string | ObjectModelConfig | AnyModelConfigTranslatable | AnyClass;
    /**
     * Set the prototype of the input object to a specific prototype.
     * @example
     * prototype: {
     *     getName: function() {
     *         return this.name;
     *     }
     * }
     */
    prototype ?: object;
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
    construct ?: ConstructObjectFunction;
    /**
     * Convert the input object in a specific value;
     * for example, you only want the name value of the object.
     * The converting process will only be invoked if the object model has no validation errors.
     * @example
     * convert: (obj,bag) => {
     *    return obj['name'];
     * }
     */
    convert ?: ConvertObjectFunction;
    /**
     * Set if the input can have more properties as there defined in the model.
     * @default false
     */
    morePropsAllowed?: boolean;
}

export interface ArrayModelConfig extends ArraySettings
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
    minLength ?: number;
    /**
     * MaxLength defines the maximum length of the input array.
     * @example
     * maxLength: 10
     */
    maxLength ?: number;
    /**
     * Length defines the exact length of the input array.
     * @example
     * length: 5
     */
    length ?: number;
    /**
     * Convert the input array in a specific value; for example,
     * you want only to have the first item.
     * The converting process will only be invoked if the array model has no validation errors.
     * @example
     * convert: (array,bag) => {
     *    return array[0];
     * }
     */
    convert ?: ConvertArrayFunction
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