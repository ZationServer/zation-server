/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import BackErrorConstruct   from "../main/definitions/backErrorConstruct";
// noinspection TypeScriptPreferShortImport,ES6PreferShortImport
import {ErrorType}          from "../main/definitions/errorType";
import {jsonStringify}      from '../main/utils/jsonConverter';

export interface DryBackError {
    /**
     * Name
     */
    n: string,
    /**
     * Group
     */
    g?: string,
    /**
     * Type
     */
    t: string
    /**
     * Description
     */
    d?: string,
    /**
     * Custom
     */
    c: 0 | 1,
    /**
     * Info
     */
    i?: Record<string,any>
}

export default class BackError extends Error
{
    /**
     * @description
     * The name of the BackError.
     * @default BackError
     */
    public name: string;
    /**
     * @description
     * The group of the BackError.
     * Multiple errors can belong to a group.
     * @default undefined
     */
    public group: string | undefined;
    /**
     * @description
     * The description of the BackError.
     * Contains a more detailed message about the error.
     * It will only be sent when it is activated.
     * @default undefined
     */
    public readonly description: string | undefined;
    /**
     * @description
     * The type of the BackError.
     * The error type is a very abstract topic name.
     * Like validation error, database error, input error.
     * There some default types,
     * you can see them in the BackErrorBuilder.
     * @default ErrorType.NormalError
     */
    public type: string;
    /**
     * @description
     * Indicates if the info of the BackError should also be transmitted to the client.
     * The BackError info is a dynamic object which contains more detailed information.
     * For example, with an valueNotMatchesWithMinLength error,
     * the info object could include what the length of the input is and
     * what the minimum length is.
     * @default true
     */
    public sendInfo: boolean;
    /**
     * @description
     * The BackError info.
     * The BackError info is a dynamic object which contains more detailed information.
     * For example, with an valueNotMatchesWithMinLength error,
     * the info object could include what the length of the input is and
     * what the minimum length is.
     * @default {}
     */
    public info: Record<string,any>;
    /**
     * @description
     * Indicates if the BackError is private.
     * A private BackError only sends its type and
     * whether it is a custom-defined error.
     * @default false
     */
    public private: boolean;
    /**
     * @description
     * Indicates if the BackError is a custom-defined error.
     * @default true
     */
    public custom: boolean;

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Creates a BackError (An error that goes back to the client).
     * The error can be thrown and will be returned to the client.
     * You also can collect more BackErrors in a BackErrorBag and throw them together.
     * @example
     * new BackError('valueNotMatchesWithMinLength',{minLength: 5, inputLength: 3}).throw();
     * @param name
     * Name of the BackError
     * @param info
     * The BackError info is a dynamic object which contains more detailed information.
     * For example, with an valueNotMatchesWithMinLength error,
     * the info object could include what the length of the input is and
     * what the minimum length is.
     */
    constructor(name: string, info?: Record<string,any>)
    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Creates a BackError (An error that goes back to the client).
     * The error can be thrown and will be returned to the client.
     * You also can collect more BackErrors in a BackErrorBag and throw them together.
     * @example
     * new BackError({name: 'valueNotMatchesWithMinLength'},{minLength: 5, inputLength: 3}).throw();
     * @param backErrorConstruct
     * The construct that will be used to create the BackError.
     * @param info
     * The BackError info is a dynamic object which contains more detailed information.
     * For example, with an valueNotMatchesWithMinLength error,
     * the info object could include what the length of the input is and
     * what the minimum length is.
     */
    constructor(backErrorConstruct: BackErrorConstruct, info?: Record<string,any>)
    constructor(value: BackErrorConstruct | string, info?: Record<string,any>) {
        super((typeof value === 'object') ? value.description : undefined);

        if(typeof value === 'string') value = {name: value} as BackErrorConstruct;
        this.name = value.name || 'BackError';
        this.group = value.group;
        this.description = value.description;
        this.type = value.type != null ? value.type : ErrorType.NormalError;
        this.sendInfo = value.sendInfo != null ? value.sendInfo : true;
        this.info = info || {};
        this.private = value.private != null ? value.private : false;
        this.custom = value.custom != null ? value.custom : true;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the complete information as a string.
     */
    toString(): string {
        return `BackError -> Name: "${this.name}" Group: "${this.group}" Description: "${this.description}" Type: "${this.type}" Info: "${jsonStringify(this.info)}" Private: "${this.private}" Custom: "${this.custom}"`;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @internal
     * @description
     * This method is used internally.
     * @param withDesc
     */
    _dehydrate(withDesc: boolean = false): DryBackError {
        if(this.private){
            return {
                n: 'BackError',
                t: this.type,
                c: this.custom ? 1 : 0
            }
        }
        else{
            return {
                n: this.name,
                g: this.group,
                t: this.type,
                c: this.custom ? 1 : 0,
                i: this.sendInfo ? this.info: {},
                ...(withDesc ? {d: this.description}: {})
            };
        }
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Throws this BackError.
     * Alternative for throwing the BackError directly in a controller method.
     */
    throw(): void {
       throw this;
    }
}