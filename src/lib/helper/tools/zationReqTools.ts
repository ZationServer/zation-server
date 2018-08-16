/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import Const              = require('../constants/constWrapper');
import ZationConfig       = require("../../main/zationConfig");

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