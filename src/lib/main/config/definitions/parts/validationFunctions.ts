/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {FormatLetters}   from '../../../definitions/validation';
import {GetDateFunction} from './inputConfig';

export interface ValidationFunctions {
    /**
     * With this property, you can define that the input should exactly match
     * with at least one of the array items.
     * @example
     * in: ['Red','Blue','Black']
     */
    in?: any [];
    /**
     * With this property, you can define that the input should exactly match
     * with at least one of the array items.
     * The difference between the property: 'in' is that in case
     * of error case the available items are not sent to the client.
     * @example
     * privateIn: ['CODE-1','CODE-2']
     */
    privateIn?: any [];
    /**
     * MinLength specifies the minimum length of a string.
     * @example
     * minLength: 20
     */
    minLength?: number;
    /**
     * MaxLength specifies the maximum length of a string.
     * @example
     * maxLength: 40
     */
    maxLength?: number;
    /**
     * Length specifies the exact length of a string.
     * @example
     * length: 10
     */
    length?: number;
    /**
     * With contains, you can describe that a string should contain a string.
     * You also can define more strings that should be included with an array.
     * @example
     * contains: 'name'
     * contains: ['code','Code']
     */
    contains?: string | string[];
    /**
     * With equals, you can describe that the input should be exactly equal.
     * @example
     * equals: 'something'
     */
    equals?: any;
    /**
     * With minValue, you can define the minimum value of a number.
     * @example
     * minValue: 2
     */
    minValue?: number;
    /**
     * With maxValue, you can define the maximum value of a number.
     * @example
     * maxValue: 2
     */
    maxValue?: number;
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
    regex?: string | RegExp | Record<string,RegExp | string>;
    /**
     * With endWith, you can describe with what string the input string should end.
     * @example
     * endWith: 'a'
     */
    endsWith?: string;
    /**
     * With startWith, you can describe with what string the input string should start.
     * @example
     * startWith: 'Hello'
     */
    startsWith?: string;
    /**
     * With letters, it is possible to define if the string letters
     * should be all in uppercase or lowercase.
     * @example
     * letters: 'lowercase'
     * letters: 'uppercase'
     */
    letters?: FormatLetters.LowerCase | FormatLetters.UpperCase | string;
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
}