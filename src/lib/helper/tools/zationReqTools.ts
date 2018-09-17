/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import Const              = require('../constants/constWrapper');
import ZationConfig       = require("../../main/zationConfig");
import JsonConverter      = require("./jsonConverter");

class ZationReqTools
{
    static isValidReqStructure(zationReq : object) : boolean
    {
        return typeof zationReq[Const.Settings.REQUEST_INPUT.VERSION] === 'number'&&
            typeof zationReq[Const.Settings.REQUEST_INPUT.SYSTEM] === 'string' &&
            (
                (
                    typeof zationReq[Const.Settings.REQUEST_INPUT.TASK] === 'object' &&
                    (
                        typeof zationReq[Const.Settings.REQUEST_INPUT.TASK][Const.Settings.REQ_IN_C.CONTROLLER] === 'string' ||
                        typeof zationReq[Const.Settings.REQUEST_INPUT.TASK][Const.Settings.REQ_IN_C.SYSTEM_CONTROLLER] === 'string'
                    ) &&
                    typeof zationReq[Const.Settings.REQUEST_INPUT.TASK][Const.Settings.REQUEST_INPUT.INPUT] === 'object'
                ) || (
                    typeof zationReq[Const.Settings.REQUEST_INPUT.AUTH] === 'object' &&
                    typeof zationReq[Const.Settings.REQUEST_INPUT.AUTH][Const.Settings.REQUEST_INPUT.INPUT] === 'object'
                ));
    }

    static isSystemControllerReq(task : object) : boolean
    {
        return typeof task[Const.Settings.REQ_IN_C.SYSTEM_CONTROLLER] === 'string' &&
            !task[Const.Settings.REQ_IN_C.CONTROLLER];
    }

    public static async convertGetRequest(query : object) : Promise<object>
    {
        const res = {};

        //input convert
        const input = await JsonConverter.parse(query[Const.Settings.HTTP_GET_REQ.INPUT]);

        //version,system,token
        res[Const.Settings.REQUEST_INPUT.SYSTEM] = query[Const.Settings.HTTP_GET_REQ.SYSTEM_CONTROLLER];
        res[Const.Settings.REQUEST_INPUT.VERSION] = query[Const.Settings.HTTP_GET_REQ.VERSION];
        res[Const.Settings.REQUEST_INPUT.TOKEN] = query[Const.Settings.HTTP_GET_REQ.TOKEN];

        //task
        if(query.hasOwnProperty(Const.Settings.HTTP_GET_REQ.CONTROLLER) || query.hasOwnProperty(Const.Settings.HTTP_GET_REQ.SYSTEM_CONTROLLER)) {
            const task = {};

            if(query.hasOwnProperty(Const.Settings.HTTP_GET_REQ.CONTROLLER)) {
                task[Const.Settings.REQ_IN_C.CONTROLLER] = query[Const.Settings.HTTP_GET_REQ.CONTROLLER];
            }
            else {
                task[Const.Settings.REQ_IN_C.SYSTEM_CONTROLLER] = query[Const.Settings.HTTP_GET_REQ.SYSTEM_CONTROLLER];
            }

            task[Const.Settings.REQUEST_INPUT.INPUT] = input;
            res[Const.Settings.REQUEST_INPUT.TASK] = task;
        }
        else if(query.hasOwnProperty(Const.Settings.HTTP_GET_REQ.AUTH_REQ)) {
            res[Const.Settings.REQUEST_INPUT.AUTH] = {};
            res[Const.Settings.REQUEST_INPUT.AUTH][Const.Settings.REQUEST_INPUT.INPUT] = input;
        }

        return res;
    }

    public static isValidGetReq(query : object) : boolean
    {
        return(
            query.hasOwnProperty(Const.Settings.HTTP_GET_REQ.SYSTEM) &&
            query.hasOwnProperty(Const.Settings.HTTP_GET_REQ.VERSION)
            )
            && (
            query.hasOwnProperty(Const.Settings.HTTP_GET_REQ.AUTH_REQ) ||
            query.hasOwnProperty(Const.Settings.HTTP_GET_REQ.CONTROLLER) ||
            query.hasOwnProperty(Const.Settings.HTTP_GET_REQ.SYSTEM_CONTROLLER)
            ) &&
            query.hasOwnProperty(Const.Settings.HTTP_GET_REQ.INPUT);
    }

    static getControllerName(task : object, isSystemController : boolean) : string
    {
        if(!isSystemController) {
            return task[Const.Settings.REQ_IN_C.CONTROLLER];
        }
        else {
            return task[Const.Settings.REQ_IN_C.SYSTEM_CONTROLLER];
        }
    }

    static isValidationCheckReq(zationReq : object) : boolean
    {
        return typeof zationReq[Const.Settings.VALIDATION_REQUEST_INPUT.MAIN] === 'object'
               &&     zationReq[Const.Settings.REQUEST_INPUT.TASK] === undefined
               &&     zationReq[Const.Settings.REQUEST_INPUT.AUTH] === undefined;
    }

    static isValidValidationStructure(zationReq : object) : boolean
    {
        return typeof zationReq[Const.Settings.VALIDATION_REQUEST_INPUT.MAIN] === 'object' &&
            (
                (
                    typeof zationReq[Const.Settings.VALIDATION_REQUEST_INPUT.MAIN]
                        [Const.Settings.REQ_IN_C.CONTROLLER] === 'string' ||
                    typeof zationReq[Const.Settings.VALIDATION_REQUEST_INPUT.MAIN]
                        [Const.Settings.REQ_IN_C.SYSTEM_CONTROLLER] === 'string'
                ) &&
                Array.isArray(zationReq[Const.Settings.VALIDATION_REQUEST_INPUT.MAIN]
                    [Const.Settings.VALIDATION_REQUEST_INPUT.INPUT])
            );
    }

    static isZationAuthReq(zationReq : object) : boolean
    {
        return zationReq[Const.Settings.REQUEST_INPUT.AUTH] !== undefined;
    }

    static dissolveZationAuthReq(zc : ZationConfig,zationReq : object) : object
    {
        zationReq[Const.Settings.REQUEST_INPUT.TASK] = zationReq[Const.Settings.REQUEST_INPUT.AUTH];
        delete zationReq[Const.Settings.REQUEST_INPUT.AUTH];

        zationReq[Const.Settings.REQUEST_INPUT.TASK][Const.Settings.REQ_IN_C.CONTROLLER] =
            zc.getApp(Const.App.KEYS.AUTH_CONTROLLER);

        return zationReq;
    }
}

export = ZationReqTools;