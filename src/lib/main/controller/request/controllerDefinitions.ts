/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {BackErrorInfo} from "../../constants/internal";

export enum ZationHttpInfo {
    Deauthenticate = 'deauthenticate'
}

export const enum ControllerRequestType {
    Normal,
    ValidationCheck,
    Auth
}

export interface ControllerRequest {
    /**
     * System
     */
    s?: string,
    /**
     * Version
     */
    v?: number,
    /**
     * Token
     */
    to?: string,
    /**
     * ApiLevel
     */
    al?: number,
    /**
     * Controller
     */
    c?: string,
    /**
     * SystemController
     */
    sc?: string,
    /**
     * RequestType
     */
    t?: ControllerRequestType,
    /**
     * Input
     */
    i?: any
}

export interface ControllerValidationCheckRequest extends ControllerRequest {
    /**
     * RequestType
     */
    t: ControllerRequestType.ValidationCheck,
    /**
     * Input
     */
    i: ValidationCheckPair[]
}

export interface ValidationCheckPair {
    /**
     * Path
     */
    p: string | string[],
    /**
     * Value
     */
    v: any
}

export interface ResponseError {
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
     * From Zation System
     */
    zs: boolean,
    /**
     * Info
     */
    i?: object | BackErrorInfo
}

/**
 * Successful = errors.length === 0
 */
export interface ControllerResponse {
    /**
     * Errors
     */
    e: ResponseError[],
    /**
     * Result
     */
    r?: any
    /**
     * Token [signedToken,plainToken]
     */
    t?: [string,object]
    /**
     * Http information codes
     */
    hi?: string[]
}