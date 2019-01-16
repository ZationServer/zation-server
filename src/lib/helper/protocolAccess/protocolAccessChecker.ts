/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import SHBridge       = require("../bridges/shBridge");
import {ControllerConfig} from "../configs/appConfig";

class ProtocolAccessChecker
{
    static hasProtocolAccess(shBridge : SHBridge,controller : ControllerConfig) : boolean
    {
        let hasAccess = true;
        if(shBridge.isWebSocket()) {
            if(!!controller.wsAccess) {
                hasAccess = controller.wsAccess;
            }
        }
        else {
            if(!!controller.httpAccess){
                hasAccess = controller.httpAccess;
            }
        }
        return hasAccess;
    }

    static hasHttpMethodAccess(shBridge : SHBridge,controller : ControllerConfig) : boolean
    {
        let hasAccess = true;
        const method = shBridge.getRequest().method;

        if(method === 'GET' && !!controller.httpGetAllowed) {
            hasAccess = controller.httpGetAllowed;
        }
        else if(method === 'POST' && !!controller.httpPostAllowed) {
            hasAccess = controller.httpPostAllowed;
        }
        return hasAccess;
    }

    static getProtocol(shBridge : SHBridge,) : string {
        return shBridge.isWebSocket() ? 'ws' : 'http';
    }
}

export = ProtocolAccessChecker;