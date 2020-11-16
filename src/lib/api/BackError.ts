/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import BackErrorConstruct   from "../main/definitions/backErrorConstruct";
// noinspection TypeScriptPreferShortImport,ES6PreferShortImport
import {ErrorType}          from "../main/definitions/errorType";
import BackErrorBuilder     from '../main/builder/backErrorBuilder';

type BackErrorInfo = Record<string,any> & {main ?: any};

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
    i?: BackErrorInfo
}

export default class BackError extends Error
{
    private group: string | undefined;
    private description: string;
    private type: string;
    private sendInfo: boolean;
    private info: BackErrorInfo;
    private private: boolean;
    private custom: boolean;

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns a BackError builder
     * to easily create a BackError.
     */
    static build(): BackErrorBuilder {
        return new BackErrorBuilder();
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Creates a BackError (An error that goes back to the client).
     * The error can be thrown and will be returned to the client.
     * You also can collect more BackErrors in a BackErrorBag.
     * And throw them together.
     * @example
     * new BackError('valueNotMatchesWithMinLength',{minLength: 5, inputLength: 3}).throw();
     * @param name
     * Name of the back error.
     * @param info
     * The error info is a dynamic object which contains more detailed information.
     * For example, with an valueNotMatchesWithMinLength error,
     * the info object could include what the length of the input is and
     * what the minimum length is.
     * @param message
     */
    constructor(name: string, info?: object | string, message?: string)
    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Creates a BackError (An error that goes back to the client).
     * The error can be thrown and will be returned to the client.
     * You also can collect more BackErrors in a BackErrorBag.
     * And throw them together.
     * @example
     * new BackError({name: 'valueNotMatchesWithMinLength'},{minLength: 5, inputLength: 3}).throw();
     * @param backErrorConstruct
     * Create a new back error construct.
     * @param info
     * The error info is a dynamic object which contains more detailed information.
     * For example, with an valueNotMatchesWithMinLength error,
     * the info object could include what the length of the input is and
     * what the minimum length is.
     * @param message
     */
    constructor(backErrorConstruct: BackErrorConstruct, info?: object | string, message?: string)
    constructor(value: BackErrorConstruct | string = {}, info?: object | string, message?: string)
    {
        super(message);
        if(typeof value === 'string'){
            value = {name: value} as BackErrorConstruct;
        }
        this.name        = value.name || 'BackError';
        this.group       = value.group;
        this.description = value.description || 'No Description defined in Error';
        this.type        = value.type || ErrorType.NormalError;
        this.sendInfo    = value.sendInfo !== undefined ? value.sendInfo : true;
        this.info        = {};
        this.private     = value.private !== undefined ? value.private : false;
        this.custom      = value.custom !== undefined ? value.custom : true;

        if(info) {
            if (typeof info === 'string') {
                this.info.main = info;
            }
            else {
                this.info = info;
            }
        }
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the complete information as a string.
     */
    toString(): string {
        return `BackError  Name: ${this.name} Group: ${this.group}  Description: ${this.description}  Type: ${this.type}  Info: ${JSON.stringify(this.info)}  Private: ${this.private}  Custom: ${this.custom}`;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @internal
     * @description
     * This method is used internal.
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
     * Returns the name of the BackError.
     * The name is a specific identifier.
     */
    getName(): string {
        return this.name;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Set the name of the BackError.
     * The name is a specific identifier.
     * @param name
     */
    setName(name: string): void {
        this.name = name;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the group of the BackError.
     * Multiple errors can belong to a group.
     * As an example, the validation errors for a type would belong to the group typeErrors.
     * But for each error, the name is unique, for example, valueIsNotTypeString or valueIsNotTypeEmail.
     */
    getGroup(): string | undefined {
        return this.group;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Set the group of the BackError.
     * Multiple errors can belong to a group.
     * As an example, the validation errors for a type would belong to the group typeErrors.
     * But for each error, the name is unique, for example, valueIsNotTypeString or valueIsNotTypeEmail.
     * @param group
     */
    setGroup(group: string | undefined): void {
        this.group = group;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the BackError description.
     */
    getDescription(): string {
        return this.description;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Set the BackError description.
     * @param description
     */
    setDescription(description: string): void {
        this.description = description;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the type of the BackError.
     * The error type is a very abstract topic name.
     * Like validation error, database error, input error.
     * There some default types,
     * you can see them in the BackErrorBuilder.
     */
    getType(): string {
        return this.type;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Set the type of the BackError.
     * The error type is a very abstract topic name.
     * Like validation error, database error, input error.
     * There some default types,
     * you can see them in the BackErrorBuilder.
     * @param type
     */
    setType(type: string): void {
        this.type = type;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns if the BackError is private.
     * A private BackError only sends its type and
     * whether it is from the zation system.
     */
    isPrivate(): boolean {
        return this.private;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Set if the BackError is private.
     * A private BackError only sends its type and
     * whether it is from the zation system.
     * @param privateError
     */
    setPrivate(privateError: boolean): void {
        this.private = privateError;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns if the BackError should send the info.
     * The BackError info is a dynamic object which contains more detailed information.
     * For example, with an valueNotMatchesWithMinLength error,
     * the info object could include what the length of the input is and
     * what the minimum length is.
     */
    isSendInfo(): boolean {
        return this.sendInfo;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Set if the BackError should send the info.
     * The error info is a dynamic object which contains more detailed information.
     * For example, with an valueNotMatchesWithMinLength error,
     * the info object could include what the length of the input is and
     * what the minimum length is.
     * @param sendInfo
     */
    setSendInfo(sendInfo: boolean): void {
        this.sendInfo = sendInfo;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the BackError info.
     * The BackError info is a dynamic object which contains more detailed information.
     * For example, with an valueNotMatchesWithMinLength error,
     * the info object could include what the length of the input is and
     * what the minimum length is.
     */
    getInfo(): Record<string,any> {
        return this.info;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Set the BackError info.
     * The BackError info is a dynamic object which contains more detailed information.
     * For example, with an valueNotMatchesWithMinLength error,
     * the info object could include what the length of the input is and
     * what the minimum length is.
     * @param info
     */
    setInfo(info: Record<string,any>): void {
        this.info = info;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns if the BackError is a custom-defined error.
     */
    isCustom(): boolean {
        return this.custom;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Set if the BackError is custom-defined.
     * @param custom
     */
    setCustom(custom: boolean): void {
        this.custom = custom;
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