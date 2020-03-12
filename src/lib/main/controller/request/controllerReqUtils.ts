/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import ZationConfig  from "../../config/manager/zationConfig";
import {jsonParse}   from "../../utils/jsonConverter";
import {HttpGetReq, ZationRequest, ZationTask, ZationValidationCheck} from './controllerDefinitions';

export default class ControllerReqUtils
{
    static isValidReqStructure(zationReq: ZationRequest,isWsReq: boolean): boolean
    {
        return (isWsReq || (
            typeof zationReq.v === 'number' && typeof zationReq.s === 'string'
            )) &&
            (
                (
                    typeof zationReq.t === 'object' &&
                    (
                        typeof zationReq.t.c === 'string' || typeof zationReq.t.sc === 'string'
                    )
                ) || (
                    typeof zationReq.a === 'object'
                ));
    }

    static isSystemControllerReq(task: ZationTask): boolean {
        return typeof task.sc === 'string' && typeof task.c !== 'string';
    }

    public static async convertGetRequest(query: object): Promise<object>
    {
        const res: ZationRequest =
            typeof query[HttpGetReq.API_LEVEL] === 'number' ? {al: query[HttpGetReq.API_LEVEL]}: {};

        //input convert
        const input = typeof query[HttpGetReq.INPUT] === 'string' ?
            jsonParse(decodeURIComponent(query[HttpGetReq.INPUT])): undefined;

        //version,system,token
        res.s = query[HttpGetReq.SYSTEM];
        res.v = parseFloat(query[HttpGetReq.VERSION]);
        if(query[HttpGetReq.TOKEN] !== undefined){
            res.to = query[HttpGetReq.TOKEN];
        }
        //task
        if(query.hasOwnProperty(HttpGetReq.CONTROLLER) || query.hasOwnProperty(HttpGetReq.SYSTEM_CONTROLLER)) {
            res.t = {
                i: input,
            };
            if(query.hasOwnProperty(HttpGetReq.CONTROLLER)) {
                res.t.c = query[HttpGetReq.CONTROLLER];
            }
            else {
                res.t.sc = query[HttpGetReq.SYSTEM_CONTROLLER];
            }
        }
        else if(query.hasOwnProperty(HttpGetReq.AUTH_REQ)) {
            res.a = {
                i: input
            };
        }
        return res;
    }

    public static async convertValidationGetRequest(query: object): Promise<object>
    {
        const res: ZationRequest =
            typeof query[HttpGetReq.API_LEVEL] === 'number' ? {al: query[HttpGetReq.API_LEVEL]}: {};

        //input convert
        const input: any = jsonParse(decodeURIComponent(query[HttpGetReq.INPUT]));

        const main: ZationValidationCheck = {
            i: input
        };
        if(query.hasOwnProperty(HttpGetReq.CONTROLLER)) {
            main.c = query[HttpGetReq.CONTROLLER];
        }
        else {
            main.sc = query[HttpGetReq.SYSTEM_CONTROLLER];
        }
        res.v = main;
        return res;
    }

    public static isValidGetReq(query: object): boolean
    {
        return((
            query.hasOwnProperty(HttpGetReq.SYSTEM) &&
            query.hasOwnProperty(HttpGetReq.VERSION)
            )
            && (
            query.hasOwnProperty(HttpGetReq.AUTH_REQ) ||
            query.hasOwnProperty(HttpGetReq.CONTROLLER) ||
            query.hasOwnProperty(HttpGetReq.SYSTEM_CONTROLLER)
            ));
    }

    public static isValidValidationGetReq(query: object): boolean
    {
        return (
            //validationReq
            query.hasOwnProperty(HttpGetReq.VALI_REQ) &&
            typeof query[HttpGetReq.INPUT] === 'string' &&
            (
                query.hasOwnProperty(HttpGetReq.CONTROLLER) ||
                query.hasOwnProperty(HttpGetReq.SYSTEM_CONTROLLER)
            )
        );
    }

    static getControllerId(task: object, isSystemController: boolean): string
    {
        return !isSystemController ? task[nameof<ZationTask>(s => s.c)] :
            task[nameof<ZationTask>(s => s.sc)];
    }

    static isValidationCheckReq(zationReq: ZationRequest): boolean {
        return typeof zationReq.v === 'object' && zationReq.t === undefined && zationReq.a === undefined;
    }

    static isValidValidationStructure(zationReq: ZationRequest): boolean
    {
        return typeof zationReq.v === 'object' &&
            ((
                    typeof zationReq.v.c  === 'string' || typeof zationReq.v.sc === 'string'
                ) && Array.isArray(zationReq.v.i)
            );
    }

    static isZationAuthReq(zationReq: ZationRequest): boolean {
        return zationReq.a !== undefined;
    }

    static dissolveZationAuthReq(zc: ZationConfig,zationReq: ZationRequest): object
    {
        zationReq.t = zationReq.a;
        delete zationReq.a;
        //is checked before
        // @ts-ignore
        zationReq.t.c = zc.appConfig.authController;
        return zationReq;
    }
}