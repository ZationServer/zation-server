/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {jsonParse} from '../../utils/jsonConverter';
import {ControllerRequest, ControllerRequestType, ControllerValidationCheckRequest} from './controllerDefinitions';

export default class ControllerReqUtils
{
    static isValidReqStructure(request: ControllerRequest, isWsReq: boolean): boolean {
        return (isWsReq || (typeof request.v === 'number' && typeof request.s === 'string')) &&
            ((typeof request.s === 'string' || typeof request.sc === 'string') ||
                request.t === ControllerRequestType.Auth)
    }

    static isSystemControllerReq(request: ControllerRequest): boolean {
        return typeof request.sc === 'string';
    }

    /**
     * Converts a valid get request to a ControllerRequest.
     * @param query
     */
    public static convertGetRequest(query: ControllerRequest): ControllerRequest {
        return {
            ...(typeof query.al === 'number' ? {al: query.al} : {}),
            s: query.s,
            //is valid request
            v: parseFloat(query.v as any),
            ...(query.to != undefined ? {to: query.to} : {}),
            t: query.t,
            ...(typeof query.i === 'string' ? {i: jsonParse(decodeURIComponent(query.i))} : {}),
            ...(query.c != undefined ? {c: query.c} : {}),
            ...(query.sc != undefined ? {sc: query.sc} : {}),
        };
    }

    static getControllerId(request: ControllerRequest, isSystemController: boolean): string {
        return isSystemController ? request.sc as string : request.c as string;
    }

    static isValidationCheckReq(req: ControllerRequest): boolean {
        return req.t === ControllerRequestType.ValidationCheck;
    }

    static isValidValidationStructure(controllerRequest: ControllerRequest): controllerRequest is ControllerValidationCheckRequest {
        return Array.isArray(controllerRequest.i) &&
            (typeof controllerRequest.c === 'string' || typeof controllerRequest.sc === 'string');
    }

    static isAuthReq(request: ControllerRequest): boolean {
        return request.t === ControllerRequestType.Auth;
    }
}