/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {ControllerBaseReq, ControllerValidationCheckReq, SpecialController} from '../controllerDefinitions';

export function checkValidControllerBaseRequest(request: ControllerBaseReq | any | null | undefined | number | string): boolean {
    return typeof request === 'object' && !!request &&
        (typeof request.c === 'string' || request.c === SpecialController.AuthController);
}

export function isValidationCheckRequest(request: ControllerBaseReq & any): request is ControllerValidationCheckReq {
    return request.v;
}