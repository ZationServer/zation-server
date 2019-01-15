/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import {ErrorConstruct}     from "../helper/configs/errorConfig";
import TaskErrorBuilder   = require("../helper/builder/taskErrorBuilder");
// noinspection TypeScriptPreferShortImport
import {ErrorType}          from "../helper/constants/errorType";
import {ResponseTaskError, TaskErrorInfo} from "../helper/constants/internal";

class TaskError extends Error
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
     * Creates a TaskError.
     * The error can be thrown and will be returned to the client.
     * You also can collect more task errors in a task error bag.
     * And throw them together.
     * @example
     * new TaskError({name : 'inputNotMatchWithMinLength'},{minLength : 5, inputLength : 3}).throw();
     * @param errorConstruct
     * Create a new error construct
     * or get one from the errorConfig by using the method getErrorConstruct on the bag/smallBag.
     * @param info
     * The error info is a dynamic object which contains more detailed information.
     * For example, with an inputNotMatchWithMinLength error,
     * the info object could include what the length of the input is and
     * what the minimum length is.
     */
    constructor(errorConstruct : ErrorConstruct = {}, info ?: object | string)
    {
        super();
        //defaultValues
        this.name        = errorConstruct.name || 'TaskError';
        this.group       = errorConstruct.group;
        this.description = errorConstruct.description || 'No Description define in Error';
        this.type        = errorConstruct.type || ErrorType.NORMAL_ERROR;
        this.sendInfo    = errorConstruct.sendInfo || true;
        this.info        = {};
        this.privateE    = errorConstruct.private || false;
        this.fromZationSystem = errorConstruct.fromZationSystem || false;

        if(info) {
            if (typeof info === 'string') {
                this.info[TaskErrorInfo.MAIN] = info;
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
        return `TaskError  Name: ${this.name} Group: ${this.group}  Description: ${this.description}  Type: ${this.type}  Info: ${JSON.stringify(this.info)}  isPrivate:${this.privateE}  isFromZationSystem:${this.fromZationSystem}`;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * This method is used internal!
     * @param withDesc
     */
    _getJsonObj(withDesc : boolean = false) : ResponseTaskError
    {
        if(this.privateE){
            return {
                n : 'TaskError',
                t : this.type,
                zs : this.fromZationSystem
            }
        }
        else{
            const err : ResponseTaskError = {
                n : this.name,
                g : this.group,
                t : this.type,
                zs : this.fromZationSystem,
                i : this.sendInfo ? this.info : {}
            };

            if(withDesc){
                err.d = this.description;
            }

            return err;
        }
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the name of the error.
     * The name is a specific identifier.
     */
    getName() : string
    {
        return this.name;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Set the name of the error.
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
     * Returns the group of the error.
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
     * Set the group of the error.
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
     * Returns the task error description.
     */
    getDescription() : string
    {
        return this.description;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Set the task error description.
     * @param description
     */
    setDescription(description : string) : void
    {
        this.description = description;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the type of the task error.
     * The error type is a very abstract topic name.
     * Like validation error, database error, input error.
     * There some default types,
     * you can see them in the taskErrorBuilder.
     */
    getType() : string
    {
        return this.type;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Set the type of the task error.
     * The error type is a very abstract topic name.
     * Like validation error, database error, input error.
     * There some default types,
     * you can see them in the taskErrorBuilder.
     * @param type
     */
    setType(type : string) : void
    {
        this.type = type;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns if the error is private.
     * A private error only sends its type and
     * whether it is from the zation system.
     */
    isPrivate() : boolean
    {
        return this.privateE;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Set if the error is private.
     * A private error only sends its type and
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
     * Returns if the error is send the info.
     * The error info is a dynamic object which contains more detailed information.
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
     * Set if the error is send the info.
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
     * Returns the error info.
     * The error info is a dynamic object which contains more detailed information.
     * For example, with an inputNotMatchWithMinLength error,
     * the info object could include what the length of the input is and
     * what the minimum length is.
     */
    getInfo() : object
    {
        return this.info;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Set the error info.
     * The error info is a dynamic object which contains more detailed information.
     * For example, with an inputNotMatchWithMinLength error,
     * the info object could include what the length of the input is and
     * what the minimum length is.
     * @param info
     */
    setInfo(info : object) : void
    {
        this.info = info;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns if the error is from zation system.
     * This indicates if this task error is from the main zation system.
     * This is used in the system internal.
     */
    isFromZationSystem() : boolean
    {
        return this.fromZationSystem;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Set if the error is from zation system.
     * This indicates if this task error is from the main zation system.
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
     * Throws this task error.
     * Alternative than to throw him directly in the handler method.
     */
    throw() : void
    {
       throw this;
    }
}

export = TaskError;