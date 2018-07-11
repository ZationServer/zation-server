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
                    typeof zationReq[Const.Settings.REQUEST_INPUT.TASK][Const.Settings.REQUEST_INPUT.CONTROLLER] === 'string' &&
                    typeof zationReq[Const.Settings.REQUEST_INPUT.TASK][Const.Settings.REQUEST_INPUT.INPUT] === 'object'
                ) || (
                    typeof zationReq[Const.Settings.REQUEST_INPUT.AUTH] === 'object' &&
                    typeof zationReq[Const.Settings.REQUEST_INPUT.AUTH][Const.Settings.REQUEST_INPUT.INPUT] === 'object'
                ));
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
                typeof zationReq[Const.Settings.VALIDATION_REQUEST_INPUT.MAIN]
                    [Const.Settings.VALIDATION_REQUEST_INPUT.CONTROLLER] === 'string' &&

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

        zationReq[Const.Settings.REQUEST_INPUT.TASK][Const.Settings.REQUEST_INPUT.CONTROLLER] =
            zc.getApp(Const.App.KEYS.AUTH_CONTROLLER);

        return zationReq;
    }
}

export = ZationReqTools;