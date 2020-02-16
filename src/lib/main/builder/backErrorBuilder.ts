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
    private _construct: BackErrorConstruct = {};
    private _info: object = {};

    constructor() {
        this._construct.type = ErrorType.NORMAL_ERROR;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Set the name of the BackError.
     * The name is a specific identifier.
     * @param name
     */
    name(name: string): BackErrorBuilder {
        this._construct.name = name;
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
    group(group: string | undefined): BackErrorBuilder {
        this._construct.group = group;
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
    typ(type: string): BackErrorBuilder {
        this._construct.type = type;
        return this;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Set the BackError type to system error.
     */
    typeSystemError(): BackErrorBuilder {
        this._construct.type = ErrorType.SYSTEM_ERROR;
        return this;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Set the BackError type to input error.
     */
    typeInputError(): BackErrorBuilder {
        this._construct.type = ErrorType.INPUT_ERROR;
        return this;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Set the BackError type to validation error.
     */
    typeValidationError(): BackErrorBuilder {
        this._construct.type = ErrorType.VALIDATION_ERROR;
        return this;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Set the BackError type to auth error.
     */
    typeAuthError(): BackErrorBuilder {
        this._construct.type = ErrorType.AUTH_ERROR;
        return this;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Set the BackError type to protocol error.
     */
    typeProtocolError(): BackErrorBuilder {
        this._construct.type = ErrorType.PROTOCOL_ERROR;
        return this;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Set the BackError type to token error.
     */
    typeTokenError(): BackErrorBuilder {
        this._construct.type = ErrorType.TOKEN_ERROR;
        return this;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Set the BackError type to database error.
     */
    typeDatabaseError(): BackErrorBuilder {
        this._construct.type = ErrorType.DATABASE_ERROR;
        return this;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Set the BackError type to compatibility error.
     */
    typeCompatibilityError(): BackErrorBuilder {
        this._construct.type = ErrorType.NO_ACCESS_ERROR;
        return this;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Set the BackError type to time error.
     */
    typeTimeError(): BackErrorBuilder {
        this._construct.type = ErrorType.TIME_ERROR;
        return this;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Set the BackError type to normal error.
     */
    typeNormalError(): BackErrorBuilder {
        this._construct.type = ErrorType.NORMAL_ERROR;
        return this;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Set the BackError description.
     */
    description(description: string): BackErrorBuilder {
        this._construct.description = description;
        return this;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Set if the BackError sends the info.
     */
    sendInfo(sendInfo: boolean): BackErrorBuilder {
        this._construct.sendInfo = sendInfo;
        return this;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Set if the BackError is private.
     */
    private(isPrivate: boolean): BackErrorBuilder {
        this._construct.private = isPrivate;
        return this;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Set if the BackError is from zation system.
     */
    fromZationSystem(fromZationSystem: boolean): BackErrorBuilder {
        this._construct.fromZationSystem = fromZationSystem;
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
    setInfo(info: object): BackErrorBuilder {
        this._info = info;
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
    addInfo(key: string, value: any, override: boolean = true): BackErrorBuilder
    {
        if(override || !this._info.hasOwnProperty(key)) {
            this._info[key] = value;
        }
        return this;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the created BackError.
     */
    create(): BackError {
        return new BackError(this._construct,this._info);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the back error construct.
     */
    get backErrorConstruct(): BackErrorConstruct {
        return this._construct;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the info.
     */
    get info(): Record<string,any> {
        return this._info;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns an BackError builder.
     * For easy build an BackError.
     */
    static build(): BackErrorBuilder {
        return new BackErrorBuilder();
    }
}

