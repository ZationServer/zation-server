/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

const Const              = require('../constante/constWrapper');

class ZationReqTools
{
    static checkValidStructure(zationReq)
    {
        return zationReq[Const.Settings.INPUT_VERSION] !== undefined &&
            zationReq[Const.Settings.INPUT_SYSTEM] !== undefined &&
            (
                (
                    zationReq[Const.Settings.INPUT_TASK] !== undefined &&
                    zationReq[Const.Settings.INPUT_TASK][Const.Settings.INPUT_CONTROLLER] !== undefined &&
                    zationReq[Const.Settings.INPUT_TASK][Const.Settings.INPUT_PARAMS] !== undefined
                ) || (
                    zationReq[Const.Settings.INPUT_AUTH] !== undefined &&
                    zationReq[Const.Settings.INPUT_AUTH][Const.Settings.INPUT_PARAMS] !== undefined
                ));
    }

    static createZationAuth(zc,zationReq)
    {
        if(zationReq[Const.Settings.INPUT_AUTH] !== undefined)
        {
            zationReq[Const.Settings.INPUT_TASK] = zationReq[Const.Settings.INPUT_AUTH];
            delete zationReq[Const.Settings.INPUT_AUTH];

            zationReq[Const.Settings.INPUT_TASK][Const.Settings.INPUT_CONTROLLER] =
                zc.getApp(Const.App.AUTH_CONTROLLER);
        }
        return zationReq;
    }
}

module.exports = ZationReqTools;