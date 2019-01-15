/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import {ErrorConstruct}     from "../configs/errorConfig";
// noinspection TypeScriptPreferShortImport
import {ErrorType}          from "../constants/errorType";
import TaskError          = require("../../api/TaskError");

class TaskErrorBuilder
{
    private errorSettings : ErrorConstruct = {};
    private errorInfo : object = {};

    constructor() {
        this.errorSettings.type = ErrorType.NORMAL_ERROR;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Set the name of the task error.
     * The name is a specific identifier.
     * @param name
     */
    name(name : string) : TaskErrorBuilder {
        this.errorSettings.name = name;
        return this;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Set the group of the task error.
     * Multiple errors can belong to a group.
     * As an example, the validation errors for a type would belong to the group typeErrors.
     * But for each error, the name is unique, for example, inputIsNotTypeString or inputIsNotTypeEmail.
     * @param group
     */
    group(group : string | undefined) : TaskErrorBuilder {
        this.errorSettings.group = group;
        return this;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Set the type of the task error.
     * The error type is a very abstract topic name.
     * Like validation error, database error, input error.
     * @param type
     */
    typ(type : string) : TaskErrorBuilder {
        this.errorSettings.type = type;
        return this;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Set the task error type to system error.
     */
    typeSystemError() : TaskErrorBuilder {
        this.errorSettings.type = ErrorType.SYSTEM_ERROR;
        return this;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Set the task error type to input error.
     */
    typeInputError() : TaskErrorBuilder {
        this.errorSettings.type = ErrorType.INPUT_ERROR;
        return this;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Set the task error type to validation error.
     */
    typeValidationError() : TaskErrorBuilder {
        this.errorSettings.type = ErrorType.VALIDATION_ERROR;
        return this;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Set the task error type to auth error.
     */
    typeAuthError() : TaskErrorBuilder {
        this.errorSettings.type = ErrorType.AUTH_ERROR;
        return this;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Set the task error type to protocol error.
     */
    typeProtocolError() : TaskErrorBuilder {
        this.errorSettings.type = ErrorType.PROTOCOL_ERROR;
        return this;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Set the task error type to token error.
     */
    typeTokenError() : TaskErrorBuilder {
        this.errorSettings.type = ErrorType.TOKEN_ERROR;
        return this;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Set the task error type to database error.
     */
    typeDatabaseError() : TaskErrorBuilder {
        this.errorSettings.type = ErrorType.DATABASE_ERROR;
        return this;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Set the task error type to compatibility error.
     */
    typeCompatibilityError() : TaskErrorBuilder {
        this.errorSettings.type = ErrorType.COMPATIBILITY_ERROR;
        return this;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Set the task error type to time error.
     */
    typeTimeError() : TaskErrorBuilder {
        this.errorSettings.type = ErrorType.TIME_ERROR;
        return this;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Set the task error type to normal error.
     */
    typeNormalError() : TaskErrorBuilder {
        this.errorSettings.type = ErrorType.NORMAL_ERROR;
        return this;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Set the task error description.
     */
    description(description : string) : TaskErrorBuilder {
        this.errorSettings.description = description;
        return this;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Set if the task error sends the info.
     */
    sendInfo(sendInfo : boolean) : TaskErrorBuilder {
        this.errorSettings.sendInfo = sendInfo;
        return this;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Set if the task error is private.
     */
    private(isPrivate : boolean) : TaskErrorBuilder {
        this.errorSettings.private = isPrivate;
        return this;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Set if the task error is from zation system.
     */
    fromZationSystem(fromZationSystem : boolean) : TaskErrorBuilder {
        this.errorSettings.fromZationSystem = fromZationSystem;
        return this;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Set the task error info.
     * The error info is a dynamic object which contains more detailed information.
     * For example, with an inputNotMatchWithMinLength error,
     * the info object could include what the length of the input is and
     * what the minimum length is.
     * Notice that you override the info property.
     */
    setInfo(info : object) : TaskErrorBuilder {
        this.errorInfo = info;
        return this;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Add a new info key value pair to info object.
     * The error info is a dynamic object which contains more detailed information.
     * For example, with an inputNotMatchWithMinLength error,
     * the info object could include what the length of the input is and
     * what the minimum length is.
     */
    addInfo(key : string, value : any, override : boolean = true) : TaskErrorBuilder
    {
        if(override || !this.errorInfo.hasOwnProperty(key)) {
            this.errorInfo[key] = value;
        }
        return this;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the created task error.
     */
    create() : TaskError {
        return new TaskError(this.errorSettings,this.errorInfo);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns an task error builder.
     * For easy build an task error.
     */
    static build() : TaskErrorBuilder
    {
        return new TaskErrorBuilder();
    }
}

export = TaskErrorBuilder;
