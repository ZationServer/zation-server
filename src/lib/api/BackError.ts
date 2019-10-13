/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import BackErrorConstruct   from "../main/constants/backErrorConstruct";
// noinspection TypeScriptPreferShortImport
import {ErrorType}          from "../main/constants/errorType";
import {BackErrorInfo}      from "../main/constants/internal";
import {ResponseError}      from "../main/controller/request/controllerDefinitions";

export default class BackError extends Error
{
    private group : string | undefined;
    private description : string;
    private type : string;
    private sendInfo : boolean;
    private info : object;
    private privateE : boolean;
    private fromZationSystem : boolean;

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Creates a BackError (An error that goes back to the client).
     * The error can be thrown and will be returned to the client.
     * You also can collect more BackErrors in a BackErrorBag.
     * And throw them together.
     * @example
     * new BackError({name : 'inputNotMatchWithMinLength'},{minLength : 5, inputLength : 3}).throw();
     * @param backErrorConstruct
     * Create a new back error construct.
     * @param info
     * The error info is a dynamic object which contains more detailed information.
     * For example, with an inputNotMatchWithMinLength error,
     * the info object could include what the length of the input is and
     * what the minimum length is.
     */
    constructor(backErrorConstruct : BackErrorConstruct = {}, info ?: object | string)
    {
        super();
        //defaultValues
        this.name        = backErrorConstruct.name || 'BackError';
        this.group       = backErrorConstruct.group;
        this.description = backErrorConstruct.description || 'No Description define in Error';
        this.type        = backErrorConstruct.type || ErrorType.NORMAL_ERROR;
        this.sendInfo    = backErrorConstruct.sendInfo || true;
        this.info        = {};
        this.privateE    = backErrorConstruct.private || false;
        this.fromZationSystem = backErrorConstruct.fromZationSystem || false;

        if(info) {
            if (typeof info === 'string') {
                this.info[BackErrorInfo.MAIN] = info;
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
    toString() : string
    {
        return `BackError  Name: ${this.name} Group: ${this.group}  Description: ${this.description}  Type: ${this.type}  Info: ${JSON.stringify(this.info)}  isPrivate:${this.privateE}  isFromZationSystem:${this.fromZationSystem}`;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * This method is used internal!
     * @param withDesc
     */
    _toResponseError(withDesc : boolean = false) : ResponseError
    {
        if(this.privateE){
            return {
                n : 'BackError',
                t : this.type,
                zs : this.fromZationSystem
            }
        }
        else{
            return {
                n : this.name,
                g : this.group,
                t : this.type,
                zs : this.fromZationSystem,
                i : this.sendInfo ? this.info : {},
                ...(withDesc ? {d : this.description} : {})
            };
        }
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the name of the BackError.
     * The name is a specific identifier.
     */
    getName() : string
    {
        return this.name;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Set the name of the BackError.
     * The name is a specific identifier.
     * @param name
     */
    setName(name : string) : void
    {
        this.name = name;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the group of the BackError.
     * Multiple errors can belong to a group.
     * As an example, the validation errors for a type would belong to the group typeErrors.
     * But for each error, the name is unique, for example, inputIsNotTypeString or inputIsNotTypeEmail.
     */
    getGroup() : string | undefined
    {
        return this.group;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Set the group of the BackError.
     * Multiple errors can belong to a group.
     * As an example, the validation errors for a type would belong to the group typeErrors.
     * But for each error, the name is unique, for example, inputIsNotTypeString or inputIsNotTypeEmail.
     * @param group
     */
    setGroup(group : string | undefined) : void
    {
        this.group = group;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the BackError description.
     */
    getDescription() : string
    {
        return this.description;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Set the BackError description.
     * @param description
     */
    setDescription(description : string) : void
    {
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
    getType() : string
    {
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
    setType(type : string) : void
    {
        this.type = type;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns if the BackError is private.
     * A private BackError only sends its type and
     * whether it is from the zation system.
     */
    isPrivate() : boolean
    {
        return this.privateE;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Set if the BackError is private.
     * A private BackError only sends its type and
     * whether it is from the zation system.
     * @param privateError
     */
    setPrivate(privateError : boolean) : void
    {
        this.privateE = privateError;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns if the BackError should send the info.
     * The BackError info is a dynamic object which contains more detailed information.
     * For example, with an inputNotMatchWithMinLength error,
     * the info object could include what the length of the input is and
     * what the minimum length is.
     */
    isSendInfo() : boolean
    {
        return this.sendInfo;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Set if the BackError should send the info.
     * The error info is a dynamic object which contains more detailed information.
     * For example, with an inputNotMatchWithMinLength error,
     * the info object could include what the length of the input is and
     * what the minimum length is.
     * @param sendInfo
     */
    setSendInfo(sendInfo : boolean) : void
    {
        this.sendInfo = sendInfo;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the BackError info.
     * The BackError info is a dynamic object which contains more detailed information.
     * For example, with an inputNotMatchWithMinLength error,
     * the info object could include what the length of the input is and
     * what the minimum length is.
     */
    getInfo() : Record<string,any>
    {
        return this.info;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Set the BackError info.
     * The BackError info is a dynamic object which contains more detailed information.
     * For example, with an inputNotMatchWithMinLength error,
     * the info object could include what the length of the input is and
     * what the minimum length is.
     * @param info
     */
    setInfo(info : Record<string,any>) : void
    {
        this.info = info;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns if the BackError is from zation system.
     * This indicates if this BackError is from the main zation system.
     * This is used in the system internal.
     */
    isFromZationSystem() : boolean
    {
        return this.fromZationSystem;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Set if the BackError is from zation system.
     * This indicates if this BackError is from the main zation system.
     * This is used in the system internal.
     * @param fromZationSystem
     */
    setFromZationSystem(fromZationSystem : boolean) : void
    {
        this.fromZationSystem = fromZationSystem;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Throws this BackError.
     * Alternative for throwing the BackError directly in a controller method.
     */
    throw() : void {
       throw this;
    }
}

