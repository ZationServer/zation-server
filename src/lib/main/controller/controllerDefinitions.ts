/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

export const enum SpecialController {
    AuthController
}

export interface ControllerBaseReq {
    /**
     * Controller
     */
    c: string | SpecialController,
    /**
     * ApiLevel
     */
    a?: number
}

export interface ControllerStandardReq extends ControllerBaseReq {
    /**
     * Data (Input)
     */
    d?: any
}

export interface ControllerValidationCheckReq extends ControllerBaseReq {
    /**
     * Validation checks
     */
    v: ValidationCheckPair[]
}

export interface ValidationCheckPair {
    /**
     * Path
     */
    0: string | string[],
    /**
     * Value
     */
    1: any
}

export const CONTROLLER_EVENT = '>';