/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

const Const              = require('../constants/constWrapper');

class ZationReqTools
{
    static isValidStructure(zationReq)
    {
        return zationReq[Const.Settings.REQUEST_INPUT.VERSION] !== undefined &&
            zationReq[Const.Settings.REQUEST_INPUT.SYSTEM] !== undefined &&
            (
                (
                    zationReq[Const.Settings.REQUEST_INPUT.TASK] !== undefined &&
                    zationReq[Const.Settings.REQUEST_INPUT.TASK][Const.Settings.REQUEST_INPUT.CONTROLLER] !== undefined &&
                    zationReq[Const.Settings.REQUEST_INPUT.TASK][Const.Settings.REQUEST_INPUT.INPUT] !== undefined
                ) || (
                    zationReq[Const.Settings.REQUEST_INPUT.AUTH] !== undefined &&
                    zationReq[Const.Settings.REQUEST_INPUT.AUTH][Const.Settings.REQUEST_INPUT.INPUT] !== undefined
                ));
    }

    static isZationAuthReq(zationReq)
    {
        return zationReq[Const.Settings.REQUEST_INPUT.AUTH] !== undefined;
    }

    static dissolveZationAuthReq(zc,zationReq)
    {
        zationReq[Const.Settings.REQUEST_INPUT.TASK] = zationReq[Const.Settings.REQUEST_INPUT.AUTH];
        delete zationReq[Const.Settings.REQUEST_INPUT.AUTH];

        zationReq[Const.Settings.REQUEST_INPUT.TASK][Const.Settings.REQUEST_INPUT.CONTROLLER] =
            zc.getApp(Const.App.KEYS.AUTH_CONTROLLER);

        return zationReq;
    }
}

module.exports = ZationReqTools;