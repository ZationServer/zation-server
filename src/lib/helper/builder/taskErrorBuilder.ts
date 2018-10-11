/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import Const              = require('../constants/constWrapper');
import {ErrorConstruct} from "../configEditTool/errorConfigStructure";
import TaskError          = require("../../api/TaskError");

class TaskErrorBuilder
{
    private errorSettings : ErrorConstruct = {};
    private errorInfo : object = {};

    constructor()
    {
        this.errorSettings[Const.Settings.ERROR.TYPE] = Const.Error.NORMAL_ERROR;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Set the name of the task error.
     * The name is a specific identifier.
     * @param name
     */
    name(name : string) : TaskErrorBuilder {
        this.errorSettings[Const.Settings.ERROR.NAME] = name;
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
        this.errorSettings[Const.Settings.ERROR.GROUP] = group;
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
        this.errorSettings[Const.Settings.ERROR.TYPE] = type;
        return this;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Set the task error type to system error.
     */
    typeSystemError() : TaskErrorBuilder {
        this.errorSettings[Const.Settings.ERROR.TYPE] = Const.Error.SYSTEM_ERROR;
        return this;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Set the task error type to input error.
     */
    typeInputError() : TaskErrorBuilder {
        this.errorSettings[Const.Settings.ERROR.TYPE] = Const.Error.INPUT_ERROR;
        return this;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Set the task error type to validation error.
     */
    typeValidationError() : TaskErrorBuilder {
        this.errorSettings[Const.Settings.ERROR.TYPE] = Const.Error.VALIDATION_ERROR;
        return this;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Set the task error type to auth error.
     */
    typeAuthError() : TaskErrorBuilder {
        this.errorSettings[Const.Settings.ERROR.TYPE] = Const.Error.AUTH_ERROR;
        return this;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Set the task error type to protocol error.
     */
    typeProtocolError() : TaskErrorBuilder {
        this.errorSettings[Const.Settings.ERROR.TYPE] = Const.Error.PROTOCOL_ERROR;
        return this;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Set the task error type to token error.
     */
    typeTokenError() : TaskErrorBuilder {
        this.errorSettings[Const.Settings.ERROR.TYPE] = Const.Error.TOKEN_ERROR;
        return this;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Set the task error type to database error.
     */
    typeDatabaseError() : TaskErrorBuilder {
        this.errorSettings[Const.Settings.ERROR.TYPE] = Const.Error.DATABASE_ERROR;
        return this;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Set the task error type to compatibility error.
     */
    typeCompatibilityError() : TaskErrorBuilder {
        this.errorSettings[Const.Settings.ERROR.TYPE] = Const.Error.COMPATIBILITY_ERROR;
        return this;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Set the task error type to time error.
     */
    typeTimeError() : TaskErrorBuilder {
        this.errorSettings[Const.Settings.ERROR.TYPE] = Const.Error.TIME_ERROR;
        return this;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Set the task error type to normal error.
     */
    typeNormalError() : TaskErrorBuilder {
        this.errorSettings[Const.Settings.ERROR.TYPE] = Const.Error.NORMAL_ERROR;
        return this;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Set the task error description.
     */
    description(description : string) : TaskErrorBuilder {
        this.errorSettings[Const.Settings.ERROR.DESCRIPTION] = description;
        return this;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Set if the task error sends the info.
     */
    sendInfo(sendInfo : boolean) : TaskErrorBuilder {
        this.errorSettings[Const.Settings.ERROR.SEND_INFO] = sendInfo;
        return this;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Set if the task error is private.
     */
    private(isPrivate : boolean) : TaskErrorBuilder {
        this.errorSettings[Const.Settings.ERROR.IS_PRIVATE] = isPrivate;
        return this;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Set if the task error is from zation system.
     */
    fromZationSystem(fromZationSystem : boolean) : TaskErrorBuilder {
        this.errorSettings[Const.Settings.ERROR.IS_FROM_ZATION_SYSTEM] = fromZationSystem;
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
        this.errorSettings[Const.Settings.ERROR.INFO] = info;
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

}

export = TaskErrorBuilder;
