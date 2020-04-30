/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {ControllerReq, ControllerRequestType} from '../controllerDefinitions';

export default class ControllerReqUtils
{
    static isValidReqStructure(request: ControllerReq): boolean {
        return ((typeof request.c === 'string' || typeof request.sc === 'string') ||
                request.t === ControllerRequestType.Auth)
    }

    static isSystemControllerReq(request: ControllerReq): boolean {
        return typeof request.sc === 'string';
    }

    static getControllerId(request: ControllerReq, isSystemController: boolean): string {
        return isSystemController ? request.sc as string : request.c as string;
    }
}