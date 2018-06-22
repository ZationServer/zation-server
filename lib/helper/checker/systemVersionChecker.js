/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

const Const           = require('../constants/constWrapper');
const TaskError       = require('../../api/TaskError');
const MainErrors      = require('../zationTaskErrors/mainTaskErrors');

class SystemVersionChecker
{

    static checkSystemAndVersion(zc,zationReq)
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

module.exports = SystemVersionChecker;