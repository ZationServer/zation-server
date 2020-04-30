/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {BackErrorInfo} from "../../constants/internal";

export const enum ControllerRequestType {
    Normal,
    ValidationCheck,
    Auth
}

export interface ControllerReq {
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
     * @default 0
     */
    t?: ControllerRequestType,
    /**
     * Input
     */
    i?: any
}

export interface ControllerValidationCheckReq extends ControllerReq {
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
export interface ControllerRes {
    /**
     * Errors
     */
    0: ResponseError[],
    /**
     * Result
     */
    1?: any
}