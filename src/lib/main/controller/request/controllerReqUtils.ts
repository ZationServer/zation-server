/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import JsonConverter from "../../utils/jsonConverter";
import ZationConfig  from "../../config/manager/zationConfig";
import {HttpGetRequest, ZationRequest, ZationTask, ZationValidationCheck} from "./controllerDefinitions";

export default class ControllerReqUtils
{
    static isValidReqStructure(zationReq : ZationRequest,isWsReq : boolean) : boolean
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

    static isSystemControllerReq(task : ZationTask) : boolean {
        return typeof task.sc === 'string' && typeof task.c !== 'string';
    }

    public static async convertGetRequest(query : object) : Promise<object>
    {
        const res : ZationRequest =
            typeof query[HttpGetRequest.API_LEVEL] === 'number' ? {al : query[HttpGetRequest.API_LEVEL]} : {};

        //input convert
        const input = typeof query[HttpGetRequest.INPUT] === 'string' ?
            await JsonConverter.parse(decodeURIComponent(query[HttpGetRequest.INPUT])) : undefined;

        //version,system,token
        res.s = query[HttpGetRequest.SYSTEM];
        res.v = parseFloat(query[HttpGetRequest.VERSION]);
        if(query[HttpGetRequest.TOKEN] !== undefined){
            res.to = query[HttpGetRequest.TOKEN];
        }
        //task
        if(query.hasOwnProperty(HttpGetRequest.CONTROLLER) || query.hasOwnProperty(HttpGetRequest.SYSTEM_CONTROLLER)) {
            res.t = {
                i : input,
            };
            if(query.hasOwnProperty(HttpGetRequest.CONTROLLER)) {
                res.t.c = query[HttpGetRequest.CONTROLLER];
            }
            else {
                res.t.sc = query[HttpGetRequest.SYSTEM_CONTROLLER];
            }
        }
        else if(query.hasOwnProperty(HttpGetRequest.AUTH_REQ)) {
            res.a = {
                i : input
            };
        }
        return res;
    }

    public static async convertValidationGetRequest(query : object) : Promise<object>
    {
        const res : ZationRequest =
            typeof query[HttpGetRequest.API_LEVEL] === 'number' ? {al : query[HttpGetRequest.API_LEVEL]} : {};

        //input convert
        const input : any = await JsonConverter.parse(decodeURIComponent(query[HttpGetRequest.INPUT]));

        const main : ZationValidationCheck = {
            i : input
        };
        if(query.hasOwnProperty(HttpGetRequest.CONTROLLER)) {
            main.c = query[HttpGetRequest.CONTROLLER];
        }
        else {
            main.sc = query[HttpGetRequest.SYSTEM_CONTROLLER];
        }
        res.v = main;
        return res;
    }

    public static isValidGetReq(query : object) : boolean
    {
        return((
            query.hasOwnProperty(HttpGetRequest.SYSTEM) &&
            query.hasOwnProperty(HttpGetRequest.VERSION)
            )
            && (
            query.hasOwnProperty(HttpGetRequest.AUTH_REQ) ||
            query.hasOwnProperty(HttpGetRequest.CONTROLLER) ||
            query.hasOwnProperty(HttpGetRequest.SYSTEM_CONTROLLER)
            ));
    }

    public static isValidValidationGetReq(query : object) : boolean
    {
        return (
            //validationReq
            query.hasOwnProperty(HttpGetRequest.VALI_REQ) &&
            typeof query[HttpGetRequest.INPUT] === 'string' &&
            (
                query.hasOwnProperty(HttpGetRequest.CONTROLLER) ||
                query.hasOwnProperty(HttpGetRequest.SYSTEM_CONTROLLER)
            )
        );
    }

    static getControllerId(task : object, isSystemController : boolean) : string
    {
        return !isSystemController ? task[nameof<ZationTask>(s => s.c)] :
            task[nameof<ZationTask>(s => s.sc)];
    }

    static isValidationCheckReq(zationReq : ZationRequest) : boolean {
        return typeof zationReq.v === 'object' && zationReq.t === undefined && zationReq.a === undefined;
    }

    static isValidValidationStructure(zationReq : ZationRequest) : boolean
    {
        return typeof zationReq.v === 'object' &&
            ((
                    typeof zationReq.v.c  === 'string' || typeof zationReq.v.sc === 'string'
                ) && Array.isArray(zationReq.v.i)
            );
    }

    static isZationAuthReq(zationReq : ZationRequest) : boolean {
        return zationReq.a !== undefined;
    }

    static dissolveZationAuthReq(zc : ZationConfig,zationReq : ZationRequest) : object
    {
        zationReq.t = zationReq.a;
        delete zationReq.a;
        //is checked before
        // @ts-ignore
        zationReq.t.c = zc.appConfig.authController;
        return zationReq;
    }
}