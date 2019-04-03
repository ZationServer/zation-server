/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

// noinspection TypeScriptPreferShortImport
import {ControllerConfig} from "../configs/appConfig";
import {BaseSHBridge}     from "../bridges/baseSHBridge";
import {SHBridge}         from "../bridges/shBridge";

class ProtocolAccessChecker
{
    static hasProtocolAccess(shBridge : BaseSHBridge,controller : ControllerConfig) : boolean
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

    static getProtocol(shBridge : BaseSHBridge) : string {
        return shBridge.isWebSocket() ? 'ws' : 'http';
    }
}

export = ProtocolAccessChecker;