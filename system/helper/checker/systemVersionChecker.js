/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

const Const           = require('../constante/constWrapper');
const TaskError       = require('../../api/TaskError');
const SyErrors        = require('../zationTaskErrors/systemTaskErrors');

class SystemVersionChecker
{

    static checkSystemAndVersion(zc,zationReq)
    {
        if(zc.isApp(Const.App.VERSION_CONTROL))
        {
            if(zc.getApp(Const.App.VERSION_CONTROL).hasOwnProperty(zationReq[Const.Settings.INPUT_SYSTEM]))
            {
                let serverMinVersion =
                    parseFloat(zc.getApp(Const.App.VERSION_CONTROL)[zationReq[Const.Settings.INPUT_SYSTEM]]);

                if(serverMinVersion > parseFloat(zationReq[Const.Settings.INPUT_VERSION]))
                {
                    throw new TaskError(SyErrors.versionToOld,{minVersion : serverMinVersion});
                }
            }
            else
            {
                throw new TaskError(SyErrors.systemNotFound,{systemName : zationReq[Const.Settings.INPUT_SYSTEM]});
            }
        }
    }

}

module.exports = SystemVersionChecker;