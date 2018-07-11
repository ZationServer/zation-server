/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import ZationConfig = require("../../main/zationConfig");
import Const        = require('../constants/constWrapper');
import TaskError    = require('../../api/TaskError');
import MainErrors   = require('../zationTaskErrors/mainTaskErrors');

class SystemVersionChecker
{

    static checkSystemAndVersion(zc : ZationConfig,zationReq : object) : void
    {
        if(zc.isApp(Const.App.KEYS.VERSION_CONTROL))
        {
            if(zc.getApp(Const.App.KEYS.VERSION_CONTROL).hasOwnProperty(zationReq[Const.Settings.REQUEST_INPUT.SYSTEM]))
            {
                let serverMinVersion =
                    parseFloat(zc.getApp(Const.App.KEYS.VERSION_CONTROL)[zationReq[Const.Settings.REQUEST_INPUT.SYSTEM]]);

                if(serverMinVersion > parseFloat(zationReq[Const.Settings.REQUEST_INPUT.VERSION]))
                {
                    throw new TaskError(MainErrors.versionToOld,{minVersion : serverMinVersion});
                }
            }
            else
            {
                throw new TaskError(MainErrors.systemNotFound,{systemName : zationReq[Const.Settings.REQUEST_INPUT.SYSTEM]});
            }
        }
    }

}

export = SystemVersionChecker;