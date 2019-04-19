/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import MainErrors   = require('../zationTaskErrors/mainTaskErrors');
import {ControllerConfig} from "../configs/appConfig";
import {BaseSHBridge}     from "../bridges/baseSHBridge";
import {BackError}        from "../../api/BackError";

class SystemVersionChecker
{

    static checkSystemAndVersion(shBridge : BaseSHBridge,controllerConfig : ControllerConfig) : void
    {
        const versionAccess = controllerConfig.versionAccess;
        if(typeof versionAccess === 'object') {
            const system = shBridge.getSystem();
            if(versionAccess.hasOwnProperty(system))
            {
                const version = shBridge.getVersion();
                const sVersion = versionAccess[system];
                if((Array.isArray(sVersion) && !sVersion.includes(version)) || (typeof sVersion === 'number' && sVersion > version)) {
                    throw new BackError(MainErrors.versionNotCompatible,{version : version});
                }
            }
            else {
                throw new BackError(MainErrors.systemNotCompatible,{system : system});
            }
        }
    }

}

export = SystemVersionChecker;