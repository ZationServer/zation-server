/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import BackErrorConstruct   from "../constants/backErrorConstruct";
// noinspection TypeScriptPreferShortImport
import {ErrorType}          from "../constants/errorType";
import BackError            from "../../api/BackError";

export default class BackErrorBuilder
{
    private errorSettings : BackErrorConstruct = {};
    private errorInfo : object = {};

    constructor() {
        this.errorSettings.type = ErrorType.NORMAL_ERROR;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Set the name of the BackError.
     * The name is a specific identifier.
     * @param name
     */
    name(name : string) : BackErrorBuilder {
        this.errorSettings.name = name;
        return this;
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
    group(group : string | undefined) : BackErrorBuilder {
        this.errorSettings.group = group;
        return this;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Set the type of the BackError.
     * The error type is a very abstract topic name.
     * Like validation error, database error, input error.
     * @param type
     */
    typ(type : string) : BackErrorBuilder {
        this.errorSettings.type = type;
        return this;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Set the BackError type to system error.
     */
    typeSystemError() : BackErrorBuilder {
        this.errorSettings.type = ErrorType.SYSTEM_ERROR;
        return this;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Set the BackError type to input error.
     */
    typeInputError() : BackErrorBuilder {
        this.errorSettings.type = ErrorType.INPUT_ERROR;
        return this;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Set the BackError type to validation error.
     */
    typeValidationError() : BackErrorBuilder {
        this.errorSettings.type = ErrorType.VALIDATION_ERROR;
        return this;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Set the BackError type to auth error.
     */
    typeAuthError() : BackErrorBuilder {
        this.errorSettings.type = ErrorType.AUTH_ERROR;
        return this;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Set the BackError type to protocol error.
     */
    typeProtocolError() : BackErrorBuilder {
        this.errorSettings.type = ErrorType.PROTOCOL_ERROR;
        return this;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Set the BackError type to token error.
     */
    typeTokenError() : BackErrorBuilder {
        this.errorSettings.type = ErrorType.TOKEN_ERROR;
        return this;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Set the BackError type to database error.
     */
    typeDatabaseError() : BackErrorBuilder {
        this.errorSettings.type = ErrorType.DATABASE_ERROR;
        return this;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Set the BackError type to compatibility error.
     */
    typeCompatibilityError() : BackErrorBuilder {
        this.errorSettings.type = ErrorType.NO_ACCESS_ERROR;
        return this;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Set the BackError type to time error.
     */
    typeTimeError() : BackErrorBuilder {
        this.errorSettings.type = ErrorType.TIME_ERROR;
        return this;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Set the BackError type to normal error.
     */
    typeNormalError() : BackErrorBuilder {
        this.errorSettings.type = ErrorType.NORMAL_ERROR;
        return this;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Set the BackError description.
     */
    description(description : string) : BackErrorBuilder {
        this.errorSettings.description = description;
        return this;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Set if the BackError sends the info.
     */
    sendInfo(sendInfo : boolean) : BackErrorBuilder {
        this.errorSettings.sendInfo = sendInfo;
        return this;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Set if the BackError is private.
     */
    private(isPrivate : boolean) : BackErrorBuilder {
        this.errorSettings.private = isPrivate;
        return this;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Set if the BackError is from zation system.
     */
    fromZationSystem(fromZationSystem : boolean) : BackErrorBuilder {
        this.errorSettings.fromZationSystem = fromZationSystem;
        return this;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Set the BackError info.
     * The BackError info is a dynamic object which contains more detailed information.
     * For example, with an inputNotMatchWithMinLength error,
     * the info object could include what the length of the input is and
     * what the minimum length is.
     * Notice that you override the info property.
     */
    setInfo(info : object) : BackErrorBuilder {
        this.errorInfo = info;
        return this;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Add a new info key value pair to info object.
     * The BackError info is a dynamic object which contains more detailed information.
     * For example, with an inputNotMatchWithMinLength error,
     * the info object could include what the length of the input is and
     * what the minimum length is.
     */
    addInfo(key : string, value : any, override : boolean = true) : BackErrorBuilder
    {
        if(override || !this.errorInfo.hasOwnProperty(key)) {
            this.errorInfo[key] = value;
        }
        return this;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the created BackError.
     */
    create() : BackError {
        return new BackError(this.errorSettings,this.errorInfo);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns an BackError builder.
     * For easy build an BackError.
     */
    static build() : BackErrorBuilder
    {
        return new BackErrorBuilder();
    }
}

