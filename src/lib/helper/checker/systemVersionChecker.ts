/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import Const        = require('../constants/constWrapper');
import TaskError    = require('../../api/TaskError');
import MainErrors   = require('../zationTaskErrors/mainTaskErrors');
import SHBridge     = require("../bridges/shBridge");

class SystemVersionChecker
{

    static checkSystemAndVersion(shBridge : SHBridge,controllerConfig : object) : void
    {
        const versionAccess = controllerConfig[Const.App.CONTROLLER.VERSION_ACCESS];

        if(typeof versionAccess === 'object')
        {
            const system = shBridge.getSystem();

            if(versionAccess.hasOwnProperty(system))
            {
                const version = shBridge.getVersion();
                const sVersion = versionAccess[system];
                if((Array.isArray(sVersion) && !sVersion.includes(version)) || (typeof sVersion === 'number' && sVersion > version))
                {
                    throw new TaskError(MainErrors.versionNotCompatible,{version : version});
                }
            }
            else {
                throw new TaskError(MainErrors.systemNotCompatible,{system : system});
            }
        }
    }

}

export = SystemVersionChecker;