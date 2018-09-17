/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */
import Const          = require('../constants/constWrapper');
import SHBridge       = require("../bridges/shBridge");

class ProtocolAccessChecker
{
    static hasProtocolAccess(shBridge : SHBridge,controller : object) : boolean
    {
        let hasAccess = true;
        if(shBridge.isWebSocket() && !!controller[Const.App.CONTROLLER.WS_ACCESS]) {
            hasAccess = controller[Const.App.CONTROLLER.WS_ACCESS];
        }
        else if(!!controller[Const.App.CONTROLLER.HTTP_ACCESS]) {
            hasAccess = controller[Const.App.CONTROLLER.HTTP_ACCESS];
        }
        return hasAccess;
    }

    static hasHttpMethodAccess(shBridge : SHBridge,controller : object) : boolean
    {
        let hasAccess = true;
        const method = shBridge.getRequest().method;

        if(method === 'GET' && !!controller[Const.App.CONTROLLER.HTTP_GET_ALLOWED]) {
            hasAccess = controller[Const.App.CONTROLLER.HTTP_GET_ALLOWED];
        }
        else if(method === 'POST' && !!controller[Const.App.CONTROLLER.HTTP_POST_ALLOWED]) {
            hasAccess = controller[Const.App.CONTROLLER.HTTP_POST_ALLOWED];
        }
        return hasAccess;
    }

    static getProtocol(shBridge : SHBridge,) : string {
        return shBridge.isWebSocket() ? 'ws' : 'http';
    }
}

export = ProtocolAccessChecker;